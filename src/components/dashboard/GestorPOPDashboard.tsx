// =====================================================
// DASHBOARD GESTOR POP
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { BarChart3, Users, Target, TrendingUp, FileText, Settings, UserPlus, Building2 } from 'lucide-react'
import BaseFilter from '@/components/filters/BaseFilter'
import DateRangeFilter from '@/components/filters/DateRangeFilter'
import { TEMAS_INDICADORES } from '@/components/historico/HistoricoIndicadores'

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

interface IndicadorPorTema {
  tema_id: string
  tema_nome: string
  tabela: string
  total_registros: number
  ultimo_registro: string | null
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
  const [indicadoresPorTema, setIndicadoresPorTema] = useState<IndicadorPorTema[]>([])
  const [loading, setLoading] = useState(true)

  // Estados dos filtros
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchEstatisticas()
    if (selectedBase) {
      fetchIndicadoresPorTema()
    } else {
      fetchIndicadoresPorSecao()
    }
  }, [selectedBase, startDate, endDate])

  const fetchEstatisticas = async () => {
    try {
      // Buscar total de seções
      const { count: totalSecoes } = await supabase
        .from('secoes')
        .select('id', { count: 'exact' })

      // Buscar total de equipes
      const { count: totalEquipes } = await supabase
        .from('equipes')
        .select('id', { count: 'exact' })
        .eq(selectedBase ? 'secao_id' : 'secao_id', selectedBase || undefined as any)

      // Buscar indicadores
      const { count: totalIndicadores } = await supabase
        .from('indicadores')
        .select('id', { count: 'exact' })

      // Buscar preenchimentos
      let preenchimentosQuery
      if (selectedBase) {
        // Consulta específica quando há base selecionada, usando join com profiles
        preenchimentosQuery = supabase
          .from('preenchimentos')
          .select(`
            id,
            profiles!inner (
              secao_id
            )
          `, { count: 'exact' })
          .eq('profiles.secao_id', selectedBase)
      } else {
        // Consulta mais simples quando não há base selecionada
        preenchimentosQuery = supabase
          .from('preenchimentos')
          .select('id', { count: 'exact' })
      }

      if (startDate) {
        preenchimentosQuery = preenchimentosQuery.gte('data_preenchimento', startDate)
      }
      if (endDate) {
        preenchimentosQuery = preenchimentosQuery.lte('data_preenchimento', endDate)
      }

      const { count: indicadoresPreenchidos } = await preenchimentosQuery

      const totalIndicadoresNumber = totalIndicadores ?? 0
      const indicadoresPreenchidosNumber = indicadoresPreenchidos ?? 0

      const percentualConclusao = totalIndicadoresNumber > 0 
        ? Math.round((indicadoresPreenchidosNumber / totalIndicadoresNumber) * 100)
        : 0

      setEstatisticas({
        totalSecoes: totalSecoes ?? 0,
        totalEquipes: totalEquipes ?? 0,
        totalIndicadores: totalIndicadoresNumber,
        indicadoresPreenchidos: indicadoresPreenchidosNumber,
        percentualConclusao
      })
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }

  const fetchIndicadoresPorSecao = async () => {
    try {
      const { data: secoes, error } = await supabase
        .from('secoes')
        .select('id, nome')
        .order('nome')

      if (error) throw error

      // Buscar total de indicadores (uma vez para todas as seções)
      const { count: totalIndicadores } = await supabase
        .from('indicadores')
        .select('id', { count: 'exact', head: true })
        .eq('ativo', true)

      // Buscar dados reais de indicadores por seção
      const indicadoresData: IndicadorPorSecao[] = await Promise.all(
        (secoes || []).map(async (secao) => {
          // Buscar preenchimentos da seção através de profiles
          const { count: preenchidos } = await supabase
            .from('preenchimentos')
            .select('id, profiles!inner(secao_id)', { count: 'exact', head: true })
            .eq('profiles.secao_id', secao.id)

          const total = totalIndicadores || 0
          const preenchidosCount = preenchidos || 0
          const pendentes = total - preenchidosCount
          const percentual = total > 0 ? Math.round((preenchidosCount / total) * 100) : 0

          return {
            secao_id: secao.id,
            secao_nome: secao.nome,
            total_indicadores: total,
            preenchidos: preenchidosCount,
            pendentes,
            percentual
          }
        })
      )

      setIndicadoresPorSecao(indicadoresData)
    } catch (error) {
      console.error('Erro ao buscar indicadores por seção:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIndicadoresPorTema = async () => {
    if (!selectedBase) return

    try {
      setLoading(true)

      // Buscar indicadores por tema para a base selecionada
      const indicadoresData: IndicadorPorTema[] = await Promise.all(
        TEMAS_INDICADORES.map(async (tema) => {
          try {
            // Primeiro, tentar buscar com secao_id direto
            let query = supabase
              .from(tema.tabela)
              .select('id, created_at', { count: 'exact' })
              .eq('secao_id', selectedBase)
              .order('created_at', { ascending: false })
              .limit(1)

            const { data, count, error } = await query

            if (!error && count !== null) {
              return {
                tema_id: tema.id,
                tema_nome: tema.nome,
                tabela: tema.tabela,
                total_registros: count || 0,
                ultimo_registro: data && data.length > 0 ? data[0].created_at : null
              }
            }

            // Se não funcionar, tentar através de profiles
            try {
              const { data: dataWithProfile, count: countWithProfile, error: errorProfile } = await supabase
                .from(tema.tabela)
                .select(`
                  id,
                  created_at,
                  profiles!inner(secao_id)
                `, { count: 'exact' })
                .eq('profiles.secao_id', selectedBase)
                .order('created_at', { ascending: false })
                .limit(1)

              if (!errorProfile) {
                return {
                  tema_id: tema.id,
                  tema_nome: tema.nome,
                  tabela: tema.tabela,
                  total_registros: countWithProfile || 0,
                  ultimo_registro: dataWithProfile && dataWithProfile.length > 0 
                    ? dataWithProfile[0].created_at 
                    : null
                }
              }
            } catch (profileError) {
              // Ignorar erro de profile
            }

            // Se nenhuma das abordagens funcionou, retornar zero
            return {
              tema_id: tema.id,
              tema_nome: tema.nome,
              tabela: tema.tabela,
              total_registros: 0,
              ultimo_registro: null
            }
          } catch (err) {
            // Se a tabela não existir ou houver erro, retornar zero
            console.warn(`Erro ao buscar dados da tabela ${tema.tabela}:`, err)
            return {
              tema_id: tema.id,
              tema_nome: tema.nome,
              tabela: tema.tabela,
              total_registros: 0,
              ultimo_registro: null
            }
          }
        })
      )

      setIndicadoresPorTema(indicadoresData)
    } catch (error) {
      console.error('Erro ao buscar indicadores por tema:', error)
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
        <div className="text-gray-500">Preparando seus indicadores...</div>
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
          <BaseFilter
            selectedBase={selectedBase}
            onBaseChange={setSelectedBase}
          />
          
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onDateChange={handleDateChange}
            label="Período dos Indicadores"
          />
        </div>

        {/* Resumo dos Filtros Aplicados */}
        {(selectedBase || startDate || endDate) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Filtros aplicados:</strong>
              {selectedBase && (
                <span className="ml-2">• Base selecionada</span>
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

      {/* Indicadores por Tema (quando base selecionada) ou por Seção */}
      {selectedBase ? (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Indicadores por Tema</h2>
                <p className="text-sm text-gray-600">
                  Todos os indicadores da base selecionada agrupados por tema
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicadoresPorTema.map((tema) => (
                <div
                  key={tema.tema_id}
                  className="bg-linear-to-br from-white to-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {tema.tema_nome}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {TEMAS_INDICADORES.find(t => t.id === tema.tema_id)?.descricao || ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total de Registros:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {tema.total_registros}
                      </span>
                    </div>
                    
                    {tema.ultimo_registro && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          Último registro:{' '}
                          {new Date(tema.ultimo_registro).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}
                    
                    {tema.total_registros === 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-400 italic">
                          Nenhum registro encontrado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {indicadoresPorTema.length === 0 && !loading && (
              <div className="p-8 text-center text-gray-500">
                Nenhum indicador encontrado para a base selecionada
              </div>
            )}
          </div>
        </div>
      ) : (
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

          {indicadoresPorSecao.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500">
              Nenhum dado encontrado
            </div>
          )}
        </div>
      )}

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