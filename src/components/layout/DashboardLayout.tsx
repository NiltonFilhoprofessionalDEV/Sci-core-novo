// =====================================================
// LAYOUT PRINCIPAL DO DASHBOARD
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  LogOut, 
  User, 
  Settings, 
  Bell, 
  Home, 
  BarChart3, 
  FileText, 
  Users, 
  Shield,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuthContext()
  const { getUserDisplayInfo, isGestorPOP, isGerenteSecao, isBACE } = usePermissions()
  const router = useRouter()

  const userInfo = getUserDisplayInfo()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  // Navegação baseada no perfil
  const getNavigationItems = () => {
    const baseItems = [
      {
        icon: Home,
        label: 'Dashboard',
        href: '/dashboard',
        active: true
      }
    ]

    if (isGestorPOP) {
      return [
        ...baseItems,
        {
          icon: BarChart3,
          label: 'Todas as Seções',
          href: '/secoes',
          active: false
        },
        {
          icon: Users,
          label: 'Usuários',
          href: '/usuarios',
          active: false
        },
        {
          icon: Target,
          label: 'Indicadores',
          href: '/indicadores',
          active: false
        },
        {
          icon: TrendingUp,
          label: 'Relatórios Gerais',
          href: '/relatorios',
          active: false
        },
        {
          icon: Settings,
          label: 'Configurações',
          href: '/configuracoes',
          active: false
        }
      ]
    }

    if (isGerenteSecao) {
      return [
        ...baseItems,
        {
          icon: BarChart3,
          label: 'Minha Seção',
          href: '/secao',
          active: false
        },
        {
          icon: Users,
          label: 'Equipes',
          href: '/equipes',
          active: false
        },
        {
          icon: FileText,
          label: 'Relatórios',
          href: '/relatorios',
          active: false
        },
        {
          icon: Calendar,
          label: 'Cronograma',
          href: '/cronograma',
          active: false
        }
      ]
    }

    if (isBACE) {
      return [
        ...baseItems,
        {
          icon: Target,
          label: 'Preencher Indicadores',
          href: '/indicadores/preencher',
          active: false
        },
        {
          icon: BarChart3,
          label: 'Meus Dados',
          href: '/meus-dados',
          active: false
        },
        {
          icon: FileText,
          label: 'Histórico',
          href: '/historico',
          active: false
        }
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#7a5b3e] via-[#cdbdae] to-[#fafafa]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white/10 backdrop-blur-lg border-r border-white/20 z-40">
        <div className="p-6">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-[#fa4b00] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#1f1f1f]">Bombeiro</h1>
              <p className="text-xs text-[#1f1f1f]/60">MedMais</p>
            </div>
          </div>

          {/* Informações do Usuário */}
          {userInfo && (
            <div className="bg-white/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#fa4b00] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#1f1f1f] font-medium text-sm truncate">
                    {userInfo.nome}
                  </p>
                  <p className="text-[#1f1f1f]/60 text-xs truncate">
                    {userInfo.perfil}
                  </p>
                  <p className="text-[#1f1f1f]/50 text-xs truncate">
                    {userInfo.contexto}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navegação */}
          <nav className="space-y-2">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? 'text-[#1f1f1f] bg-white/20'
                      : 'text-[#1f1f1f]/70 hover:text-[#1f1f1f] hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </a>
              )
            })}
          </nav>
        </div>

        {/* Botão de Logout */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-300/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1f1f1f]">
                Sistema de Indicadores
              </h1>
              <p className="text-[#7a5b3e]/70 text-sm">
                Grupo MedMais - Seções de Bombeiro de Aeródromo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-[#1f1f1f]" />
              </button>
              {userInfo && (
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1f1f1f]">
                    {userInfo.perfil}
                  </p>
                  <p className="text-xs text-[#1f1f1f]/60">
                    {userInfo.contexto}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}