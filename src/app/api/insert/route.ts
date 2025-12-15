import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withQueryTimeout, executeWithRetry } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const payloadSchema = z.object({
  table: z.string().min(1),
  records: z.array(z.record(z.any())).min(1).max(100),
})

// Tabelas permitidas para inserção genérica
const ALLOWED_TABLES = [
  'ocorrencias_aeronauticas',
  'ocorrencias_nao_aeronauticas',
  'taf_registros',
  'taf_resultados',
  'tempo_resposta',
  'ptr_ba_horas_treinamento',
  'controle_agentes_extintores',
  'controle_uniformes_recebidos',
  'atividades_acessorias',
  'ptr_ba_provas_teoricas',
  'tempo_epr',
  'controle_trocas',
  'verificacao_tps',
  'higienizacao_tps',
  'inspecoes_viatura',
] as const

type AllowedTable = (typeof ALLOWED_TABLES)[number]

export async function POST(req: Request) {
  try {
    // 1) Exigir autenticação via Bearer token
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const json = await req.json()
    const parsed = payloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { table, records } = parsed.data

    // 2) Verificar se a tabela é permitida
    if (!ALLOWED_TABLES.includes(table as AllowedTable)) {
      return NextResponse.json(
        { error: 'Tabela não permitida para inserção via esta API' },
        { status: 400 }
      )
    }

    // 3) Criar client Supabase com o token do usuário (RLS ativo)
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const result = await executeWithRetry(async () => {
      return withQueryTimeout(
        client.from(table).insert(records).select(),
        10000
      )
    }, `Insert em ${table}`)

    if (result.error) {
      const message = String(result.error?.message || 'Erro ao inserir dados')
      const status = /row-level security/i.test(message) ? 403 : 500
      return NextResponse.json({ error: message }, { status })
    }

    return NextResponse.json(
      { inserted: result.data?.length ?? 0, data: result.data ?? [] },
      { status: 200 }
    )
  } catch (err) {
    console.error('❌ Erro na API /api/insert:', err)
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 500 })
  }
}