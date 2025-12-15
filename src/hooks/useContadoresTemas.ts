import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'

interface Contador {
  tema: string
  count: number
}

interface ContadoresResponse {
  contadores: Contador[]
  metadata: {
    mesReferencia: string
    secaoId: string
    periodo: {
      inicio: string
      fim: string
    }
  }
}

interface UseContadoresTemasOptions {
  mesReferencia: string
  secaoId?: string
}

/**
 * Hook para buscar contadores de temas do histórico
 * Substitui múltiplas queries paralelas por uma única chamada à API
 * 
 * @param mesReferencia - Mês de referência no formato YYYY-MM
 * @param secaoId - ID da seção (opcional)
 * 
 * @returns { contadores, loading, error, refresh }
 */
export function useContadoresTemas({ mesReferencia, secaoId }: UseContadoresTemasOptions) {
  const [contadores, setContadores] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)
  const { session } = useAuth()

  const fetchContadores = useCallback(async () => {
    if (!mesReferencia) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Construir URL com parâmetros
      const params = new URLSearchParams({
        mesReferencia,
      })

      if (secaoId && secaoId !== 'todas') {
        params.append('secaoId', secaoId)
      }

      // Fazer requisição com token de autenticação
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/historico/contadores?${params.toString()}`, {
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar contadores')
      }

      const data: ContadoresResponse = await response.json()

      // Converter array de contadores em objeto para acesso fácil
      const contadoresMap: Record<string, number> = {}
      data.contadores.forEach((c) => {
        contadoresMap[c.tema] = c.count
      })

      setContadores(contadoresMap)
    } catch (err) {
      console.error('Erro ao buscar contadores de temas:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setContadores({})
    } finally {
      setLoading(false)
    }
  }, [mesReferencia, secaoId, session?.access_token])

  useEffect(() => {
    fetchContadores()
  }, [fetchContadores, refreshToken])

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1)
  }, [])

  return {
    contadores,
    loading,
    error,
    refresh,
  }
}

