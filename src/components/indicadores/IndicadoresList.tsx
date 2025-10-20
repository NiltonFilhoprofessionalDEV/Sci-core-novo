// =====================================================
// LISTA DE INDICADORES
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { usePermissions } from '@/hooks/usePermissions'
import { 
  Target, 
  Plus, 
  Filter, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Edit3,
  Eye,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IndicadorForm } from './IndicadorForm'

interface Indicador {
  id: string
  nome: string
  descricao: string
  tipo_dados: 'texto' | 'numero' | 'tempo' | 'data' | 'data_hora'
  frequencia: 'evento' | 'diario' | 'mensal'
  obrigatorio: boolean
  unidade_medida?: string
  ativo: boolean
  ultimo_preenchimento?: string
  status_preenchimento: 'preenchido' | 'pendente' | 'atrasado'
}

interface FiltrosIndicadores {
  busca: string
  frequencia: 'todas' | 'evento' | 'diario' | 'mensal'
  status: 'todos' | 'preenchido' | 'pendente' | 'atrasado'
  tipo: 'todos' | 'texto' | 'numero' | 'tempo' | 'data' | 'data_hora'
}

export function IndicadoresList() {
  const supabase = useSupabaseClient()
  const { canFillIndicators, canManageIndicators } = usePermissions()
  const [indicadores, setIndicadores] = useState<Indicador[]>([])
  const [indicadorSelecionado, setIndicadorSelecionado] = useState<Indicador | null>(null)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState<FiltrosIndicadores>({
    busca: '',
    frequencia: 'todas',
    status: 'todos',
    tipo: 'todos'
  })

  // Carregar indicadores
  useEffect(() => {
    const carregarIndicadores = async () => {
      try {
        setLoading(true)

        // Simular dados de indicadores
        const indicadoresSimulados: Indicador[] = [
          {
            id: '1',
            nome: 'Treinamento PTR-BA Diário',
            descricao: 'Registro das horas de treinamento diário dos bombeiros aeronáuticos',
            tipo_dados: 'tempo',
            frequencia: 'diario',
            obrigatorio: true,
            unidade_medida: 'horas',
            ativo: true,
            ultimo_preenchimento: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            status_preenchimento: 'preenchido'
          },
          {
            id: '2',
            nome: 'Ocorrências Aeronáuticas',
            descricao: 'Registro de ocorrências relacionadas à aviação civil',
            tipo_dados: 'texto',
            frequencia: 'evento',
            obrigatorio: true,
            ativo: true,
            status_preenchimento: 'pendente'
          },
          {
            id: '3',
            nome: 'Relatório Mensal de Equipamentos',
            descricao: 'Verificação e status dos equipamentos de combate a incêndio',
            tipo_dados: 'texto',
            frequencia: 'mensal',
            obrigatorio: true,
            ativo: true,
            ultimo_preenchimento: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            status_preenchimento: 'atrasado'
          },
          {
            id: '4',
            nome: 'Número de Voos Atendidos',
            descricao: 'Quantidade de aeronaves atendidas durante o plantão',
            tipo_dados: 'numero',
            frequencia: 'diario',
            obrigatorio: false,
            unidade_medida: 'voos',
            ativo: true,
            ultimo_preenchimento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status_preenchimento: 'preenchido'
          },
          {
            id: '5',
            nome: 'Inspeção de Segurança',
            descricao: 'Inspeção mensal das instalações e equipamentos de segurança',
            tipo_dados: 'texto',
            frequencia: 'mensal',
            obrigatorio: true,
            ativo: true,
            status_preenchimento: 'pendente'
          },
          {
            id: '6',
            nome: 'Ocorrências Não Aeronáuticas',
            descricao: 'Registro de ocorrências não relacionadas à aviação',
            tipo_dados: 'texto',
            frequencia: 'evento',
            obrigatorio: false,
            ativo: true,
            ultimo_preenchimento: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            status_preenchimento: 'preenchido'
          }
        ]

        setIndicadores(indicadoresSimulados)
      } catch (error) {
        console.error('Erro ao carregar indicadores:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarIndicadores()
  }, [supabase])

  // Filtrar indicadores
  const indicadoresFiltrados = indicadores.filter(indicador => {
    const matchBusca = indicador.nome.toLowerCase().includes(filtros.busca.toLowerCase()) ||
                      indicador.descricao.toLowerCase().includes(filtros.busca.toLowerCase())
    
    const matchFrequencia = filtros.frequencia === 'todas' || indicador.frequencia === filtros.frequencia
    const matchStatus = filtros.status === 'todos' || indicador.status_preenchimento === filtros.status
    const matchTipo = filtros.tipo === 'todos' || indicador.tipo_dados === filtros.tipo

    return matchBusca && matchFrequencia && matchStatus && matchTipo
  })

  const handlePreencherIndicador = (indicador: Indicador) => {
    setIndicadorSelecionado(indicador)
    setMostrarFormulario(true)
  }

  const handleSalvarIndicador = async (dados: any) => {
    try {
      // Aqui seria feita a inserção no Supabase
      console.log('Salvando indicador:', dados)
      
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Atualizar lista
      setIndicadores(prev => prev.map(ind => 
        ind.id === indicadorSelecionado?.id 
          ? { ...ind, status_preenchimento: 'preenchido', ultimo_preenchimento: new Date().toISOString() }
          : ind
      ))
      
      setMostrarFormulario(false)
      setIndicadorSelecionado(null)
    } catch (error) {
      throw error
    }
  }

  const formatarDataRelativa = (data: string) => {
    const agora = new Date()
    const dataItem = new Date(data)
    const diffHoras = Math.floor((agora.getTime() - dataItem.getTime()) / (1000 * 60 * 60))
    
    if (diffHoras < 1) return 'Agora há pouco'
    if (diffHoras < 24) return `${diffHoras}h atrás`
    const diffDias = Math.floor(diffHoras / 24)
    return `${diffDias}d atrás`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preenchido': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'atrasado': return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'pendente': return <Clock className="w-4 h-4 text-orange-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preenchido': return 'Preenchido'
      case 'atrasado': return 'Atrasado'
      case 'pendente': return 'Pendente'
      default: return status
    }
  }

  const getFrequenciaIcon = (frequencia: string) => {
    switch (frequencia) {
      case 'evento': return <Target className="w-4 h-4 text-purple-600" />
      case 'diario': return <Calendar className="w-4 h-4 text-blue-600" />
      case 'mensal': return <BarChart3 className="w-4 h-4 text-green-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getFrequenciaLabel = (frequencia: string) => {
    switch (frequencia) {
      case 'evento': return 'Por Evento'
      case 'diario': return 'Diário'
      case 'mensal': return 'Mensal'
      default: return frequencia
    }
  }

  if (mostrarFormulario && indicadorSelecionado) {
    return (
      <IndicadorForm
        indicador={indicadorSelecionado}
        onSave={handleSalvarIndicador}
        onCancel={() => {
          setMostrarFormulario(false)
          setIndicadorSelecionado(null)
        }}
      />
    )
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
            Indicadores
          </h2>
          <p className="text-[#7a5b3e]/70">
            Gerencie e preencha os indicadores do sistema
          </p>
        </div>
        
        {canManageIndicators && (
          <Button className="bg-[#fa4b00] hover:bg-[#e63d00] text-white">
            <Plus className="w-4 h-4 mr-2" />
            Novo Indicador
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card className="bg-white/20 backdrop-blur-lg border-white/30">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar indicadores..."
                value={filtros.busca}
                onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent"
              />
            </div>

            {/* Filtro Frequência */}
            <select
              value={filtros.frequencia}
              onChange={(e) => setFiltros(prev => ({ ...prev, frequencia: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent"
            >
              <option value="todas">Todas as Frequências</option>
              <option value="evento">Por Evento</option>
              <option value="diario">Diário</option>
              <option value="mensal">Mensal</option>
            </select>

            {/* Filtro Status */}
            <select
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent"
            >
              <option value="todos">Todos os Status</option>
              <option value="preenchido">Preenchido</option>
              <option value="pendente">Pendente</option>
              <option value="atrasado">Atrasado</option>
            </select>

            {/* Filtro Tipo */}
            <select
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value as any }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="texto">Texto</option>
              <option value="numero">Número</option>
              <option value="tempo">Tempo</option>
              <option value="data">Data</option>
              <option value="data_hora">Data e Hora</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Indicadores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {indicadoresFiltrados.map((indicador) => (
          <Card key={indicador.id} className="bg-white/20 backdrop-blur-lg border-white/30 hover:bg-white/30 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-[#1f1f1f] text-lg mb-2">
                    {indicador.nome}
                    {indicador.obrigatorio && (
                      <span className="ml-2 text-red-500 text-sm">*</span>
                    )}
                  </CardTitle>
                  <p className="text-[#7a5b3e]/70 text-sm mb-3">
                    {indicador.descricao}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      {getFrequenciaIcon(indicador.frequencia)}
                      <span className="text-[#7a5b3e]/70">
                        {getFrequenciaLabel(indicador.frequencia)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(indicador.status_preenchimento)}
                      <span className="text-[#7a5b3e]/70">
                        {getStatusLabel(indicador.status_preenchimento)}
                      </span>
                    </div>
                    
                    {indicador.unidade_medida && (
                      <span className="text-[#7a5b3e]/70">
                        Unidade: {indicador.unidade_medida}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {canFillIndicators && (
                    <Button
                      onClick={() => handlePreencherIndicador(indicador)}
                      size="sm"
                      className="bg-[#fa4b00] hover:bg-[#e63d00] text-white"
                    >
                      <Edit3 className="w-3 h-3 mr-1" />
                      Preencher
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[#7a5b3e] hover:text-[#1f1f1f]"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {indicador.ultimo_preenchimento && (
              <CardContent className="pt-0">
                <div className="text-xs text-[#7a5b3e]/50 border-t border-white/20 pt-3">
                  Último preenchimento: {formatarDataRelativa(indicador.ultimo_preenchimento)}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Mensagem quando não há indicadores */}
      {indicadoresFiltrados.length === 0 && (
        <Card className="bg-white/20 backdrop-blur-lg border-white/30">
          <CardContent className="text-center py-12">
            <Target className="w-12 h-12 text-[#7a5b3e]/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#1f1f1f] mb-2">
              Nenhum indicador encontrado
            </h3>
            <p className="text-[#7a5b3e]/70">
              Ajuste os filtros ou adicione novos indicadores ao sistema
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}