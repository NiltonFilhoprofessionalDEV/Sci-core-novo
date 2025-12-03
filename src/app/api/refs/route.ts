import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const secaoId = url.searchParams.get('secao_id') || undefined

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekhuhyervzndsatdngyl.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVraHVoeWVydnpuZHNhdGRuZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NzE4OTAsImV4cCI6MjA3NjU0Nzg5MH0.DQgnQYEBHjCGUVAxQY6l1OWwqqZcSNUIUviTjDrrI8M'
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