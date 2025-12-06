import { NextResponse } from 'next/server'
import { z } from 'zod'
import { withQueryTimeout, executeWithRetry } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const payloadSchema = z.object({
  table: z.string().min(1),
  records: z.array(z.record(z.any())).min(1).max(100),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = payloadSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Payload inválido', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { table, records } = parsed.data

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const authorization = req.headers.get('authorization') || ''
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: authorization ? { Authorization: authorization } : {} },
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

    return NextResponse.json({ inserted: result.data?.length ?? 0, data: result.data ?? [] }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: 'Falha ao processar requisição' }, { status: 500 })
  }
}