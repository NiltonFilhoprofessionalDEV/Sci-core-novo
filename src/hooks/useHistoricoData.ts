'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { FiltrosState, TemaInfo } from '@/components/historico/HistoricoIndicadores'

interface UseHistoricoDataProps {
  tema: TemaInfo
  filtros: FiltrosState
  paginaAtual: number
  registrosPorPagina: number
}

interface UseHistoricoDataReturn {
  dados: any[]
  loading: boolean
  error: string | null
  totalRegistros: number
  refetch: () => void
  excluirRegistro: (id: string) => Promise<boolean>
  editarRegistro: (id: string, dados: any) => Promise<boolean>
}

// Cache inteligente global com stale time
const cache = new Map<string, { data: any[], timestamp: number, total: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos - dados dinâmicos (histórico pode ser atualizado frequentemente)
const STALE_TIME = 15 * 60 * 1000 // 15 minutos - dados podem ser retornados mesmo se antigos

// Prefixo para localStorage
const STORAGE_PREFIX = 'sci-historico-cache-'

// Inicializar cache do localStorage
if (typeof window !== 'undefined') {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key)
        if (item) {
          try {
            const cached = JSON.parse(item)
            const age = Date.now() - cached.timestamp
            if (age > STALE_TIME) {
              keysToRemove.push(key)
            } else {
              cache.set(cached.key, cached)
            }
          } catch {
            keysToRemove.push(key)
          }
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.warn('⚠️ Erro ao carregar cache do localStorage:', error)
  }
}

// Funções auxiliares para localStorage
const saveCacheToStorage = (key: string, data: any[], total: number) => {
  if (typeof window === 'undefined') return
  try {
    const entry = { key, data, timestamp: Date.now(), total }
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch (error) {
    console.warn('⚠️ Erro ao salvar cache no localStorage:', error)
  }
}

const removeCacheFromStorage = (key: string) => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch (error) {
    console.warn('⚠️ Erro ao remover cache do localStorage:', error)
  }
}

// Controle global de requisições para evitar duplicatas
const activeRequests = new Map<string, Promise<any>>()

// Mapa de campos de data por tabela
const CAMPOS_DATA_POR_TABELA: Record<string, string> = {
  'ocorrencias_aeronauticas': 'data_ocorrencia',
  'ocorrencias_nao_aeronauticas': 'data_ocorrencia',
  'taf_registros': 'data_teste',
  'taf_resultados': 'data_taf',
  'ptr_ba_provas_teoricas': 'data_referencia',
  'ptr_ba_horas_treinamento': 'data_referencia',
  'inspecoes_viatura': 'data',
  'tempo_epr': 'data_referencia',
  'tempo_resposta': 'data_referencia',
  'controle_agentes_extintores': 'data_referencia',
  'controle_trocas': 'data_referencia',
  'verificacao_tps': 'data_referencia',
  'higienizacao_tps': 'data_referencia',
  'controle_uniformes_recebidos': 'data_referencia',
  'atividades_acessorias': 'data_referencia'
}

// Lista de tabelas válidas
const TABELAS_VALIDAS = new Set([
  'ocorrencias_aeronauticas',
  'ocorrencias_nao_aeronauticas',
  'taf_registros',
  'taf_resultados',
  'ptr_ba_provas_teoricas',
  'ptr_ba_horas_treinamento',
  'inspecoes_viatura',
  'tempo_epr',
  'tempo_resposta',
  'controle_agentes_extintores',
  'controle_trocas',
  'verificacao_tps',
  'higienizacao_tps',
  'controle_uniformes_recebidos',
  'atividades_acessorias'
])

