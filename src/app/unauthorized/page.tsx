// =====================================================
// PÁGINA DE ACESSO NÃO AUTORIZADO
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Home, LogOut } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()
  const { signOut, user, profile } = useAuthContext()
  const { getUserDisplayInfo } = usePermissions()

  const userInfo = getUserDisplayInfo()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleGoHome = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Acesso Não Autorizado
          </CardTitle>
          <CardDescription className="text-gray-600">
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {user && profile && userInfo && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-gray-900">Informações do Usuário</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Nome:</span> {userInfo.nome}</p>
                <p><span className="font-medium">Perfil:</span> {userInfo.perfil}</p>
                <p><span className="font-medium">Contexto:</span> {userInfo.contexto}</p>
                <p><span className="font-medium">Email:</span> {userInfo.email}</p>
              </div>
            </div>
          )}

          {!profile?.ativo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">Conta Inativa:</span> Sua conta está desativada. 
                Entre em contato com o administrador do sistema.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={handleGoHome}
              className="w-full"
              variant="default"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Dashboard
            </Button>
            
            <Button 
              onClick={handleSignOut}
              variant="outline"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Fazer Logout
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Se você acredita que isso é um erro, entre em contato com o suporte técnico.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}