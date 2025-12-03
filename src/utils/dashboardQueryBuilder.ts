import { SupabaseClient } from '@supabase/supabase-js'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'

/**
 * Utilitário para construir queries do Supabase de forma consistente
 * com timeout e retry automático
 */
export async function executeSupabaseQuery<T>(
  queryBuilder: PostgrestQueryBuilder<any, any, any>,
  timeout = 20000
): Promise<T[]> {
  // Criar promise com timeout
  const queryPromise = queryBuilder.then(({ data, error }) => {
    if (error) throw error
    return (data ?? []) as T[]
  })

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Query timeout: A requisição demorou muito para responder'))
    }, timeout)
  })

  try {
    return await Promise.race([queryPromise, timeoutPromise])
  } catch (error) {
    // Se for timeout, tentar novamente uma vez
    if (error instanceof Error && error.message.includes('timeout')) {
      console.log('⏱️ Timeout na query, tentando novamente...')
      return await queryBuilder.then(({ data, error }) => {
        if (error) throw error
        return (data ?? []) as T[]
      })
    }
    throw error
  }
}

