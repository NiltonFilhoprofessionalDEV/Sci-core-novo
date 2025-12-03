'use client'

import { usePathname } from 'next/navigation'
import { 
  Plane, 
  AlertTriangle, 
  Wrench, 
  Cloud, 
  GraduationCap, 
  Clock, 
  Truck, 
  Timer, 
  Zap, 
  Droplets, 
  RefreshCw, 
  CheckCircle, 
  Package,
  Sparkles
} from 'lucide-react'
import { NavBar } from '@/components/ui/tubelight-navbar'
import { useEffect, useState } from 'react'

const indicatorTabs = [
  { name: 'Ocorrências Aeronáuticas', url: '/dashboard/ocorrencias-aeronauticas', icon: Plane },
  { name: 'Ocorrência Não Aeronáutica', url: '/dashboard/ocorrencia-nao-aeronautica', icon: AlertTriangle },
  { name: 'Atividades Acessórias', url: '/dashboard/atividades-acessorias', icon: Wrench },
  { name: 'TAF', url: '/dashboard/taf', icon: Cloud },
  { name: 'PTR-BA - Prova Teórica', url: '/dashboard/ptr-ba-prova-teorica', icon: GraduationCap },
  { name: 'PTR-BA - Horas de Treinamento', url: '/dashboard/ptr-ba-horas-treinamento', icon: Clock },
  { name: 'Inspeções de Viaturas', url: '/dashboard/inspecoes-viaturas', icon: Truck },
  { name: 'Tempo EPR', url: '/dashboard/tempo-epr', icon: Timer },
  { name: 'Tempo Resposta', url: '/dashboard/tempo-resposta', icon: Zap },
  { name: 'Controle de Agentes Extintores', url: '/dashboard/controle-agentes-extintores', icon: Droplets },
  { name: 'Controle de Trocas', url: '/dashboard/controle-trocas', icon: RefreshCw },
  { name: 'Verificação de TPS', url: '/dashboard/verificacao-tps', icon: CheckCircle },
  { name: 'Higienização de TPS', url: '/dashboard/higienizacao-tps', icon: Sparkles },
  { name: 'Controle de Uniformes Recebidos', url: '/dashboard/controle-uniformes-recebidos', icon: Package }
]

const basePath = '/dashboard'

export function IndicatorsNavbar() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    // Determina qual aba está ativa baseado no pathname
    const currentTab = indicatorTabs.find(tab => {
      if (pathname === tab.url) return true
      if (pathname === basePath && tab.url === '/dashboard/ocorrencias-aeronauticas') return true
      if (pathname.startsWith(tab.url) && tab.url !== '/dashboard/ocorrencias-aeronauticas') return true
      return false
    })
    
    if (currentTab) {
      setActiveTab(currentTab.name)
    } else {
      // Se nenhuma aba específica estiver ativa, define a primeira como padrão
      setActiveTab(indicatorTabs[0].name)
    }
  }, [pathname])

  // Filtra apenas os itens que devem ser exibidos (pode ser usado para filtrar por permissões no futuro)
  const visibleTabs = indicatorTabs

  return (
    <div className="w-full">
      <NavBar 
        items={visibleTabs.map(tab => ({
          name: tab.name,
          url: tab.url,
          icon: tab.icon
        }))} 
        className="relative"
        activeTab={activeTab}
      />
    </div>
  )
}




