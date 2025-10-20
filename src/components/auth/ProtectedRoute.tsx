// =====================================================
// COMPONENTE DE ROTA PROTEGIDA
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { PerfilUsuario } from '@/types/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredProfile?: PerfilUsuario | PerfilUsuario[]
  requireAuth?: boolean
  fallbackPath?: string
}

export function ProtectedRoute({ 
  children, 
  requiredProfile,
  requireAuth = true,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthContext()
  const { isGestorPOP, isGerenteSecao, isBACE } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // Se requer autenticação e não está logado
    if (requireAuth && !user) {
      router.push(fallbackPath)
      return
    }

    // Se requer autenticação e está logado mas sem perfil ativo
    if (requireAuth && user && (!profile || !profile.ativo)) {
      router.push('/unauthorized')
      return
    }

    // Se tem perfil específico requerido
    if (requiredProfile && profile) {
      const profiles = Array.isArray(requiredProfile) ? requiredProfile : [requiredProfile]
      
      const hasRequiredProfile = profiles.some(p => {
        switch (p) {
          case 'gestor_pop':
            return isGestorPOP
          case 'gerente_secao':
            return isGerenteSecao
          case 'ba_ce':
            return isBACE
          default:
            return false
        }
      })

      if (!hasRequiredProfile) {
        router.push('/unauthorized')
        return
      }
    }
  }, [user, profile, loading, requiredProfile, requireAuth, fallbackPath, router, isGestorPOP, isGerenteSecao, isBACE])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  // Se requer autenticação e não está logado, não renderiza nada (redirecionamento em andamento)
  if (requireAuth && !user) {
    return null
  }

  // Se requer autenticação e está logado mas sem perfil ativo
  if (requireAuth && user && (!profile || !profile.ativo)) {
    return null
  }

  // Se tem perfil específico requerido e não atende
  if (requiredProfile && profile) {
    const profiles = Array.isArray(requiredProfile) ? requiredProfile : [requiredProfile]
    
    const hasRequiredProfile = profiles.some(p => {
      switch (p) {
        case 'gestor_pop':
          return isGestorPOP
        case 'gerente_secao':
          return isGerenteSecao
        case 'ba_ce':
          return isBACE
        default:
          return false
      }
    })

    if (!hasRequiredProfile) {
      return null
    }
  }

  return <>{children}</>
}

// Componentes específicos para cada perfil
export function GestorPOPRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredProfile="gestor_pop">
      {children}
    </ProtectedRoute>
  )
}

export function GerenteSecaoRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredProfile="gerente_secao">
      {children}
    </ProtectedRoute>
  )
}

export function BACERoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredProfile="ba_ce">
      {children}
    </ProtectedRoute>
  )
}

export function ManagerRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredProfile={['gestor_pop', 'gerente_secao']}>
      {children}
    </ProtectedRoute>
  )
}

export function AuthenticatedRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
}