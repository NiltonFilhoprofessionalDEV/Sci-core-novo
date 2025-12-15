import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Definição de todos os temas com suas respectivas tabelas e campos de data
const TEMAS = [
  { id: 'ocorrencias-aeronauticas', tabela: 'ocorrencias_aeronauticas', campoData: 'data_ocorrencia' },
  { id: 'ocorrencias-nao-aeronauticas', tabela: 'ocorrencias_nao_aeronauticas', campoData: 'data_ocorrencia' },
  { id: 'taf', tabela: 'taf_registros', campoData: 'data_teste' },
  { id: 'tempo-epr', tabela: 'tempo_epr', campoData: 'data_exercicio_epr' },
  { id: 'tempo-resposta', tabela: 'tempo_resposta', campoData: 'data_tempo_resposta' },
  { id: 'ptr-ba-horas-treinamento', tabela: 'ptr_ba_horas_treinamento', campoData: 'data_ptr_ba' },
  { id: 'ptr-ba-prova-teorica', tabela: 'ptr_ba_provas_teoricas', campoData: 'data_prova' },
  { id: 'controle-agentes-extintores', tabela: 'controle_agentes_extintores', campoData: 'data_referencia' },
  { id: 'controle-uniformes-recebidos', tabela: 'controle_uniformes_recebidos', campoData: 'data_referencia' },
  { id: 'controle-trocas', tabela: 'controle_trocas', campoData: 'data_referencia' },
  { id: 'verificacao-tps', tabela: 'verificacao_tps', campoData: 'data_referencia' },
  { id: 'higienizacao-tps', tabela: 'higienizacao_tps', campoData: 'data_referencia' },
  { id: 'atividades-acessorias', tabela: 'atividades_acessorias', campoData: 'data_atividade' },
  { id: 'inspecoes-viaturas', tabela: 'inspecoes_viatura', campoData: 'data' },
] as const

/**
 * GET /api/historico/contadores
 * 
 * Retorna contadores de registros para todos os temas de histórico
 * Substitui 15+ queries paralelas do cliente por 1 único request
 * 
 * Query params:
 * - mesReferencia: string (formato YYYY-MM) - obrigatório
 * - secaoId: string (UUID) - opcional, filtra por seção
 * 
 * Retorna:
 * - contadores: array de { tema: string, count: number }
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const mesReferencia = url.searchParams.get('mesReferencia')
    const secaoId = url.searchParams.get('secaoId')
    
    // Validação de parâmetros
    if (!mesReferencia) {
      return NextResponse.json(
        { error: 'Parâmetro mesReferencia é obrigatório (formato: YYYY-MM)' },
        { status: 400 }
      )
    }
    
    // Validar formato do mês
    const mesRegex = /^\d{4}-\d{2}$/
    if (!mesRegex.test(mesReferencia)) {
      return NextResponse.json(
        { error: 'Formato inválido para mesReferencia. Use YYYY-MM' },
        { status: 400 }
      )
    }
    
    // Configurar cliente Supabase com token do usuário
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
    
    // Calcular início e fim do mês
    const [ano, mes] = mesReferencia.split('-').map(Number)
    const inicioMes = new Date(ano, mes - 1, 1)
    const fimMes = new Date(ano, mes, 0, 23, 59, 59)
    
    const inicioMesISO = inicioMes.toISOString().split('T')[0]
    const fimMesISO = fimMes.toISOString().split('T')[0]
    
    // Executar todas as queries em paralelo no servidor
    const contadores = await Promise.all(
      TEMAS.map(async (tema) => {
        try {
          let query = client
            .from(tema.tabela)
            .select('*', { count: 'exact', head: true })
            .gte(tema.campoData, inicioMesISO)
            .lte(tema.campoData, fimMesISO)
          
          // Aplicar filtro de seção se fornecido
          if (secaoId && secaoId !== 'todas') {
            query = query.eq('secao_id', secaoId)
          }
          
          const { count, error } = await query
          
          if (error) {
            console.error(`Erro ao contar ${tema.id}:`, error)
            return { tema: tema.id, count: 0 }
          }
          
          return { tema: tema.id, count: count || 0 }
        } catch (error) {
          console.error(`Exceção ao contar ${tema.id}:`, error)
          return { tema: tema.id, count: 0 }
        }
      })
    )
    
    // Retornar contadores
    return NextResponse.json(
      { 
        contadores,
        metadata: {
          mesReferencia,
          secaoId: secaoId || 'todas',
          periodo: {
            inicio: inicioMesISO,
            fim: fimMesISO
          }
        }
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    )
    
  } catch (error) {
    console.error('Erro ao buscar contadores de histórico:', error)
    return NextResponse.json(
      { 
        error: 'Erro interno ao buscar contadores',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

