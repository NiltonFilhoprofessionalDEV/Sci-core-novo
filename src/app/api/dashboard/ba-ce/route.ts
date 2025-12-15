import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/dashboard/ba-ce
 * 
 * Dashboard para BA/CE (visão de equipe específica)
 * 
 * Query params:
 * - equipeId: string (UUID) - obrigatório
 * 
 * Retorna:
 * - equipe: informações da equipe
 * - secao: informações da seção
 * - indicadoresPendentes: indicadores que precisam ser preenchidos
 * - indicadoresRecentes: últimos indicadores preenchidos
 * - estatisticas: métricas da equipe
 * - membros: membros da equipe (se disponível)
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const equipeId = url.searchParams.get('equipeId')
    
    if (!equipeId) {
      return NextResponse.json(
        { error: 'Parâmetro equipeId é obrigatório' },
        { status: 400 }
      )
    }
    
    // Configurar cliente Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Configuração do Supabase não encontrada' },
        { status: 500 }
      )
    }
    
    const authHeader = req.headers.get('authorization') || ''
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: authHeader ? { headers: { Authorization: authHeader } } : {},
    })
    
    // Buscar informações da equipe
    const { data: equipe, error: equipeError } = await client
      .from('equipes')
      .select('id, nome, descricao, secao_id')
      .eq('id', equipeId)
      .eq('ativa', true)
      .single()
    
    if (equipeError || !equipe) {
      return NextResponse.json(
        { error: 'Equipe não encontrada ou inativa' },
        { status: 404 }
      )
    }
    
    // Buscar informações da seção
    const { data: secao } = await client
      .from('secoes')
      .select('id, nome, sigla')
      .eq('id', equipe.secao_id)
      .single()
    
    // Calcular data de referência (últimos 30 dias e mês atual)
    const dataAtual = new Date()
    const dataReferencia = new Date()
    dataReferencia.setDate(dataReferencia.getDate() - 30)
    const dataReferenciaISO = dataReferencia.toISOString().split('T')[0]
    
    // Primeiro dia do mês atual
    const primeiroDiaMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1)
    const primeiroDiaMesISO = primeiroDiaMes.toISOString().split('T')[0]
    
    // Definir indicadores
    const indicadores = [
      { 
        id: 'ocorrencias-aeronauticas', 
        nome: 'Ocorrências Aeronáuticas',
        tabela: 'ocorrencias_aeronauticas', 
        campoData: 'data_ocorrencia' 
      },
      { 
        id: 'ocorrencias-nao-aeronauticas', 
        nome: 'Ocorrências Não Aeronáuticas',
        tabela: 'ocorrencias_nao_aeronauticas', 
        campoData: 'data_ocorrencia' 
      },
      { 
        id: 'taf', 
        nome: 'TAF',
        tabela: 'taf_registros', 
        campoData: 'data_teste' 
      },
      { 
        id: 'tempo-epr', 
        nome: 'Tempo EPR',
        tabela: 'tempo_epr', 
        campoData: 'data_exercicio_epr' 
      },
      { 
        id: 'tempo-resposta', 
        nome: 'Tempo de Resposta',
        tabela: 'tempo_resposta', 
        campoData: 'data_tempo_resposta' 
      },
      { 
        id: 'controle-agentes', 
        nome: 'Controle de Agentes Extintores',
        tabela: 'controle_agentes_extintores', 
        campoData: 'data_referencia' 
      },
      { 
        id: 'controle-uniformes', 
        nome: 'Controle de Uniformes',
        tabela: 'controle_uniformes_recebidos', 
        campoData: 'data_referencia' 
      },
      { 
        id: 'atividades-acessorias', 
        nome: 'Atividades Acessórias',
        tabela: 'atividades_acessorias', 
        campoData: 'data_atividade' 
      },
    ]
    
    // Verificar quais indicadores foram preenchidos no mês atual
    const statusIndicadores = await Promise.all(
      indicadores.map(async (indicador) => {
        try {
          // Contar registros no mês atual
          const { count } = await client
            .from(indicador.tabela)
            .select('*', { count: 'exact', head: true })
            .eq('secao_id', equipe.secao_id)
            .eq('equipe_id', equipeId)
            .gte(indicador.campoData, primeiroDiaMesISO)
          
          // Buscar último registro (para indicadores recentes)
          const { data: ultimoRegistro } = await client
            .from(indicador.tabela)
            .select('created_at, ' + indicador.campoData)
            .eq('secao_id', equipe.secao_id)
            .eq('equipe_id', equipeId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()
          
          return {
            id: indicador.id,
            nome: indicador.nome,
            preenchido: (count || 0) > 0,
            totalRegistrosMes: count || 0,
            ultimoRegistro: ultimoRegistro?.created_at || null,
            ultimaData: ultimoRegistro?.[indicador.campoData] || null,
          }
        } catch {
          return {
            id: indicador.id,
            nome: indicador.nome,
            preenchido: false,
            totalRegistrosMes: 0,
            ultimoRegistro: null,
            ultimaData: null,
          }
        }
      })
    )
    
    // Separar indicadores pendentes e recentes
    const indicadoresPendentes = statusIndicadores
      .filter(ind => !ind.preenchido)
      .map(ind => ({
        id: ind.id,
        nome: ind.nome,
      }))
    
    const indicadoresRecentes = statusIndicadores
      .filter(ind => ind.preenchido && ind.ultimoRegistro)
      .sort((a, b) => {
        const dateA = new Date(a.ultimoRegistro!).getTime()
        const dateB = new Date(b.ultimoRegistro!).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
      .map(ind => ({
        id: ind.id,
        nome: ind.nome,
        totalRegistros: ind.totalRegistrosMes,
        ultimoRegistro: ind.ultimoRegistro,
        ultimaData: ind.ultimaData,
      }))
    
    // Calcular estatísticas
    const totalIndicadores = indicadores.length
    const indicadoresPreenchidos = statusIndicadores.filter(ind => ind.preenchido).length
    const taxaConclusao = Math.round((indicadoresPreenchidos / totalIndicadores) * 100)
    const totalRegistrosMes = statusIndicadores.reduce((acc, ind) => acc + ind.totalRegistrosMes, 0)
    
    return NextResponse.json(
      {
        equipe: {
          id: equipe.id,
          nome: equipe.nome,
          descricao: equipe.descricao,
        },
        secao: secao || null,
        indicadoresPendentes,
        indicadoresRecentes,
        estatisticas: {
          totalIndicadores,
          indicadoresPreenchidos,
          indicadoresPendentes: indicadoresPendentes.length,
          taxaConclusao,
          totalRegistrosMes,
          periodo: {
            mesAtual: primeiroDiaMesISO,
            dataReferencia: dataReferenciaISO,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Erro ao buscar dashboard BA-CE:', error)
    return NextResponse.json(
      {
        error: 'Erro interno ao buscar dashboard',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

