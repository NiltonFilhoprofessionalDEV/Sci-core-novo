import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../useAuth'

interface UseContadoresTemasOptions {
  mesReferencia: string
  secaoId?: string
}

/**
 * Hook usando React Query para buscar contadores de temas
 * Substitui useContadoresTemas com cache automático
 */
export function useContadoresTemasQuery({ mesReferencia, secaoId }: UseContadoresTemasOptions) {
  const { session } = useAuth()

  return useQuery({
    queryKey: ['contadores-temas', mesReferencia, secaoId],
    queryFn: async () => {
      const params = new URLSearchParams({
        mesReferencia,
      })

      if (secaoId && secaoId !== 'todas') {
        params.append('secaoId', secaoId)
      }

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

      const data = await response.json()

      // Converter array de contadores em objeto para acesso fácil
      const contadoresMap: Record<string, number> = {}
      data.contadores.forEach((c: { tema: string; count: number }) => {
        contadoresMap[c.tema] = c.count
      })

      return contadoresMap
    },
    enabled: !!session && !!mesReferencia,
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

