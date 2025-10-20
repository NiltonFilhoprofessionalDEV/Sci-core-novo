// =====================================================
// DASHBOARD GESTOR POP
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, Users, Target, TrendingUp, FileText, Settings, UserPlus } from 'lucide-react'
import SecaoFilter from '@/components/filters/SecaoFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import DateRangeFilter from '@/components/filters/DateRangeFilter'

interface Estatisticas {
  totalSecoes: number
  totalEquipes: number
  totalIndicadores: number
  indicadoresPreenchidos: number
  percentualConclusao: number
}

interface IndicadorPorSecao {
  secao_id: string
  secao_nome: string
  total_indicadores: number
  preenchidos: number
  pendentes: number
  percentual: number
}

export function GestorPOPDashboard() {
  const { user } = useAuth()
  const [estatisticas, setEstatisticas] = useState<Estatisticas>({
    totalSecoes: 0,
    totalEquipes: 0,
    totalIndicadores: 0,
    indicadoresPreenchidos: 0,
    percentualConclusao: 0
  })
  const [indicadoresPorSecao, setIndicadoresPorSecao] = useState<IndicadorPorSecao[]>([])
  const [loading, setLoading] = useState(true)

  // Estados dos filtros
  const [selectedSecoes, setSelectedSecoes] = useState<string[]>([])
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchEstatisticas()
    fetchIndicadoresPorSecao()
  }, [selectedSecoes, selectedEquipes, startDate, endDate])

  const fetchEstatisticas = async () => {
    try {
      // Buscar total de seções
      let secoesQuery = supabase.from('secoes').select('id', { count: 'exact' })
      if (selectedSecoes.length > 0) {
        secoesQuery = secoesQuery.in('id', selectedSecoes)
      }
      const { count: totalSecoes } = await secoesQuery

      // Buscar total de equipes
      let equipesQuery = supabase.from('equipes').select('id', { count: 'exact' })
      if (selectedSecoes.length > 0) {
        equipesQuery = equipesQuery.in('secao_id', selectedSecoes)
      }
      if (selectedEquipes.length > 0) {
        equipesQuery = equipesQuery.in('id', selectedEquipes)
      }
      const { count: totalEquipes } = await equipesQuery

      // Buscar indicadores
      let indicadoresQuery = supabase.from('indicadores').select('id', { count: 'exact' })
      const { count: totalIndicadores } = await indicadoresQuery

      // Buscar preenchimentos
      let preenchimentosQuery = supabase
        .from('preenchimentos')
        .select('id', { count: 'exact' })

      if (selectedSecoes.length > 0 || selectedEquipes.length > 0) {
        preenchimentosQuery = preenchimentosQuery
          .select(`
            id,
            profiles!inner (
              secao_id,
              equipe_id
            )
          `, { count: 'exact' })

        if (selectedSecoes.length > 0) {
          preenchimentosQuery = preenchimentosQuery.in('profiles.secao_id', selectedSecoes)
        }
        if (selectedEquipes.length > 0) {
          preenchimentosQuery = preenchimentosQuery.in('profiles.equipe_id', selectedEquipes)
        }
      }

      if (startDate) {
        preenchimentosQuery = preenchimentosQuery.gte('data_preenchimento', startDate)
      }
      if (endDate) {
        preenchimentosQuery = preenchimentosQuery.lte('data_preenchimento', endDate)
      }

      const { count: indicadoresPreenchidos } = await preenchimentosQuery

      const percentualConclusao = totalIndicadores > 0 
        ? Math.round((indicadoresPreenchidos / totalIndicadores) * 100)
        : 0

      setEstatisticas({
        totalSecoes: totalSecoes || 0,
        totalEquipes: totalEquipes || 0,
        totalIndicadores: totalIndicadores || 0,
        indicadoresPreenchidos: indicadoresPreenchidos || 0,
        percentualConclusao
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const fetchIndicadoresPorSecao = async () => {
    try {
      let query = supabase
        .from('secoes')
        .select(`
          id,
          nome,
          preenchimentos!inner (
            id,
            profiles!inner (
              secao_id
            )
          )
        `)

      if (selectedSecoes.length > 0) {
        query = query.in('id', selectedSecoes)
      }

      const { data: secoes, error } = await query

      if (error) throw error

      // Simular dados de indicadores por seção
      const indicadoresData: IndicadorPorSecao[] = (secoes || []).map(secao => {
        const totalIndicadores = Math.floor(Math.random() * 50) + 20
        const preenchidos = Math.floor(Math.random() * totalIndicadores)
        const pendentes = totalIndicadores - preenchidos
        const percentual = Math.round((preenchidos / totalIndicadores) * 100)

        return {
          secao_id: secao.id,
          secao_nome: secao.nome,
          total_indicadores: totalIndicadores,
          preenchidos,
          pendentes,
          percentual
        }
      })

      setIndicadoresPorSecao(indicadoresData)
    } catch (error) {
      console.error('Erro ao buscar indicadores por seção:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando dashboard...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Gestor POP</h1>
            <p className="text-gray-600">Visão geral de todas as seções e indicadores</p>
          </div>
        </div>

        {/* Filtros Avançados */}
        <div className="flex flex-wrap gap-4">
          <SecaoFilter
            selectedSecoes={selectedSecoes}
            onSecaoChange={setSelectedSecoes}
            showAllOption={true}
          />
          
          <EquipeFilter
            selectedEquipes={selectedEquipes}
            onEquipeChange={setSelectedEquipes}
            secaoId={selectedSecoes.length === 1 ? selectedSecoes[0] : undefined}
            showAllOption={true}
          />
          
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            label="Período dos Indicadores"
          />
        </div>

        {/* Resumo dos Filtros Aplicados */}
        {(selectedSecoes.length > 0 || selectedEquipes.length > 0 || startDate || endDate) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Filtros aplicados:</strong>
              {selectedSecoes.length > 0 && (
                <span className="ml-2">• {selectedSecoes.length} seção(ões) selecionada(s)</span>
              )}
              {selectedEquipes.length > 0 && (
                <span className="ml-2">• {selectedEquipes.length} equipe(s) selecionada(s)</span>
              )}
              {(startDate || endDate) && (
                <span className="ml-2">• Período personalizado</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Seções</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalSecoes}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Equipes</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalEquipes}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Indicadores</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalIndicadores}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Indicadores Preenchidos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.indicadoresPreenchidos}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.percentualConclusao}%</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Indicadores por Seção */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Indicadores por Seção</h2>
          <p className="text-sm text-gray-600">Status de preenchimento dos indicadores por seção</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seção
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preenchidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendentes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Conclusão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {indicadoresPorSecao.map((item) => (
                <tr key={item.secao_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.secao_nome}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.total_indicadores}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">{item.preenchidos}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600 font-medium">{item.pendentes}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.percentual}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentual}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {indicadoresPorSecao.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Nenhum dado encontrado com os filtros aplicados
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Relatórios Gerais</h3>
              <p className="text-sm text-gray-600">Gerar relatórios consolidados</p>
            </div>
          </div>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <UserPlus className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gerenciar Usuários</h3>
              <p className="text-sm text-gray-600">Administrar perfis e permissões</p>
            </div>
          </div>
        </button>

        <button className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow text-left">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Configurações</h3>
              <p className="text-sm text-gray-600">Configurar sistema e indicadores</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}