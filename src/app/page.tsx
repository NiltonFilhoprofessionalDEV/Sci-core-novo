'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export default function Home() {
  const { user, loading, error } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    console.log('🏠 Home - Estado atual:', { user: !!user, loading, error })
    
    if (!loading && !error) {
      if (user) {
        console.log('🏠 Home - Redirecionando para dashboard')
        router.push('/dashboard')
      } else {
        console.log('🏠 Home - Redirecionando para login')
        router.push('/login')
      }
    }
  }, [user, loading, error, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7a5b3e] via-[#cdbdae] to-[#fafafa] flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-red-600 text-center mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Erro de Conexão</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#7a5b3e] via-[#cdbdae] to-[#fafafa] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl">Carregando...</div>
          <div className="text-sm mt-2 opacity-75">Conectando com o servidor...</div>
        </div>
      </div>
    )
  }

  return null
}
