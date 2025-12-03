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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Pagination } from '@/components/ui/pagination'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface PTRBAProvaRegistro {
  secao_id: string | null
  equipe_id: string | null
  nome_cidade: string | null
  data_prova: string | null
  nome_completo: string | null
  nota_prova: number | null
  status: string | null
  equipe: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const yearMonthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })

// Cores atualizadas para o padrão laranja/branco/preto
const barBaseColor = '#fb923c'
const barEquipeColor = '#fb923c'
const donutColors = ['#fb923c', '#f97316', '#ea580c', '#c2410c']
const areaColor = '#fb923c'

export default function PtrbaProvaTeoricaDashboard() {
  const { user } = useAuth()
  const [selectedNome, setSelectedNome] = useState<string>('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filtros
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
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
        query = query.gte('data_prova', startDate)
        query = query.lte('data_prova', endDate)
      }
      
      return query
    }
  }, [isGestorPOP, isBace, isGerenteSecao, selectedBase, selectedEquipes, selectedMes, user?.profile?.secao_id])

  // Usar hook unificado para carregamento de dados
  const { 
    data: registros, 
    loading, 
    error, 
    refetch,
    isReady 
  } = useDashboardData<PTRBAProvaRegistro>({
    tableName: 'ptr_ba_provas_teoricas',
    selectFields: 'secao_id, equipe_id, nome_cidade, data_prova, nome_completo, nota_prova, status, equipe',
    orderBy: { column: 'data_prova', ascending: false },
    limit: 1000,
    cacheKey: `ptr-ba-prova-teorica-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMes || 'all'}`,
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
        if (!registro.data_prova) return false
        const data = new Date(`${registro.data_prova}T00:00:00`)
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
      const data = new Date(`${registro.data_prova}T00:00:00`)
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
      const data = new Date(`${registro.data_prova}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      return key === latestMonthKey
    })
  }, [registrosFiltrados, latestMonthKey])

  const mediaPorBase = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosFiltrados.forEach((registro) => {
      const base = registro.nome_cidade || registro.secao_id || 'Base não informada'
      const nota = typeof registro.nota_prova === 'number' ? registro.nota_prova : null
      if (nota !== null) {
        if (!mapa.has(base)) {
          mapa.set(base, { soma: 0, count: 0 })
        }
        const entry = mapa.get(base)!
        entry.soma += nota
        entry.count += 1
      }
    })

    return Array.from(mapa.entries())
      .map(([base, { soma, count }]) => ({ base, media: count > 0 ? Number((soma / count).toFixed(1)) : 0 }))
      .sort((a, b) => b.media - a.media)
  }, [registrosFiltrados])

  const statusResumo = useMemo(() => {
    let aprovados = 0
    let reprovados = 0

    registrosFiltrados.forEach((registro) => {
      if ((registro.status ?? '').toLowerCase() === 'aprovado' && (registro.nota_prova ?? 0) >= 8) {
        aprovados += 1
      } else {
        reprovados += 1
      }
    })

    return [
      { name: 'Aprovado', value: aprovados },
      { name: 'Reprovado', value: reprovados }
    ]
  }, [registrosFiltrados])

  const mediaPorEquipe = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosUltimoMes.forEach((registro) => {
      const equipe = registro.equipe || 'Equipe não informada'
      const nota = typeof registro.nota_prova === 'number' ? registro.nota_prova : null
      if (nota !== null) {
        if (!mapa.has(equipe)) {
          mapa.set(equipe, { soma: 0, count: 0 })
        }
        const entry = mapa.get(equipe)!
        entry.soma += nota
        entry.count += 1
      }
    })

    return Array.from(mapa.entries())
      .map(([equipe, { soma, count }]) => ({ equipe, media: count > 0 ? Number((soma / count).toFixed(1)) : 0 }))
      .sort((a, b) => b.media - a.media)
  }, [registrosUltimoMes])

  const mediaPorMes = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosFiltrados.forEach((registro) => {
      const data = new Date(`${registro.data_prova}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const nota = typeof registro.nota_prova === 'number' ? registro.nota_prova : null
      if (nota !== null) {
        if (!mapa.has(key)) {
          mapa.set(key, { soma: 0, count: 0 })
        }
        const entry = mapa.get(key)!
        entry.soma += nota
        entry.count += 1
      }
    })

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { soma, count }]) => {
        const date = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          mes: yearMonthFormatter.format(date).replace('.', ''),
          media: count > 0 ? Number((soma / count).toFixed(2)) : 0
        }
      })
  }, [registrosFiltrados])

  const mediaGeral = useMemo(() => {
    const { soma, count } = registrosFiltrados.reduce(
      (acc, registro) => {
        const nota = typeof registro.nota_prova === 'number' ? registro.nota_prova : null
        if (nota !== null) {
          acc.soma += nota
          acc.count += 1
        }
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
      dataFormatada: registro.data_prova
        ? dateFormatter.format(new Date(`${registro.data_prova}T00:00:00`))
        : '—',
      notaFormatada: registro.nota_prova !== null ? registro.nota_prova.toFixed(1) : '—'
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
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Avaliação Teórica PTR-BA</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace ? `Resultados da prova teórica para a base ${nomeBase}.` : 'Visão consolidada das avaliações teóricas PTR-BA registradas.'}
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
          Carregando dados da prova teórica...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : totalRegistros === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
          <p className="text-lg font-semibold text-primary">Ainda não há provas teóricas registradas.</p>
          <p className="mt-2 text-sm">Assim que novas avaliações forem registradas, os gráficos e indicadores serão exibidos aqui.</p>
        </div>
      ) : (
        <>
          {/* Cards no topo - Laranja */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de registros</p>
              <p className="mt-2 text-4xl font-black">{totalRegistros}</p>
              <p className="mt-1 text-xs text-white/80">Avaliações registradas</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Média geral</p>
              <p className="mt-2 text-4xl font-black">{mediaGeral.toFixed(1)}</p>
              <p className="mt-1 text-xs text-white/80">Nota média das avaliações</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Aprovados</p>
              <p className="mt-2 text-4xl font-black">{statusResumo.find(s => s.name === 'Aprovado')?.value || 0}</p>
              <p className="mt-1 text-xs text-white/80">Nota ≥ 8,0</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-[#1f1f1f]">Filtrar por participante</p>
              <p className="text-xs text-[#1f1f1f]/60">Selecione um nome para visualizar os indicadores específicos.</p>
            </div>
            <select
              value={selectedNome}
              onChange={(event) => setSelectedNome(event.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:w-64"
            >
              <option value="todos">Todos os participantes</option>
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
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Média de notas por base</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Médias gerais das bases cadastradas</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={mediaPorBase}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="base" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 10]} />
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
                    <Bar dataKey="media" fill={barBaseColor} radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f1f1f]/60 mb-4">Status</h3>
                <div className="h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusResumo} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {statusResumo.map((entry, index) => (
                          <Cell key={entry.name} fill={donutColors[index % donutColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number, name: string) => [`${value} (${((value / totalRegistros) * 100).toFixed(1)}%)`, name]} 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: 12,
                          border: '1px solid #fb923c',
                          boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                          color: '#1f1f1f'
                        }}
                        labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                      />
                      <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 12, color: '#1f1f1f' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 shadow-lg text-sm text-white">
                <p className="font-semibold text-white/90">Critério de aprovação</p>
                <p className="mt-2 text-xs text-white/80">Aprovado: notas maiores ou iguais a 8,0.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Nota de avaliação por equipe (média)</h3>
                  <p className="text-xs text-[#1f1f1f]/60">
                    {latestMonthDate ? `Resultados do mês ${monthFormatter.format(latestMonthDate)}` : 'Último mês disponível'}
                  </p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={mediaPorEquipe} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 10]} />
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
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Média de nota por mês</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Histórico das avaliações registradas</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={mediaPorMes}>
                    <defs>
                      <linearGradient id="mediaNotas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={areaColor} stopOpacity={0.7} />
                        <stop offset="30%" stopColor="#f97316" stopOpacity={0.5} />
                        <stop offset="60%" stopColor="#ea580c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c2410c" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} domain={[0, 10]} />
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
                      fill="url(#mediaNotas)"
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
              <h3 className="text-lg font-semibold text-foreground">Detalhamento das avaliações</h3>
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
                    <th className="px-4 py-3 text-left font-semibold">Nota</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paginatedRegistros.map((registro, index) => (
                    <tr key={`${registro.nome_completo}-${registro.data_prova}-${index}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{registro.dataFormatada}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_completo ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.equipe ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_cidade ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80 font-medium">{registro.notaFormatada}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            (registro.status ?? '').toLowerCase() === 'aprovado' && (registro.nota_prova ?? 0) >= 8
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {registro.status ?? 'Reprovado'}
                        </span>
                      </td>
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
