import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../useAuth'

interface DashboardFilters {
  secaoId?: string
  equipeId?: string
  meses: number
}

/**
 * Hook usando React Query para buscar métricas do dashboard
 * Substitui o hook antigo useDashboardMetrics com cache automático
 */
export function useDashboardMetricsQuery(filters: DashboardFilters) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['dashboard-metrics', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      
      if (filters.secaoId && filters.secaoId !== 'todas') {
        params.append('secaoId', filters.secaoId)
      }
      if (filters.equipeId) {
        params.append('equipeId', filters.equipeId)
      }
      params.append('meses', filters.meses.toString())

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const response = await fetch(`/api/dashboard/metrics?${params.toString()}`, {
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao buscar métricas')
      }

      return response.json()
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

