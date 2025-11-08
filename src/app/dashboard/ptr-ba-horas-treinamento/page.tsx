'use client'

import { useEffect, useMemo, useState } from 'react'
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

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

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
const areaColor = '#f97316'
const barEquipeColor = '#f97316'
const barColaboradorColor = '#f97316'

export default function PtrbaHorasTreinamentoDashboard() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<HorasTreinamentoRegistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNome, setSelectedNome] = useState<string>('todos')

  const secaoId = user?.profile?.secao_id
  const isBace = user?.profile?.perfil === 'ba_ce'
  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      if (isBace && !secaoId) {
        setError('Não foi possível identificar a base do usuário.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('ptr_ba_horas_treinamento')
          .select('secao_id, equipe_id, nome_cidade, data_ptr_ba, nome_completo, hora_ptr_diaria, equipe, mes_referencia')
          .order('data_ptr_ba', { ascending: false })

        if (isBace && secaoId) {
          query = query.eq('secao_id', secaoId)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) {
          throw supabaseError
        }

        if (!isMounted) return

        setRegistros((data as HorasTreinamentoRegistro[]) ?? [])
      } catch (err) {
        if (!isMounted) return
        console.error('Erro ao carregar PTR-BA Horas de Treinamento:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados de horas de treinamento.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [isBace, secaoId])

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

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Horas de Treinamento PTR-BA</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          {isBace ? `Resultados de horas de treinamento registrados na base ${nomeBase}.` : 'Visão consolidada das horas de treinamento PTR-BA.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-[#ff6600]">
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
          <p className="text-lg font-semibold text-[#ff6600]">Ainda não há registros de horas de treinamento.</p>
          <p className="mt-2 text-sm">Assim que novas horas forem registradas, os gráficos e indicadores aparecerão aqui.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1f1f1f]">Filtrar por colaborador</p>
              <p className="text-xs text-[#7a5b3e]/70">Selecione um nome para visualizar indicadores específicos.</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Horas de treinamento por colaborador (média)</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Média mensal considerando todos os registros válidos</p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={horasPorColaboradorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#b45309" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 5']} />
                    <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.12)' }} contentStyle={{ borderRadius: 12, borderColor: '#f97316' }} />
                    <Bar dataKey="media" fill={barColaboradorColor} radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm flex flex-col justify-between text-sm text-[#374151]">
              <div>
                <p className="font-semibold text-[#ff6600]">Média geral</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{mediaGeral.toFixed(2)} h</p>
              </div>
              <div>
                <p className="font-semibold text-[#ff6600]">Maior carga no mês atual</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{maiorHoraUltimoMes.toFixed(2)} h</p>
                <p className="mt-2 text-xs text-[#7a5b3e]/70">Considera registros do mês {latestMonthDate ? monthFormatter.format(latestMonthDate).toUpperCase() : ''}.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Horas de treinamento por equipe (média)</h3>
                  <p className="text-xs text-[#7a5b3e]/70">
                    {latestMonthDate ? `Resultados do mês ${monthFormatter.format(latestMonthDate).toUpperCase()}` : 'Último mês disponível'}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={horasPorEquipe} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis type="number" stroke="#b45309" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 5']} />
                    <YAxis dataKey="equipe" type="category" stroke="#b45309" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip cursor={{ fill: 'rgba(249, 115, 22, 0.12)' }} contentStyle={{ borderRadius: 12, borderColor: '#f97316' }} />
                    <Bar dataKey="media" fill={barEquipeColor} barSize={18} radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Média de horas por mês</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Histórico consolidado das horas registradas</p>
                </div>
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} payload={[{ value: 'Horas', type: 'square', color: areaColor, id: 'horasLegend' }]} />
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={mediaPorMes}>
                    <defs>
                      <linearGradient id="horasMedia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={areaColor} stopOpacity={0.7} />
                        <stop offset="95%" stopColor={areaColor} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                    <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#b45309" tick={{ fontSize: 12 }} domain={[0, 'dataMax + 5']} />
                    <Tooltip cursor={{ stroke: areaColor, strokeWidth: 1 }} contentStyle={{ borderRadius: 12, borderColor: '#f97316' }} />
                    <Area type="monotone" dataKey="media" stroke={areaColor} fill="url(#horasMedia)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
