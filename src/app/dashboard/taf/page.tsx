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
  Legend,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

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
  month: 'long'
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

const donutColors = ['#22c55e', '#ef4444']

export default function TafDashboard() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<TAFResultadoRegistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNome, setSelectedNome] = useState<string>('todos')

  const secaoId = user?.profile?.secao_id
  const perfil = user?.profile?.perfil
  const isBace = perfil === 'ba_ce'
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
          .from('taf_resultados')
          .select(
            `idade, tempo_total, desempenho, data_taf, nome_equipe, nome_cidade, nome_completo, taf_registros!inner(secao_id, equipe_id)`
          )
          .order('data_taf', { ascending: false })

        if (isBace && secaoId) {
          query = query.eq('taf_registros.secao_id', secaoId)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) {
          throw supabaseError
        }

        if (!isMounted) return

        setRegistros((data as TAFResultadoRegistro[]) ?? [])
      } catch (err) {
        if (!isMounted) return
        console.error('Erro ao carregar resultados do TAF:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados do TAF.')
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

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Avaliação do TAF</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          {isBace ? `Visualizando os resultados do TAF da base ${nomeBase}.` : 'Visão consolidada das avaliações de TAF registradas.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-[#ff6600]">
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
          <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-[#1f1f1f]">Filtrar por participante</p>
              <p className="text-xs text-[#7a5b3e]/70">Selecione um nome para visualizar os indicadores específicos.</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Tempo do TAF (minutos)</h3>
                  <p className="text-xs text-[#7a5b3e]/70">
                    Idade categoria • MAIOR QUE 40 • MENOR QUE 40 {latestMonthDate ? `• ${dateFormatter.format(latestMonthDate)}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={categoriasResumo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                    <XAxis dataKey="categoria" stroke="#b45309" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#b45309" tick={{ fontSize: 12 }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }}
                      formatter={(value: number) => [minutesToHHMMSS(value), 'Tempo médio']}
                    />
                    <Bar dataKey="mediaMinutos" fill="#ff7a00" radius={[8, 8, 0, 0]} barSize={48}>
                      {categoriasResumo.map((item, index) => (
                        <Cell key={item.categoria} fill={index === 0 ? '#b45309' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a5b3e]/70">Status</h3>
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
                      <Tooltip formatter={(value: number, name: string) => [`${value} (${((value / totalRegistros) * 100).toFixed(1)}%)`, name]} />
                      <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm text-sm text-[#374151]">
                <p className="font-semibold text-[#ff6600]">Tempo médio geral</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{tempoMedioGeral}</p>
                <p className="mt-2 text-xs text-[#7a5b3e]/70">
                  TAF avaliado: 30 flexões, 45 abdominais remadores e 45 polichinelos.
                </p>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm text-sm text-[#374151]">
                <p className="font-semibold text-[#ff6600]">Critério de aprovação</p>
                <p className="mt-2 text-xs text-[#7a5b3e]/70">
                  Para aprovação, concluir até 3 minutos para menores de 40 anos e até 4 minutos para maiores de 40 anos.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Média por equipe e categoria de idade</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Comparativo do mês {latestMonthDate ? monthFormatter.format(latestMonthDate) : ''}</p>
                </div>
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ fontSize: 12 }}
                  payload={[
                    { value: 'MAIOR QUE 40', type: 'square', color: '#b45309', id: 'maior40' },
                    { value: 'MENOR QUE 40', type: 'square', color: '#f97316', id: 'menor40' }
                  ]}
                />
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={mediasPorEquipe} layout="vertical" margin={{ top: 20, right: 20, left: 60, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                    <XAxis type="number" stroke="#b45309" tick={{ fontSize: 12 }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <YAxis dataKey="equipe" stroke="#b45309" tick={{ fontSize: 12 }} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }}
                      formatter={(value: number, name: string) => [minutesToHHMMSS(value), name]}
                    />
                    <Bar dataKey="maior40" fill="#b45309" radius={[8, 8, 0, 0]} barSize={48} />
                    <Bar dataKey="menor40" fill="#f97316" radius={[8, 8, 0, 0]} barSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#ff6600]">Evolução do tempo médio por mês</h3>
                  <p className="text-xs text-[#7a5b3e]/70">
                    {latestMonthDate ? `Mês de referência: ${yearMonthFormatter.format(latestMonthDate)}` : ''}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer>
                  <LineChart data={evolucaoPorMes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                    <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#b45309" tick={{ fontSize: 12 }} tickFormatter={(value) => minutesToHHMMSS(value)} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }}
                      contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }}
                      formatter={(value: number) => [minutesToHHMMSS(value), 'Tempo médio']}
                    />
                    <Line type="monotone" dataKey="mediaMinutos" stroke="#ff7a00" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
