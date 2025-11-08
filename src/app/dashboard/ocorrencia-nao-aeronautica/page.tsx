'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Treemap,
  Cell
} from 'recharts'

import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface OcorrenciaNaoAeronauticaRegistro {
  id: string
  secao_id: string | null
  equipe_id: string | null
  equipe: string | null
  cidade_aeroporto: string | null
  data_ocorrencia: string | null
  tipo_ocorrencia: string | null
  local_ocorrencia: string | null
  hora_acionamento: string | null
  hora_chegada: string | null
  hora_termino: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

function timeToSeconds(time?: string | null): number {
  if (!time) return 0
  const parts = time.split(':').map(Number)
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0
  const [hours = 0, minutes = 0, seconds = 0] = parts
  return hours * 3600 + minutes * 60 + seconds
}

function diffSeconds(inicio?: string | null, fim?: string | null): number {
  const start = timeToSeconds(inicio)
  const end = timeToSeconds(fim)
  if (start === 0 && end === 0) return 0
  if (end >= start) return end - start
  return end + 24 * 3600 - start
}

function secondsToExtendedTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

function secondsToHours(totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0
  return Number((totalSeconds / 3600).toFixed(2))
}

export default function OcorrenciasNaoAeronauticasDashboard() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<OcorrenciaNaoAeronauticaRegistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const secaoId = user?.profile?.secao_id
  const perfil = user?.profile?.perfil
  const isBace = perfil === 'ba_ce'
  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (isBace && !secaoId) {
        setError('Não foi possível identificar a base do usuário.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        let query = supabase
          .from('ocorrencias_nao_aeronauticas')
          .select(
            `id, secao_id, equipe_id, equipe, cidade_aeroporto, data_ocorrencia, tipo_ocorrencia, local_ocorrencia, hora_acionamento, hora_chegada, hora_termino`
          )
          .order('data_ocorrencia', { ascending: false })

        if (isBace && secaoId) {
          query = query.eq('secao_id', secaoId)
        }

        const { data, error: supabaseError } = await query

        if (supabaseError) {
          throw supabaseError
        }

        if (!isMounted) return

        setRegistros(data ?? [])
      } catch (err) {
        if (!isMounted) return
        console.error('Erro ao carregar ocorrências não aeronáuticas:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados das ocorrências.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [isBace, secaoId])

  const totalOcorrencias = registros.length

  const ocorrenciasPorMes = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()

    registros.forEach((registro) => {
      if (!registro.data_ocorrencia) return
      const date = new Date(`${registro.data_ocorrencia}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { label: monthFormatter.format(date), count: 0 })
      }
      map.get(key)!.count += 1
    })

    return Array.from(map.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => ({ mes: value.label, total: value.count }))
  }, [registros])

  const topTiposOcorrencia = useMemo(() => {
    const map = new Map<string, number>()
    registros.forEach((registro) => {
      const tipo = registro.tipo_ocorrencia?.trim() || 'Não informado'
      map.set(tipo, (map.get(tipo) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [registros])

  const ocorrenciasPorLocalidade = useMemo(() => {
    const map = new Map<string, number>()

    registros.forEach((registro) => {
      const chave = registro.local_ocorrencia?.trim() || 'Sem registro'
      map.set(chave, (map.get(chave) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [registros])

  const tempoTotalSegundos = useMemo(() => {
    return registros.reduce((acc, registro) => {
      return acc + diffSeconds(registro.hora_acionamento, registro.hora_termino)
    }, 0)
  }, [registros])

  const tempoTotalPorMes = useMemo(() => {
    const map = new Map<string, { label: string; segundos: number }>()

    registros.forEach((registro) => {
      if (!registro.data_ocorrencia) return
      const date = new Date(`${registro.data_ocorrencia}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { label: monthFormatter.format(date), segundos: 0 })
      }
      map.get(key)!.segundos += diffSeconds(registro.hora_acionamento, registro.hora_termino)
    })

    return Array.from(map.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => ({ mes: value.label, horas: secondsToHours(value.segundos) }))
  }, [registros])

  const treemapColors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#ff7c43', '#ffa600']

  const tabelaRegistros = useMemo(() => {
    return registros.map((registro) => {
      const duracaoSegundos = diffSeconds(registro.hora_acionamento, registro.hora_termino)
      return {
        ...registro,
        dataFormatada: registro.data_ocorrencia
          ? dateFormatter.format(new Date(`${registro.data_ocorrencia}T00:00:00`))
          : '—',
        tempo_total: secondsToExtendedTime(duracaoSegundos)
      }
    })
  }, [registros])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Ocorrências Não Aeronáuticas</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          {isBace ? `Visualizando os registros da base ${nomeBase}.` : 'Visão consolidada das ocorrências não aeronáuticas registradas.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-[#ff6600]">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados das ocorrências...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : (
        <>
          {totalOcorrencias === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
              <p className="text-lg font-semibold text-[#ff6600]">Nenhuma ocorrência cadastrada.</p>
              <p className="mt-2 text-sm">
                Assim que novas ocorrências não aeronáuticas forem registradas para sua base, os gráficos e a tabela serão exibidos aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Ocorrências por mês</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Últimos registros</span>
                  </div>
                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={ocorrenciasPorMes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                        <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} interval={0} angle={-12} dy={12} height={70} />
                        <YAxis allowDecimals={false} stroke="#b45309" tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }} contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }} />
                        <Bar dataKey="total" fill="#ff7a00" radius={[8, 8, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-100 via-orange-50 to-white p-6 text-center shadow-sm">
                    <p className="text-sm font-medium uppercase tracking-wide text-orange-600">Total de ocorrências</p>
                    <p className="mt-2 text-5xl font-black text-[#ff6600]">{totalOcorrencias}</p>
                    <p className="mt-1 text-xs text-orange-500">Registros não aeronáuticos</p>
                  </div>
                  <div className="rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-100 via-orange-50 to-white p-6 text-center shadow-sm">
                    <p className="text-sm font-medium uppercase tracking-wide text-orange-600">Total de horas em ocorrências</p>
                    <p className="mt-2 text-4xl font-black text-[#ff6600]">{secondsToExtendedTime(tempoTotalSegundos)}</p>
                    <p className="mt-1 text-xs text-orange-500">Somatório do tempo entre acionamento e término</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Top 5 maiores ocorrências</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Por tipo</span>
                  </div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer>
                      <BarChart
                        data={topTiposOcorrencia}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1c9a4" />
                        <XAxis type="number" stroke="#b45309" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" stroke="#b45309" tick={{ fontSize: 12, width: 180 }} />
                        <Tooltip cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }} contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }} />
                        <Bar dataKey="value" fill="#ff7a00" radius={[0, 8, 8, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Ocorrências por localidade</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Distribuição</span>
                  </div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer>
                      <Treemap data={ocorrenciasPorLocalidade} dataKey="value" stroke="white" aspectRatio={1} animationDuration={600}>
                        {ocorrenciasPorLocalidade.map((item, index) => (
                          <Cell key={item.name} fill={treemapColors[index % treemapColors.length]} />
                        ))}
                      </Treemap>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2 text-sm">
                    {ocorrenciasPorLocalidade.map((item, index) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-3 w-3 rounded-full"
                            style={{ backgroundColor: treemapColors[index % treemapColors.length] }}
                          />
                          <span className="text-[#1f1f1f]">{item.name}</span>
                        </div>
                        <span className="font-medium text-[#7a5b3e]/80">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Tempo total das ocorrências por mês</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Horas</span>
                  </div>
                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={tempoTotalPorMes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                        <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} interval={0} angle={-12} dy={12} height={70} />
                        <YAxis stroke="#b45309" tick={{ fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }}
                          contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }}
                          formatter={(value) => [`${value} h`, 'Tempo']} // value é horas
                        />
                        <Bar dataKey="horas" fill="#ff7a00" radius={[8, 8, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-right text-xs text-[#7a5b3e]/70">
                    Total: {secondsToExtendedTime(tempoTotalSegundos)}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-white shadow-sm">
                <div className="border-b border-orange-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-[#ff6600]">Detalhamento das ocorrências</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Registros ordenados do mais recente para o mais antigo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-orange-100 text-sm">
                    <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Equipe</th>
                        <th className="px-4 py-2 text-left">Tipo de ocorrência</th>
                        <th className="px-4 py-2 text-left">Local da ocorrência</th>
                        <th className="px-4 py-2 text-left">Hora acionamento</th>
                        <th className="px-4 py-2 text-left">Hora chegada</th>
                        <th className="px-4 py-2 text-left">Hora término</th>
                        <th className="px-4 py-2 text-left">Tempo total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {tabelaRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-orange-50/40">
                          <td className="px-4 py-3 text-[#1f1f1f]">{registro.dataFormatada}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.equipe ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.tipo_ocorrencia ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.local_ocorrencia ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.hora_acionamento ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.hora_chegada ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.hora_termino ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.tempo_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
