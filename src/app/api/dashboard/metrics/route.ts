import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Interfaces copiadas do hook original
export interface DashboardFilters {
  secaoId?: string
  equipeId?: string
  meses?: number
}

export interface DashboardData {
  kpis: Array<{ id: string; label: string; value: string | number; helper?: string }>
  ocorrenciasAeronauticasPorMes: Array<{ month: string; ocorrencias: number }>
  ocorrenciasNaoAeronauticasPorMes: Array<{ month: string; ocorrencias: number }>
  ptrBaHorasPorMes: Array<{ month: string; horas: number }>
  ptrBaProvasPorMes: Array<{ month: string; aprovados: number; reprovados: number }>
  atividadesAcessoriasPorMes: Array<{ month: string; atividades: number }>
  inspecoesViaturaPorMes: Array<{ month: string; inspecoes: number }>
  tafResumo: {
    aprovados: number
    reprovados: number
    semAvaliacao: number
    aprovadosPorMes: Array<{ month: string; aprovados: number }>
    reprovadosPorMes: Array<{ month: string; reprovados: number }>
  }
  tempoEprResumo: {
    ideal: number
    toleravel: number
    reprovado: number
    mediaPorMes: Array<{ month: string; minutos: number }>
  }
  tempoEprStatusPorMes: Array<{ month: string; ideal: number; toleravel: number; reprovado: number }>
  tempoRespostaSerie: Array<{ month: string; mediaMinutos: number }>
  controleAgentesSerie: Array<{
    month: string
    estoquePo: number
    estoqueLge: number
    estoqueN2: number
    exigidoPo: number
    exigidoLge: number
    exigidoN2: number
  }>
  agentesResumo: {
    registros: number
    estoquePo: number
    estoqueLge: number
    estoqueN2: number
    exigidoPo: number
    exigidoLge: number
    exigidoN2: number
  }
  controleTrocasPorMes: Array<{ month: string; quantidade: number }>
  verificacaoTpsSerie: Array<{ month: string; conformes: number; verificados: number; total: number }>
  higienizacaoTpsSerie: Array<{ month: string; higienizados: number; total: number }>
  uniformesResumo: {
    epiEntregue: number
    epiPrevisto: number
    uniformeEntregue: number
    uniformePrevisto: number
    series: Array<{ month: string; epi: number; uniforme: number }>
  }
  ultimaAtualizacao: string
}

// Funções auxiliares copiadas do hook original
const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
})

function buildMonthSequence(totalMonths: number): Array<{ key: string; label: string; date: Date }> {
  const months: Array<{ key: string; label: string; date: Date }> = []
  const today = new Date()
  for (let i = totalMonths - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.push({
      key,
      label: monthFormatter.format(date).replace('.', ''),
      date,
    })
  }
  return months
}

