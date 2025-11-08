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

interface OcorrenciaAeronauticaRegistro {
  id: string
  secao_id: string | null
  equipe_id: string | null
  equipe: string | null
  cidade_aeroporto: string | null
  data_ocorrencia: string | null
  posicionamento_intervencao: string | null
  local_ocorrencia: string | null
  tempo_chegada_primeiro_cci: string | null
  tempo_chegada_ultimo_cci: string | null
  tempo_total_ocorrencia: string | null
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

function secondsToTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

export default function OcorrenciasAeronauticasDashboard() {
  const { user } = useAuth()
  const [registros, setRegistros] = useState<OcorrenciaAeronauticaRegistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const secaoId = user?.profile?.secao_id
  const perfil = user?.profile?.perfil
  const isBace = perfil === 'ba_ce'
  const nomeBase = user?.profile?.secao?.nome ?? user?.profile?.secao_nome ?? 'Base não identificada'

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
          .from('ocorrencias_aeronauticas')
          .select(
            `id, secao_id, equipe_id, equipe, cidade_aeroporto, data_ocorrencia, posicionamento_intervencao, local_ocorrencia, tempo_chegada_primeiro_cci, tempo_chegada_ultimo_cci, tempo_total_ocorrencia`
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
        console.error('Erro ao carregar ocorrências aeronáuticas:', err)
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

  const maiorTempoPrimeiraViatura = useMemo(() => {
    const maxSeconds = registros.reduce((acc, registro) => {
      return Math.max(acc, timeToSeconds(registro.tempo_chegada_primeiro_cci))
    }, 0)
    return secondsToTime(maxSeconds)
  }, [registros])

  const maiorTempoUltimaViatura = useMemo(() => {
    const maxSeconds = registros.reduce((acc, registro) => {
      return Math.max(acc, timeToSeconds(registro.tempo_chegada_ultimo_cci))
    }, 0)
    return secondsToTime(maxSeconds)
  }, [registros])

  const treemapColors = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#ff7c43', '#ffa600']

  const tabelaRegistros = useMemo(() => {
    return registros.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_ocorrencia
        ? dateFormatter.format(new Date(`${registro.data_ocorrencia}T00:00:00`))
        : '—',
      tempo_total_ocorrencia:
        registro.tempo_total_ocorrencia && registro.tempo_total_ocorrencia !== '00:00:00'
          ? registro.tempo_total_ocorrencia
          : secondsToTime(timeToSeconds(registro.tempo_chegada_ultimo_cci))
    }))
  }, [registros])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Ocorrências Aeronáuticas</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          {isBace ? `Visualizando exclusivamente os registros da base ${nomeBase}.` : 'Visualização consolidada das ocorrências aeronáuticas registradas.'}
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
                Assim que novas ocorrências aeronáuticas forem registradas para sua base, os gráficos e a tabela serão exibidos aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Ocorrências por mês</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">
                      Últimos registros
                    </span>
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
                    <p className="mt-1 text-xs text-orange-500">Ocorrências aeronáuticas registradas</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                        Maior tempo 1ª viatura
                      </p>
                      <p className="mt-3 text-3xl font-bold text-gray-900">{maiorTempoPrimeiraViatura}</p>
                      <p className="text-xs text-[#7a5b3e]/80">Chegada ao local e intervenção</p>
                    </div>
                    <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-orange-500">
                        Maior tempo última viatura
                      </p>
                      <p className="mt-3 text-3xl font-bold text-gray-900">{maiorTempoUltimaViatura}</p>
                      <p className="text-xs text-[#7a5b3e]/80">Chegada e início de intervenção</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Ocorrências por localidade</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">
                      Distribuição
                    </span>
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

                <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-white shadow-sm">
                  <div className="border-b border-orange-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Detalhamento das ocorrências</h3>
                    <p className="text-xs text-[#7a5b3e]/70">Registros ordenados do mais recente para o mais antigo</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-orange-100 text-sm">
                      <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-700">
                        <tr>
                          <th className="px-4 py-2 text-left">Base</th>
                          <th className="px-4 py-2 text-left">Data</th>
                          <th className="px-4 py-2 text-left">Equipe</th>
                          <th className="px-4 py-2 text-left">Local</th>
                          <th className="px-4 py-2 text-left">Chegada 1ª viatura</th>
                          <th className="px-4 py-2 text-left">Chegada último CCI</th>
                          <th className="px-4 py-2 text-left">Tempo total</th>
                          <th className="px-4 py-2 text-left">Posicionamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-orange-50">
                        {tabelaRegistros.map((registro) => (
                          <tr key={registro.id} className="hover:bg-orange-50/40">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {registro.cidade_aeroporto || nomeBase || '—'}
                            </td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.dataFormatada}</td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.equipe ?? '—'}</td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.local_ocorrencia ?? '—'}</td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">
                              {registro.tempo_chegada_primeiro_cci ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">
                              {registro.tempo_chegada_ultimo_cci ?? '—'}
                            </td>
                            <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.tempo_total_ocorrencia ?? '—'}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-600">
                                {registro.posicionamento_intervencao ?? '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
