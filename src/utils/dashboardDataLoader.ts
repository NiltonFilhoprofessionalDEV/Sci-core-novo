import { supabase } from '@/lib/supabase'

interface LoadDashboardDataOptions<T> {
  tableName: string
  selectFields: string
  filters?: {
    secaoId?: string | null
    isBace?: boolean
  }
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  abortSignal?: AbortSignal
  onSuccess?: (data: T[]) => void
  onError?: (error: Error) => void
}

export async function loadDashboardData<T>({
  tableName,
  selectFields,
  filters,
  orderBy = { column: 'created_at', ascending: false },
  limit = 1000,
  abortSignal,
  onSuccess,
  onError
}: LoadDashboardDataOptions<T>): Promise<T[] | null> {
  try {
    let query = supabase
      .from(tableName)
      .select(selectFields)
      .order(orderBy.column, { ascending: orderBy.ascending ?? false })
      .limit(limit)

    // Aplicar filtros
    if (filters?.isBace && filters?.secaoId) {
      query = query.eq('secao_id', filters.secaoId)
    }

    const { data, error: supabaseError } = await query

    // Verificar se foi cancelado
    if (abortSignal?.aborted) {
      return null
    }

    if (supabaseError) {
      throw supabaseError
    }

    const resultData = (data ?? []) as T[]
    
    if (onSuccess) {
      onSuccess(resultData)
    }

    return resultData
  } catch (err) {
    if (abortSignal?.aborted) {
      return null
    }
    
    const error = err instanceof Error ? err : new Error('Erro desconhecido ao carregar dados')
    if (onError) {
      onError(error)
    }
    throw error
  }
}

