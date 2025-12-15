'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDebounce } from '@/hooks/useDebounce'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'
import DateRangeFilter from '@/components/filters/DateRangeFilter'
import { ChevronDown } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

interface AtividadeAcessoriaRegistro {
  id: string
  secao_id: string | null
  equipe_id: string | null
  equipe_nome: string | null
  cidade_aeroporto: string | null
  data_atividade: string | null
  tipo_atividade: string | null
  qtd_equipamentos: number | null
  qtd_bombeiros: number | null
  tempo_gasto: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const yearMonthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

function timeToMinutes(time?: string | null): number {
  if (!time) return 0
  const parts = time.split(':').map(Number)
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0
  const [hours = 0, minutes = 0, seconds = 0] = parts
  return hours * 60 + minutes + seconds / 60
}

function minutesToHHMM(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '00:00'
  const totalMinutes = Math.round(minutes)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function minutesToHuman(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours > 0) {
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }
  return `${mins}min`
}

export default function AtividadesAcessoriasDashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const itemsPerPage = 10
  
  // Filtros
  const [selectedEquipe, setSelectedEquipe] = useState<string>('todas')
  const [selectedTipo, setSelectedTipo] = useState<string>('todos')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  
  // Filtros padronizados
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMes, setSelectedMes] = useState<string | null>(null)
  
  // Debounce para filtros de data (evita múltiplas requisições)
  const debouncedStartDate = useDebounce(startDate, 500)
  const debouncedEndDate = useDebounce(endDate, 500)

  const isGestorPOP = user?.profile?.perfil === 'gestor_pop'
  const isBace = user?.profile?.perfil === 'ba_ce'
  const isGerenteSecao = user?.profile?.perfil === 'gerente_secao'
  
  // Determinar secaoId para filtro de equipes
  const secaoIdParaEquipes: string | undefined = isGestorPOP
    ? (selectedBase ?? undefined)
    : (isBace || isGerenteSecao)
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id ?? undefined)
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
      
      // Filtro por equipes (padronizado)
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
        query = query.gte('data_atividade', startDate)
        query = query.lte('data_atividade', endDate)
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
  } = useDashboardData<AtividadeAcessoriaRegistro>({
    tableName: 'atividades_acessorias',
    selectFields: `id, secao_id, equipe_id, equipe_nome, cidade_aeroporto, data_atividade, tipo_atividade, qtd_equipamentos, qtd_bombeiros, tempo_gasto`,
    orderBy: { column: 'data_atividade', ascending: false },
    limit: 1000,
    cacheKey: `atividades-acessorias-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMes || 'all'}-${isGestorPOP ? 'pop' : 'user'}`,
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

  // Filtrar registros (usando debounced dates para evitar recálculos excessivos)
  const registrosFiltrados = useMemo(() => {
    return registros.filter((registro) => {
      // Filtro de equipe
      if (selectedEquipe !== 'todas' && registro.equipe_id !== selectedEquipe) {
        return false
      }
      
      // Filtro de tipo
      if (selectedTipo !== 'todos' && registro.tipo_atividade !== selectedTipo) {
        return false
      }
      
      // Filtro de data (usando valores debounced)
      if (debouncedStartDate || debouncedEndDate) {
        if (!registro.data_atividade) return false
        const dataRegistro = new Date(`${registro.data_atividade}T00:00:00`)
        if (debouncedStartDate && dataRegistro < new Date(`${debouncedStartDate}T00:00:00`)) {
          return false
        }
        if (debouncedEndDate && dataRegistro > new Date(`${debouncedEndDate}T23:59:59`)) {
          return false
        }
      }
      
      return true
    })
  }, [registros, selectedEquipe, selectedTipo, debouncedStartDate, debouncedEndDate])

  // Opções de filtros
  const equipesDisponiveis = useMemo(() => {
    const equipes = new Set<string>()
    registros.forEach((registro) => {
      if (registro.equipe_id && registro.equipe_nome) {
        equipes.add(registro.equipe_id)
      }
    })
    return Array.from(equipes).map((id) => {
      const registro = registros.find((r) => r.equipe_id === id)
      return { value: id, label: registro?.equipe_nome || 'Equipe não informada' }
    }).sort((a, b) => a.label.localeCompare(b.label))
  }, [registros])

  const tiposDisponiveis = useMemo(() => {
    const tipos = new Set<string>()
    registros.forEach((registro) => {
      if (registro.tipo_atividade) {
        tipos.add(registro.tipo_atividade)
      }
    })
    return Array.from(tipos).sort().map((tipo) => ({ value: tipo, label: tipo }))
  }, [registros])

  const totalAtividades = registrosFiltrados.length

  const hoje = new Date()
  const mesAtualKey = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  const atividadesMesAtual = useMemo(() => {
    return registrosFiltrados.filter((registro) => {
      if (!registro.data_atividade) return false
      const data = new Date(`${registro.data_atividade}T00:00:00`)
      if (Number.isNaN(data.getTime())) return false
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      return key === mesAtualKey
    })
  }, [registrosFiltrados, mesAtualKey])

  const totalTempoMesAtual = useMemo(() => {
    return atividadesMesAtual.reduce((acc, registro) => acc + timeToMinutes(registro.tempo_gasto), 0)
  }, [atividadesMesAtual])

  const mesesSeries = useMemo(() => {
    const map = new Map<string, { label: string; quant: number }>()

    registrosFiltrados.forEach((registro) => {
      if (!registro.data_atividade) return
      const date = new Date(`${registro.data_atividade}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { label: yearMonthFormatter.format(date).replace('.', ''), quant: 0 })
      }
      map.get(key)!.quant += 1
    })

    return Array.from(map.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .slice(-12)
      .map(([, value]) => ({ mes: value.label, total: value.quant }))
  }, [registrosFiltrados])

  const diasSeries = useMemo(() => {
    if (atividadesMesAtual.length === 0) return []

    const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate()
    const map = new Map<number, number>()
    for (let dia = 1; dia <= diasNoMes; dia += 1) {
      map.set(dia, 0)
    }

    atividadesMesAtual.forEach((registro) => {
      if (!registro.data_atividade) return
      const data = new Date(`${registro.data_atividade}T00:00:00`)
      if (Number.isNaN(data.getTime())) return
      const dia = data.getDate()
      map.set(dia, (map.get(dia) ?? 0) + 1)
    })

    return Array.from(map.entries()).map(([dia, total]) => ({ dia, total }))
  }, [atividadesMesAtual, hoje])

  const topTiposAtividade = useMemo(() => {
    const map = new Map<string, number>()

    registrosFiltrados.forEach((registro) => {
      const tipo = registro.tipo_atividade?.trim() || 'Não informado'
      map.set(tipo, (map.get(tipo) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }, [registrosFiltrados])

  const tabelaRegistros = useMemo(() => {
    return registrosFiltrados.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_atividade
        ? dateFormatter.format(new Date(`${registro.data_atividade}T00:00:00`))
        : '—',
      tempoFormatado: registro.tempo_gasto?.slice(0, 5) ?? '—'
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

  const totalTempoHuman = minutesToHuman(
    registrosFiltrados.reduce((acc, registro) => acc + timeToMinutes(registro.tempo_gasto), 0)
  )

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Atividades Acessórias</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace
            ? `Visualizando os registros da base ${nomeBase}.`
            : 'Resumo das atividades acessórias registradas em todas as bases.'}
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
          Carregando dados das atividades...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : (
        <>
          {totalAtividades === 0 && registros.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#1f1f1f]">
              <p className="text-lg font-semibold text-[#1f1f1f]">Nenhuma atividade acessória cadastrada.</p>
              <p className="mt-2 text-sm">
                Assim que novas atividades forem registradas para sua base, os gráficos e a tabela serão exibidos aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Cards no topo - Laranja */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de atividades</p>
                  <p className="mt-2 text-4xl font-black">{totalAtividades}</p>
                  <p className="mt-1 text-xs text-white/80">Registros filtrados</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Atividades no mês</p>
                  <p className="mt-2 text-4xl font-black">{atividadesMesAtual.length}</p>
                  <p className="mt-1 text-xs text-white/80">{monthFormatter.format(hoje)} {hoje.getFullYear()}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo total no mês</p>
                  <p className="mt-2 text-4xl font-black">{minutesToHHMM(totalTempoMesAtual)}</p>
                  <p className="mt-1 text-xs text-white/80">Somatório de tempo gasto</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo total acumulado</p>
                  <p className="mt-2 text-3xl font-black">{totalTempoHuman}</p>
                  <p className="mt-1 text-xs text-white/80">Soma de tempo gasto</p>
                </div>
              </div>

              {/* Filtros */}
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm space-y-4 mb-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex flex-wrap gap-3">
                    <div className="min-w-[200px]">
                      <label className="mb-1 block text-xs font-semibold text-[#1f1f1f]/60 uppercase tracking-wide">
                        Equipe
                      </label>
                      <div className="relative">
                        <select
                          value={selectedEquipe}
                          onChange={(event) => setSelectedEquipe(event.target.value)}
                          className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="todas">Todas as equipes</option>
                          {equipesDisponiveis.map((equipe) => (
                            <option key={equipe.value} value={equipe.value}>
                              {equipe.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div className="min-w-[200px]">
                      <label className="mb-1 block text-xs font-semibold text-[#1f1f1f]/60 uppercase tracking-wide">
                        Tipo de atividade
                      </label>
                      <div className="relative">
                        <select
                          value={selectedTipo}
                          onChange={(event) => setSelectedTipo(event.target.value)}
                          className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200"
                        >
                          <option value="todos">Todos os tipos</option>
                          {tiposDisponiveis.map((tipo) => (
                            <option key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                      </div>
                    </div>

                    <div className="min-w-[240px]">
                      <label className="mb-1 block text-xs font-semibold text-[#1f1f1f]/60 uppercase tracking-wide">
                        Período
                      </label>
                      <DateRangeFilter
                        startDate={startDate}
                        endDate={endDate}
                        onDateChange={(inicio, fim) => {
                          setStartDate(inicio)
                          setEndDate(fim)
                        }}
                        label="Período"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Total de atividades ao longo do ano</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">Últimos 12 meses</span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <AreaChart data={mesesSeries}>
                        <defs>
                          <linearGradient id="atividadesMes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.7} />
                            <stop offset="30%" stopColor="#f97316" stopOpacity={0.5} />
                            <stop offset="60%" stopColor="#ea580c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#c2410c" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                        <XAxis 
                          dataKey="mes" 
                          stroke="#1f1f1f" 
                          tick={{ fontSize: 12, fill: '#1f1f1f' }} 
                          interval={0}
                        />
                        <YAxis 
                          allowDecimals={false} 
                          stroke="#1f1f1f" 
                          tick={{ fontSize: 12, fill: '#1f1f1f' }} 
                        />
                        <Tooltip 
                          cursor={{ stroke: '#fb923c', strokeWidth: 2 }}
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
                          dataKey="total" 
                          stroke="#fb923c" 
                          strokeWidth={3}
                          fill="url(#atividadesMes)"
                          dot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                          activeDot={{ r: 7, fill: '#f97316', strokeWidth: 2, stroke: 'white' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Total de atividades x dia</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">
                      {monthFormatter.format(hoje)}
                    </span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={diasSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} vertical={false} />
                        <XAxis dataKey="dia" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                        <YAxis allowDecimals={false} stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
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
                        <Bar dataKey="total" fill="#fb923c" barSize={18} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Total de atividades por tipo</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">Top 12</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart
                        data={topTiposAtividade}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" strokeOpacity={0.3} />
                        <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                        <YAxis dataKey="name" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f', width: 200 }} />
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
                        <Bar dataKey="value" fill="#fb923c" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Resumo de recursos</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">Dados acumulados</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 text-white shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/90">Equipamentos inspecionados</p>
                      <p className="mt-2 text-2xl font-black">
                        {registrosFiltrados.reduce((acc, registro) => acc + (registro.qtd_equipamentos ?? 0), 0)}
                      </p>
                      <p className="text-xs text-white/80 mt-1">Quantidade total registrada</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 text-white shadow-lg">
                      <p className="text-xs uppercase tracking-wide text-white/90">Bombeiros envolvidos</p>
                      <p className="mt-2 text-2xl font-black">
                        {registrosFiltrados.reduce((acc, registro) => acc + (registro.qtd_bombeiros ?? 0), 0)}
                      </p>
                      <p className="text-xs text-white/80 mt-1">Total de participações</p>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 text-white shadow-lg sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide text-white/90">Bases registradas</p>
                      <p className="mt-2 text-2xl font-black">
                        {new Set(registrosFiltrados.map((registro) => registro.cidade_aeroporto || registro.secao_id || '—')).size}
                      </p>
                      <p className="text-xs text-white/80 mt-1">Com atividades no período</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabela de detalhamento */}
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4 bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground">Detalhamento das atividades</h3>
                  <p className="text-xs text-muted-foreground">Registros ordenados do mais recente para o mais antigo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Data</th>
                        <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                        <th className="px-4 py-3 text-left font-semibold">Tipo de atividade</th>
                        <th className="px-4 py-3 text-left font-semibold">Local / Base</th>
                        <th className="px-4 py-3 text-left font-semibold">Equipamentos</th>
                        <th className="px-4 py-3 text-left font-semibold">Bombeiros</th>
                        <th className="px-4 py-3 text-left font-semibold">Tempo gasto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {paginatedRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">{registro.dataFormatada}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.equipe_nome ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.tipo_atividade ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.cidade_aeroporto ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.qtd_equipamentos ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.qtd_bombeiros ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80 font-medium">{registro.tempoFormatado}</td>
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
        </>
      )}
    </div>
  )
}
