'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
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
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'
import { useAuth } from '@/hooks/useAuth'
import { useTempoResposta, TempoRespostaData } from '@/hooks/useTempoResposta'
import { useDebounce } from '@/hooks/useDebounce'
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
  const { profile, user } = useAuth()
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
  
  // Filtros padronizados
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMes, setSelectedMes] = useState<string | null>(null)
  
  // Debounce para filtros de data (evita múltiplas requisições)
  const debouncedStartDate = useDebounce(startDate, 500)
  const debouncedEndDate = useDebounce(endDate, 500)

  const canSelecionarSecao = permissoes.podeVerTodasSecoes
  
  const isGestorPOP = user?.profile?.perfil === 'gestor_pop'
  const isBace = user?.profile?.perfil === 'ba_ce'
  const isGerenteSecao = user?.profile?.perfil === 'gerente_secao'
  
  // Determinar secaoId para filtro de equipes
  const secaoIdParaEquipes = isGestorPOP 
    ? selectedBase 
    : (isBace || isGerenteSecao) 
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id)
      : undefined
  
  // Sincronizar selectedSecao com selectedBase para Gestor POP
  useEffect(() => {
    if (isGestorPOP) {
      if (selectedBase) {
        setSelectedSecao(selectedBase)
      } else {
        setSelectedSecao('todas')
      }
    }
  }, [selectedBase, isGestorPOP])
  
  // Sincronizar selectedEquipe com selectedEquipes
  useEffect(() => {
    if (selectedEquipes.length === 0) {
      setSelectedEquipe('todas')
    } else if (selectedEquipes.length === 1) {
      setSelectedEquipe(selectedEquipes[0])
    }
  }, [selectedEquipes])
  
  // Aplicar filtro de mês de referência
  useEffect(() => {
    if (selectedMes) {
      const [ano, mes] = selectedMes.split('-')
      const anoNum = parseInt(ano, 10)
      const mesNum = parseInt(mes, 10)
      const startDateStr = new Date(anoNum, mesNum - 1, 1).toISOString().split('T')[0]
      const endDateStr = new Date(anoNum, mesNum, 0).toISOString().split('T')[0]
      setStartDate(startDateStr)
      setEndDate(endDateStr)
    } else {
      setStartDate('')
      setEndDate('')
    }
  }, [selectedMes])

  useEffect(() => {
    if (!canSelecionarSecao && profile?.secao_id) {
      setSelectedSecao(profile.secao_id)
    }
  }, [canSelecionarSecao, profile?.secao_id])

  useEffect(() => {
    let ativo = true
    let abortController: AbortController | null = null
    let loadTimeout: NodeJS.Timeout | null = null

    const carregar = async () => {
      // Cancelar requisição anterior se existir
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      setIsFetching(true)
      setFetchError(null)
      try {
        // O hook useTempoResposta já tem timeout interno de 30 segundos
        const resultados = await fetchTempoResposta({
          secaoId: selectedSecao === 'todas' ? undefined : selectedSecao,
          equipeId: selectedEquipe === 'todas' ? undefined : selectedEquipe,
          dataInicio: debouncedStartDate || undefined,
          dataFim: debouncedEndDate || undefined,
        })

        if (abortController.signal.aborted || !ativo) return
        setDados(resultados)
      } catch (erro) {
        if (abortController.signal.aborted || !ativo) return
        console.error('Erro ao carregar tempo resposta:', erro)
        setFetchError('Não foi possível carregar os dados de tempo de resposta.')
      } finally {
        if (ativo && !abortController.signal.aborted) {
          setIsFetching(false)
        }
      }
    }

    // Debounce: aguardar 300ms antes de carregar para evitar múltiplas chamadas
    loadTimeout = setTimeout(() => {
      if (ativo) {
        carregar()
      }
    }, 300)

    return () => {
      ativo = false
      if (abortController) {
        abortController.abort()
      }
      if (loadTimeout) {
        clearTimeout(loadTimeout)
      }
    }
  }, [fetchTempoResposta, selectedSecao, selectedEquipe, debouncedStartDate, debouncedEndDate])

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
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Tempo de Resposta</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          Acompanhe o desempenho das equipes nos exercícios de tempo de resposta, filtrando por base,
          período, CCI utilizado e local da aferição.
        </p>
      </div>

      {/* Filtros Padronizados */}
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
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200"
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
                  className="w-full appearance-none rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-orange-200"
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
          <div className="flex items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-primary">
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
            <p className="text-lg font-semibold text-primary">Nenhum registro encontrado</p>
            <p className="mt-2 text-sm text-[#7a5b3e]">
              Ajuste os filtros ou registre novos dados para visualizar os indicadores.
            </p>
          </div>
        ) : (
          <>
            {/* Cards no topo - Laranja */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                <p className="text-sm font-medium uppercase tracking-wide text-white/90">Média geral</p>
                <p className="mt-2 text-4xl font-black">
                  {mediaGeral !== null ? formatSecondsToClock(mediaGeral) : '--:--'}
                </p>
                <p className="mt-1 text-xs text-white/80">Tempo médio de resposta</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                <p className="text-sm font-medium uppercase tracking-wide text-white/90">Menor tempo</p>
                <p className="mt-2 text-4xl font-black">
                  {registroMenorTempo ? formatSecondsToClock(registroMenorTempo.segundos) : '--:--'}
                </p>
                <p className="mt-1 text-xs text-white/80">Melhor desempenho registrado</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                <p className="text-sm font-medium uppercase tracking-wide text-white/90">Maior tempo</p>
                <p className="mt-2 text-4xl font-black">
                  {registroMaiorTempo ? formatSecondsToClock(registroMaiorTempo.segundos) : '--:--'}
                </p>
                <p className="mt-1 text-xs text-white/80">Maior tempo registrado</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">
                      Evolução do tempo de resposta
                    </h3>
                    <p className="text-xs text-[#1f1f1f]/60">
                      Médias mensais (HH:MM:SS) de acordo com os filtros selecionados.
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-72 w-full">
                  <ResponsiveContainer>
                    <LineChart data={serieTemporal}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                      <XAxis
                        dataKey="mes"
                        stroke="#1f1f1f"
                        tick={{ fontSize: 12, fill: '#1f1f1f' }}
                        axisLine={{ stroke: '#1f1f1f' }}
                      />
                      <YAxis
                        stroke="#1f1f1f"
                        tick={{ fontSize: 12, fill: '#1f1f1f' }}
                        tickFormatter={(valor: number) => formatSecondsToClock(valor)}
                        width={80}
                        axisLine={{ stroke: '#1f1f1f' }}
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
                        formatter={(valor: number) => formatSecondsToClock(valor)}
                        labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mediaSegundos"
                        stroke="#fb923c"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Resumo dos Registros</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3 rounded-xl bg-white/20 backdrop-blur-sm p-4 border border-white/30">
                    <MapPinned className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        {opcoesSecao.find((opcao) => opcao.value === selectedSecao)?.label ||
                          'Base selecionada'}
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        {selectedLocal === 'todos'
                          ? 'Todos os locais de aferição'
                          : `Local: ${selectedLocal}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-white/20 backdrop-blur-sm p-4 border border-white/30">
                    <Clock className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-white">
                        {dadosFiltrados.length} registro(s) encontrado(s)
                      </p>
                      <p className="text-xs text-white/80 mt-1">
                        Período: {startDate ? formatDateDisplay(startDate) : 'Início indefinido'} -{' '}
                        {endDate ? formatDateDisplay(endDate) : 'Fim indefinido'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de detalhamento */}
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Registros detalhados</h3>
                  <p className="text-xs text-muted-foreground">
                    Lista completa dos exercícios registrados com os filtros atuais.
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead>
                    <tr className="bg-muted text-foreground uppercase text-xs tracking-wider">
                      <th className="px-4 py-3 text-left font-semibold">Base</th>
                      <th className="px-4 py-3 text-left font-semibold">Data do exercício</th>
                      <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                      <th className="px-4 py-3 text-left font-semibold">BA-MC</th>
                      <th className="px-4 py-3 text-left font-semibold">Local da aferição</th>
                      <th className="px-4 py-3 text-left font-semibold">CCI utilizado</th>
                      <th className="px-4 py-3 text-left font-semibold">Tempo aferido</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {dadosOrdenados.map((registro) => (
                      <tr
                        key={`${registro.id}-${registro.data_tempo_resposta}-${registro.nome_completo}`}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {registro.nome_cidade || 'Não informado'}
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {formatDateDisplay(registro.data_tempo_resposta)}
                        </td>
                        <td className="px-4 py-3 text-foreground/80">{registro.equipe || '-'}</td>
                        <td className="px-4 py-3 text-foreground/80">{registro.nome_completo || '-'}</td>
                        <td className="px-4 py-3 text-foreground/80">
                          {registro.local_posicionamento || '-'}
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {registro.cci_utilizado || 'Não informado'}
                        </td>
                        <td className="px-4 py-3 font-mono font-medium text-foreground">
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