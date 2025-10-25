'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import IndicadorForm from '@/components/indicadores/IndicadorForm'
import { Zap, Plus, Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface IndicadorEvento {
  id: string
  nome: string
  descricao: string
  tipo_dados: 'numero' | 'texto' | 'tempo' | 'data' | 'datetime'
  obrigatorio: boolean
  ativo: boolean
  created_at: string
  preenchimentos?: any[]
}

export default function IndicadoresEventoPage() {
  const { user, profile } = useAuth()
  const { canFillIndicators, canManageIndicators } = usePermissions()
  const [indicadores, setIndicadores] = useState<IndicadorEvento[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedIndicador, setSelectedIndicador] = useState<IndicadorEvento | null>(null)
  const [statusFilter, setStatusFilter] = useState<'todos' | 'preenchidos' | 'pendentes'>('todos')

  useEffect(() => {
    fetchIndicadores()
  }, [])

  const fetchIndicadores = async () => {
    try {
      const { data, error } = await supabase
        .from('indicadores')
        .select(`
          *,
          preenchimentos (
            id,
            data_preenchimento,
            profiles (
              id,
              nome
            )
          )
        `)
        .eq('frequencia', 'evento')
        .eq('ativo', true)
        .order('nome')

      if (error) throw error
      setIndicadores(data || [])
    } catch (error) {
      console.error('Erro ao buscar indicadores:', error)
      toast.error('Erro ao carregar indicadores')
    } finally {
      setLoading(false)
    }
  }

  const handlePreencherIndicador = (indicador: IndicadorEvento) => {
    setSelectedIndicador(indicador)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedIndicador(null)
    fetchIndicadores() // Recarregar dados após preenchimento
  }

  const getStatusIndicador = (indicador: IndicadorEvento) => {
    const hoje = new Date().toISOString().split('T')[0]
    const preenchimentoHoje = indicador.preenchimentos?.find(p => 
      p.data_preenchimento?.startsWith(hoje)
    )
    
    return preenchimentoHoje ? 'preenchido' : 'pendente'
  }

  const filteredIndicadores = indicadores.filter(indicador => {
    const matchesSearch = indicador.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicador.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false

    if (statusFilter === 'todos') return true
    
    const status = getStatusIndicador(indicador)
    return statusFilter === status
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'preenchido':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'pendente':
        return <Clock className="w-5 h-5 text-orange-600" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'preenchido':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Preenchido Hoje
          </span>
        )
      case 'pendente':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Aguardando Evento
          </span>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Carregando indicadores...</div>
          </div>
        </DashboardLayout>
      </AuthenticatedRoute>
    )
  }

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Indicadores por Evento</h1>
                  <p className="text-gray-600">Preenchidos sempre que ocorre um evento específico</p>
                </div>
              </div>
            </div>

            {/* Filtros e Busca */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar indicadores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="pendentes">Aguardando Evento</option>
                  <option value="preenchidos">Preenchidos Hoje</option>
                </select>
              </div>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Indicadores</p>
                  <p className="text-xl font-bold text-gray-900">{indicadores.length}</p>
                </div>
                <Zap className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Preenchidos Hoje</p>
                  <p className="text-xl font-bold text-green-600">
                    {indicadores.filter(i => getStatusIndicador(i) === 'preenchido').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aguardando Evento</p>
                  <p className="text-xl font-bold text-orange-600">
                    {indicadores.filter(i => getStatusIndicador(i) === 'pendente').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Eventos</p>
                  <p className="text-xl font-bold text-blue-600">
                    {indicadores.length > 0 
                      ? Math.round((indicadores.filter(i => getStatusIndicador(i) === 'preenchido').length / indicadores.length) * 100)
                      : 0}%
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Lista de Indicadores */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Indicadores Disponíveis</h2>
              <p className="text-sm text-gray-600">Clique em "Registrar Evento" quando ocorrer a situação</p>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredIndicadores.map((indicador) => {
                const status = getStatusIndicador(indicador)
                
                return (
                  <div key={indicador.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(status)}
                          <h3 className="text-lg font-medium text-gray-900">{indicador.nome}</h3>
                          {getStatusBadge(status)}
                          {indicador.obrigatorio && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Obrigatório
                            </span>
                          )}
                        </div>
                        
                        {indicador.descricao && (
                          <p className="text-gray-600 mb-3">{indicador.descricao}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Tipo: {indicador.tipo_dados}</span>
                          {indicador.preenchimentos && indicador.preenchimentos.length > 0 && (
                            <span>
                              Último preenchimento: {' '}
                              {new Date(indicador.preenchimentos[0].data_preenchimento).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>

                      {canFillIndicators && (
                        <div className="ml-4">
                          <button
                            onClick={() => handlePreencherIndicador(indicador)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Registrar Evento
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredIndicadores.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                {searchTerm || statusFilter !== 'todos' 
                  ? 'Nenhum indicador encontrado com os filtros aplicados'
                  : 'Nenhum indicador por evento cadastrado'
                }
              </div>
            )}
          </div>

          {/* Informações sobre Indicadores por Evento */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Importante sobre Indicadores por Evento</h3>
                <div className="space-y-2 text-sm text-red-800">
                  <p><strong>Quando preencher:</strong> Sempre que ocorrer o evento específico (emergência, ocorrência, situação especial).</p>
                  <p><strong>Urgência:</strong> Deve ser preenchido imediatamente após o evento, enquanto as informações estão frescas.</p>
                  <p><strong>Precisão:</strong> Registre todos os detalhes relevantes, pois estes dados são críticos para análises e relatórios.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal do Formulário */}
        {showForm && selectedIndicador && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Registrar Evento: {selectedIndicador.nome}
                </h2>
              </div>
              
              <div className="p-6">
                <IndicadorForm
                  indicador={selectedIndicador}
                  onClose={handleFormClose}
                />
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}