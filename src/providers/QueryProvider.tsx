'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

/**
 * Provider para React Query
 * Configura cache inteligente e otimizado para o sistema
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache de 5 minutos para dados dinâmicos
            staleTime: 5 * 60 * 1000,
            // Manter cache por 30 minutos mesmo se não usado
            gcTime: 30 * 60 * 1000,
            // Não refetch automaticamente ao focar janela
            refetchOnWindowFocus: false,
            // Retry até 2 vezes em caso de erro
            retry: 2,
            // Não mostrar erros no console automaticamente
            throwOnError: false,
          },
          mutations: {
            // Retry 1 vez para mutations
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

