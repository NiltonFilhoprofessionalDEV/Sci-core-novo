// Hook unificado e robusto para carregamento de dados de dashboard
// Garante que usuários sempre vejam apenas dados da sua base
import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import { useDashboardCache } from './useDashboardCache'

interface UseDashboardDataOptions<T> {
  tableName: string
  selectFields: string
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  cacheKey?: string
  enabled?: boolean
  additionalFilters?: (query: any) => any
}

interface UseDashboardDataReturn<T> {
  data: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isReady: boolean // Indica se o usuário está pronto e os dados podem ser carregados
}

/**
 * Hook unificado para carregamento de dados de dashboard
 * 
 * Características:
 * - Sempre filtra por base do usuário (secao_id) para perfil BA-CE
 * - Usa cache inteligente para carregamento rápido
 * - Tratamento robusto de erros
 * - Não fica em loading infinito
 * - Retry automático em caso de falha
 * - Cancela requisições antigas automaticamente
 */
export function useDashboardData<T>({
  tableName,
  selectFields,
  orderBy = { column: 'created_at', ascending: false },
  limit = 1000,
  cacheKey,
  enabled = true,
  additionalFilters
}: UseDashboardDataOptions<T>): UseDashboardDataReturn<T> {
  const { user, loading: authLoading } = useAuth()
  
  // Gerar chave de cache única baseada na tabela e base do usuário
  const finalCacheKey = cacheKey || `${tableName}-${user?.profile?.secao_id || 'all'}`
  const { getCachedData, setCachedData } = useDashboardCache<T[]>(finalCacheKey)
  
  // Quando o cacheKey mudar, limpar os dados antigos e recarregar
  const [data, setData] = useState<T[]>(() => {
    // Inicializar com cache se disponível
    const cached = getCachedData()
    return cached || []
  })
  
  // Quando o cacheKey mudar, atualizar os dados do cache
  useEffect(() => {
    const cached = getCachedData()
    if (cached) {
      setData(cached)
    } else {
      setData([])
    }
  }, [finalCacheKey, getCachedData])
  
  const [loading, setLoading] = useState(() => {
    // Sempre mostrar loading inicialmente se auth estiver carregando ou não houver cache
    const cached = getCachedData()
    return authLoading || !cached
  })
  
  const [error, setError] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  
  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const checkReadyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar se o usuário está pronto para carregar dados
  const checkUserReady = useCallback(() => {
    if (authLoading) return false
    if (!user) return false
    if (!user.profile) return false
    
    // Para perfil BA-CE, é obrigatório ter secao_id
    if (user.profile.perfil === 'ba_ce' && !user.profile.secao_id) {
      return false
    }
    
    return true
  }, [user, authLoading])

  // Função para limpar recursos
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }
    if (checkReadyTimeoutRef.current) {
      clearTimeout(checkReadyTimeoutRef.current)
      checkReadyTimeoutRef.current = null
    }
  }, [])

  // Função principal para buscar dados
  const fetchData = useCallback(async (forceRefresh = false, showLoading = true) => {
    // Verificar se está pronto
    if (!checkUserReady()) {
      setIsReady(false)
      if (showLoading) {
        setLoading(false)
      }
      return
    }

    setIsReady(true)

    // Evitar requisições muito frequentes (debounce de 500ms)
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTimeRef.current < 500) {
      return
    }
    lastFetchTimeRef.current = now

    // Limpar requisição anterior
    cleanup()

    // Criar novo AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Verificar cache primeiro (se não for refresh forçado)
    if (!forceRefresh) {
      const cachedData = getCachedData()
      if (cachedData && cachedData.length >= 0) {
        setData(cachedData)
        setLoading(false)
        setError(null)
        
        // Atualizar em background sem bloquear UI
        fetchTimeoutRef.current = setTimeout(async () => {
          if (abortController.signal.aborted || !isMountedRef.current) return
          await fetchFreshData(abortController, false)
        }, 200)
        return
      }
    }

    // Se não houver cache ou for refresh forçado, carregar dados
    await fetchFreshData(abortController, showLoading)
  }, [checkUserReady, getCachedData, cleanup, finalCacheKey, additionalFilters])

  // Função para buscar dados frescos do servidor
  const fetchFreshData = async (controller: AbortController, showLoading: boolean) => {
    if (!isMountedRef.current || controller.signal.aborted) return

    if (!user || !user.profile) {
      if (isMountedRef.current) {
        setError('Usuário não autenticado')
        setLoading(false)
      }
      return
    }

    // Validar que usuário BA-CE tem secao_id
    if (user.profile.perfil === 'ba_ce' && !user.profile.secao_id) {
      if (isMountedRef.current) {
        setError('Não foi possível identificar a base do usuário. Entre em contato com o suporte.')
        setLoading(false)
      }
      return
    }

    if (showLoading && isMountedRef.current) {
      setLoading(true)
    }
    setError(null)

    try {
      // Construir query base
      let query = supabase
        .from(tableName)
        .select(selectFields)
        .order(orderBy.column, { ascending: orderBy.ascending ?? false })
        .limit(limit)

      // Aplicar filtros adicionais primeiro (para casos como TAF que precisam filtrar no join)
      if (additionalFilters) {
        query = additionalFilters(query)
      } else {
        // SEMPRE aplicar filtro por base para usuários BA-CE (apenas se não houver additionalFilters)
        if (user.profile.perfil === 'ba_ce' && user.profile.secao_id) {
          query = query.eq('secao_id', user.profile.secao_id)
        } else if (user.profile.perfil === 'ba_op' && user.profile.equipe_id) {
          // Para operadores, filtrar por equipe
          query = query.eq('equipe_id', user.profile.equipe_id)
        }
      }

      // Timeout de 8 segundos (otimizado para melhor responsividade)
      const timeoutPromise = new Promise<never>((_, reject) => {
        fetchTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout: A requisição demorou muito para responder'))
        }, 8000)
      })

      // Promise de query
      const queryPromise = query.then((result) => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current)
          fetchTimeoutRef.current = null
        }
        if (result.error) {
          throw result.error
        }
        return result.data || []
      })

      // Race entre query e timeout
      const fetchedData = await Promise.race([queryPromise, timeoutPromise]) as T[]

      // Verificar se foi cancelado
      if (controller.signal.aborted || !isMountedRef.current) {
        return
      }

      // Atualizar estado apenas se ainda estiver montado
      if (isMountedRef.current) {
        setData(fetchedData)
        setCachedData(fetchedData)
        setError(null)
        retryCountRef.current = 0 // Reset retry count em caso de sucesso
      }
    } catch (err) {
      // Verificar se foi cancelado
      if (controller.signal.aborted || !isMountedRef.current) {
        return
      }

      // Se for timeout ou erro de rede, tentar novamente (máximo 2 tentativas)
      const isRetryableError = err instanceof Error && (
        err.message.includes('Timeout') ||
        err.message.includes('network') ||
        err.message.includes('fetch')
      )

      if (isRetryableError && retryCountRef.current < 2) {
        retryCountRef.current += 1
        console.log(`🔄 Tentativa ${retryCountRef.current} de carregamento para ${tableName}`)
        
        // Retry após 1 segundo
        fetchTimeoutRef.current = setTimeout(async () => {
          if (controller.signal.aborted || !isMountedRef.current) return
          await fetchFreshData(controller, false)
        }, 1000)
        return
      }

      // Se não for possível retry ou excedeu tentativas, mostrar erro
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Erro desconhecido ao carregar dados'
        
        console.error(`❌ Erro ao carregar dados de ${tableName}:`, err)
        setError(errorMessage)
        retryCountRef.current = 0 // Reset para próxima tentativa manual
      }
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  // Função para refetch manual
  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await fetchData(true, true)
  }, [fetchData])

  // Effect principal
  useEffect(() => {
    isMountedRef.current = true
    
    if (!enabled) {
      setLoading(false)
      setIsReady(false)
      setError(null)
      return
    }

    // Limpar timeout anterior se existir
    if (checkReadyTimeoutRef.current) {
      clearTimeout(checkReadyTimeoutRef.current)
      checkReadyTimeoutRef.current = null
    }

    // Aguardar autenticação estar pronta - não definir erro enquanto estiver carregando
    if (authLoading) {
      setLoading(true)
      setIsReady(false)
      setError(null) // Limpar erro enquanto carrega
      return
    }

    // Se auth não está carregando, verificar se usuário está pronto
    const isReady = checkUserReady()
    
    if (isReady) {
      // Usuário está pronto, limpar erro e carregar dados imediatamente
      setError(null)
      fetchData(false, true)
      return
    }

    // Se não estiver pronto, aguardar um pequeno delay antes de mostrar erro
    // Isso evita mostrar erro durante navegação rápida entre abas
    checkReadyTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return
      
      // Verificar novamente se usuário está pronto (pode ter mudado durante o delay)
      const stillReady = checkUserReady()
      
      if (stillReady) {
        // Se agora estiver pronto, carregar dados
        setError(null)
        fetchData(false, true)
        return
      }
      
      // Se ainda não estiver pronto, mostrar erro apropriado
      setLoading(false)
      setIsReady(false)
      
      if (!user) {
        setError('Usuário não autenticado')
      } else if (!user.profile) {
        setError('Perfil do usuário não encontrado')
      } else if (user.profile.perfil === 'ba_ce' && !user.profile.secao_id) {
        setError('Base do usuário não identificada')
      } else {
        setError(null)
      }
    }, 200) // Delay reduzido para 200ms para melhor performance

    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [enabled, authLoading, user?.id, user?.profile?.secao_id, user?.profile?.perfil, checkUserReady, fetchData, cleanup, finalCacheKey, additionalFilters])

  return {
    data,
    loading,
    error,
    refetch,
    isReady
  }
}
