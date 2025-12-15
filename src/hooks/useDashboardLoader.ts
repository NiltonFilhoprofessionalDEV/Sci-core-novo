import { useState, useEffect, useRef, useCallback } from 'react'
import { useDashboardCache } from './useDashboardCache'
import { useAuth } from './useAuth'

interface UseDashboardLoaderOptions<T> {
  cacheKey: string
  fetchFunction: (filters?: any) => Promise<T[]>
  enabled?: boolean
  filters?: any
}

/**
 * Hook unificado e robusto para carregamento de dados em dashboards
 * Resolve problemas de:
 * - Race conditions
 * - Requisições duplicadas
 * - Cache inválido
 * - Componentes desmontados
 * - Timeouts
 */
export function useDashboardLoader<T>({
  cacheKey,
  fetchFunction,
  enabled = true,
  filters
}: UseDashboardLoaderOptions<T>) {
  const { user } = useAuth()
  const { getCachedData, setCachedData } = useDashboardCache<T[]>(cacheKey)
  
  const [data, setData] = useState<T[]>(() => {
    // Inicializar com cache se disponível
    const cached = getCachedData()
    return cached || []
  })
  const [loading, setLoading] = useState(() => {
    // Não mostrar loading se houver cache válido
    return !getCachedData()
  })
  const [error, setError] = useState<string | null>(null)
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const isMountedRef = useRef(true)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)

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
  }, [])

  // Função principal de carregamento
  const loadData = useCallback(async (forceRefresh = false) => {
    // Evitar requisições muito frequentes (debounce de 500ms)
    const now = Date.now()
    if (!forceRefresh && now - lastFetchTimeRef.current < 500) {
      return
    }
    lastFetchTimeRef.current = now

    // Limpar recursos anteriores
    cleanup()

    // Criar novo AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    // Verificar cache primeiro (se não for refresh forçado)
    if (!forceRefresh) {
      const cachedData = getCachedData()
      if (cachedData && cachedData.length > 0) {
        setData(cachedData)
        setLoading(false)
        setError(null)
        
        // Atualizar em background sem bloquear UI
        // Usar setTimeout para não bloquear o render
        fetchTimeoutRef.current = setTimeout(async () => {
          if (abortController.signal.aborted || !isMountedRef.current) return
          await fetchFreshData(abortController, false)
        }, 100)
        return
      }
    }

    // Se não houver cache ou for refresh forçado, carregar dados
    await fetchFreshData(abortController, true)
  }, [cacheKey, fetchFunction, filters, getCachedData, setCachedData, cleanup, fetchFreshData, enabled, user])

  // Função para buscar dados frescos
  const fetchFreshData = async (controller: AbortController, showLoading: boolean) => {
    if (!enabled || !user) {
      if (isMountedRef.current) {
        setLoading(false)
      }
      return
    }

    if (showLoading && isMountedRef.current) {
      setLoading(true)
    }
    setError(null)

    try {
      // Timeout de segurança (30 segundos)
      const timeoutPromise = new Promise<never>((_, reject) => {
        fetchTimeoutRef.current = setTimeout(() => {
          reject(new Error('Timeout: A requisição demorou muito para responder'))
        }, 30000)
      })

      // Promise de fetch com suporte a abort
      const fetchPromise = fetchFunction(filters).then((result) => {
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current)
          fetchTimeoutRef.current = null
        }
        return result
      })

      // Race entre fetch e timeout
      const fetchedData = await Promise.race([fetchPromise, timeoutPromise])

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
      if (retryCountRef.current < 2 && (err instanceof Error && (err.message.includes('Timeout') || err.message.includes('network')))) {
        retryCountRef.current += 1
        console.log(`🔄 Tentativa ${retryCountRef.current} de carregamento para ${cacheKey}`)
        
        // Retry após 1 segundo
        fetchTimeoutRef.current = setTimeout(async () => {
          if (controller.signal.aborted || !isMountedRef.current) return
          await fetchFreshData(controller, false)
        }, 1000)
        return
      }

      // Se não for possível retry ou excedeu tentativas, mostrar erro
      if (isMountedRef.current) {
        console.error(`❌ Erro ao carregar dados de ${cacheKey}:`, err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados')
        retryCountRef.current = 0 // Reset para próxima tentativa manual
      }
    } finally {
      if (isMountedRef.current && !controller.signal.aborted) {
        setLoading(false)
      }
    }
  }

  // Efeito principal
  useEffect(() => {
    isMountedRef.current = true
    
    if (enabled && user) {
      loadData(false)
    } else if (!user) {
      // Se não houver usuário, limpar dados
      setData([])
      setLoading(false)
      setError(null)
    }

    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [enabled, user?.id, loadData, cleanup])

  // Função para refresh manual
  const refetch = useCallback(() => {
    loadData(true)
  }, [loadData])

  return {
    data,
    loading,
    error,
    refetch
  }
}

