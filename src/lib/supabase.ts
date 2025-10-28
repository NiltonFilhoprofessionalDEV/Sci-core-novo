import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhuhyervzndsatdngyl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'

// Configuração mais robusta do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
})

// Função utilitária para retry com backoff exponencial
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Se é o último attempt, lança o erro
      if (attempt === maxRetries) {
        throw lastError
      }

      // Verificar se é um erro de rede que vale a pena tentar novamente
      const isRetryableError = 
        error instanceof Error && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('ERR_INSUFFICIENT_RESOURCES') ||
          error.message.includes('ERR_ABORTED') ||
          error.message.includes('ERR_NETWORK') ||
          error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('timeout')
        )

      if (!isRetryableError) {
        throw error
      }

      // Calcular delay com backoff exponencial + jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} falhou, tentando novamente em ${Math.round(delay)}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Função para verificar conectividade
export async function checkConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('secoes')
      .select('id')
      .limit(1)
      .single()
    
    return !error
  } catch {
    return false
  }
}