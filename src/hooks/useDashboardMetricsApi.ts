import { useState, useEffect, useCallback, useMemo } from 'react'
import type { DashboardFilters, DashboardData } from './useDashboardMetrics'

interface DashboardState {
  data: DashboardData | null
  loading: boolean
  error: string | null
}

/**
 * Hook leve para consumir a API centralizada de métricas do dashboard
 * Substitui o useDashboardMetrics original, movendo toda a lógica pesada para o servidor
 */
export function useDashboardMetricsApi(filters: DashboardFilters) {
  const [state, setState] = useState<DashboardState>({ data: null, loading: true, error: null })
  const [refreshToken, setRefreshToken] = useState(0)

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const params = new URLSearchParams()
      if (filters.secaoId) params.set('secaoId', filters.secaoId)
      if (filters.equipeId) params.set('equipeId', filters.equipeId)
      if (filters.meses) params.set('meses', String(filters.meses))

      const res = await fetch(`/api/dashboard/metrics?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Erro ao carregar métricas do dashboard')
      }

      const json = (await res.json()) as DashboardData
      setState({ data: json, loading: false, error: null })
    } catch (err: any) {
      console.error('Erro em useDashboardMetricsApi:', err)
      setState({
        data: null,
        loading: false,
        error: err?.message || 'Erro ao carregar métricas do dashboard',
      })
    }
  }, [filters.secaoId, filters.equipeId, filters.meses])

  useEffect(() => {
    fetchData()
  }, [fetchData, refreshToken])

  const refresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1)
  }, [])

  return useMemo(
    () => ({
      data: state.data,
      loading: state.loading,
      error: state.error,
      refresh,
    }),
    [state.data, state.loading, state.error, refresh],
  )
}

