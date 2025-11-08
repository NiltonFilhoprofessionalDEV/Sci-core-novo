'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts'
import { AlertCircle, Loader2, MapPinned, Clock, ChevronDown, Timer, Target } from 'lucide-react'

import DateRangeFilter from '@/components/filters/DateRangeFilter'
import { useAuth } from '@/hooks/useAuth'
import { useTempoResposta, TempoRespostaData } from '@/hooks/useTempoResposta'
import { getPermissoes } from '@/types/auth'

type FiltroOpcao = {
  label: string
  value: string
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })

const parseDurationToSeconds = (tempo: string | null | undefined): number | null => {
  if (!tempo) return null
  const [horas, minutos, segundos] = tempo.split(':').map((parte) => Number(parte) || 0)
  if ([horas, minutos, segundos].some((parte) => Number.isNaN(parte))) return null
  return horas * 3600 + minutos * 60 + segundos
}

const formatSecondsToClock = (valor: number | null | undefined): string => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '--:--'
  const horas = Math.floor(valor / 3600)
  const minutos = Math.floor((valor % 3600) / 60)
  const segundos = Math.floor(valor % 60)
  return [horas, minutos, segundos].map((parte) => parte.toString().padStart(2, '0')).join(':')
}

const formatDateDisplay = (dataISO: string | null | undefined): string => {
  if (!dataISO) return '-'
  const data = new Date(`${dataISO}T00:00:00`)
  if (Number.isNaN(data.getTime())) return '-'
  return data.toLocaleDateString('pt-BR')
}

