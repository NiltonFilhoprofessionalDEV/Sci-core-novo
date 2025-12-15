import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../useAuth'

interface IndicatorFilters {
  secaoId?: string
  equipeId?: string
  dataInicio?: string
  dataFim?: string
  page?: number
  limit?: number
}

/**
 * Hook genérico usando React Query para buscar dados de indicadores
 * Pode ser usado para qualquer um dos 14 indicadores
 */
export function useIndicatorQuery(indicator: string, filters: IndicatorFilters = {}) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['indicator', indicator, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.secaoId && filters.secaoId !== 'todas') {
        params.append('secaoId', filters.secaoId)
      }
      if (filters.equipeId) {
        params.append('equipeId', filters.equipeId)
      }
      if (filters.dataInicio) {
        params.append('dataInicio', filters.dataInicio)
      }
      if (filters.dataFim) {
        params.append('dataFim', filters.dataFim)
      }
      if (filters.page) {
        params.append('page', filters.page.toString())
      }
      if (filters.limit) {
        params.append('limit', filters.limit.toString())
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/indicators/${indicator}?${params.toString()}`, {
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao buscar ${indicator}`)
      }

      return response.json()
    },
    enabled: !!session && !!indicator,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

