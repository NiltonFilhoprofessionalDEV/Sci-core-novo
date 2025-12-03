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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhuhyervzndsatdngyl.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'
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