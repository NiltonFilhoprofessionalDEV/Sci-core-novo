import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/dashboard/gerente-secao
 * 
 * Dashboard para Gerente de Seção (visão de uma seção específica)
 * 
 * Query params:
 * - secaoId: string (UUID) - obrigatório
 * 
 * Retorna:
 * - secao: informações da seção
 * - equipes: lista de equipes da seção com estatísticas
 * - estatisticas: métricas agregadas da seção
 * - atividadesRecentes: últimos registros criados na seção
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const secaoId = url.searchParams.get('secaoId')
    
    if (!secaoId) {
      return NextResponse.json(
        { error: 'Parâmetro secaoId é obrigatório' },
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
    
    // Buscar informações da seção
    const { data: secao, error: secaoError } = await client
      .from('secoes')
      .select('id, nome, sigla, descricao')
      .eq('id', secaoId)
      .eq('ativa', true)
      .single()
    
    if (secaoError || !secao) {
      return NextResponse.json(
        { error: 'Seção não encontrada ou inativa' },
        { status: 404 }
      )
    }
    
    // Buscar equipes da seção
    const { data: equipes, error: equipesError } = await client
      .from('equipes')
      .select('id, nome, descricao')
      .eq('secao_id', secaoId)
      .eq('ativa', true)
      .order('nome')
    
    if (equipesError) throw equipesError
    
    // Calcular data de referência (últimos 30 dias)
    const dataReferencia = new Date()
    dataReferencia.setDate(dataReferencia.getDate() - 30)
    const dataReferenciaISO = dataReferencia.toISOString().split('T')[0]
    
    // Definir tabelas de indicadores
    const tabelasIndicadores = [
      { tabela: 'ocorrencias_aeronauticas', campoData: 'data_ocorrencia', nome: 'Ocorrências Aeronáuticas' },
      { tabela: 'ocorrencias_nao_aeronauticas', campoData: 'data_ocorrencia', nome: 'Ocorrências Não Aeronáuticas' },
      { tabela: 'taf_registros', campoData: 'data_teste', nome: 'TAF' },
      { tabela: 'tempo_epr', campoData: 'data_exercicio_epr', nome: 'Tempo EPR' },
      { tabela: 'tempo_resposta', campoData: 'data_tempo_resposta', nome: 'Tempo de Resposta' },
      { tabela: 'controle_agentes_extintores', campoData: 'data_referencia', nome: 'Agentes Extintores' },
      { tabela: 'atividades_acessorias', campoData: 'data_atividade', nome: 'Atividades Acessórias' },
    ]
    
    // Buscar estatísticas por equipe
    const equipesComEstatisticas = await Promise.all(
      (equipes || []).map(async (equipe) => {
        const contadores = await Promise.all(
          tabelasIndicadores.map(async ({ tabela, campoData }) => {
            try {
              const { count } = await client
                .from(tabela)
                .select('*', { count: 'exact', head: true })
                .eq('secao_id', secaoId)
                .eq('equipe_id', equipe.id)
                .gte(campoData, dataReferenciaISO)
              
              return count || 0
            } catch {
              return 0
            }
          })
        )
        
        const totalRegistros = contadores.reduce((acc, count) => acc + count, 0)
        const indicadoresPreenchidos = contadores.filter(c => c > 0).length
        
        return {
          equipeId: equipe.id,
          equipeNome: equipe.nome,
          equipeDescricao: equipe.descricao,
          totalRegistros,
          indicadoresPreenchidos,
          totalIndicadores: tabelasIndicadores.length,
        }
      })
    )
    
    // Buscar atividades recentes da seção (últimos 10 registros)
    const { data: atividadesRecentes } = await client
      .from('atividades_acessorias')
      .select('id, descricao, data_atividade, created_at')
      .eq('secao_id', secaoId)
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Calcular estatísticas gerais da seção
    const totalRegistrosSecao = equipesComEstatisticas.reduce((acc, e) => acc + e.totalRegistros, 0)
    const mediaIndicadoresPorEquipe = Math.round(
      equipesComEstatisticas.reduce((acc, e) => acc + e.indicadoresPreenchidos, 0) / (equipesComEstatisticas.length || 1)
    )
    
    return NextResponse.json(
      {
        secao: {
          id: secao.id,
          nome: secao.nome,
          sigla: secao.sigla,
          descricao: secao.descricao,
        },
        equipes: equipesComEstatisticas,
        estatisticas: {
          totalRegistros: totalRegistrosSecao,
          totalEquipes: equipes?.length || 0,
          totalIndicadores: tabelasIndicadores.length,
          mediaIndicadoresPorEquipe,
          periodo: {
            dataInicio: dataReferenciaISO,
            dataFim: new Date().toISOString().split('T')[0],
          },
        },
        atividadesRecentes: atividadesRecentes || [],
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error) {
    console.error('Erro ao buscar dashboard gerente seção:', error)
    return NextResponse.json(
      {
        error: 'Erro interno ao buscar dashboard',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

