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
  Legend,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDebounce } from '@/hooks/useDebounce'
import { Pagination } from '@/components/ui/pagination'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface TAFResultadoRegistro {
  idade: number | null
  tempo_total: string | null
  desempenho: number | null
  data_taf: string | null
  nome_equipe: string | null
  nome_cidade: string | null
  nome_completo: string | null
  taf_registros: {
    secao_id: string | null
    equipe_id: string | null
  } | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const yearMonthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

function tempoToMinutes(tempo?: string | null): number {
  if (!tempo) return 0
  const parts = tempo.split(':').map(Number)
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0
  const [hours = 0, minutes = 0, seconds = 0] = parts
  return hours * 60 + minutes + seconds / 60
}

function minutesToHHMMSS(mins: number): string {
  if (!Number.isFinite(mins) || mins <= 0) return '00:00:00'
  const totalSeconds = Math.round(mins * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

function categoriaIdade(idade: number | null): 'MAIOR QUE 40' | 'MENOR QUE 40' {
  if (idade !== null && idade >= 40) return 'MAIOR QUE 40'
  return 'MENOR QUE 40'
}

const donutColors = ['#fb923c', '#f97316', '#ea580c', '#c2410c']

export default function TafDashboard() {
  const { user } = useAuth()
  const [selectedNome, setSelectedNome] = useState<string>('todos')
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filtros padronizados
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMes, setSelectedMes] = useState<string | null>(null)

  // Debounce dos filtros para evitar múltiplas requisições
  const debouncedBase = useDebounce(selectedBase, 800)
  const debouncedEquipes = useDebounce(selectedEquipes, 800)
  const debouncedMes = useDebounce(selectedMes, 800)

  const isGestorPOP = user?.profile?.perfil === 'gestor_pop'
  const isBace = user?.profile?.perfil === 'ba_ce'
  const isGerenteSecao = user?.profile?.perfil === 'gerente_secao'
  
  // Determinar secaoId para filtro de equipes
  const secaoIdParaEquipes = isGestorPOP 
    ? selectedBase 
    : (isBace || isGerenteSecao) 
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id)
      : undefined

  // Memoizar a função de filtros para evitar recriações desnecessárias - usando valores debounced
  const additionalFilters = useMemo(() => {
    return (query: any) => {
      // Para TAF, o filtro por base é aplicado no join
      if (isGestorPOP && debouncedBase) {
        query = query.eq('taf_registros.secao_id', debouncedBase)
      }
      if ((isBace || isGerenteSecao) && user?.profile?.secao_id) {
        query = query.eq('taf_registros.secao_id', user.profile.secao_id)
      }
      
      // Filtro por equipes
      if (debouncedEquipes.length > 0) {
        query = query.in('taf_registros.equipe_id', debouncedEquipes)
      }
      
      // Filtro por mês de referência
      if (debouncedMes) {
        const [ano, mes] = debouncedMes.split('-')
        const anoNum = parseInt(ano, 10)
        const mesNum = parseInt(mes, 10)
        const startDate = new Date(anoNum, mesNum - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(anoNum, mesNum, 0).toISOString().split('T')[0]
        query = query.gte('data_taf', startDate)
        query = query.lte('data_taf', endDate)
      }
      
      return query
    }
  }, [isGestorPOP, isBace, isGerenteSecao, debouncedBase, debouncedEquipes, debouncedMes, user?.profile?.secao_id])

  // Usar hook unificado para carregamento de dados
  // O hook já aplica automaticamente o filtro por base do usuário
  // Para TAF, usamos additionalFilters para aplicar o filtro no join
  const { 
    data: registros, 
    loading, 
    error, 
    refetch,
    isReady 
  } = useDashboardData<TAFResultadoRegistro>({
    tableName: 'taf_resultados',
    selectFields: `idade, tempo_total, desempenho, data_taf, nome_equipe, nome_cidade, nome_completo, taf_registros!inner(secao_id, equipe_id)`,
    orderBy: { column: 'data_taf', ascending: false },
    limit: 1000,
    cacheKey: `taf-${debouncedBase || 'all'}-${debouncedEquipes.join(',')}-${debouncedMes || 'all'}-${isGestorPOP ? 'pop' : 'user'}`,
    additionalFilters
  })

  // Quando os filtros mudarem (debounced), recarregar os dados
  useEffect(() => {
    if (isReady && (isGestorPOP || isBace || isGerenteSecao)) {
      refetch()
    }
  }, [debouncedBase, debouncedEquipes, debouncedMes, isReady, isGestorPOP, isBace, isGerenteSecao, refetch])
  
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
        if (!registro.data_taf) return false
        const data = new Date(`${registro.data_taf}T00:00:00`)
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
      const date = new Date(`${registro.data_taf}T00:00:00`)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
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
      if (!registro.data_taf) return false
      const date = new Date(`${registro.data_taf}T00:00:00`)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      return key === latestMonthKey
    })
  }, [registrosFiltrados, latestMonthKey])

  const categoriasResumo = useMemo(() => {
    if (!latestMonthKey || registrosUltimoMes.length === 0) {
      return [
        { categoria: 'MAIOR QUE 40', mediaMinutos: 0, mediaFormatada: '00:00:00' },
        { categoria: 'MENOR QUE 40', mediaMinutos: 0, mediaFormatada: '00:00:00' }
      ]
    }

    const agrupado = new Map<'MAIOR QUE 40' | 'MENOR QUE 40', { soma: number; count: number }>()
    agrupado.set('MAIOR QUE 40', { soma: 0, count: 0 })
    agrupado.set('MENOR QUE 40', { soma: 0, count: 0 })

    registrosUltimoMes.forEach((registro) => {
      const categoria = categoriaIdade(registro.idade)
      const minutos = tempoToMinutes(registro.tempo_total)
      if (minutos > 0) {
        const entry = agrupado.get(categoria)!
        entry.soma += minutos
        entry.count += 1
      }
    })

    return Array.from(agrupado.entries()).map(([categoria, { soma, count }]) => ({
      categoria,
      mediaMinutos: count > 0 ? soma / count : 0,
      mediaFormatada: minutesToHHMMSS(count > 0 ? soma / count : 0)
    }))
  }, [registrosUltimoMes, latestMonthKey])

  const statusResumo = useMemo(() => {
    let aprovados = 0
    let reprovados = 0

    registrosFiltrados.forEach((registro) => {
      const desempenho = registro.desempenho ?? null
      if (desempenho !== null && desempenho >= 7) {
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

  const mediasPorEquipe = useMemo(() => {
    const mapa = new Map<string, { maior40: { soma: number; count: number }; menor40: { soma: number; count: number } }>()

    registrosUltimoMes.forEach((registro) => {
      const equipe = registro.nome_equipe ?? 'Equipe não informada'
      if (!mapa.has(equipe)) {
        mapa.set(equipe, {
          maior40: { soma: 0, count: 0 },
          menor40: { soma: 0, count: 0 }
        })
      }
      const bucket = mapa.get(equipe)!
      const categoria = categoriaIdade(registro.idade)
      const minutos = tempoToMinutes(registro.tempo_total)
      if (minutos > 0) {
        if (categoria === 'MAIOR QUE 40') {
          bucket.maior40.soma += minutos
          bucket.maior40.count += 1
        } else {
          bucket.menor40.soma += minutos
          bucket.menor40.count += 1
        }
      }
    })

    return Array.from(mapa.entries()).map(([equipe, valores]) => ({
      equipe,
      maior40: valores.maior40.count > 0 ? Number((valores.maior40.soma / valores.maior40.count).toFixed(2)) : 0,
      menor40: valores.menor40.count > 0 ? Number((valores.menor40.soma / valores.menor40.count).toFixed(2)) : 0,
      maior40Formatado: minutesToHHMMSS(valores.maior40.count > 0 ? valores.maior40.soma / valores.maior40.count : 0),
      menor40Formatado: minutesToHHMMSS(valores.menor40.count > 0 ? valores.menor40.soma / valores.menor40.count : 0)
    }))
  }, [registrosUltimoMes])

  const evolucaoPorMes = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosFiltrados.forEach((registro) => {
      const data = new Date(`${registro.data_taf}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      if (!mapa.has(key)) {
        mapa.set(key, { soma: 0, count: 0 })
      }
      const minutos = tempoToMinutes(registro.tempo_total)
      if (minutos > 0) {
        const entry = mapa.get(key)!
        entry.soma += minutos
        entry.count += 1
      }
    })

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { soma, count }]) => {
        const date = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          mes: yearMonthFormatter.format(date).replace('.', ''),
          mediaMinutos: count > 0 ? Number((soma / count).toFixed(2)) : 0
        }
      })
  }, [registrosFiltrados])

  const tempoMedioGeral = useMemo(() => {
    const { soma, count } = registrosFiltrados.reduce(
      (acc, registro) => {
        const minutos = tempoToMinutes(registro.tempo_total)
        if (minutos > 0) {
          acc.soma += minutos
          acc.count += 1
        }
        return acc
      },
      { soma: 0, count: 0 }
    )
    return minutesToHHMMSS(count > 0 ? soma / count : 0)
  }, [registrosFiltrados])

  const tabelaRegistros = useMemo(() => {
    return registrosFiltrados.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_taf
        ? dateFormatter.format(new Date(`${registro.data_taf}T00:00:00`))
        : '—',
      tempoFormatado: registro.tempo_total ?? '—',
      desempenhoFormatado: registro.desempenho !== null ? registro.desempenho.toFixed(1) : '—',
      statusFormatado: (registro.desempenho ?? 0) >= 7 ? 'Aprovado' : 'Reprovado'
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
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Avaliação do TAF</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace ? `Visualizando os resultados do TAF da base ${nomeBase}.` : 'Visão consolidada das avaliações de TAF registradas.'}
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
          Carregando dados do TAF...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : totalRegistros === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
          <p className="text-lg font-semibold text#[ff6600]">Ainda não há avaliações de TAF registradas.</p>
          <p className="mt-2 text-sm">Assim que novas avaliações forem registradas, os gráficos e indicadores serão exibidos aqui.</p>
        </div>
      ) : (
        <>
          {/* Cards no topo - Laranja */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de registros</p>
              <p className="mt-2 text-4xl font-black">{totalRegistros}</p>
              <p className="mt-1 text-xs text-white/80">Avaliações de TAF registradas</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo médio geral</p>
              <p className="mt-2 text-4xl font-black">{tempoMedioGeral}</p>
              <p className="mt-1 text-xs text-white/80">Média de todos os registros</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Aprovados</p>
              <p className="mt-2 text-4xl font-black">{statusResumo.find(s => s.name === 'Aprovado')?.value || 0}</p>
              <p className="mt-1 text-xs text-white/80">Desempenho ≥ 7</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <p className="text-sm font-medium text-[#1f1f1f]">Filtrar por participante</p>
              <p className="text-xs text-[#1f1f1f]/60">Selecione um nome para visualizar os indicadores específicos.</p>
            </div>
            <select
              value={selectedNome}
              onChange={(event) => setSelectedNome(event.target.value)}
              className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 md:w-64"
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
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Tempo do TAF (minutos)</h3>
                  <p className="text-xs text-[#1f1f1f]/60">
                    Idade categoria • MAIOR QUE 40 • MENOR QUE 40 {latestMonthDate ? `• ${dateFormatter.format(latestMonthDate)}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={categoriasResumo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="categoria" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <Tooltip
                      cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      formatter={(value: number) => [minutesToHHMMSS(value), 'Tempo médio']}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="mediaMinutos" fill="#fb923c" radius={[8, 8, 0, 0]} barSize={48}>
                      {categoriasResumo.map((item, index) => (
                        <Cell key={item.categoria} fill={index === 0 ? '#fb923c' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f1f1f]/60 mb-4">Status</h3>
                <div className="mt-4 h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={statusResumo}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
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
                <p className="mt-2 text-xs text-white/80">
                  Para aprovação, concluir até 3 minutos para menores de 40 anos e até 4 minutos para maiores de 40 anos.
                </p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 shadow-lg text-sm text-white">
                <p className="font-semibold text-white/90">TAF avaliado</p>
                <p className="mt-2 text-xs text-white/80">
                  30 flexões, 45 abdominais remadores e 45 polichinelos.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Média por equipe e categoria de idade</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Comparativo do mês {latestMonthDate ? monthFormatter.format(latestMonthDate) : ''}</p>
                </div>
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: 12 }}
                  payload={[
                    { value: 'MAIOR QUE 40', type: 'square', color: '#fb923c', id: 'maior40' },
                    { value: 'MENOR QUE 40', type: 'square', color: '#f97316', id: 'menor40' }
                  ]}
                />
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={mediasPorEquipe} layout="vertical" margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <YAxis dataKey="equipe" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      formatter={(value: number, name: string) => [minutesToHHMMSS(value), name]}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="maior40" fill="#fb923c" radius={[0, 4, 4, 0]} barSize={48} />
                    <Bar dataKey="menor40" fill="#f97316" radius={[0, 4, 4, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Evolução do tempo médio por mês</h3>
                  <p className="text-xs text-[#7a5b3e]/70">
                    {latestMonthDate ? `Mês de referência: ${yearMonthFormatter.format(latestMonthDate)}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <LineChart data={evolucaoPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <Tooltip
                      cursor={{ stroke: '#fb923c', strokeWidth: 2 }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      formatter={(value: number) => [minutesToHHMMSS(value), 'Tempo médio']}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mediaMinutos" 
                      stroke="#fb923c" 
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                      activeDot={{ r: 7, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabela de detalhamento */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Detalhamento das avaliações TAF</h3>
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
                    <th className="px-4 py-3 text-left font-semibold">Idade</th>
                    <th className="px-4 py-3 text-left font-semibold">Tempo Total</th>
                    <th className="px-4 py-3 text-left font-semibold">Desempenho</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paginatedRegistros.map((registro, index) => (
                    <tr key={`${registro.nome_completo}-${registro.data_taf}-${index}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{registro.dataFormatada}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_completo ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_equipe ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.nome_cidade ?? '—'}</td>
                      <td className="px-4 py-3 text-foreground/80">{registro.idade !== null ? `${registro.idade} anos` : '—'}</td>
                      <td className="px-4 py-3 text-foreground/80 font-medium">{registro.tempoFormatado}</td>
                      <td className="px-4 py-3 text-foreground/80 font-medium">{registro.desempenhoFormatado}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                            registro.statusFormatado === 'Aprovado'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {registro.statusFormatado}
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
