import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/dashboard/gestor-pop
 * 
 * Dashboard para Gestor POP (visão geral de todas as seções)
 * 
 * Retorna:
 * - totalSecoes: número total de seções ativas
 * - totalEquipes: número total de equipes ativas
 * - indicadoresPorSecao: estatísticas de preenchimento por seção
 * - estatisticasGerais: métricas agregadas do sistema
 * - ultimasAtualizacoes: últimas atividades de cada seção
 */
export async function GET(req: NextRequest) {
  try {
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
    
    // Buscar todas as seções ativas
    const { data: secoes, error: secoesError } = await client
      .from('secoes')
      .select('id, nome, sigla')
      .eq('ativa', true)
      .order('nome')
    
    if (secoesError) throw secoesError
    
    // Buscar todas as equipes ativas
    const { data: equipes, error: equipesError } = await client
      .from('equipes')
      .select('id, nome, secao_id')
      .eq('ativa', true)
      .order('nome')
    
    if (equipesError) throw equipesError
    
    // Calcular data de referência (últimos 30 dias)
    const dataReferencia = new Date()
    dataReferencia.setDate(dataReferencia.getDate() - 30)
    const dataReferenciaISO = dataReferencia.toISOString().split('T')[0]
    
    // Definir tabelas de indicadores para contagem
    const tabelasIndicadores = [
      'ocorrencias_aeronauticas',
      'ocorrencias_nao_aeronauticas',
      'taf_registros',
      'tempo_epr',
      'tempo_resposta',
      'ptr_ba_horas_treinamento',
      'ptr_ba_provas_teoricas',
      'controle_agentes_extintores',
      'controle_uniformes_recebidos',
      'controle_trocas',
      'verificacao_tps',
      'higienizacao_tps',
      'atividades_acessorias',
      'inspecoes_viatura',
    ]
    
    // Buscar estatísticas por seção
    const indicadoresPorSecao = await Promise.all(
      (secoes || []).map(async (secao) => {
        // Contar registros por tabela para esta seção nos últimos 30 dias
        const contadores = await Promise.all(
          tabelasIndicadores.map(async (tabela) => {
            try {
              // Determinar campo de data baseado na tabela
              let campoData = 'created_at'
              if (tabela.includes('ocorrencia')) campoData = 'data_ocorrencia'
              else if (tabela === 'taf_registros') campoData = 'data_teste'
              else if (tabela === 'tempo_epr') campoData = 'data_exercicio_epr'
              else if (tabela === 'tempo_resposta') campoData = 'data_tempo_resposta'
              else if (tabela.includes('ptr_ba')) campoData = tabela.includes('horas') ? 'data_ptr_ba' : 'data_prova'
              else if (tabela.includes('controle') || tabela.includes('tps')) campoData = 'data_referencia'
              else if (tabela === 'atividades_acessorias') campoData = 'data_atividade'
              else if (tabela === 'inspecoes_viatura') campoData = 'data'
              
              const { count } = await client
                .from(tabela)
                .select('*', { count: 'exact', head: true })
                .eq('secao_id', secao.id)
                .gte(campoData, dataReferenciaISO)
              
              return count || 0
            } catch {
              return 0
            }
          })
        )
        
        const totalRegistros = contadores.reduce((acc, count) => acc + count, 0)
        const indicadoresPreenchidos = contadores.filter(c => c > 0).length
        const taxaConclusao = Math.round((indicadoresPreenchidos / tabelasIndicadores.length) * 100)
        
        // Buscar última atualização
        const { data: ultimaAtualizacao } = await client
          .from('ocorrencias_aeronauticas')
          .select('data_ocorrencia')
          .eq('secao_id', secao.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        return {
          secaoId: secao.id,
          secaoNome: secao.nome,
          secaoSigla: secao.sigla,
          totalRegistros,
          indicadoresPreenchidos,
          totalIndicadores: tabelasIndicadores.length,
          taxaConclusao,
          ultimaAtualizacao: ultimaAtualizacao?.data_ocorrencia || null,
        }
      })
    )
    
    // Calcular estatísticas gerais
    const totalRegistros = indicadoresPorSecao.reduce((acc, s) => acc + s.totalRegistros, 0)
    const taxaConclusaoMedia = Math.round(
      indicadoresPorSecao.reduce((acc, s) => acc + s.taxaConclusao, 0) / (indicadoresPorSecao.length || 1)
    )
    
    return NextResponse.json(
      {
        totalSecoes: secoes?.length || 0,
        totalEquipes: equipes?.length || 0,
        totalIndicadores: tabelasIndicadores.length,
        indicadoresPorSecao,
        estatisticasGerais: {
          totalRegistros,
          taxaConclusaoMedia,
          periodo: {
            dataInicio: dataReferenciaISO,
            dataFim: new Date().toISOString().split('T')[0],
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
    console.error('Erro ao buscar dashboard gestor POP:', error)
    return NextResponse.json(
      {
        error: 'Erro interno ao buscar dashboard',
        message: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

