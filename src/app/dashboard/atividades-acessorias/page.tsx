'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [registros, setRegistros] = useState<AtividadeAcessoriaRegistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const secaoId = user?.profile?.secao_id
  const perfil = user?.profile?.perfil
  const isBace = perfil === 'ba_ce'
  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'
  const nomeCoordenador = user?.profile?.nome ?? '—'

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
          .from('atividades_acessorias')
          .select(
            `id, secao_id, equipe_id, equipe_nome, cidade_aeroporto, data_atividade, tipo_atividade, qtd_equipamentos, qtd_bombeiros, tempo_gasto`
          )
          .order('data_atividade', { ascending: false })

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
        console.error('Erro ao carregar atividades acessórias:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados das atividades.')
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

  const totalAtividades = registros.length

  const hoje = new Date()
  const mesAtualKey = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`

  const atividadesMesAtual = useMemo(() => {
    return registros.filter((registro) => {
      if (!registro.data_atividade) return false
      const data = new Date(`${registro.data_atividade}T00:00:00`)
      if (Number.isNaN(data.getTime())) return false
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
      return key === mesAtualKey
    })
  }, [registros, mesAtualKey])

  const totalTempoMesAtual = useMemo(() => {
    return atividadesMesAtual.reduce((acc, registro) => acc + timeToMinutes(registro.tempo_gasto), 0)
  }, [atividadesMesAtual])

  const mesesSeries = useMemo(() => {
    const map = new Map<string, { label: string; quant: number }>()

    registros.forEach((registro) => {
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
  }, [registros])

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

    registros.forEach((registro) => {
      const tipo = registro.tipo_atividade?.trim() || 'Não informado'
      map.set(tipo, (map.get(tipo) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 12)
  }, [registros])

  const tabelaRegistros = useMemo(() => {
    return registros.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_atividade
        ? dateFormatter.format(new Date(`${registro.data_atividade}T00:00:00`))
        : '—',
      tempoFormatado: registro.tempo_gasto?.slice(0, 5) ?? '—'
    }))
  }, [registros])

  const totalTempoHuman = minutesToHuman(
    registros.reduce((acc, registro) => acc + timeToMinutes(registro.tempo_gasto), 0)
  )

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Atividades Acessórias</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          {isBace
            ? `Visualizando os registros da base ${nomeBase}.`
            : 'Resumo das atividades acessórias registradas em todas as bases.'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-[#ff6600]">
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
          {totalAtividades === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
              <p className="text-lg font-semibold text-[#ff6600]">Nenhuma atividade acessória cadastrada.</p>
              <p className="mt-2 text-sm">
                Assim que novas atividades forem registradas para sua base, os gráficos e a tabela serão exibidos aqui.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a5b3e]/70">Total de atividades</p>
                  <p className="mt-2 text-4xl font-bold text-[#ff6600]">{totalAtividades}</p>
                  <p className="text-xs text-[#7a5b3e]/60">Registros acumulados</p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a5b3e]/70">Atividades no mês</p>
                  <p className="mt-2 text-4xl font-bold text-[#ff6600]">{atividadesMesAtual.length}</p>
                  <p className="text-xs text-[#7a5b3e]/60">{monthFormatter.format(hoje)} {hoje.getFullYear()}</p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a5b3e]/70">Tempo total no mês</p>
                  <p className="mt-2 text-3xl font-bold text-[#ff6600]">{minutesToHHMM(totalTempoMesAtual)}</p>
                  <p className="text-xs text-[#7a5b3e]/60">Somatório de tempo gasto</p>
                </div>
                <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7a5b3e]/70">Coordenador da base</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{nomeCoordenador}</p>
                  <p className="text-xs text-[#7a5b3e]/60">Responsável pelo acesso atual</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Total de atividades ao longo do ano</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Últimos 12 meses</span>
                  </div>
                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer>
                      <AreaChart data={mesesSeries}>
                        <defs>
                          <linearGradient id="atividadesMes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#fb923c" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1c9a4" />
                        <XAxis dataKey="mes" stroke="#b45309" tick={{ fontSize: 12 }} angle={-12} dy={12} height={70} />
                        <YAxis allowDecimals={false} stroke="#b45309" tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ stroke: '#fb923c', strokeWidth: 1 }} contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }} />
                        <Area type="monotone" dataKey="total" stroke="#fb923c" fill="url(#atividadesMes)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-[#ff6600]/90 p-6 shadow-sm">
                  <div className="flex items-center justify-between text-white">
                    <h3 className="text-lg font-semibold">Total de atividades x dia</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                      {monthFormatter.format(hoje)}
                    </span>
                  </div>
                  <div className="mt-4 h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={diasSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                        <XAxis dataKey="dia" stroke="#fff" tick={{ fontSize: 11, fill: '#fff' }} />
                        <YAxis allowDecimals={false} stroke="#fff" tick={{ fontSize: 11, fill: '#fff' }} />
                        <Tooltip
                          cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                          contentStyle={{ borderRadius: 12, borderColor: '#fff' }}
                          labelStyle={{ color: '#ff6600' }}
                        />
                        <Bar dataKey="total" fill="#fff" barSize={18} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Total de atividades por tipo</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Top 12</span>
                  </div>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer>
                      <BarChart
                        data={topTiposAtividade}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1c9a4" />
                        <XAxis type="number" stroke="#b45309" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" stroke="#b45309" tick={{ fontSize: 12, width: 200 }} />
                        <Tooltip cursor={{ fill: 'rgba(255, 102, 0, 0.08)' }} contentStyle={{ borderRadius: 12, borderColor: '#ff6600' }} />
                        <Bar dataKey="value" fill="#ff7a00" radius={[0, 8, 8, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-[#ff6600]">Resumo de recursos</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#7a5b3e]/70">Dados acumulados</span>
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-4 text-sm text-[#374151] sm:grid-cols-2">
                    <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-orange-500">Tempo acumulado</p>
                      <p className="mt-2 text-xl font-semibold text-orange-700">{totalTempoHuman}</p>
                      <p className="text-xs text-orange-500/80">Soma de tempo gasto</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-blue-600">Equipamentos inspecionados</p>
                      <p className="mt-2 text-xl font-semibold text-blue-700">
                        {registros.reduce((acc, registro) => acc + (registro.qtd_equipamentos ?? 0), 0)}
                      </p>
                      <p className="text-xs text-blue-500/80">Quantidade total registrada</p>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-emerald-600">Bombeiros envolvidos</p>
                      <p className="mt-2 text-xl font-semibold text-emerald-700">
                        {registros.reduce((acc, registro) => acc + (registro.qtd_bombeiros ?? 0), 0)}
                      </p>
                      <p className="text-xs text-emerald-500/80">Total de participações</p>
                    </div>
                    <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-purple-600">Bases registradas</p>
                      <p className="mt-2 text-xl font-semibold text-purple-700">
                        {new Set(registros.map((registro) => registro.cidade_aeroporto || registro.secao_id || '—')).size}
                      </p>
                      <p className="text-xs text-purple-500/80">Com atividades no período</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-white shadow-sm">
                <div className="border-b border-orange-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-[#ff6600]">Detalhamento das atividades</h3>
                  <p className="text-xs text-[#7a5b3e]/70">Registros ordenados do mais recente para o mais antigo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-orange-100 text-sm">
                    <thead className="bg-orange-50 text-xs uppercase tracking-wide text-orange-700">
                      <tr>
                        <th className="px-4 py-2 text-left">Data</th>
                        <th className="px-4 py-2 text-left">Equipe</th>
                        <th className="px-4 py-2 text-left">Tipo de atividade</th>
                        <th className="px-4 py-2 text-left">Local / Base</th>
                        <th className="px-4 py-2 text-left">Equipamentos</th>
                        <th className="px-4 py-2 text-left">Bombeiros</th>
                        <th className="px-4 py-2 text-left">Tempo gasto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {tabelaRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-orange-50/40">
                          <td className="px-4 py-3 text-[#1f1f1f]">{registro.dataFormatada}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.equipe_nome ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.tipo_atividade ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.cidade_aeroporto ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.qtd_equipamentos ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.qtd_bombeiros ?? '—'}</td>
                          <td className="px-4 py-3 text-[#7a5b3e]/80">{registro.tempoFormatado}</td>
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
