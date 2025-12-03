'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Pagination } from '@/components/ui/pagination'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface HorasTreinamentoRegistro {
  secao_id: string | null
  equipe_id: string | null
  nome_cidade: string | null
  data_ptr_ba: string | null
  nome_completo: string | null
  hora_ptr_diaria: number | null
  equipe: string | null
  mes_referencia: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
// Cores atualizadas para o padrão laranja/branco/preto
const areaColor = '#fb923c'
const barEquipeColor = '#fb923c'
const barColaboradorColor = '#fb923c'

export default function PtrbaHorasTreinamentoDashboard() {
  const { user } = useAuth()
  const [selectedNome, setSelectedNome] = useState<string>('todos')
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filtros padronizados
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMes, setSelectedMes] = useState<string | null>(null)

  const isGestorPOP = user?.profile?.perfil === 'gestor_pop'
  const isBace = user?.profile?.perfil === 'ba_ce'
  const isGerenteSecao = user?.profile?.perfil === 'gerente_secao'
  
  // Determinar secaoId para filtro de equipes
  const secaoIdParaEquipes = isGestorPOP 
    ? selectedBase 
    : (isBace || isGerenteSecao) 
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id)
      : undefined

  // Memoizar a função de filtros
  const additionalFilters = useMemo(() => {
    return (query: any) => {
      // Filtro por base (Gestor POP)
      if (isGestorPOP && selectedBase) {
        query = query.eq('secao_id', selectedBase)
      }
      
      // Filtro por seção (BA-CE e Gerente de Seção)
      if ((isBace || isGerenteSecao) && user?.profile?.secao_id) {
        query = query.eq('secao_id', user.profile.secao_id)
      }
      
      // Filtro por equipes
      if (selectedEquipes.length > 0) {
        query = query.in('equipe_id', selectedEquipes)
      }
      
      // Filtro por mês de referência
      if (selectedMes) {
        const [ano, mes] = selectedMes.split('-')
        const anoNum = parseInt(ano, 10)
        const mesNum = parseInt(mes, 10)
        const startDate = new Date(anoNum, mesNum - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(anoNum, mesNum, 0).toISOString().split('T')[0]
        query = query.gte('data_ptr_ba', startDate)
        query = query.lte('data_ptr_ba', endDate)
      }
      
      return query
    }
  }, [isGestorPOP, isBace, isGerenteSecao, selectedBase, selectedEquipes, selectedMes, user?.profile?.secao_id])

  // Usar hook unificado para carregamento de dados
  // O hook já aplica automaticamente o filtro por base do usuário
  const { 
    data: registros, 
    loading, 
    error, 
    refetch,
    isReady 
  } = useDashboardData<HorasTreinamentoRegistro>({
    tableName: 'ptr_ba_horas_treinamento',
    selectFields: 'secao_id, equipe_id, nome_cidade, data_ptr_ba, nome_completo, hora_ptr_diaria, equipe, mes_referencia',
    orderBy: { column: 'data_ptr_ba', ascending: false },
    limit: 1000,
    cacheKey: `ptr-ba-horas-treinamento-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMes || 'all'}-${isGestorPOP ? 'pop' : 'user'}`,
    additionalFilters
  })

  // Quando os filtros mudarem, recarregar os dados
  useEffect(() => {
    if (isReady && (isGestorPOP || isBace || isGerenteSecao)) {
      refetch()
    }
  }, [selectedBase, selectedEquipes, selectedMes, isReady, isGestorPOP, isBace, isGerenteSecao, refetch])
  
  // Limpar filtro de equipes quando a base mudar
  const previousBaseRef = useRef<string | null>(null)
  useEffect(() => {
    if (previousBaseRef.current !== selectedBase) {
      setSelectedEquipes([])
      previousBaseRef.current = selectedBase
    }
  }, [selectedBase])

  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'

  const registrosValidos = useMemo(
    () =>
      registros.filter((registro) => {
        if (!registro.data_ptr_ba) return false
        const data = new Date(`${registro.data_ptr_ba}T00:00:00`)
        return !Number.isNaN(data.getTime())
      }),
    [registros]
  )

  const nomesDisponiveis = useMemo(() => {
    const set = new Set<string>()
    registrosValidos.forEach((registro) => {
      if (registro.nome_completo) {
        set.add(registro.nome_completo)
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [registrosValidos])

  const registrosFiltrados = useMemo(() => {
    if (selectedNome === 'todos') return registrosValidos
    return registrosValidos.filter((registro) => registro.nome_completo === selectedNome)
  }, [registrosValidos, selectedNome])

  const totalRegistros = registrosFiltrados.length

  const monthKeys = useMemo(() => {
    const set = new Set<string>()
    registrosFiltrados.forEach((registro) => {
      const data = new Date(`${registro.data_ptr_ba}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      set.add(key)
    })
    return Array.from(set).sort()
  }, [registrosFiltrados])

  const latestMonthKey = monthKeys[monthKeys.length - 1] ?? null
  const latestMonthDate = latestMonthKey
    ? new Date(`${latestMonthKey.split('-')[0]}-${latestMonthKey.split('-')[1]}-01T00:00:00`)
    : null

  const registrosUltimoMes = useMemo(() => {
    if (!latestMonthKey) return []
    return registrosFiltrados.filter((registro) => {
      const data = new Date(`${registro.data_ptr_ba}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      return key === latestMonthKey
    })
  }, [registrosFiltrados, latestMonthKey])

  const horasPorColaboradorMes = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosFiltrados.forEach((registro) => {
      if (!registro.data_ptr_ba) return
      const data = new Date(`${registro.data_ptr_ba}T00:00:00`)
      const mes = monthFormatter.format(data).toUpperCase()
      const horas = registro.hora_ptr_diaria ?? 0
      if (!mapa.has(mes)) {
        mapa.set(mes, { soma: 0, count: 0 })
      }
      const entry = mapa.get(mes)!
      entry.soma += horas
      entry.count += 1
    })

    return Array.from(mapa.entries())
      .sort((a, b) => {
        const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
        return meses.indexOf(a[0]) - meses.indexOf(b[0])
      })
      .map(([mes, { soma, count }]) => ({ mes, media: count > 0 ? Number((soma / count).toFixed(2)) : 0 }))
  }, [registrosFiltrados])

  const horasPorEquipe = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosUltimoMes.forEach((registro) => {
      const equipe = registro.equipe || 'Equipe não informada'
      const horas = registro.hora_ptr_diaria ?? 0
      if (!mapa.has(equipe)) {
        mapa.set(equipe, { soma: 0, count: 0 })
      }
      const entry = mapa.get(equipe)!
      entry.soma += horas
      entry.count += 1
    })

    return Array.from(mapa.entries())
      .map(([equipe, { soma, count }]) => ({ equipe, media: count > 0 ? Number((soma / count).toFixed(2)) : 0 }))
      .sort((a, b) => b.media - a.media)
  }, [registrosUltimoMes])

  const mediaPorMes = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosFiltrados.forEach((registro) => {
      if (!registro.data_ptr_ba) return
      const data = new Date(`${registro.data_ptr_ba}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const horas = registro.hora_ptr_diaria ?? 0
      if (!mapa.has(key)) {
        mapa.set(key, { soma: 0, count: 0 })
      }
      const entry = mapa.get(key)!
      entry.soma += horas
      entry.count += 1
    })

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { soma, count }]) => {
        const data = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          mes: monthFormatter.format(data).toUpperCase(),
          media: count > 0 ? Number((soma / count).toFixed(2)) : 0
        }
      })
  }, [registrosFiltrados])

  const maiorHoraUltimoMes = useMemo(() => {
    if (registrosUltimoMes.length === 0) return 0
    return registrosUltimoMes.reduce((max, registro) => Math.max(max, registro.hora_ptr_diaria ?? 0), 0)
  }, [registrosUltimoMes])

  const mediaGeral = useMemo(() => {
    const { soma, count } = registrosFiltrados.reduce(
      (acc, registro) => {
        const horas = registro.hora_ptr_diaria ?? 0
        acc.soma += horas
        acc.count += 1
        return acc
      },
      { soma: 0, count: 0 }
    )
    return count > 0 ? Number((soma / count).toFixed(2)) : 0
  }, [registrosFiltrados])

  const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })

  const tabelaRegistros = useMemo(() => {
    return registrosFiltrados.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_ptr_ba
        ? dateFormatter.format(new Date(`${registro.data_ptr_ba}T00:00:00`))
        : '—',
      horasFormatadas: registro.hora_ptr_diaria !== null ? `${registro.hora_ptr_diaria.toFixed(2)} h` : '—'
    }))
  }, [registrosFiltrados])

  // Paginação
  const totalPages = Math.ceil(tabelaRegistros.length / itemsPerPage)
  const paginatedRegistros = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return tabelaRegistros.slice(startIndex, endIndex)
  }, [tabelaRegistros, currentPage, itemsPerPage])

  // Resetar página quando os dados mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [registrosFiltrados.length])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Horas de Treinamento PTR-BA</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace ? `Resultados de horas de treinamento registrados na base ${nomeBase}.` : 'Visão consolidada das horas de treinamento PTR-BA.'}
        </p>
      </div>

      {/* Filtros */}
      {(isGestorPOP || isBace || isGerenteSecao) && (
        <div className="bg-white rounded-lg border border-orange-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            {isGestorPOP && (
              <BaseFilter
                selectedBase={selectedBase}
                onBaseChange={setSelectedBase}
              />
            )}
            {((isGestorPOP && selectedBase) || ((isBace || isGerenteSecao) && user?.profile?.secao_id)) && (
              <EquipeFilter
                selectedEquipes={selectedEquipes}
                onEquipeChange={setSelectedEquipes}
                secaoId={secaoIdParaEquipes}
              />
            )}
            <MesReferenciaFilter
              selectedMes={selectedMes}
              onMesChange={setSelectedMes}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-primary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados de horas de treinamento...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : totalRegistros === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
          <p className="text-lg font-semibold text-primary">Ainda não há registros de horas de treinamento.</p>
          <p className="mt-2 text-sm">Assim que novas horas forem registradas, os gráficos e indicadores aparecerão aqui.</p>
        </div>
      ) : (
        <>
          {/* Cards no topo - Laranja */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de registros</p>
              <p className="mt-2 text-4xl font-black">{totalRegistros}</p>
              <p className="mt-1 text-xs text-white/80">Horas registradas</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Média geral</p>
              <p className="mt-2 text-4xl font-black">{mediaGeral.toFixed(1)} h</p>
              <p className="mt-1 text-xs text-white/80">Horas médias por registro</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Maior carga</p>
              <p className="mt-2 text-4xl font-black">{maiorHoraUltimoMes.toFixed(1)} h</p>
              <p className="mt-1 text-xs text-white/80">Mês atual</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-[#1f1f1f]">Filtrar por colaborador</p>
              <p className="text-xs text-[#1f1f1f]/60">Selecione um nome para visualizar indicadores específicos.</p>
            </div>
            <select
              value={selectedNome}
              onChange={(event) => setSelectedNome(event.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:w-64"
            >
              <option value="todos">Todos os colaboradores</option>
              {nomesDisponiveis.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Horas de treinamento por colaborador (média)</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Média mensal considerando todos os registros válidos</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={horasPorColaboradorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 'dataMax + 5']} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="media" fill={barColaboradorColor} radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-white/90">Média geral</p>
                <p className="mt-2 text-3xl font-black">{mediaGeral.toFixed(2)} h</p>
              </div>
              <div className="mt-6">
                <p className="text-sm font-medium uppercase tracking-wide text-white/90">Maior carga no mês atual</p>
                <p className="mt-2 text-3xl font-black">{maiorHoraUltimoMes.toFixed(2)} h</p>
                <p className="mt-2 text-xs text-white/80">Considera registros do mês {latestMonthDate ? monthFormatter.format(latestMonthDate).toUpperCase() : ''}.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Horas de treinamento por equipe (média)</h3>
                  <p className="text-xs text-[#1f1f1f]/60">
                    {latestMonthDate ? `Resultados do mês ${monthFormatter.format(latestMonthDate).toUpperCase()}` : 'Último mês disponível'}
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={horasPorEquipe} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 'dataMax + 5']} />
                    <YAxis dataKey="equipe" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} width={100} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="media" fill={barEquipeColor} barSize={18} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Média de horas por mês</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Histórico consolidado das horas registradas</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={mediaPorMes}>
                    <defs>
                      <linearGradient id="horasMedia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={areaColor} stopOpacity={0.7} />
                        <stop offset="30%" stopColor="#f97316" stopOpacity={0.5} />
                        <stop offset="60%" stopColor="#ea580c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c2410c" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 'dataMax + 5']} />
                    <Tooltip 
                      cursor={{ stroke: areaColor, strokeWidth: 2 }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="media" 
                      stroke={areaColor} 
                      strokeWidth={3}
                      fill="url(#horasMedia)"
                      dot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 7, fill: '#f97316', strokeWidth: 2, stroke: 'white' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabela de detalhamento */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Detalhamento das horas de treinamento</h3>
              <p className="text-xs text-muted-foreground">Registros ordenados do mais recente para o mais antigo</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Data</th>
                    <th className="px-4 py-3 text-left font-semibold">Colaborador</th>
                    <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                    <th className="px-4 py-3 text-left font-semibold">Base</th>
                    <th className="px-4 py-3 text-left font-semibold">Horas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paginatedRegistros.map((registro, index) => (
                    <tr key={`${registro.nome_completo}-${registro.data_ptr_ba}-${index}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{registro.dataFormatada}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_completo ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.equipe ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_cidade ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80 font-medium">{registro.horasFormatadas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={tabelaRegistros.length}
            />
          </div>
        </>
      )}
    </div>
  )
}
