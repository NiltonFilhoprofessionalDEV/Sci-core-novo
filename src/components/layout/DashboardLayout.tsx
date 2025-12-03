// =====================================================
// LAYOUT PRINCIPAL DO DASHBOARD
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
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
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { signOut } = useAuthContext()
  const { getUserDisplayInfo, isGestorPOP, isGerenteSecao, isBACE } = usePermissions()
  const router = useRouter()
  const pathname = usePathname()

  const userInfo = getUserDisplayInfo()

  // Função para verificar se uma rota está ativa
  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    // Para rotas como /indicadores, considera tanto /indicadores quanto /indicadores/preencher como ativas
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      // Tentar fazer logout no Supabase
      await signOut()
    } catch (error) {
      // Se falhar, apenas log o erro mas continue com o logout local
      console.warn('Erro ao fazer logout no servidor:', error)
    } finally {
      // Usar replace para evitar problemas de navegação e limpar histórico
      router.replace('/login')
    }
  }

  // Navegação baseada no perfil
  const getNavigationItems = () => {
    const baseItems = [
      {
        icon: Home,
        label: 'Dashboard',
        href: '/dashboard',
        active: isActive('/dashboard')
      }
    ]

    if (isGestorPOP) {
      return [
        ...baseItems,
        {
          icon: Target,
          label: 'Indicadores',
          href: '/indicadores',
          active: isActive('/indicadores')
        },
        {
          icon: Settings,
          label: 'Configurações',
          href: '/configuracoes',
          active: isActive('/configuracoes')
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
          active: isActive('/secao')
        },
        {
          icon: Users,
          label: 'Equipes',
          href: '/equipes',
          active: isActive('/equipes')
        },
        {
          icon: FileText,
          label: 'Relatórios',
          href: '/relatorios',
          active: isActive('/relatorios')
        },
        {
          icon: Calendar,
          label: 'Cronograma',
          href: '/cronograma',
          active: isActive('/cronograma')
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
          active: isActive('/indicadores')
        },
        {
          icon: FileText,
          label: 'Histórico',
          href: '/historico',
          active: isActive('/historico')
        }
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border shadow-sm z-40">
        <div className="p-6">
          {/* Logo e Título */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Bombeiro</h1>
              <p className="text-xs text-white/80">MedMais</p>
            </div>
          </div>

          {/* Informações do Usuário */}
          {userInfo && (
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {userInfo.nome}
                  </p>
                  <p className="text-white/80 text-xs truncate">
                    {userInfo.perfil}
                  </p>
                  <p className="text-white/70 text-xs truncate">
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
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors border-l-2 ${
                    item.active
                      ? 'text-sidebar-accent-foreground bg-sidebar-accent border-sidebar-accent-foreground/40'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${item.active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'}`} />
                  <span className={`text-sm ${item.active ? 'text-sidebar-accent-foreground' : 'text-sidebar-foreground'}`}>{item.label}</span>
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
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-sidebar text-sidebar-foreground shadow-sm px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-sidebar-foreground">
                Sistema de Indicadores
              </h1>
              <p className="text-sidebar-foreground/80 text-sm">
                Grupo MedMais - Seções de Bombeiro de Aeródromo
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-white" />
              </button>
              {userInfo && (
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {userInfo.perfil}
                  </p>
                  <p className="text-xs text-white/80">
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