// Cache de perfil do usuário
let perfilCache: { data: any, timestamp: number } | null = null
const PERFIL_CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Função para obter perfil do usuário com cache robusto e timeout
const obterPerfilUsuario = async (userId: string) => {
  if (perfilCache && Date.now() - perfilCache.timestamp < PERFIL_CACHE_DURATION) {
    return perfilCache.data
  }

  try {
    // Adicionar timeout de 8 segundos
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('secao_id, equipe_id, perfil, ativo')
        .eq('id', userId)
        .single()
        .abortSignal(controller.signal)

      clearTimeout(timeoutId)

      if (profileError) {
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`)
      }

      if (!profile || !profile.ativo) {
        throw new Error('Perfil inativo ou não encontrado')
      }

      perfilCache = { data: profile, timestamp: Date.now() }
      return profile
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
        throw new Error('Timeout ao buscar perfil do usuário')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('Erro ao obter perfil:', error)
    throw error
  }
}

// Função para verificar se tabela existe
const verificarTabelaExiste = (nomeTabela: string): boolean => {
  return TABELAS_VALIDAS.has(nomeTabela)
}

// Função para construir query com filtros RLS
const construirQuery = (tabela: string, profile: any, filtros: FiltrosState, paginaAtual: number, registrosPorPagina: number) => {
  const isTabelaTAF = tabela === 'taf_resultados'

  const selectColumns = isTabelaTAF
    ? 'id, funcionario_id, idade, tempo_total, desempenho, observacoes, nome_completo, nome_cidade, nome_equipe, data_taf, created_at, updated_at, taf_registros!inner(id, secao_id, equipe_id, data_teste)'
    : '*'

  let query = supabase
    .from(tabela)
    .select(selectColumns, { count: 'exact' })

  // Aplicar RLS baseado no perfil
  if (isTabelaTAF) {
    if (profile.perfil === 'ba_ce' && profile.secao_id) {
      query = query.eq('taf_registros.secao_id', profile.secao_id)
    } else if (profile.perfil === 'ba_op' && profile.equipe_id) {
      query = query.eq('taf_registros.equipe_id', profile.equipe_id)
    }
  } else {
    if (profile.perfil === 'ba_ce' && profile.secao_id) {
      query = query.eq('secao_id', profile.secao_id)
    } else if (profile.perfil === 'ba_op' && profile.equipe_id) {
      query = query.eq('equipe_id', profile.equipe_id)
    }
  }

  // Obter campo de data correto
  const campoData = CAMPOS_DATA_POR_TABELA[tabela] || 'data_referencia'

  // Aplicar filtros de data (padrão: últimos 12 meses)
  const dataLimite = new Date()
  dataLimite.setMonth(dataLimite.getMonth() - 12)
  
  if (filtros.dataInicio) {
    query = query.gte(campoData, filtros.dataInicio)
  } else {
    query = query.gte(campoData, dataLimite.toISOString().split('T')[0])
  }

  if (filtros.dataFim) {
    query = query.lte(campoData, filtros.dataFim)
  }

  // Filtro por equipe
  if (filtros.equipeId) {
    query = isTabelaTAF
      ? query.eq('taf_registros.equipe_id', filtros.equipeId)
      : query.eq('equipe_id', filtros.equipeId)
  }

  // Filtro por mês/ano
  if (filtros.mesAno) {
    const [ano, mes] = filtros.mesAno.split('-')
    const inicioMes = `${ano}-${mes}-01`
    const fimMes = new Date(parseInt(ano), parseInt(mes), 0).toISOString().split('T')[0]
    query = query.gte(campoData, inicioMes).lte(campoData, fimMes)
  }

  // Ordenação e paginação
  query = query
    .order(campoData, { ascending: false })
    .order('created_at', { ascending: false })
    .range(
      (paginaAtual - 1) * registrosPorPagina,
      paginaAtual * registrosPorPagina - 1
    )

  return query
}

export function useHistoricoData({
  tema,
  filtros,
  paginaAtual,
  registrosPorPagina
}: UseHistoricoDataProps): UseHistoricoDataReturn {
  // Estados
  const { user, loading: authLoading } = useAuth()
  
  // Função auxiliar para gerar chave de cache inicial
  const gerarChaveInicial = () => {
    return `${tema.id}_${JSON.stringify(filtros)}_${paginaAtual}_${registrosPorPagina}_${user?.id || ''}`
  }
  
  const [dados, setDados] = useState<any[]>(() => {
    // Inicializar com cache se disponível
    const chave = gerarChaveInicial()
    const cached = cache.get(chave)
    return cached?.data || []
  })
  
  const [loading, setLoading] = useState(() => {
    // Inicializar loading baseado em cache e auth
    const chave = gerarChaveInicial()
    const cached = cache.get(chave)
    return !cached && !authLoading
  })
  
  const [error, setError] = useState<string | null>(null)
  
  const [totalRegistros, setTotalRegistros] = useState(() => {
    // Inicializar com cache se disponível
    const chave = gerarChaveInicial()
    const cached = cache.get(chave)
    return cached?.total || 0
  })

  // Refs para controle de estado
  const mountedRef = useRef(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup quando componente desmonta
  useEffect(() => {
    mountedRef.current = true // Garantir que está montado
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Gerar chave única para cache e controle de requisições
  const gerarChave = useCallback(() => {
    return `${tema.id}_${JSON.stringify(filtros)}_${paginaAtual}_${registrosPorPagina}_${user?.id}`
  }, [tema.id, filtros, paginaAtual, registrosPorPagina, user?.id])

  // Função principal para buscar dados
  const buscarDados = useCallback(async () => {
    if (!user || !tema?.tabela || !mountedRef.current) {
      return
    }

    const chave = gerarChave()

    // Verificar cache primeiro - retornar dados mesmo se estiverem um pouco antigos
    const cached = cache.get(chave)
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity
    
    if (cached && cacheAge < STALE_TIME) {
      // Se houver cache válido (mesmo que antigo), retornar imediatamente
      if (mountedRef.current) {
        setDados(cached.data)
        setTotalRegistros(cached.total)
        setLoading(false)
        setError(null)
      }
      
      // Se os dados estão antigos mas ainda válidos, atualizar em background
      if (cacheAge >= CACHE_DURATION && cacheAge < STALE_TIME) {
        // Não bloquear UI, apenas iniciar atualização em background
        setTimeout(() => {
          if (mountedRef.current && !activeRequests.has(chave)) {
            buscarDados()
          }
        }, 100)
      }
      
      // Se os dados estão frescos, não buscar novamente
      if (cacheAge < CACHE_DURATION) {
        return
      }
    }

    // Verificar se já existe uma requisição ativa para esta chave
    if (activeRequests.has(chave)) {
      console.log('🔍 [DEBUG] Requisição já ativa, aguardando...')
      try {
        const result = await activeRequests.get(chave)
        if (mountedRef.current && result) {
          console.log('🔍 [DEBUG] Resultado da requisição ativa:', { 
            registros: result.data?.length || 0, 
            total: result.total || 0 
          })
          setDados(result.data || [])
          setTotalRegistros(result.total || 0)
          setLoading(false)
          setError(null)
        }
      } catch (err) {
        console.error('🔍 [DEBUG] Erro na requisição ativa:', err)
        if (mountedRef.current) {
          setError('Erro ao carregar dados')
          setLoading(false)
        }
      }
      return
    }

    if (mountedRef.current) {
      setLoading(true)
      setError(null)
    }

    // Criar nova requisição
    const requestPromise = (async () => {
      try {
        // Verificar se tabela existe
        if (!tema?.tabela || !verificarTabelaExiste(tema.tabela)) {
          console.error('🔍 [DEBUG] Tabela não existe:', tema?.tabela)
          throw new Error(`Tabela "${tema?.tabela}" não está disponível`)
        }

        // Obter perfil do usuário
        const profile = await obterPerfilUsuario(user.id)

        // Construir e executar query com timeout
        const query = construirQuery(tema.tabela, profile, filtros, paginaAtual, registrosPorPagina)
        
        // Timeout de 8 segundos (consistente com dashboards)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 8000)
        
        const timeoutPromise = new Promise<{ data: null, error: { message: string }, count: null }>((resolve) => {
          setTimeout(() => {
            resolve({ 
              data: null, 
              error: { message: 'Timeout: A requisição demorou mais de 8 segundos' }, 
              count: null 
            })
          }, 8000)
        })
        
        // Race entre query com abort signal e timeout
        const queryPromise = query
          .abortSignal(controller.signal)
          .then(result => {
            clearTimeout(timeoutId)
            return { result, isTimeout: false }
          })
          .catch((err: any) => {
            clearTimeout(timeoutId)
            if (err.name === 'AbortError') {
              return { result: { data: null, error: { message: 'Timeout: A requisição foi cancelada' }, count: null }, isTimeout: true }
            }
            throw err
          })
        
        const raceResult = await Promise.race([queryPromise, timeoutPromise.then(r => ({ result: r, isTimeout: true }))]) as any
        
        if (raceResult.isTimeout) {
          throw new Error('Timeout: A requisição demorou muito para responder. Tente novamente.')
        }
        
        const { data, error: queryError, count } = raceResult.result

        if (queryError) {
          if (queryError.code === 'PGRST116') {
            // Sem resultados - não é erro
            return { data: [], total: 0 }
          } else if (queryError.code === '42501') {
            throw new Error('Sem permissão para acessar estes dados')
          } else if (queryError.message?.includes('JWT')) {
            throw new Error('Sessão expirada. Faça login novamente.')
          } else {
            // Melhorar o log de erro para incluir mais detalhes
            const errorDetails = {
              message: queryError.message,
              details: queryError.details,
              hint: queryError.hint,
              code: queryError.code
            }
            console.error('Erro na consulta:', errorDetails)
            
            // Se o erro não tiver mensagem, usar uma mensagem padrão
            const errorMessage = queryError.message || 'Erro desconhecido na consulta'
            throw new Error(`Erro na consulta: ${errorMessage}`)
          }
        }

        const result = {
          data: data || [],
          total: count || 0
        }

        // Salvar no cache (memória + localStorage)
        cache.set(chave, {
          data: result.data,
          timestamp: Date.now(),
          total: result.total
        })
        saveCacheToStorage(chave, result.data, result.total)

        return result

      } catch (err: any) {
        console.error('🔍 [DEBUG] Erro ao buscar dados:', err)
        throw err
      }
    })()

    // Registrar requisição ativa
    activeRequests.set(chave, requestPromise)

    try {
      const result = await requestPromise
      
      if (mountedRef.current) {
        setDados(result.data)
        setTotalRegistros(result.total)
        setError(null)
      }
    } catch (err: any) {
      if (mountedRef.current) {
        let mensagemErro = 'Erro ao carregar dados'
        
        if (err.message?.includes('não está disponível')) {
          mensagemErro = `Tabela "${tema.tabela}" não está disponível`
        } else if (err.message?.includes('permissão')) {
          mensagemErro = 'Você não tem permissão para acessar estes dados'
        } else if (err.message?.includes('Sessão expirada')) {
          mensagemErro = 'Sua sessão expirou. Faça login novamente.'
        } else if (err.message) {
          mensagemErro = err.message
        }
        
        setError(mensagemErro)
        setDados([])
        setTotalRegistros(0)
      }
    } finally {
      // Remover requisição ativa
      activeRequests.delete(chave)
      
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [user, tema?.tabela, filtros, paginaAtual, registrosPorPagina, gerarChave])

  // Excluir registro
  const excluirRegistro = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !tema?.tabela) return false

    try {
      const { error } = await supabase
        .from(tema.tabela)
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Limpar cache (memória + localStorage) e recarregar
      cache.clear()
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith(STORAGE_PREFIX)) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
        } catch (error) {
          console.warn('⚠️ Erro ao limpar cache do localStorage:', error)
        }
      }
      activeRequests.clear()
      await buscarDados()
      
      return true
    } catch (err: any) {
      console.error('Erro ao excluir registro:', err)
      if (mountedRef.current) {
        setError(err.message || 'Erro ao excluir registro')
      }
      return false
    }
  }, [user, tema?.tabela, buscarDados])

  // Editar registro
  const editarRegistro = useCallback(async (id: string, dadosAtualizacao: any): Promise<boolean> => {
    if (!user || !tema?.tabela) return false

    try {
      const { error } = await supabase
        .from(tema.tabela)
        .update({
          ...dadosAtualizacao,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        throw error
      }

      // Limpar cache (memória + localStorage) e recarregar
      cache.clear()
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith(STORAGE_PREFIX)) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
        } catch (error) {
          console.warn('⚠️ Erro ao limpar cache do localStorage:', error)
        }
      }
      activeRequests.clear()
      await buscarDados()
      
      return true
    } catch (err: any) {
      console.error('Erro ao editar registro:', err)
      if (mountedRef.current) {
        setError(err.message || 'Erro ao editar registro')
      }
      return false
    }
  }, [user, tema.tabela, buscarDados])

  // Refetch manual
  const refetch = useCallback(() => {
    cache.clear()
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
      } catch (error) {
        console.warn('⚠️ Erro ao limpar cache do localStorage:', error)
      }
    }
    activeRequests.clear()
    buscarDados()
  }, [buscarDados])

  // Effect principal com debounce e verificação de cache inicial
  useEffect(() => {
    // Inicializar dados do cache imediatamente se disponível
    const chave = gerarChave()
    const cached = cache.get(chave)
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity
    
    if (cached && cacheAge < STALE_TIME && mountedRef.current) {
      setDados(cached.data)
      setTotalRegistros(cached.total)
      setLoading(false)
      setError(null)
      
      // Se dados estão antigos, atualizar em background
      if (cacheAge >= CACHE_DURATION) {
        setTimeout(() => {
          if (mountedRef.current && !activeRequests.has(chave)) {
            buscarDados()
          }
        }, 100)
        return
      }
    }
    
    // Se não houver cache ou auth ainda está carregando, aguardar
    if (authLoading) {
      setLoading(true)
      return
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        buscarDados()
      }
    }, 500) // Debounce de 500ms - consistente com dashboards

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [buscarDados, authLoading, gerarChave])

  return {
    dados,
    loading,
    error,
    totalRegistros,
    refetch,
    excluirRegistro,
    editarRegistro
  }
}

// Hook para contadores - versão simplificada e robusta
export function useContadoresTemas() {
  const { user } = useAuth()
  const [contadores, setContadores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  const buscarContadores = useCallback(async (temas: TemaInfo[]) => {
    if (!user || !mountedRef.current) return

    setLoading(true)

    try {
      const profile = await obterPerfilUsuario(user.id)
      const novosContadores: Record<string, number> = {}
      
      // Calcular início e fim do mês atual
      const agora = new Date()
      const ano = agora.getFullYear()
      const mes = agora.getMonth() // 0-11
      
      // Primeiro dia do mês atual
      const inicioMes = new Date(ano, mes, 1)
      const inicioMesStr = inicioMes.toISOString().split('T')[0]
      
      // Último dia do mês atual
      const fimMes = new Date(ano, mes + 1, 0)
      const fimMesStr = fimMes.toISOString().split('T')[0]

      // Processar temas em PARALELO para máxima velocidade (80% mais rápido)
      const promessasContadores = temas.map(async (tema) => {
        if (!mountedRef.current) return { id: tema.id, count: 0 }

        try {
          if (!verificarTabelaExiste(tema.tabela)) {
            return { id: tema.id, count: 0 }
          }

          const campoData = CAMPOS_DATA_POR_TABELA[tema.tabela] || 'data_referencia'
          const isTabelaTAF = tema.tabela === 'taf_resultados'

          const selectColumns = isTabelaTAF
            ? 'id, taf_registros!inner(id, secao_id, equipe_id)'
            : '*'

          let query = supabase
            .from(tema.tabela)
            .select(selectColumns, { count: 'exact', head: true })
            .gte(campoData, inicioMesStr)
            .lte(campoData, fimMesStr)

          // Aplicar RLS
          if (isTabelaTAF) {
            if (profile.perfil === 'ba_ce' && profile.secao_id) {
              query = query.eq('taf_registros.secao_id', profile.secao_id)
            } else if (profile.perfil === 'ba_op' && profile.equipe_id) {
              query = query.eq('taf_registros.equipe_id', profile.equipe_id)
            }
          } else {
            if (profile.perfil === 'ba_ce' && profile.secao_id) {
              query = query.eq('secao_id', profile.secao_id)
            } else if (profile.perfil === 'ba_op' && profile.equipe_id) {
              query = query.eq('equipe_id', profile.equipe_id)
            }
          }

          const { count, error } = await query
          
          if (error && error.code !== 'PGRST116') {
            console.warn(`Erro ao buscar contador para ${tema.tabela}:`, error.message)
            return { id: tema.id, count: 0 }
          }
          
          return { id: tema.id, count: count || 0 }

        } catch (err: any) {
          console.warn(`Erro ao buscar contador para ${tema.tabela}:`, err.message)
          return { id: tema.id, count: 0 }
        }
      })

      // Aguardar todas as requisições em paralelo
      const resultados = await Promise.all(promessasContadores)
      
      // Montar objeto de contadores
      resultados.forEach(({ id, count }) => {
        novosContadores[id] = count
      })

      if (mountedRef.current) {
        setContadores(novosContadores)
      }
    } catch (err: any) {
      console.error('Erro ao buscar contadores:', err)
      if (mountedRef.current) {
        const contadoresVazios: Record<string, number> = {}
        temas.forEach(tema => {
          contadoresVazios[tema.id] = 0
        })
        setContadores(contadoresVazios)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [user])

  return {
    contadores,
    loading,
    buscarContadores
  }
}