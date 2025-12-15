import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Configuração mais robusta do cliente Supabase com timeouts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Tratar erros de refresh token
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
    // Não sobrescrever fetch globalmente para evitar problemas com Supabase
    // Timeouts serão adicionados nas queries individuais
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

// Observação: O tratamento de erros de refresh token inválido é feito no hook useAuth.ts
// através do listener onAuthStateChange. Não interceptamos fetch globalmente para evitar
// problemas com outras requisições.

// Função utilitária para retry com backoff exponencial otimizada
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 500
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
          error.message.includes('timeout') ||
          error.message.includes('ECONNRESET') ||
          error.message.includes('ENOTFOUND')
        )

      if (!isRetryableError) {
        throw error
      }

      // Calcular delay com backoff exponencial + jitter reduzido
      const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 200
      console.log(`🔄 Tentativa ${attempt + 1}/${maxRetries + 1} falhou, tentando novamente em ${Math.round(delay)}ms...`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

// Função para verificar conectividade otimizada com timeout reduzido
export async function checkConnection(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const { data, error } = await supabase
      .from('secoes')
      .select('id')
      .limit(1)
      .abortSignal(controller.signal)
    
    clearTimeout(timeoutId)
    return !error && !!data
  } catch (error) {
    console.warn('⚠️ Falha na verificação de conectividade:', error)
    return false
  }
}

// Função helper para adicionar timeout a queries do Supabase
export function withQueryTimeout<T>(
  queryPromise: PromiseLike<{ data: T | null; error: any }>,
  timeoutMs: number = 10000
): Promise<{ data: T | null; error: any }> {
  return Promise.race([
    Promise.resolve(queryPromise),
    new Promise<{ data: null; error: { message: string } }>((resolve) => {
      setTimeout(() => {
        resolve({
          data: null,
          error: { message: `Query timeout após ${timeoutMs}ms` }
        })
      }, timeoutMs)
    })
  ])
}

// Função para executar operações com retry automático
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Operação'
): Promise<T> {
  return withRetry(async () => {
    try {
      return await operation()
    } catch (error) {
      console.error(`❌ ${operationName} falhou:`, error)
      throw error
    }
  })
}