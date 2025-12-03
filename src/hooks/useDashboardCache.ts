// Sistema de cache para dashboards - evita recarregamentos desnecessários
import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  key: string
}

// Cache global em memória
const dashboardCache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos (aumentado de 2 para 5)
const STALE_TIME = 10 * 60 * 1000 // 10 minutos - dados podem ser considerados stale mas ainda usáveis

export function useDashboardCache<T>(cacheKey: string) {
  const cacheKeyRef = useRef(cacheKey)

  // Obter dados do cache
  const getCachedData = useCallback((): T | null => {
    const cached = dashboardCache.get(cacheKeyRef.current)
    if (!cached) return null

    const age = Date.now() - cached.timestamp
    
    // Se os dados estão muito antigos, remover do cache
    if (age > STALE_TIME) {
      dashboardCache.delete(cacheKeyRef.current)
      return null
    }

    // Retornar dados mesmo se estiverem um pouco antigos (stale)
    // Isso permite carregamento instantâneo enquanto atualiza em background
    return cached.data
  }, [])

  // Salvar dados no cache
  const setCachedData = useCallback((data: T) => {
    dashboardCache.set(cacheKeyRef.current, {
      data,
      timestamp: Date.now(),
      key: cacheKeyRef.current
    })
  }, [])

  // Limpar cache específico
  const clearCache = useCallback(() => {
    dashboardCache.delete(cacheKeyRef.current)
  }, [])

  // Limpar todo o cache
  const clearAllCache = useCallback(() => {
    dashboardCache.clear()
  }, [])

  return {
    getCachedData,
    setCachedData,
    clearCache,
    clearAllCache
  }
}

// Função utilitária para limpar cache de uma página específica
export function clearDashboardCache(cacheKey: string) {
  dashboardCache.delete(cacheKey)
}

// Função utilitária para limpar todo o cache
export function clearAllDashboardCache() {
  dashboardCache.clear()
}

