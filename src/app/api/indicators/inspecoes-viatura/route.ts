import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const secaoId = searchParams.get('secaoId')
    const equipeId = searchParams.get('equipeId')
    const dataInicio = searchParams.get('dataInicio')
    const dataFim = searchParams.get('dataFim')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const authHeader = req.headers.get('authorization') || ''
    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: authHeader ? { headers: { Authorization: authHeader } } : {},
    })
    
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    let query = client
      .from('inspecoes_viatura')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('data', { ascending: false })
    
    if (secaoId && secaoId !== 'todas') query = query.eq('secao_id', secaoId)
    if (equipeId) query = query.eq('equipe_id', equipeId)
    if (dataInicio) query = query.gte('data', dataInicio)
    if (dataFim) query = query.lte('data', dataFim)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Erro ao buscar Inspeções Viatura:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar dados', message: error instanceof Error ? error.message : 'Erro desconhecido' },
      { status: 500 }
    )
  }
}

