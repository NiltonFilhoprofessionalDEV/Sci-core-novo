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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface TempoEPRRegistro {
  secao_id: string | null
  equipe_id: string | null
  nome_cidade: string | null
  data_exercicio_epr: string | null
  nome_completo: string | null
  tempo_epr: string | null
  status: string | null
  equipe: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const areaColor = '#fb923c'
const legendColors = {
  Ideal: '#fb923c',
  Tolerável: '#f97316',
  Reprovado: '#ea580c'
} as const
const donutColors = ['#fb923c', '#f97316', '#ea580c', '#c2410c']

function tempoToSeconds(tempo?: string | null): number {
  if (!tempo) return 0
  const parts = tempo.split(':').map(Number)
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0
  const [minutos = 0, segundos = 0] = parts
  return minutos * 60 + segundos
}

function secondsToMMSS(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00'
  const minutos = Math.floor(totalSeconds / 60)
  const segundos = totalSeconds % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}

function calcularDesempenho(tempoSegundos: number): number {
  if (!Number.isFinite(tempoSegundos) || tempoSegundos <= 0) return 0
  if (tempoSegundos <= 40) return 10
  if (tempoSegundos <= 45) return 9
  if (tempoSegundos <= 50) return 8
  if (tempoSegundos <= 55) return 7
  if (tempoSegundos <= 60) return 6
  if (tempoSegundos <= 70) return 5
  if (tempoSegundos <= 80) return 4
  if (tempoSegundos <= 90) return 3
  if (tempoSegundos <= 110) return 2
  return 1
}

function normalizarStatus(status?: string | null): keyof typeof legendColors {
  const valor = (status || '').trim().toLowerCase()
  if (valor === 'ideal' || valor === 'ótimo' || valor === 'otimo') return 'Ideal'
  if (valor === 'tolerável' || valor === 'toleravel' || valor === 'bom' || valor === 'regular') return 'Tolerável'
  return 'Reprovado'
}

export default function TempoEPRDashboard() {
  const { user } = useAuth()
  const [selectedMes, setSelectedMes] = useState<string>('todos')
  const [selectedEquipe, setSelectedEquipe] = useState<string>('todos')
  const [selectedNome, setSelectedNome] = useState<string>('todos')
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  
  // Filtros padronizados
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMesRef, setSelectedMesRef] = useState<string | null>(null)

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
      
      // Filtro por equipes (padronizado)
      if (selectedEquipes.length > 0) {
        query = query.in('equipe_id', selectedEquipes)
      }
      
      // Filtro por mês de referência
      if (selectedMesRef) {
        const [ano, mes] = selectedMesRef.split('-')
        const anoNum = parseInt(ano, 10)
        const mesNum = parseInt(mes, 10)
        const startDate = new Date(anoNum, mesNum - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(anoNum, mesNum, 0).toISOString().split('T')[0]
        query = query.gte('data_exercicio_epr', startDate)
        query = query.lte('data_exercicio_epr', endDate)
      }
      
      return query
    }
  }, [isGestorPOP, isBace, isGerenteSecao, selectedBase, selectedEquipes, selectedMesRef, user?.profile?.secao_id])

  // Usar hook unificado para carregamento de dados
  // O hook já aplica automaticamente o filtro por base do usuário
  const { 
    data: registrosRaw, 
    loading, 
    error, 
    refetch,
    isReady 
  } = useDashboardData<TempoEPRRegistro>({
    tableName: 'tempo_epr',
    selectFields: 'secao_id, equipe_id, nome_cidade, data_exercicio_epr, nome_completo, tempo_epr, status, equipe',
    orderBy: { column: 'data_exercicio_epr', ascending: false },
    limit: 1000,
    cacheKey: `tempo-epr-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMesRef || 'all'}-${isGestorPOP ? 'pop' : 'user'}`,
    additionalFilters
  })

  // Quando os filtros mudarem, recarregar os dados
  useEffect(() => {
    if (isReady && (isGestorPOP || isBace || isGerenteSecao)) {
      refetch()
    }
  }, [selectedBase, selectedEquipes, selectedMesRef, isReady, isGestorPOP, isBace, isGerenteSecao, refetch])
  
  // Limpar filtro de equipes quando a base mudar
  const previousBaseRef = useRef<string | null>(null)
  useEffect(() => {
    if (previousBaseRef.current !== selectedBase) {
      setSelectedEquipes([])
      previousBaseRef.current = selectedBase
    }
  }, [selectedBase])

  // Adicionar desempenho aos registros
  const registros = useMemo(() => {
    return registrosRaw.map((registro) => {
      const tempoSegundos = tempoToSeconds(registro.tempo_epr)
      return {
        ...registro,
        desempenho: calcularDesempenho(tempoSegundos)
      }
    })
  }, [registrosRaw])

  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'

  const registrosValidos = useMemo(() => {
    return registros.filter((registro) => {
      if (!registro.data_exercicio_epr) return false
      const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
      return !Number.isNaN(data.getTime())
    })
  }, [registros])

  const monthKeys = useMemo(() => {
    const set = new Set<string>()
    registrosValidos.forEach((registro) => {
      const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
      set.add(`${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`)
    })
    return Array.from(set).sort()
  }, [registrosValidos])

  const monthOptions = useMemo(
    () =>
      monthKeys.map((key) => {
        const data = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          key,
          label: monthFormatter.format(data).toUpperCase()
        }
      }),
    [monthKeys]
  )

  const equipeOptions = useMemo(() => {
    const set = new Set<string>()
    registrosValidos.forEach((registro) => {
      if (registro.equipe) set.add(registro.equipe)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [registrosValidos])

  const registrosAgrupados = useMemo(() => {
    return registrosValidos.filter((registro) => {
      const passaMes =
        selectedMes === 'todos'
          ? true
          : (() => {
              const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
              const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
              return key === selectedMes
            })()
      const passaEquipe = selectedEquipe === 'todos' ? true : registro.equipe === selectedEquipe
      return passaMes && passaEquipe
    })
  }, [registrosValidos, selectedMes, selectedEquipe])

  const nomesDisponiveis = useMemo(() => {
    const set = new Set<string>()
    registrosAgrupados.forEach((registro) => {
      if (registro.nome_completo) set.add(registro.nome_completo)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [registrosAgrupados])

  useEffect(() => {
    if (selectedNome !== 'todos' && !nomesDisponiveis.includes(selectedNome)) {
      setSelectedNome('todos')
    }
  }, [nomesDisponiveis, selectedNome])

  const registrosFiltrados = useMemo(() => {
    if (selectedNome === 'todos') return registrosAgrupados
    return registrosAgrupados.filter((registro) => registro.nome_completo === selectedNome)
  }, [registrosAgrupados, selectedNome])

  const totalRegistros = registrosFiltrados.length

  const latestMonthKey = monthKeys[monthKeys.length - 1] ?? null
  const latestMonthDate = latestMonthKey
    ? new Date(`${latestMonthKey.split('-')[0]}-${latestMonthKey.split('-')[1]}-01T00:00:00`)
    : null

  const registrosUltimoMes = useMemo(() => {
    if (!latestMonthKey) return []
    return registrosAgrupados.filter((registro) => {
      const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      return key === latestMonthKey
    })
  }, [registrosAgrupados, latestMonthKey])

  const tempoMinimo = useMemo(() => {
    const segundos = registrosAgrupados.reduce((min, registro) => {
      const tempo = tempoToSeconds(registro.tempo_epr)
      if (tempo > 0 && tempo < min) return tempo
      return min
    }, Number.POSITIVE_INFINITY)
    return segundos === Number.POSITIVE_INFINITY ? '00:00' : secondsToMMSS(segundos)
  }, [registrosAgrupados])

  const tempoMaximo = useMemo(() => {
    const segundos = registrosAgrupados.reduce((max, registro) => {
      const tempo = tempoToSeconds(registro.tempo_epr)
      if (tempo > max) return tempo
      return max
    }, 0)
    return segundos === 0 ? '00:00' : secondsToMMSS(segundos)
  }, [registrosAgrupados])

  const tempoMedio = useMemo(() => {
    const { soma, count } = registrosAgrupados.reduce(
      (acc, registro) => {
        const tempo = tempoToSeconds(registro.tempo_epr)
        if (tempo > 0) {
          acc.soma += tempo
          acc.count += 1
        }
        return acc
      },
      { soma: 0, count: 0 }
    )
    return count > 0 ? secondsToMMSS(soma / count) : '00:00'
  }, [registrosAgrupados])

  const evolucaoPorMes = useMemo(() => {
    const mapa = new Map<string, { soma: number; count: number }>()

    registrosAgrupados.forEach((registro) => {
      if (!registro.data_exercicio_epr) return
      const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      const tempo = tempoToSeconds(registro.tempo_epr)
      if (tempo > 0) {
        if (!mapa.has(key)) {
          mapa.set(key, { soma: 0, count: 0 })
        }
        const entry = mapa.get(key)!
        entry.soma += tempo
        entry.count += 1
      }
    })

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { soma, count }]) => {
        const data = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          mes: monthFormatter.format(data).toUpperCase(),
          tempoSegundos: count > 0 ? Number((soma / count).toFixed(2)) : 0
        }
      })
  }, [registrosAgrupados])

  const desempenhoPorBase = useMemo(() => {
    const mapa = new Map<string, { total: number; ideal: number; toleravel: number; reprovado: number }>()

    registrosAgrupados.forEach((registro) => {
      const base = registro.nome_cidade || registro.secao_id || 'Base não informada'
      if (!mapa.has(base)) {
        mapa.set(base, { total: 0, ideal: 0, toleravel: 0, reprovado: 0 })
      }
      const entry = mapa.get(base)!
      entry.total += 1
      const status = normalizarStatus(registro.status)
      if (status === 'Ideal') entry.ideal += 1
      else if (status === 'Tolerável') entry.toleravel += 1
      else entry.reprovado += 1
    })

    return Array.from(mapa.entries()).map(([base, valores]) => ({
      base,
      ideal: valores.total > 0 ? Number(((valores.ideal / valores.total) * 100).toFixed(2)) : 0,
      toleravel: valores.total > 0 ? Number(((valores.toleravel / valores.total) * 100).toFixed(2)) : 0,
      reprovado: valores.total > 0 ? Number(((valores.reprovado / valores.total) * 100).toFixed(2)) : 0
    }))
  }, [registrosAgrupados])

  const desempenhoPorEquipe = useMemo(() => {
    const mapa = new Map<string, { total: number; ideal: number; toleravel: number; reprovado: number }>()

    registrosAgrupados.forEach((registro) => {
      const equipe = registro.equipe || 'Equipe não informada'
      if (!mapa.has(equipe)) {
        mapa.set(equipe, { total: 0, ideal: 0, toleravel: 0, reprovado: 0 })
      }
      const entry = mapa.get(equipe)!
      entry.total += 1
      const status = normalizarStatus(registro.status)
      if (status === 'Ideal') entry.ideal += 1
      else if (status === 'Tolerável') entry.toleravel += 1
      else entry.reprovado += 1
    })

    return Array.from(mapa.entries()).map(([equipe, valores]) => ({
      equipe,
      ideal: valores.total > 0 ? Number(((valores.ideal / valores.total) * 100).toFixed(2)) : 0,
      toleravel: valores.total > 0 ? Number(((valores.toleravel / valores.total) * 100).toFixed(2)) : 0,
      reprovado: valores.total > 0 ? Number(((valores.reprovado / valores.total) * 100).toFixed(2)) : 0
    }))
  }, [registrosAgrupados])

  const tabelaGeral = useMemo(() => {
    const mapa = new Map<string, { tempos: number[] }>()

    registrosAgrupados.forEach((registro) => {
      if (!registro.data_exercicio_epr) return
      const data = new Date(`${registro.data_exercicio_epr}T00:00:00`)
      const mes = monthFormatter.format(data).toUpperCase()
      const chave = `${registro.nome_cidade || 'Base'}|${registro.equipe || 'Equipe'}|${mes}`
      if (!mapa.has(chave)) {
        mapa.set(chave, { tempos: [] })
      }
      const entry = mapa.get(chave)!
      const segundos = tempoToSeconds(registro.tempo_epr)
      if (segundos > 0) entry.tempos.push(segundos)
    })

    return Array.from(mapa.entries()).map(([chave, valores]) => {
      const [base, equipe, mes] = chave.split('|')
      const media = valores.tempos.length > 0 ? valores.tempos.reduce((a, b) => a + b, 0) / valores.tempos.length : 0
      return {
        base,
        equipe,
        mes,
        tempoMedio: secondsToMMSS(media)
      }
    })
  }, [registrosAgrupados])

  const registrosIndividuais = useMemo(() => {
    if (selectedNome === 'todos') return []
    return registrosFiltrados
      .map((registro) => {
        const tempoSegundos = tempoToSeconds(registro.tempo_epr)
        const data = registro.data_exercicio_epr
          ? new Date(`${registro.data_exercicio_epr}T00:00:00`)
          : null
        return {
          ...registro,
          tempoFormatado: secondsToMMSS(tempoSegundos),
          desempenhoNota: registro.desempenho?.toFixed(2) ?? '0.00',
          mesRealizado: data ? monthFormatter.format(data).toUpperCase() : '—',
          statusNormalizado: normalizarStatus(registro.status)
        }
      })
      .sort((a, b) => {
        const dataA = a.data_exercicio_epr ? new Date(`${a.data_exercicio_epr}T00:00:00`).getTime() : 0
        const dataB = b.data_exercicio_epr ? new Date(`${b.data_exercicio_epr}T00:00:00`).getTime() : 0
        return dataB - dataA
      })
  }, [registrosFiltrados, selectedNome])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Tempo de Vestimenta Individual (Tempo EPR)</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace ? `Resultados agregados da base ${nomeBase}.` : 'Visão geral dos tempos registrados nas bases.'}
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
              selectedMes={selectedMesRef}
              onMesChange={setSelectedMesRef}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-primary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados do Tempo EPR...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : registrosAgrupados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
          <p className="text-lg font-semibold text-primary">Ainda não há registros de Tempo EPR.</p>
          <p className="mt-2 text-sm">Assim que novos registros forem inseridos, os indicadores serão exibidos aqui.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
              <div>
                <p className="text-sm font-medium text-[#1f1f1f]">Mês</p>
                <select
                  value={selectedMes}
                  onChange={(event) => setSelectedMes(event.target.value)}
                  className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 md:w-48"
                >
                  <option value="todos">Todos</option>
                  {monthOptions.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1f1f1f]">Equipe</p>
                <select
                  value={selectedEquipe}
                  onChange={(event) => setSelectedEquipe(event.target.value)}
                  className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 md:w-48"
                >
                  <option value="todos">Todas</option>
                  {equipeOptions.map((equipe) => (
                    <option key={equipe} value={equipe}>
                      {equipe}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-sm font-medium text-[#1f1f1f]">Colaborador</p>
                <select
                  value={selectedNome}
                  onChange={(event) => setSelectedNome(event.target.value)}
                  className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 md:w-64"
                >
                  <option value="todos">Todos</option>
                  {nomesDisponiveis.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-4 text-sm text-white shadow-lg">
              <p>
                Exibindo <span className="font-semibold">{registrosFiltrados.length}</span> registros filtrados.
              </p>
              <p className="text-white/80">Utilize os filtros para alternar entre a visão geral e a visão individual.</p>
            </div>
          </div>

          {/* Cards no topo - Laranja */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo mínimo</p>
              <p className="mt-2 text-4xl font-black">{tempoMinimo}</p>
              <p className="mt-1 text-xs text-white/80">Melhor tempo registrado</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo médio</p>
              <p className="mt-2 text-4xl font-black">{tempoMedio}</p>
              <p className="mt-1 text-xs text-white/80">Média de todos os registros</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Tempo máximo</p>
              <p className="mt-2 text-4xl font-black">{tempoMaximo}</p>
              <p className="mt-1 text-xs text-white/80">Maior tempo registrado</p>
            </div>
          </div>

          {/* Painel Geral */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="space-y-4 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f1f1f]/60">Categorias</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: legendColors.Ideal }} />
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">Ótimo</p>
                    <p className="text-xs text-[#1f1f1f]/60">Tempo menor ou igual a 00:50</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: legendColors.Tolerável }} />
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">Regular</p>
                    <p className="text-xs text-[#1f1f1f]/60">Tempo entre 00:51 e 01:30</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: legendColors.Reprovado }} />
                  <div>
                    <p className="font-semibold text-[#1f1f1f]">Ruim</p>
                    <p className="text-xs text-[#1f1f1f]/60">Tempo acima de 01:30</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1f1f1f]">Evolução por mês</h3>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={evolucaoPorMes}>
                    <defs>
                      <linearGradient id="tempoMedio" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={areaColor} stopOpacity={0.6} />
                        <stop offset="95%" stopColor={areaColor} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => secondsToMMSS(value)} domain={[0, 'dataMax + 20']} />
                    <Tooltip 
                      formatter={(value: number) => [secondsToMMSS(value), 'Tempo médio']}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Area type="monotone" dataKey="tempoSegundos" stroke={areaColor} strokeWidth={2} fill="url(#tempoMedio)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1f1f1f]">Desempenho por base</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={desempenhoPorBase} layout="vertical" margin={{ top: 10, right: 40, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" domain={[0, 100]} stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="base" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} width={120} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="ideal" stackId="a" fill={legendColors.Ideal} name="Ótimo" barSize={18} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="toleravel" stackId="a" fill={legendColors.Tolerável} name="Regular" barSize={18} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="reprovado" stackId="a" fill={legendColors.Reprovado} name="Ruim" barSize={18} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#1f1f1f]">Desempenho por equipe</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={desempenhoPorEquipe} layout="vertical" margin={{ top: 10, right: 40, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" domain={[0, 100]} stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => `${value}%`} />
                    <YAxis dataKey="equipe" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} width={110} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Bar dataKey="ideal" stackId="a" fill={legendColors.Ideal} name="Ótimo" barSize={18} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="toleravel" stackId="a" fill={legendColors.Tolerável} name="Regular" barSize={18} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="reprovado" stackId="a" fill={legendColors.Reprovado} name="Ruim" barSize={18} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Resumo mensal por base e equipe</h3>
              <p className="text-xs text-muted-foreground">Tempo médio calculado por mês, base e equipe, considerando os filtros atuais.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Base</th>
                    <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                    <th className="px-4 py-3 text-left font-semibold">Mês</th>
                    <th className="px-4 py-3 text-left font-semibold">Tempo médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {tabelaGeral.map((linha) => (
                    <tr key={`${linha.base}-${linha.equipe}-${linha.mes}`} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 text-foreground font-medium">{linha.base}</td>
                      <td className="px-4 py-3 text-foreground/80">{linha.equipe}</td>
                      <td className="px-4 py-3 text-foreground/80">{linha.mes}</td>
                      <td className="px-4 py-3 text-foreground/80 font-medium">{linha.tempoMedio}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Visão Individual */}
          {selectedNome !== 'todos' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-[#1f1f1f]">Evolução individual</h3>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={registrosIndividuais.map((item) => ({
                      mes: item.mesRealizado,
                      tempoSegundos: tempoToSeconds(item.tempo_epr)
                    }))}>
                      <defs>
                        <linearGradient id="tempoIndividual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={areaColor} stopOpacity={0.6} />
                          <stop offset="95%" stopColor={areaColor} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                      <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                      <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} tickFormatter={(value) => secondsToMMSS(value)} domain={[0, 'dataMax + 20']} />
                      <Tooltip 
                        formatter={(value: number) => [secondsToMMSS(value), 'Tempo']}
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: 12,
                          border: '1px solid #fb923c',
                          boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                          color: '#1f1f1f'
                        }}
                        labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                      />
                      <Area type="monotone" dataKey="tempoSegundos" stroke={areaColor} strokeWidth={2} fill="url(#tempoIndividual)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4 bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground">Histórico do colaborador</h3>
                  <p className="text-xs text-muted-foreground">Registros ordenados do mais recente para o mais antigo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Nome</th>
                        <th className="px-4 py-3 text-left font-semibold">Mês</th>
                        <th className="px-4 py-3 text-left font-semibold">Base</th>
                        <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                        <th className="px-4 py-3 text-left font-semibold">Tempo</th>
                        <th className="px-4 py-3 text-left font-semibold">Desempenho</th>
                        <th className="px-4 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {registrosIndividuais.map((registro) => (
                        <tr key={`${registro.nome_completo}-${registro.data_exercicio_epr}`} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 text-foreground font-medium">{registro.nome_completo ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.mesRealizado}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.nome_cidade ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.equipe ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80 font-medium">{registro.tempoFormatado}</td>
                          <td className="px-4 py-3 text-foreground/80 font-medium">{registro.desempenhoNota}</td>
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                              style={{
                                backgroundColor: `${legendColors[registro.statusNormalizado] ?? '#e5e7eb'}20`,
                                color: legendColors[registro.statusNormalizado] ?? '#374151'
                              }}
                            >
                              <span
                                className="inline-block h-2 w-2 rounded-full"
                                style={{ backgroundColor: legendColors[registro.statusNormalizado] ?? '#374151' }}
                              />
                              {registro.statusNormalizado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
