'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export interface Secao {
  id: string
  nome: string
  cidade: string
  codigo?: string
  estado?: string
  ativa?: boolean
}

export interface Equipe {
  id: string
  nome: string
  secao_id: string
  nome_cidade?: string
  ativa?: boolean
}

interface SecoesContextType {
  // Estados
  secoes: Secao[]
  equipes: Equipe[]
  loading: boolean
  error: string | null
  
  // Funções otimizadas
  getSecaoById: (id: string) => Secao | undefined
  getSecaoByUser: () => Secao | undefined
  getEquipesBySecao: (secaoId: string) => Equipe[]
  refreshSecoes: () => Promise<void>
  refreshEquipes: (secaoId: string) => Promise<void>
  clearAllCaches: () => void
  
  // Cache status
  isSecoesLoaded: boolean
  lastUpdated: Date | null
}

const SecoesContext = createContext<SecoesContextType | undefined>(undefined)

const CACHE_KEY_SECOES = 'sci_secoes_cache'
const CACHE_KEY_EQUIPES = 'sci_equipes_cache'
const CACHE_EXPIRY_HOURS = 24 // Cache válido por 24 horas

interface SecoesProviderProps {
  children: ReactNode
}

export function SecoesProvider({ children }: SecoesProviderProps) {
  const { user, profile } = useAuth()
  const [secoes, setSecoes] = useState<Secao[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSecoesLoaded, setIsSecoesLoaded] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Verificar se o cache está válido
  const isCacheValid = (timestamp: string): boolean => {
    const cacheTime = new Date(timestamp)
    const now = new Date()
    const diffHours = (now.getTime() - cacheTime.getTime()) / (1000 * 60 * 60)
    return diffHours < CACHE_EXPIRY_HOURS
  }

  // Carregar seções do cache ou banco
  const loadSecoes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Tentar carregar do cache primeiro
      const cachedData = localStorage.getItem(CACHE_KEY_SECOES)
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData)
          
          // Validar estrutura do cache
          if (parsed && parsed.data && Array.isArray(parsed.data) && parsed.timestamp) {
            if (isCacheValid(parsed.timestamp)) {
              console.log('📦 Carregando seções do cache local')
              setSecoes(parsed.data)
              setIsSecoesLoaded(true)
              setLastUpdated(new Date(parsed.timestamp))
              setLoading(false)
              return
            } else {
              console.log('⏰ Cache expirado, buscando dados atualizados')
            }
          } else {
            console.warn('⚠️ Cache com estrutura inválida, limpando...')
            localStorage.removeItem(CACHE_KEY_SECOES)
          }
        } catch (parseError) {
          console.warn('⚠️ Erro ao fazer parse do cache, limpando...', parseError)
          localStorage.removeItem(CACHE_KEY_SECOES)
        }
      }

      // Cache inválido ou inexistente, buscar do banco
      console.log('🔍 Buscando seções do banco de dados')
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade, codigo, estado, ativa')
        .eq('ativa', true)
        .order('nome')

      if (error) {
        throw new Error(`Erro ao buscar seções: ${error.message || JSON.stringify(error)}`)
      }

      const secoesData = data || []
      setSecoes(secoesData)
      setIsSecoesLoaded(true)
      
      // Salvar no cache
      try {
        const cacheData = {
          data: secoesData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(CACHE_KEY_SECOES, JSON.stringify(cacheData))
        setLastUpdated(new Date())
      } catch (cacheError) {
        console.warn('⚠️ Erro ao salvar cache (continuando normalmente):', cacheError)
      }

      console.log(`✅ ${secoesData.length} seções carregadas e cacheadas`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          (typeof err === 'object' && err !== null ? JSON.stringify(err) : 
                          'Erro desconhecido ao carregar seções')
      console.error('❌ Erro ao carregar seções:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar equipes de uma seção específica
  const loadEquipesBySecao = useCallback(async (secaoId: string) => {
    try {
      // Verificar cache de equipes
      const cacheKey = `${CACHE_KEY_EQUIPES}_${secaoId}`
      const cachedEquipes = localStorage.getItem(cacheKey)
      
      if (cachedEquipes) {
        try {
          const parsed = JSON.parse(cachedEquipes)
          
          // Validar estrutura do cache
          if (parsed && parsed.data && Array.isArray(parsed.data) && parsed.timestamp) {
            if (isCacheValid(parsed.timestamp)) {
              console.log(`📦 Carregando equipes da seção ${secaoId} do cache`)
              // Atualizar apenas as equipes desta seção
              setEquipes(prev => {
                const filtered = prev.filter(e => e.secao_id !== secaoId)
                return [...filtered, ...parsed.data]
              })
              return parsed.data
            } else {
              console.log(`⏰ Cache de equipes da seção ${secaoId} expirado`)
            }
          } else {
            console.warn(`⚠️ Cache de equipes com estrutura inválida, limpando...`)
            localStorage.removeItem(cacheKey)
          }
        } catch (parseError) {
          console.warn(`⚠️ Erro ao fazer parse do cache de equipes, limpando...`, parseError)
          localStorage.removeItem(cacheKey)
        }
      }

      console.log(`🔍 Buscando equipes da seção ${secaoId} do banco`)
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, secao_id, nome_cidade, ativa')
        .eq('secao_id', secaoId)
        .eq('ativa', true)
        .order('nome')

      if (error) {
        throw new Error(`Erro ao buscar equipes: ${error.message || JSON.stringify(error)}`)
      }

      const equipesData = data || []
      
      // Atualizar estado
      setEquipes(prev => {
        const filtered = prev.filter(e => e.secao_id !== secaoId)
        return [...filtered, ...equipesData]
      })

      // Salvar no cache
      try {
        const cacheData = {
          data: equipesData,
          timestamp: new Date().toISOString()
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      } catch (cacheError) {
        console.warn('⚠️ Erro ao salvar cache de equipes (continuando normalmente):', cacheError)
      }

      console.log(`✅ ${equipesData.length} equipes da seção ${secaoId} carregadas`)
      return equipesData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          (typeof err === 'object' && err !== null ? JSON.stringify(err) : 
                          `Erro desconhecido ao carregar equipes da seção ${secaoId}`)
      console.error(`❌ Erro ao carregar equipes da seção ${secaoId}:`, errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  // Funções públicas otimizadas
  const getSecaoById = useCallback((id: string): Secao | undefined => {
    return secoes.find(secao => secao.id === id)
  }, [secoes])

  const getSecaoByUser = useCallback((): Secao | undefined => {
    if (!profile?.secao_id) return undefined
    return getSecaoById(profile.secao_id)
  }, [profile?.secao_id, getSecaoById])

  const getEquipesBySecao = useCallback((secaoId: string): Equipe[] => {
    return equipes.filter(equipe => equipe.secao_id === secaoId)
  }, [equipes])

  const refreshSecoes = useCallback(async () => {
    // Limpar cache e recarregar
    localStorage.removeItem(CACHE_KEY_SECOES)
    await loadSecoes()
  }, [loadSecoes])

  const refreshEquipes = useCallback(async (secaoId: string) => {
    // Limpar cache específico e recarregar
    const cacheKey = `${CACHE_KEY_EQUIPES}_${secaoId}`
    localStorage.removeItem(cacheKey)
    await loadEquipesBySecao(secaoId)
  }, [loadEquipesBySecao])

  // Limpar todos os caches
  const clearAllCaches = useCallback(() => {
    try {
      // Limpar cache de seções
      localStorage.removeItem(CACHE_KEY_SECOES)
      
      // Limpar todos os caches de equipes
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_EQUIPES)) {
          localStorage.removeItem(key)
        }
      })
      
      console.log('🗑️ Todos os caches foram limpos')
    } catch (error) {
      console.warn('⚠️ Erro ao limpar caches:', error)
    }
  }, [])

  // Carregar seções automaticamente quando o contexto é inicializado
  useEffect(() => {
    if (!isSecoesLoaded && !loading) {
      loadSecoes().catch(err => {
        console.error('❌ Falha crítica ao carregar seções:', err)
        // Em caso de erro crítico, limpar cache e tentar novamente
        clearAllCaches()
      })
    }
  }, [isSecoesLoaded, loading, loadSecoes, clearAllCaches])

  // Pré-carregar equipes da seção do usuário
  useEffect(() => {
    if (profile?.secao_id && isSecoesLoaded && !loading) {
      const equipesJaCarregadas = equipes.some(e => e.secao_id === profile.secao_id)
      if (!equipesJaCarregadas) {
        console.log('🚀 Pré-carregando equipes da seção do usuário:', profile.secao_id)
        loadEquipesBySecao(profile.secao_id).catch(err => {
          console.error('❌ Erro ao pré-carregar equipes:', err)
        })
      }
    }
  }, [profile?.secao_id, isSecoesLoaded, loading, equipes, loadEquipesBySecao])

  const contextValue: SecoesContextType = {
    // Estados
    secoes,
    equipes,
    loading,
    error,
    
    // Funções
    getSecaoById,
    getSecaoByUser,
    getEquipesBySecao,
    refreshSecoes,
    refreshEquipes,
    clearAllCaches,
    
    // Cache status
    isSecoesLoaded,
    lastUpdated
  }

  return (
    <SecoesContext.Provider value={contextValue}>
      {children}
    </SecoesContext.Provider>
  )
}

// Hook para usar o contexto
export function useSecoes() {
  const context = useContext(SecoesContext)
  if (context === undefined) {
    throw new Error('useSecoes deve ser usado dentro de um SecoesProvider')
  }
  return context
}

// Hook otimizado para equipes por seção
export function useEquipesBySecao(secaoId: string | undefined) {
  const { getEquipesBySecao, refreshEquipes, loading } = useSecoes()
  const [equipesLoading, setEquipesLoading] = useState(false)

  const equipes = secaoId ? getEquipesBySecao(secaoId) : []

  const loadEquipes = useCallback(async () => {
    if (!secaoId) return
    
    try {
      setEquipesLoading(true)
      await refreshEquipes(secaoId)
    } catch (error) {
      console.error('Erro ao carregar equipes:', error)
    } finally {
      setEquipesLoading(false)
    }
  }, [secaoId, refreshEquipes])

  return {
    equipes,
    loading: loading || equipesLoading,
    refresh: loadEquipes
  }
}