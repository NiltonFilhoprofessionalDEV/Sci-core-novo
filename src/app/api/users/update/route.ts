import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente Supabase com service role key para operações admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function PUT(request: NextRequest) {
  try {
    // Verificar variáveis de ambiente
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurado')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta: NEXT_PUBLIC_SUPABASE_URL' },
        { status: 500 }
      )
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurado')
      return NextResponse.json(
        { error: 'Configuração do servidor incompleta: SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { user_id, nome_completo, email, equipe_id, password } = body

    // Validações
    if (!user_id) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Atualizar usuário no auth
    const updateData: any = {
      user_metadata: {
        nome_completo: nome_completo || undefined
      }
    }

    if (password) {
      updateData.password = password
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      updateData
    )

    if (authError) {
      console.error('Erro ao atualizar usuário no auth:', authError)
      return NextResponse.json(
        { error: authError.message || 'Erro ao atualizar usuário' },
        { status: 400 }
      )
    }

    // Atualizar perfil na tabela profiles
    const profileUpdate: any = {}
    if (nome_completo) profileUpdate.nome_completo = nome_completo
    if (email) profileUpdate.email = email
    if (equipe_id !== undefined) profileUpdate.equipe_id = equipe_id || null

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user_id)

    if (profileError) {
      console.error('Erro ao atualizar perfil:', profileError)
      return NextResponse.json(
        { error: profileError.message || 'Erro ao atualizar perfil' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    })
  } catch (error: any) {
    console.error('❌ Erro na API de atualização de usuário:', error)
    console.error('❌ Stack:', error.stack)
    console.error('❌ Tipo do erro:', error.constructor.name)
    
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Erro interno do servidor'
      : 'Erro interno do servidor. Tente novamente mais tarde.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