function toMonthKey(dateString?: string | null): string | null {
  if (!dateString) return null
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function parseTimeToMinutes(time?: string | null): number {
  if (!time) return 0
  const parts = time.split(':').map(Number)
  if (!parts.length || parts.some((n) => Number.isNaN(n))) return 0
  const [hours = 0, minutes = 0, seconds = 0] = parts
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds / 60
}

function formatMinutesToTime(mins: number): string {
  if (!Number.isFinite(mins) || mins <= 0) return '0 min'
  const totalSeconds = Math.round(mins * 60)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}min`
  }
  return `${minutes} min`
}

export async function GET(req: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 1. Parse query params
    const url = new URL(req.url)
    const secaoId = url.searchParams.get('secaoId') || undefined
    const equipeId = url.searchParams.get('equipeId') || undefined
    const mesesParam = url.searchParams.get('meses')
    const meses = mesesParam ? Math.max(1, Math.min(24, Number(mesesParam))) : 12

    // 2. Configurar Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta (Supabase)' },
        { status: 500 },
      )
    }

    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization') || ''
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: authHeader
        ? {
            headers: {
              Authorization: authHeader,
            },
          }
        : {},
    })

    // 3. Calcular data de início
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    startDate.setMonth(startDate.getMonth() - (meses - 1), 1)
    const startISO = startDate.toISOString().split('T')[0]

    // 4. Executar todas as queries em paralelo
    const [
      ocorrenciasAeronauticas,
      ocorrenciasNaoAeronauticas,
      tafRegistros,
      tafResultados,
      tempoResposta,
      horasTreinamento,
      agentesExtintores,
      uniformes,
      atividadesAcessorias,
      ptrBaProvas,
      tempoEpr,
      controleTrocas,
      verificacaoTps,
      higienizacaoTps,
      inspecoesViatura,
    ] = await Promise.all([
      (() => {
        let query = client
          .from('ocorrencias_aeronauticas')
          .select('data_ocorrencia, secao_id, equipe_id')
          .gte('data_ocorrencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('ocorrencias_nao_aeronauticas')
          .select('data_ocorrencia, secao_id, equipe_id')
          .gte('data_ocorrencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('taf_registros')
          .select('id, data_teste, secao_id, equipe_id')
          .gte('data_teste', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('taf_resultados')
          .select('desempenho, data_taf, taf_registros!inner(secao_id, equipe_id, data_teste)')
          .gte('data_taf', startISO)
        if (secaoId) query = query.eq('taf_registros.secao_id', secaoId)
        if (equipeId) query = query.eq('taf_registros.equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('tempo_resposta')
          .select('tempo_exercicio, data_tempo_resposta, secao_id, equipe_id')
          .gte('data_tempo_resposta', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('ptr_ba_horas_treinamento')
          .select('hora_ptr_diaria, data_ptr_ba, secao_id, equipe_id')
          .gte('data_ptr_ba', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('controle_agentes_extintores')
          .select(
            'quantidade_estoque_po_quimico, quantidade_estoque_lge, quantidade_estoque_nitrogenio, quantidade_exigida_po_quimico, quantidade_exigida_lge, quantidade_exigida_nitrogenio, nome_cidade, equipe, nome_completo, data_referencia, secao_id, equipe_id',
          )
          .gte('data_referencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('controle_uniformes_recebidos')
          .select(
            'epi_entregue, epi_previsto, uniforme_entregue, uniforme_previsto, data, data_referencia, secao_id, equipe_id',
          )
          .gte('data', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('atividades_acessorias')
          .select('data_atividade, secao_id, equipe_id')
          .gte('data_atividade', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('ptr_ba_provas_teoricas')
          .select('status, data_prova, secao_id, equipe_id')
          .gte('data_prova', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('tempo_epr')
          .select('status, tempo_epr, data_exercicio_epr, secao_id, equipe_id')
          .gte('data_exercicio_epr', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('controle_trocas')
          .select('quantidade_troca, data_referencia, secao_id, equipe_id')
          .gte('data_referencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('verificacao_tps')
          .select('tp_conforme, tp_verificado, tp_total, data, data_referencia, secao_id, equipe_id')
          .gte('data_referencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('higienizacao_tps')
          .select('tp_higienizado, tp_total, data, data_referencia, secao_id, equipe_id')
          .gte('data_referencia', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
      (() => {
        let query = client
          .from('inspecoes_viatura')
          .select('quantidade_de_inspecoes, data, secao_id, equipe_id')
          .gte('data', startISO)
        if (secaoId) query = query.eq('secao_id', secaoId)
        if (equipeId) query = query.eq('equipe_id', equipeId)
        return query
      })(),
    ])

    // 5. Verificar erros
    const handleError = (...responses: any[]) => {
      for (const response of responses) {
        if (response.error) {
          console.error('Erro ao carregar dashboard:', response.error)
          throw new Error(response.error.message || 'Erro ao carregar dados do dashboard')
        }
      }
    }

    handleError(
      ocorrenciasAeronauticas,
      ocorrenciasNaoAeronauticas,
      tafRegistros,
      tafResultados,
      tempoResposta,
      horasTreinamento,
      agentesExtintores,
      uniformes,
      atividadesAcessorias,
      ptrBaProvas,
      tempoEpr,
      controleTrocas,
      verificacaoTps,
      higienizacaoTps,
      inspecoesViatura,
    )

    // 6. Processar agregações (lógica copiada do hook original)
    const months = buildMonthSequence(meses)
    const monthMap = new Map(
      months.map((m) => [m.key, { month: m.label, aeronauticas: 0, naoAeronauticas: 0 }]),
    )

    const ocAerData = ocorrenciasAeronauticas.data ?? []
    const ocNaoData = ocorrenciasNaoAeronauticas.data ?? []

    ocAerData.forEach((item) => {
      const key = toMonthKey((item as any).data_ocorrencia)
      if (key && monthMap.has(key)) {
        monthMap.get(key)!.aeronauticas += 1
      }
    })

    ocNaoData.forEach((item) => {
      const key = toMonthKey((item as any).data_ocorrencia)
      if (key && monthMap.has(key)) {
        monthMap.get(key)!.naoAeronauticas += 1
      }
    })

    const ocorrenciasPorMes = Array.from(monthMap.values())
    const ocorrenciasAeronauticasPorMes = ocorrenciasPorMes.map(({ month, aeronauticas }) => ({
      month,
      ocorrencias: aeronauticas,
    }))
    const ocorrenciasNaoAeronauticasPorMes = ocorrenciasPorMes.map(({ month, naoAeronauticas }) => ({
      month,
      ocorrencias: naoAeronauticas,
    }))

    const totalOcorrenciasAeronauticas = ocAerData.length
    const totalOcorrenciasNaoAeronauticas = ocNaoData.length

    const tafRegData = tafRegistros.data ?? []
    const totalTafRealizados = tafRegData.length

    const tafResultadosData = (tafResultados.data ?? []) as Array<{
      desempenho: number | null
      data_taf: string | null
      // O embed `taf_registros!inner(...)` pode vir como array no PostgREST
      taf_registros: Array<{ data_teste: string | null }>
    }>

    const tafSeriesMonths = buildMonthSequence(Math.min(meses, 6))
    const tafAprovadosMap = new Map(tafSeriesMonths.map((m) => [m.key, { month: m.label, aprovados: 0 }]))
    const tafReprovadosMap = new Map(tafSeriesMonths.map((m) => [m.key, { month: m.label, reprovados: 0 }]))

    let aprovados = 0
    let reprovados = 0
    let semAvaliacao = 0

    tafResultadosData.forEach((item) => {
      const dataBase = item.data_taf || item.taf_registros?.[0]?.data_teste
      const key = toMonthKey(dataBase)
      if (item.desempenho === null || item.desempenho === undefined) {
        semAvaliacao += 1
      } else if (item.desempenho >= 7) {
        aprovados += 1
        if (key && tafAprovadosMap.has(key)) {
          tafAprovadosMap.get(key)!.aprovados += 1
        }
      } else {
        reprovados += 1
        if (key && tafReprovadosMap.has(key)) {
          tafReprovadosMap.get(key)!.reprovados += 1
        }
      }
    })

    const tempoRespostaData = tempoResposta.data ?? []
    const tempoRespostaMap = new Map(
      months.map((m) => [m.key, { month: m.label, totalMinutos: 0, qtd: 0 }]),
    )

    tempoRespostaData.forEach((item) => {
      const key = toMonthKey((item as any).data_tempo_resposta)
      if (key && tempoRespostaMap.has(key)) {
        const minutos = parseTimeToMinutes((item as any).tempo_exercicio)
        tempoRespostaMap.get(key)!.totalMinutos += minutos
        tempoRespostaMap.get(key)!.qtd += minutos > 0 ? 1 : 0
      }
    })

    const tempoRespostaSerie = Array.from(tempoRespostaMap.values()).map((entry) => ({
      month: entry.month,
      mediaMinutos: entry.qtd > 0 ? entry.totalMinutos / entry.qtd : 0,
    }))

    const tempoRespostaMedio =
      tempoRespostaSerie.reduce((acc, item) => acc + item.mediaMinutos, 0) / (tempoRespostaSerie.length || 1)

    const horasTreinamentoData = horasTreinamento.data ?? []
    const treinamentoMap = new Map(months.map((m) => [m.key, { month: m.label, horas: 0 }]))

    horasTreinamentoData.forEach((item) => {
      const key = toMonthKey((item as any).data_ptr_ba)
      if (key && treinamentoMap.has(key)) {
        const horas = parseFloat((item as any).hora_ptr_diaria ?? 0)
        if (!Number.isNaN(horas)) {
          treinamentoMap.get(key)!.horas += horas
        }
      }
    })

    const ptrBaHorasPorMes = Array.from(treinamentoMap.values())
    const totalHorasTreinamento = ptrBaHorasPorMes.reduce((acc, item) => acc + item.horas, 0)

    const ptrBaProvasData = ptrBaProvas.data ?? []
    const ptrBaProvasMap = new Map(
      months.map((m) => [m.key, { month: m.label, aprovados: 0, reprovados: 0 }]),
    )

    ptrBaProvasData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data_prova)
      if (key && ptrBaProvasMap.has(key) && record.status) {
        const entry = ptrBaProvasMap.get(key)!
        if (record.status === 'Aprovado') {
          entry.aprovados += 1
        } else if (record.status === 'Reprovado') {
          entry.reprovados += 1
        }
      }
    })

    const atividadesData = atividadesAcessorias.data ?? []
    const atividadesMap = new Map(months.map((m) => [m.key, { month: m.label, atividades: 0 }]))

    atividadesData.forEach((item) => {
      const key = toMonthKey((item as any).data_atividade)
      if (key && atividadesMap.has(key)) {
        atividadesMap.get(key)!.atividades += 1
      }
    })

    const tempoEprData = tempoEpr.data ?? []
    let tempoEprIdeal = 0
    let tempoEprToleravel = 0
    let tempoEprReprovado = 0
    const tempoEprTempoMap = new Map(months.map((m) => [m.key, { month: m.label, totalMinutos: 0, qtd: 0 }]))
    const tempoEprStatusMap = new Map(
      months.map((m) => [m.key, { month: m.label, ideal: 0, toleravel: 0, reprovado: 0 }]),
    )

    tempoEprData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data_exercicio_epr)
      const minutos = parseTimeToMinutes(record.tempo_epr)
      if (key && tempoEprTempoMap.has(key)) {
        if (minutos > 0) {
          tempoEprTempoMap.get(key)!.totalMinutos += minutos
          tempoEprTempoMap.get(key)!.qtd += 1
        }
        const statusEntry = tempoEprStatusMap.get(key)!
        if (record.status === 'Ideal') {
          tempoEprIdeal += 1
          statusEntry.ideal += 1
        } else if (record.status === 'Tolerável' || record.status === 'Toleravel') {
          tempoEprToleravel += 1
          statusEntry.toleravel += 1
        } else if (record.status === 'Reprovado') {
          tempoEprReprovado += 1
          statusEntry.reprovado += 1
        }
      }
    })

    const tempoEprMediaPorMes = Array.from(tempoEprTempoMap.values()).map((entry) => ({
      month: entry.month,
      minutos: entry.qtd > 0 ? entry.totalMinutos / entry.qtd : 0,
    }))

    const tempoEprStatusPorMes = Array.from(tempoEprStatusMap.values())

    const controleTrocasData = controleTrocas.data ?? []
    const controleTrocasMap = new Map(months.map((m) => [m.key, { month: m.label, quantidade: 0 }]))

    controleTrocasData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data_referencia)
      if (key && controleTrocasMap.has(key)) {
        controleTrocasMap.get(key)!.quantidade += Number(record.quantidade_troca || 0)
      }
    })

    const verificacaoTpsData = verificacaoTps.data ?? []
    const verificacaoTpsMap = new Map(
      months.map((m) => [m.key, { month: m.label, conformes: 0, verificados: 0, total: 0 }]),
    )

    verificacaoTpsData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data || record.data_referencia)
      if (key && verificacaoTpsMap.has(key)) {
        const entry = verificacaoTpsMap.get(key)!
        entry.conformes += Number(record.tp_conforme || 0)
        entry.verificados += Number(record.tp_verificado || 0)
        entry.total += Number(record.tp_total || 0)
      }
    })

    const higienizacaoTpsData = higienizacaoTps.data ?? []
    const higienizacaoTpsMap = new Map(
      months.map((m) => [m.key, { month: m.label, higienizados: 0, total: 0 }]),
    )

    higienizacaoTpsData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data || record.data_referencia)
      if (key && higienizacaoTpsMap.has(key)) {
        const entry = higienizacaoTpsMap.get(key)!
        entry.higienizados += Number(record.tp_higienizado || 0)
        entry.total += Number(record.tp_total || 0)
      }
    })

    const inspecoesViaturaData = inspecoesViatura.data ?? []
    const inspecoesViaturaMap = new Map(months.map((m) => [m.key, { month: m.label, inspecoes: 0 }]))

    inspecoesViaturaData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data)
      if (key && inspecoesViaturaMap.has(key)) {
        inspecoesViaturaMap.get(key)!.inspecoes += Number(record.quantidade_de_inspecoes || 0)
      }
    })

    const agentesData = agentesExtintores.data ?? []
    const agentesResumoTotais = {
      registros: 0,
      estoquePo: 0,
      estoqueLge: 0,
      estoqueN2: 0,
      exigidoPo: 0,
      exigidoLge: 0,
      exigidoN2: 0,
    }
    const agentesSeriesMap = new Map(
      months.map((m) => [
        m.key,
        {
          month: m.label,
          estoquePo: 0,
          estoqueLge: 0,
          estoqueN2: 0,
          exigidoPo: 0,
          exigidoLge: 0,
          exigidoN2: 0,
        },
      ]),
    )

    agentesData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data_referencia)
      agentesResumoTotais.registros += 1
      agentesResumoTotais.estoquePo += Number(record.quantidade_estoque_po_quimico || 0)
      agentesResumoTotais.estoqueLge += Number(record.quantidade_estoque_lge || 0)
      agentesResumoTotais.estoqueN2 += Number(record.quantidade_estoque_nitrogenio || 0)
      agentesResumoTotais.exigidoPo += Number(record.quantidade_exigida_po_quimico || 0)
      agentesResumoTotais.exigidoLge += Number(record.quantidade_exigida_lge || 0)
      agentesResumoTotais.exigidoN2 += Number(record.quantidade_exigida_nitrogenio || 0)
      if (key && agentesSeriesMap.has(key)) {
        const entry = agentesSeriesMap.get(key)!
        entry.estoquePo += Number(record.quantidade_estoque_po_quimico || 0)
        entry.estoqueLge += Number(record.quantidade_estoque_lge || 0)
        entry.estoqueN2 += Number(record.quantidade_estoque_nitrogenio || 0)
        entry.exigidoPo += Number(record.quantidade_exigida_po_quimico || 0)
        entry.exigidoLge += Number(record.quantidade_exigida_lge || 0)
        entry.exigidoN2 += Number(record.quantidade_exigida_nitrogenio || 0)
      }
    })

    const controleAgentesSerie = Array.from(agentesSeriesMap.values())

    const uniformesData = uniformes.data ?? []
    const uniformesResumo = uniformesData.reduce(
      (acc, item) => {
        const record = item as any
        acc.epiEntregue += Number(record.epi_entregue || 0)
        acc.epiPrevisto += Number(record.epi_previsto || 0)
        acc.uniformeEntregue += Number(record.uniforme_entregue || 0)
        acc.uniformePrevisto += Number(record.uniforme_previsto || 0)
        return acc
      },
      { epiEntregue: 0, epiPrevisto: 0, uniformeEntregue: 0, uniformePrevisto: 0 },
    )

    const uniformesSeriesMap = new Map(months.map((m) => [m.key, { month: m.label, epi: 0, uniforme: 0 }]))

    uniformesData.forEach((item) => {
      const record = item as any
      const key = toMonthKey(record.data || record.data_referencia)
      if (key && uniformesSeriesMap.has(key)) {
        uniformesSeriesMap.get(key)!.epi += Number(record.epi_entregue || 0)
        uniformesSeriesMap.get(key)!.uniforme += Number(record.uniforme_entregue || 0)
      }
    })

    const uniformesSeries = Array.from(uniformesSeriesMap.values())

    const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 })

    const kpis: DashboardData['kpis'] = [
      {
        id: 'ocorrenciasAeronauticas',
        label: 'Ocorrências Aeronáuticas',
        value: numberFormatter.format(totalOcorrenciasAeronauticas),
        helper: `${meses} meses`,
      },
      {
        id: 'ocorrenciasNaoAeronauticas',
        label: 'Ocorrências Não Aeronáuticas',
        value: numberFormatter.format(totalOcorrenciasNaoAeronauticas),
        helper: `${meses} meses`,
      },
      {
        id: 'tafRealizados',
        label: 'TAF Realizados',
        value: numberFormatter.format(totalTafRealizados),
        helper: `${meses} meses`,
      },
      {
        id: 'horasTreinamento',
        label: 'Horas de Treinamento',
        value: numberFormatter.format(totalHorasTreinamento),
        helper: `${meses} meses`,
      },
      {
        id: 'tempoResposta',
        label: 'Tempo de Resposta Médio',
        value: formatMinutesToTime(tempoRespostaMedio),
        helper: `${meses} meses`,
      },
      {
        id: 'uniformes',
        label: 'EPIs/Uniformes Entregues',
        value: `${numberFormatter.format(uniformesResumo.epiEntregue + uniformesResumo.uniformeEntregue)}`,
        helper: `${meses} meses`,
      },
    ]

    // 7. Montar objeto DashboardData
    const data: DashboardData = {
      kpis,
      ocorrenciasAeronauticasPorMes,
      ocorrenciasNaoAeronauticasPorMes,
      ptrBaHorasPorMes,
      ptrBaProvasPorMes: Array.from(ptrBaProvasMap.values()),
      atividadesAcessoriasPorMes: Array.from(atividadesMap.values()),
      inspecoesViaturaPorMes: Array.from(inspecoesViaturaMap.values()),
      tafResumo: {
        aprovados,
        reprovados,
        semAvaliacao,
        aprovadosPorMes: Array.from(tafAprovadosMap.values()),
        reprovadosPorMes: Array.from(tafReprovadosMap.values()),
      },
      tempoEprResumo: {
        ideal: tempoEprIdeal,
        toleravel: tempoEprToleravel,
        reprovado: tempoEprReprovado,
        mediaPorMes: tempoEprMediaPorMes,
      },
      tempoEprStatusPorMes,
      tempoRespostaSerie,
      controleAgentesSerie,
      agentesResumo: agentesResumoTotais,
      controleTrocasPorMes: Array.from(controleTrocasMap.values()),
      verificacaoTpsSerie: Array.from(verificacaoTpsMap.values()),
      higienizacaoTpsSerie: Array.from(higienizacaoTpsMap.values()),
      uniformesResumo: {
        ...uniformesResumo,
        series: uniformesSeries,
      },
      ultimaAtualizacao: new Date().toISOString(),
    }

    const endTime = Date.now()
    const duration = endTime - startTime
    
    console.log(`✅ Dashboard metrics computed in ${duration}ms`)

    // 8. Retornar JSON
    return NextResponse.json(data)
  } catch (err) {
    console.error('❌ Erro em /api/dashboard/metrics:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erro ao carregar métricas do dashboard' },
      { status: 500 },
    )
  }
}

