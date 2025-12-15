'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuthContext()

  useEffect(() => {
    // Aguardar o carregamento da autenticação
    if (loading) return

    // Se não está logado, o AuthenticatedRoute no layout já vai redirecionar
    // Se está logado, redirecionar para a página de ocorrências
    if (user && profile?.ativo) {
      router.push('/dashboard/ocorrencias-aeronauticas')
    }
  }, [user, profile, loading, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Preparando seu painel...</p>
        </div>
      </div>
    )
  }

  // Renderizar nada enquanto redireciona (o AuthenticatedRoute vai cuidar do resto)
  return null
}