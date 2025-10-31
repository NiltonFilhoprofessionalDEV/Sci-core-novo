// =====================================================
// DASHBOARD BA-CE (BOMBEIRO AERONÁUTICO - CHEFE DE EQUIPE)
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Plus,
  Edit3,
  BarChart3,
  Activity,
  Timer
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AtividadesAcessoriasModal } from '@/components/modals/AtividadesAcessoriasModal'
import { TAFModal } from '@/components/modals/TAFModal'
import { ModalControleAgentesExtintores } from '@/components/modals/ModalControleAgentesExtintores'


interface IndicadorPendente {
  id: string
  nome: string
  tipo: 'evento' | 'diario' | 'mensal'
  frequencia: string
  prazo: string
  prioridade: 'alta' | 'media' | 'baixa'
  dias_restantes: number
}

interface IndicadorRecente {
  id: string
  nome: string
  valor: string
  data_preenchimento: string
  tipo: string
}

interface EstatisticasEquipe {
  indicadores_preenchidos_mes: number
  indicadores_pendentes: number
  indicadores_atrasados: number
  taxa_conclusao: number
  membros_equipe: number
}

export function BACEDashboard() {
  const { getUserDisplayInfo, getVisibleTeams, getVisibleSections } = usePermissions()
  const [estatisticas, setEstatisticas] = useState<EstatisticasEquipe | null>(null)
  const [indicadoresPendentes, setIndicadoresPendentes] = useState<IndicadorPendente[]>([])
  const [indicadoresRecentes, setIndicadoresRecentes] = useState<IndicadorRecente[]>([])
  const [loading, setLoading] = useState(true)
  const [isAtividadesModalOpen, setIsAtividadesModalOpen] = useState(false)
  const [isTAFModalOpen, setIsTAFModalOpen] = useState(false)
  const [isControleAgentesModalOpen, setIsControleAgentesModalOpen] = useState(false)


  const userInfo = getUserDisplayInfo()
  const visibleTeams = getVisibleTeams()
  const visibleSections = getVisibleSections()
  const equipeAtual = visibleTeams[0] // BA-CE gerencia sua equipe
  const secaoAtual = visibleSections[0] // E vê dados da seção

  // Carregar dados da equipe e seção
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true)

        // Simular estatísticas da equipe
        const estatisticasSimuladas: EstatisticasEquipe = {
          indicadores_preenchidos_mes: 23,
          indicadores_pendentes: 7,
          indicadores_atrasados: 2,
          taxa_conclusao: 85,
          membros_equipe: 6
        }

        setEstatisticas(estatisticasSimuladas)

        // Simular indicadores pendentes
        const pendentesSimulados: IndicadorPendente[] = [
          {
            id: '1',
            nome: 'Treinamento PTR-BA Diário',
            tipo: 'diario',
            frequencia: 'Diário',
            prazo: '2024-12-21',
            prioridade: 'alta',
            dias_restantes: 1
          },
          {
            id: '2',
            nome: 'Ocorrências Aeronáuticas',
            tipo: 'evento',
            frequencia: 'Por evento',
            prazo: '2024-12-25',
            prioridade: 'media',
            dias_restantes: 5
          },
          {
            id: '3',
            nome: 'Relatório Mensal de Equipamentos',
            tipo: 'mensal',
            frequencia: 'Mensal',
            prazo: '2024-12-31',
            prioridade: 'alta',
            dias_restantes: 11
          },
          {
            id: '4',
            nome: 'Inspeção de Segurança',
            tipo: 'mensal',
            frequencia: 'Mensal',
            prazo: '2024-12-28',
            prioridade: 'media',
            dias_restantes: 8
          },
          {
            id: '5',
            nome: 'Manutenção Preventiva',
            tipo: 'mensal',
            frequencia: 'Mensal',
            prazo: '2024-12-30',
            prioridade: 'baixa',
            dias_restantes: 10
          }
        ]

        setIndicadoresPendentes(pendentesSimulados)

        // Simular indicadores recentes
        const recentesSimulados: IndicadorRecente[] = [
          {
            id: '1',
            nome: 'Horas de Treinamento PTR-BA',
            valor: '8h 30min',
            data_preenchimento: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            tipo: 'Tempo'
          },
          {
            id: '2',
            nome: 'Ocorrência Não Aeronáutica',
            valor: 'Vazamento de combustível - Resolvido',
            data_preenchimento: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
            tipo: 'Evento'
          },
          {
            id: '3',
            nome: 'Teste de Equipamentos',
            valor: 'Todos os equipamentos operacionais',
            data_preenchimento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            tipo: 'Verificação'
          }
        ]

        setIndicadoresRecentes(recentesSimulados)

      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDados()
  }, [supabase])

  const formatarDataRelativa = (data: string) => {
    const agora = new Date()
    const dataItem = new Date(data)
    const diffHoras = Math.floor((agora.getTime() - dataItem.getTime()) / (1000 * 60 * 60))
    
    if (diffHoras < 1) return 'Agora há pouco'
    if (diffHoras < 24) return `${diffHoras}h atrás`
    const diffDias = Math.floor(diffHoras / 24)
    return `${diffDias}d atrás`
  }

  const getPrioridadeCor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'text-red-600 bg-red-100'
      case 'media': return 'text-orange-600 bg-orange-100'
      case 'baixa': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTipoCor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return 'text-purple-600 bg-purple-100'
      case 'diario': return 'text-blue-600 bg-blue-100'
      case 'mensal': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#fa4b00]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#1f1f1f]">
            Dashboard - {equipeAtual?.nome}
          </h2>
          <p className="text-[#7a5b3e]/70">
            {secaoAtual?.nome} • {secaoAtual?.cidade}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button className="bg-[#fa4b00] hover:bg-[#e63d00] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Preencher Indicador
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Preenchidos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.indicadores_preenchidos_mes}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.indicadores_pendentes}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Para preencher
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Atrasados
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.indicadores_atrasados}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Urgente
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Taxa Conclusão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#fa4b00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.taxa_conclusao}%
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Meta: 90%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Equipe
              </CardTitle>
              <Users className="h-4 w-4 text-[#fa4b00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.membros_equipe}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Membros ativos
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicadores Pendentes */}
        <div className="lg:col-span-2">
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Indicadores Pendentes
                </div>
                <span className="text-sm font-normal text-[#7a5b3e]/70">
                  {indicadoresPendentes.length} itens
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {indicadoresPendentes.map((indicador) => (
                  <div key={indicador.id} className="border border-white/20 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-[#1f1f1f]">{indicador.nome}</h4>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTipoCor(indicador.tipo)}`}>
                          {indicador.tipo}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadeCor(indicador.prioridade)}`}>
                          {indicador.prioridade}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4 text-[#7a5b3e]/70">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {indicador.frequencia}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {indicador.dias_restantes} dias restantes
                        </span>
                      </div>
                      
                      <Button size="sm" className="bg-[#fa4b00] hover:bg-[#e63d00] text-white">
                        <Edit3 className="w-3 h-3 mr-1" />
                        Preencher
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar com Atividades Recentes e Ações */}
        <div className="space-y-6">
          {/* Indicadores Recentes */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indicadoresRecentes.map((indicador) => (
                  <div key={indicador.id} className="border-b border-white/10 pb-3 last:border-b-0">
                    <h5 className="font-medium text-[#1f1f1f] text-sm mb-1">
                      {indicador.nome}
                    </h5>
                    <p className="text-xs text-[#7a5b3e]/70 mb-1">
                      {indicador.valor}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7a5b3e]/50">
                        {formatarDataRelativa(indicador.data_preenchimento)}
                      </span>
                      <span className="text-[#fa4b00] font-medium">
                        {indicador.tipo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] text-lg">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#fa4b00] hover:bg-[#e63d00] text-white justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Novo Indicador
              </Button>

              <Button 
                onClick={() => setIsAtividadesModalOpen(true)}
                className="w-full bg-[#fa4b00] hover:bg-[#e63d00] text-white justify-start"
              >
                <Activity className="w-4 h-4 mr-2" />
                Atividades Acessórias
              </Button>

              <Button 
                onClick={() => setIsTAFModalOpen(true)}
                className="w-full bg-[#fa4b00] hover:bg-[#e63d00] text-white justify-start"
              >
                <Timer className="w-4 h-4 mr-2" />
                TAF
              </Button>

              <Button 
                onClick={() => setIsControleAgentesModalOpen(true)}
                className="w-full bg-[#fa4b00] hover:bg-[#e63d00] text-white justify-start"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Controle de Agentes Extintores
              </Button>


              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Histórico
              </Button>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Cronograma
              </Button>
            </CardContent>
          </Card>

          {/* Progresso da Meta */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] text-lg">
                Meta Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-[#1f1f1f] mb-1">
                  {estatisticas?.taxa_conclusao}%
                </div>
                <p className="text-sm text-[#7a5b3e]/70">
                  Meta: 90%
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-[#fa4b00] h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${estatisticas?.taxa_conclusao}%` }}
                ></div>
              </div>
              
              <p className="text-xs text-[#7a5b3e]/70 text-center">
                Faltam {estatisticas ? 90 - estatisticas.taxa_conclusao : 0}% para atingir a meta
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AtividadesAcessoriasModal 
        isOpen={isAtividadesModalOpen}
        onClose={() => setIsAtividadesModalOpen(false)}
      />

      <TAFModal 
        isOpen={isTAFModalOpen}
        onClose={() => setIsTAFModalOpen(false)}
        onSuccess={() => {
          setIsTAFModalOpen(false)
          // Aqui poderia recarregar dados se necessário
        }}
      />

      <ModalControleAgentesExtintores 
        isOpen={isControleAgentesModalOpen}
        onClose={() => setIsControleAgentesModalOpen(false)}
        onSuccess={() => {
          setIsControleAgentesModalOpen(false)
          // Aqui poderia recarregar dados se necessário
        }}
      />
    </div>
  )
}