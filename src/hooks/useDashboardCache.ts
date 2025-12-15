// Sistema de cache para dashboards - evita recarregamentos desnecessários
import { useRef, useCallback, useEffect } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  key: string
}

// Cache global em memória
const dashboardCache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos - dados dinâmicos (indicadores preenchidos diariamente)
const STALE_TIME = 15 * 60 * 1000 // 15 minutos - dados podem ser considerados stale mas ainda usáveis

// Prefixo para chaves do localStorage
const STORAGE_PREFIX = 'sci-dashboard-cache-'

// Flag para controlar se já inicializou o cache do localStorage
let cacheInitialized = false

// Carregar cache do localStorage na inicialização
function initializeCacheFromStorage() {
  if (cacheInitialized || typeof window === 'undefined') return
  cacheInitialized = true

  try {
    // Limpar entradas antigas do localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const item = localStorage.getItem(key)
        if (item) {
          try {
            const cached: CacheEntry<any> = JSON.parse(item)
            const age = Date.now() - cached.timestamp
            
            // Se muito antigo, marcar para remoção
            if (age > STALE_TIME) {
              keysToRemove.push(key)
            } else {
              // Carregar no cache em memória
              dashboardCache.set(cached.key, cached)
            }
          } catch {
            keysToRemove.push(key)
          }
        }
      }
    }

    // Remover entradas antigas
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.warn('⚠️ Erro ao carregar cache do localStorage:', error)
  }
}

// Salvar cache no localStorage
function saveCacheToStorage(cacheKey: string, entry: CacheEntry<any>) {
  if (typeof window === 'undefined') return

  try {
    const storageKey = STORAGE_PREFIX + cacheKey
    localStorage.setItem(storageKey, JSON.stringify(entry))
  } catch (error) {
    // localStorage pode estar cheio ou indisponível
    console.warn('⚠️ Erro ao salvar cache no localStorage:', error)
  }
}

// Remover cache do localStorage
function removeCacheFromStorage(cacheKey: string) {
  if (typeof window === 'undefined') return

  try {
    const storageKey = STORAGE_PREFIX + cacheKey
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.warn('⚠️ Erro ao remover cache do localStorage:', error)
  }
}

export function useDashboardCache<T>(cacheKey: string) {
  const cacheKeyRef = useRef(cacheKey)

  // Inicializar cache do localStorage na primeira montagem
  useEffect(() => {
    initializeCacheFromStorage()
  }, [])

  // Obter dados do cache (memória + localStorage)
  const getCachedData = useCallback((): T | null => {
    // Tentar cache em memória primeiro (mais rápido)
    let cached = dashboardCache.get(cacheKeyRef.current)
    
    // Se não estiver em memória, tentar localStorage
    if (!cached && typeof window !== 'undefined') {
      try {
        const storageKey = STORAGE_PREFIX + cacheKeyRef.current
        const item = localStorage.getItem(storageKey)
        if (item) {
          cached = JSON.parse(item)
          // Restaurar no cache em memória
          if (cached) {
            dashboardCache.set(cacheKeyRef.current, cached)
          }
        }
      } catch (error) {
        console.warn('⚠️ Erro ao ler cache do localStorage:', error)
      }
    }

    if (!cached) return null

    const age = Date.now() - cached.timestamp
    
    // Se os dados estão muito antigos, remover do cache
    if (age > STALE_TIME) {
      dashboardCache.delete(cacheKeyRef.current)
      removeCacheFromStorage(cacheKeyRef.current)
      return null
    }

    // Retornar dados mesmo se estiverem um pouco antigos (stale)
    // Isso permite carregamento instantâneo enquanto atualiza em background
    return cached.data
  }, [])

  // Salvar dados no cache (memória + localStorage)
  const setCachedData = useCallback((data: T) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      key: cacheKeyRef.current
    }
    
    // Salvar em memória
    dashboardCache.set(cacheKeyRef.current, entry)
    
    // Salvar no localStorage
    saveCacheToStorage(cacheKeyRef.current, entry)
  }, [])

  // Limpar cache específico (memória + localStorage)
  const clearCache = useCallback(() => {
    dashboardCache.delete(cacheKeyRef.current)
    removeCacheFromStorage(cacheKeyRef.current)
  }, [])

  // Limpar todo o cache (memória + localStorage)
  const clearAllCache = useCallback(() => {
    dashboardCache.clear()
    
    // Limpar localStorage
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
  }, [])

  return {
    getCachedData,
    setCachedData,
    clearCache,
    clearAllCache
  }
}

// Função utilitária para invalidar cache por padrão (pattern matching)
export function invalidateCachePattern(pattern: string) {
  const keysToDelete: string[] = []
  
  // Buscar chaves em memória que correspondem ao padrão
  for (const key of dashboardCache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key)
    }
  }
  
  // Remover da memória
  keysToDelete.forEach(key => {
    dashboardCache.delete(key)
    removeCacheFromStorage(key)
  })
  
  console.log(`🗑️ Cache invalidado: ${keysToDelete.length} entradas removidas para padrão "${pattern}"`)
  return keysToDelete.length
}

// Função utilitária para limpar cache de uma página específica
export function clearDashboardCache(cacheKey: string) {
  dashboardCache.delete(cacheKey)
  removeCacheFromStorage(cacheKey)
}

// Função utilitária para limpar todo o cache
export function clearAllDashboardCache() {
  dashboardCache.clear()
  
  // Limpar localStorage
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
}

