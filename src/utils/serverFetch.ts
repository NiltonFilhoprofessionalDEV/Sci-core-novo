import { cookies } from 'next/headers'

/**
 * Utility para fazer fetch em Server Components com autenticação
 * 
 * @param url - URL da API (relativa ou absoluta)
 * @param options - Opções do fetch
 * @returns Response da API
 */
export async function serverFetch(url: string, options: RequestInit = {}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  
  // Garantir que a URL seja absoluta
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }
  
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    // Não usar cache em development
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'default',
  })
  
  return response
}

/**
 * Utility para fazer fetch JSON em Server Components
 * 
 * @param url - URL da API
 * @param options - Opções do fetch
 * @returns Dados JSON parseados
 */
export async function serverFetchJSON<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await serverFetch(url, options)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}