export default function TempoRespostaDashboard() {
  const { profile } = useAuth()
  const permissoes = useMemo(() => getPermissoes(profile), [profile])

  const {
    loading: hookLoading,
    error: hookError,
    fetchTempoResposta,
    secoes,
    equipes,
  } = useTempoResposta(profile?.secao_id)

  const [dados, setDados] = useState<TempoRespostaData[]>([])
  const [isFetching, setIsFetching] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [selectedSecao, setSelectedSecao] = useState<string>(() => {
    if (!permissoes.podeVerTodasSecoes && profile?.secao_id) {
      return profile.secao_id
    }
    return 'todas'
  })

  const [selectedEquipe, setSelectedEquipe] = useState<string>('todas')
  const [selectedCCI, setSelectedCCI] = useState<string>('todos')
  const [selectedLocal, setSelectedLocal] = useState<string>('todos')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const canSelecionarSecao = permissoes.podeVerTodasSecoes

  useEffect(() => {
    if (!canSelecionarSecao && profile?.secao_id) {
      setSelectedSecao(profile.secao_id)
    }
  }, [canSelecionarSecao, profile?.secao_id])

  useEffect(() => {
    let ativo = true

    const carregar = async () => {
      setIsFetching(true)
      setFetchError(null)
      try {
        const resultados = await fetchTempoResposta({
          secaoId: selectedSecao === 'todas' ? undefined : selectedSecao,
          equipeId: selectedEquipe === 'todas' ? undefined : selectedEquipe,
          dataInicio: startDate || undefined,
          dataFim: endDate || undefined,
        })

        if (!ativo) return
        setDados(resultados as TempoRespostaData[])
      } catch (erro) {
        if (!ativo) return
        console.error('Erro ao carregar tempo resposta:', erro)
        setFetchError('Não foi possível carregar os dados de tempo de resposta.')
      } finally {
        if (ativo) {
          setIsFetching(false)
        }
      }
    }

    carregar()

    return () => {
      ativo = false
    }
  }, [fetchTempoResposta, selectedSecao, selectedEquipe, startDate, endDate])

  useEffect(() => {
    setSelectedEquipe('todas')
  }, [selectedSecao])

  const opcoesSecao: FiltroOpcao[] = useMemo(() => {
    const lista = (secoes || []).map((secao) => ({
      label: secao.nome,
      value: secao.id,
    }))
    if (canSelecionarSecao) {
      return [{ label: 'Todas as Bases', value: 'todas' }, ...lista]
    }
    return lista
  }, [secoes, canSelecionarSecao])

  const opcoesEquipe: FiltroOpcao[] = useMemo(() => {
    const equipesDisponiveis =
      selectedSecao !== 'todas'
        ? equipes?.filter((equipe) => equipe.secao_id === selectedSecao)
        : equipes

    const nomes = new Map<string, string>()

    ;(equipesDisponiveis || []).forEach((equipe) => {
      nomes.set(equipe.id, equipe.nome)
    })

    // Complementa com dados já carregados caso a equipe não esteja no contexto
    dados.forEach((registro) => {
      if (registro.equipe_id && registro.equipe && !nomes.has(registro.equipe_id)) {
        nomes.set(registro.equipe_id, registro.equipe)
      }
    })

    const lista = Array.from(nomes.entries())
      .map(([id, nome]) => ({ value: id, label: nome }))
      .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))

    return [{ label: 'Todas as Equipes', value: 'todas' }, ...lista]
  }, [equipes, dados, selectedSecao])

  const opcoesCCI: FiltroOpcao[] = useMemo(() => {
    const valores = new Set<string>()
    dados.forEach((item) => {
      if (item.cci_utilizado) {
        valores.add(item.cci_utilizado)
      }
    })
    return ['Todos', ...Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR'))].map(
      (valor) => ({
        label: valor,
        value: valor === 'Todos' ? 'todos' : valor,
      })
    )
  }, [dados])

  const opcoesLocal: FiltroOpcao[] = useMemo(() => {
    const valores = new Set<string>()
    dados.forEach((item) => {
      if (item.local_posicionamento) {
        valores.add(item.local_posicionamento)
      }
    })
    return ['Todos', ...Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR'))].map(
      (valor) => ({
        label: valor,
        value: valor === 'Todos' ? 'todos' : valor,
      })
    )
  }, [dados])

  const dadosFiltrados = useMemo(() => {
    return dados.filter((item) => {
      if (selectedCCI !== 'todos' && item.cci_utilizado !== selectedCCI) {
        return false
      }
      if (selectedLocal !== 'todos' && item.local_posicionamento !== selectedLocal) {
        return false
      }
      return true
    })
  }, [dados, selectedCCI, selectedLocal])

  const dadosOrdenados = useMemo(() => {
    return [...dadosFiltrados].sort((a, b) => {
      const dataA = new Date(`${a.data_tempo_resposta}T00:00:00`).getTime()
      const dataB = new Date(`${b.data_tempo_resposta}T00:00:00`).getTime()
      return dataB - dataA
    })
  }, [dadosFiltrados])

  const listaCCIs = useMemo(() => {
    const valores = new Set<string>()
    dadosFiltrados.forEach((item) => {
      valores.add(item.cci_utilizado || 'Não informado')
    })
    return Array.from(valores).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [dadosFiltrados])

  const resumoPorEquipe = useMemo(() => {
    const mapa = new Map<string, Record<string, { total: number; count: number }>>()

    dadosFiltrados.forEach((registro) => {
      const equipe = registro.equipe || 'Equipe não informada'
      const cci = registro.cci_utilizado || 'Não informado'
      const segundos = parseDurationToSeconds(registro.tempo_exercicio)
      if (segundos === null) return

      if (!mapa.has(equipe)) {
        mapa.set(equipe, {})
      }

      const linha = mapa.get(equipe)!
      if (!linha[cci]) {
        linha[cci] = { total: 0, count: 0 }
      }

      linha[cci].total += segundos
      linha[cci].count += 1
    })

    return Array.from(mapa.entries())
      .map(([equipe, valores]) => {
        const linha: Record<string, string> = {}
        listaCCIs.forEach((cci) => {
          const estatistica = valores[cci]
          linha[cci] =
            estatistica && estatistica.count > 0
              ? formatSecondsToClock(estatistica.total / estatistica.count)
              : '--:--'
        })
        return {
          equipe,
          ...linha,
        }
      })
      .sort((a, b) => a.equipe.localeCompare(b.equipe, 'pt-BR'))
  }, [dadosFiltrados, listaCCIs])

  const serieTemporal = useMemo(() => {
    const mapa = new Map<
      string,
      {
        total: number
        count: number
      }
    >()

    dadosFiltrados.forEach((registro) => {
      const segundos = parseDurationToSeconds(registro.tempo_exercicio)
      if (segundos === null || !registro.data_tempo_resposta) return

      const data = new Date(`${registro.data_tempo_resposta}T00:00:00`)
      if (Number.isNaN(data.getTime())) return
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`

      if (!mapa.has(chave)) {
        mapa.set(chave, { total: 0, count: 0 })
      }

      const acumulado = mapa.get(chave)!
      acumulado.total += segundos
      acumulado.count += 1
    })

    return Array.from(mapa.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([chave, valores]) => {
        const [ano, mes] = chave.split('-')
        const data = new Date(Number(ano), Number(mes) - 1, 1)
        const mediaSegundos = valores.count > 0 ? valores.total / valores.count : 0
        return {
          mes: monthFormatter.format(data),
          mediaSegundos,
          mediaFormatada: formatSecondsToClock(mediaSegundos),
        }
      })
  }, [dadosFiltrados])

  const registroMenorTempo = useMemo(() => {
    let melhor: TempoRespostaData | null = null
    let menor = Infinity

    dadosFiltrados.forEach((registro) => {
      const segundos = parseDurationToSeconds(registro.tempo_exercicio)
      if (segundos === null) return
      if (segundos < menor) {
        menor = segundos
        melhor = registro
      }
    })

    return melhor ? { registro: melhor, segundos: menor } : null
  }, [dadosFiltrados])

  const registroMaiorTempo = useMemo(() => {
    let pior: TempoRespostaData | null = null
    let maior = -Infinity

    dadosFiltrados.forEach((registro) => {
      const segundos = parseDurationToSeconds(registro.tempo_exercicio)
      if (segundos === null) return
      if (segundos > maior) {
        maior = segundos
        pior = registro
      }
    })

    return pior ? { registro: pior, segundos: maior } : null
  }, [dadosFiltrados])

  const mediaGeral = useMemo(() => {
    const { total, count } = dadosFiltrados.reduce(
      (acumulado, registro) => {
        const segundos = parseDurationToSeconds(registro.tempo_exercicio)
        if (segundos === null) return acumulado
        acumulado.total += segundos
        acumulado.count += 1
        return acumulado
      },
      { total: 0, count: 0 }
    )

    return count > 0 ? total / count : null
  }, [dadosFiltrados])

  const estadoCarregando = hookLoading || isFetching
  const mensagemErro = fetchError || hookError

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-[#ff6600]">Tempo de Resposta</h2>
        <p className="text-sm text-[#7a5b3e]/80">
          Acompanhe o desempenho das equipes nos exercícios de tempo de resposta, filtrando por base,
          período, CCI utilizado e local da aferição.
        </p>
      </div>

      <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold text-[#7a5b3e]/80 uppercase tracking-wide">
                Base
              </label>
              <div className="relative">
                <select
                  value={selectedSecao}
                  onChange={(event) => setSelectedSecao(event.target.value)}
                  disabled={!canSelecionarSecao}
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-[#ff6600] focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                >
                  {opcoesSecao.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold text-[#7a5b3e]/80 uppercase tracking-wide">
                Equipe
              </label>
              <div className="relative">
                <select
                  value={selectedEquipe}
                  onChange={(event) => setSelectedEquipe(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-[#ff6600] focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {opcoesEquipe.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="min-w-[240px]">
              <label className="mb-1 block text-xs font-semibold text-[#7a5b3e]/80 uppercase tracking-wide">
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

          <div className="flex flex-wrap gap-3">
            <div className="min-w-[180px]">
              <label className="mb-1 block text-xs font-semibold text-[#7a5b3e]/80 uppercase tracking-wide">
                CCI Utilizado
              </label>
              <div className="relative">
                <select
                  value={selectedCCI}
                  onChange={(event) => setSelectedCCI(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-[#ff6600] focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {opcoesCCI.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>

            <div className="min-w-[200px]">
              <label className="mb-1 block text-xs font-semibold text-[#7a5b3e]/80 uppercase tracking-wide">
                Local da aferição
              </label>
              <div className="relative">
                <select
                  value={selectedLocal}
                  onChange={(event) => setSelectedLocal(event.target.value)}
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-[#ff6600] focus:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {opcoesLocal.map((opcao) => (
                    <option key={opcao.value} value={opcao.value}>
                      {opcao.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
        </div>

        {estadoCarregando ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-[#ff6600]">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Carregando dados do indicador...
          </div>
        ) : mensagemErro ? (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <AlertCircle className="h-5 w-5" />
            {mensagemErro}
          </div>
        ) : dadosFiltrados.length === 0 ? (
          <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-12 text-center">
            <p className="text-lg font-semibold text-[#ff6600]">Nenhum registro encontrado</p>
            <p className="mt-2 text-sm text-[#7a5b3e]">
              Ajuste os filtros ou registre novos dados para visualizar os indicadores.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[#ff6600]">
                      Evolução do tempo de resposta
                    </h3>
                    <p className="text-xs text-[#7a5b3e]/70">
                      Médias mensais (HH:MM:SS) de acordo com os filtros selecionados.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer>
                    <LineChart data={serieTemporal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                      <XAxis
                        dataKey="mes"
                        stroke="#b45309"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: '#fb923c' }}
                      />
                      <YAxis
                        stroke="#b45309"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(valor: number) => formatSecondsToClock(valor)}
                        width={80}
                        axisLine={{ stroke: '#fb923c' }}
                      />
                      <Tooltip
                        cursor={{ stroke: '#fb923c', strokeWidth: 1 }}
                        contentStyle={{
                          borderRadius: 12,
                          borderColor: '#fb923c',
                          boxShadow: '0 10px 25px -15px rgba(249, 115, 22, 0.6)',
                        }}
                        formatter={(valor: number) => formatSecondsToClock(valor)}
                      />
                      <Line
                        type="monotone"
                        dataKey="mediaSegundos"
                        stroke="#fb923c"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#fb923c' }}
                        activeDot={{ r: 6, fill: '#fb923c' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#ff6600]">Resumo dos Registros</h3>
                <div className="mt-4 space-y-4 text-sm text-gray-700">
                  <div className="flex items-start gap-3 rounded-xl bg-[#ff6600]/5 p-3">
                    <MapPinned className="h-5 w-5 text-[#ff6600]" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {opcoesSecao.find((opcao) => opcao.value === selectedSecao)?.label ||
                          'Base selecionada'}
                      </p>
                      <p className="text-xs text-[#7a5b3e]/70">
                        {selectedLocal === 'todos'
                          ? 'Todos os locais de aferição'
                          : `Local: ${selectedLocal}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-[#ff6600]/5 p-3">
                    <Clock className="h-5 w-5 text-[#ff6600]" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {dadosFiltrados.length} registro(s) encontrado(s)
                      </p>
                      <p className="text-xs text-[#7a5b3e]/70">
                        Período: {startDate ? formatDateDisplay(startDate) : 'Início indefinido'} -{' '}
                        {endDate ? formatDateDisplay(endDate) : 'Fim indefinido'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-orange-100 px-6 py-4">
                <div>
                  <h3 className="text-base font-semibold text-[#ff6600]">Registros detalhados</h3>
                  <p className="text-xs text-[#7a5b3e]/70">
                    Lista completa dos exercícios registrados com os filtros atuais.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-100 text-sm">
                  <thead>
                    <tr className="bg-[#fff3e6] text-[#7a5b3e] uppercase text-xs tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">Base</th>
                      <th className="px-4 py-3 text-left font-semibold">Data do exercício</th>
                      <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                      <th className="px-4 py-3 text-left font-semibold">BA-MC</th>
                      <th className="px-4 py-3 text-left font-semibold">Local da aferição</th>
                      <th className="px-4 py-3 text-left font-semibold">CCI utilizado</th>
                      <th className="px-4 py-3 text-left font-semibold">Tempo aferido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-50 bg-white">
                    {dadosOrdenados.map((registro) => (
                      <tr
                        key={`${registro.id}-${registro.data_tempo_resposta}-${registro.nome_completo}`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {registro.nome_cidade || 'Não informado'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDateDisplay(registro.data_tempo_resposta)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{registro.equipe || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">{registro.nome_completo || '-'}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {registro.local_posicionamento || '-'}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {registro.cci_utilizado || 'Não informado'}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-900">
                          {formatSecondsToClock(parseDurationToSeconds(registro.tempo_exercicio))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}