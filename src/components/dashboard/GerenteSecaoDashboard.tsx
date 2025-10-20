// =====================================================
// DASHBOARD GERENTE DE SEÇÃO
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  BarChart3, 
  Users, 
  Target, 
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EstatisticasSecao {
  totalEquipes: number
  totalMembros: number
  indicadoresPreenchidos: number
  indicadoresPendentes: number
  indicadoresAtrasados: number
}

interface EquipeInfo {
  id: string
  nome: string
  membros_count: number
  indicadores_preenchidos: number
  indicadores_pendentes: number
  percentual_conclusao: number
  ultimo_preenchimento: string | null
}

interface AtividadeRecente {
  id: string
  tipo: 'preenchimento' | 'atraso' | 'conclusao'
  descricao: string
  usuario: string
  equipe: string
  data: string
}

export function GerenteSecaoDashboard() {
  const { getUserDisplayInfo, getVisibleSections } = usePermissions()
  const [estatisticas, setEstatisticas] = useState<EstatisticasSecao | null>(null)
  const [equipes, setEquipes] = useState<EquipeInfo[]>([])
  const [atividades, setAtividades] = useState<AtividadeRecente[]>([])
  const [loading, setLoading] = useState(true)

  const userInfo = getUserDisplayInfo()
  const visibleSections = getVisibleSections()
  const secaoAtual = visibleSections[0] // Gerente vê apenas sua seção

  // Carregar dados da seção
  useEffect(() => {
    const carregarDadosSecao = async () => {
      if (!secaoAtual) return

      try {
        setLoading(true)

        // Carregar equipes da seção
        const { data: equipesData, error: equipesError } = await supabase
          .from('equipes')
          .select(`
            id,
            nome,
            secao_id,
            ativo
          `)
          .eq('secao_id', secaoAtual.codigo)
          .eq('ativo', true)

        if (equipesError) throw equipesError

        // Simular dados de indicadores por equipe
        const equipesComIndicadores: EquipeInfo[] = (equipesData || []).map(equipe => {
          const totalIndicadores = Math.floor(Math.random() * 15) + 5
          const preenchidos = Math.floor(Math.random() * totalIndicadores)
          const pendentes = totalIndicadores - preenchidos
          
          return {
            id: equipe.id,
            nome: equipe.nome,
            membros_count: Math.floor(Math.random() * 8) + 3, // 3-10 membros
            indicadores_preenchidos: preenchidos,
            indicadores_pendentes: pendentes,
            percentual_conclusao: Math.round((preenchidos / totalIndicadores) * 100),
            ultimo_preenchimento: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })

        setEquipes(equipesComIndicadores)

        // Calcular estatísticas gerais
        const totalEquipes = equipesComIndicadores.length
        const totalMembros = equipesComIndicadores.reduce((sum, eq) => sum + eq.membros_count, 0)
        const totalPreenchidos = equipesComIndicadores.reduce((sum, eq) => sum + eq.indicadores_preenchidos, 0)
        const totalPendentes = equipesComIndicadores.reduce((sum, eq) => sum + eq.indicadores_pendentes, 0)
        const atrasados = Math.floor(totalPendentes * 0.3) // 30% dos pendentes são atrasados

        setEstatisticas({
          totalEquipes,
          totalMembros,
          indicadoresPreenchidos: totalPreenchidos,
          indicadoresPendentes: totalPendentes,
          indicadoresAtrasados: atrasados
        })

        // Simular atividades recentes
        const atividadesSimuladas: AtividadeRecente[] = [
          {
            id: '1',
            tipo: 'preenchimento',
            descricao: 'Indicador PTR-BA preenchido',
            usuario: 'João Silva',
            equipe: 'Equipe Alfa',
            data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            tipo: 'conclusao',
            descricao: 'Relatório mensal concluído',
            usuario: 'Maria Santos',
            equipe: 'Equipe Beta',
            data: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            tipo: 'atraso',
            descricao: 'Indicador de ocorrências em atraso',
            usuario: 'Pedro Costa',
            equipe: 'Equipe Gama',
            data: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
          }
        ]

        setAtividades(atividadesSimuladas)

      } catch (error) {
        console.error('Erro ao carregar dados da seção:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarDadosSecao()
  }, [supabase, secaoAtual])

  const formatarDataRelativa = (data: string) => {
    const agora = new Date()
    const dataItem = new Date(data)
    const diffHoras = Math.floor((agora.getTime() - dataItem.getTime()) / (1000 * 60 * 60))
    
    if (diffHoras < 1) return 'Agora há pouco'
    if (diffHoras < 24) return `${diffHoras}h atrás`
    const diffDias = Math.floor(diffHoras / 24)
    return `${diffDias}d atrás`
  }

  const getIconeAtividade = (tipo: string) => {
    switch (tipo) {
      case 'preenchimento': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'conclusao': return <Target className="w-4 h-4 text-blue-600" />
      case 'atraso': return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
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
            Dashboard - {secaoAtual?.nome}
          </h2>
          <p className="text-[#7a5b3e]/70">
            Gerenciamento da sua seção • {secaoAtual?.cidade}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button className="bg-[#fa4b00] hover:bg-[#e63d00] text-white">
            <FileText className="w-4 h-4 mr-2" />
            Relatório Mensal
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Equipes
              </CardTitle>
              <Users className="h-4 w-4 text-[#fa4b00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.totalEquipes}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                {estatisticas.totalMembros} membros
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Preenchidos
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {estatisticas.indicadoresPreenchidos}
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
                {estatisticas.indicadoresPendentes}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Aguardando
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
                {estatisticas.indicadoresAtrasados}
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Requer atenção
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#1f1f1f]">
                Conclusão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#fa4b00]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1f1f1f]">
                {Math.round((estatisticas.indicadoresPreenchidos / (estatisticas.indicadoresPreenchidos + estatisticas.indicadoresPendentes)) * 100)}%
              </div>
              <p className="text-xs text-[#7a5b3e]/70">
                Taxa geral
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desempenho das Equipes */}
        <div className="lg:col-span-2">
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Desempenho das Equipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipes.map((equipe) => (
                  <div key={equipe.id} className="border-b border-white/10 pb-4 last:border-b-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-[#1f1f1f]">{equipe.nome}</h4>
                        <p className="text-sm text-[#7a5b3e]/70">
                          {equipe.membros_count} membros • Último preenchimento: {formatarDataRelativa(equipe.ultimo_preenchimento || '')}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#1f1f1f]">
                          {equipe.percentual_conclusao}%
                        </div>
                        <div className="text-sm text-[#7a5b3e]/70">
                          {equipe.indicadores_preenchidos}/{equipe.indicadores_preenchidos + equipe.indicadores_pendentes}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-[#fa4b00] h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${equipe.percentual_conclusao}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {equipe.indicadores_preenchidos}
                        </span>
                        <span className="text-orange-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {equipe.indicadores_pendentes}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Atividades Recentes */}
        <div>
          <Card className="bg-white/20 backdrop-blur-lg border-white/30">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atividades.map((atividade) => (
                  <div key={atividade.id} className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getIconeAtividade(atividade.tipo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1f1f1f]">
                        {atividade.descricao}
                      </p>
                      <p className="text-xs text-[#7a5b3e]/70">
                        {atividade.usuario} • {atividade.equipe}
                      </p>
                      <p className="text-xs text-[#7a5b3e]/50">
                        {formatarDataRelativa(atividade.data)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-white/20 backdrop-blur-lg border-white/30 mt-6">
            <CardHeader>
              <CardTitle className="text-[#1f1f1f] text-lg">
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-[#fa4b00] hover:bg-[#e63d00] text-white justify-start">
                <Target className="w-4 h-4 mr-2" />
                Revisar Indicadores
              </Button>
              <Button className="w-full bg-[#7a5b3e] hover:bg-[#6b4d35] text-white justify-start">
                <Users className="w-4 h-4 mr-2" />
                Gerenciar Equipes
              </Button>
              <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Cronograma
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}