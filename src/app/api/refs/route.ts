import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const secaoId = url.searchParams.get('secao_id') || undefined

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

    const secoesQuery = client.from('secoes').select('id, nome').order('nome')
    const equipesQuery = client
      .from('equipes')
      .select('id, nome, secao_id, ativa')
      .eq('ativa', true)
      .order('nome')

    const [secoesRes, equipesRes] = await Promise.all([secoesQuery, secaoId ? equipesQuery.eq('secao_id', secaoId) : equipesQuery])

    if (secoesRes.error) return NextResponse.json({ error: secoesRes.error.message }, { status: 403 })
    if (equipesRes.error) return NextResponse.json({ error: equipesRes.error.message }, { status: 403 })

    return NextResponse.json({ secoes: secoesRes.data || [], equipes: equipesRes.data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Falha ao listar referências' }, { status: 500 })
  }
}