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

export async function POST(request: NextRequest) {
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
    const { email, password, nome_completo, perfil, secao_id, equipe_id } = body

    // Validações
    if (!email || !password || !nome_completo || !perfil) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Validar que ba_ce (chefe de equipe) deve ter seção e equipe
    if ((perfil === 'chefe_equipe' || perfil === 'ba_ce') && (!secao_id || !equipe_id)) {
      return NextResponse.json(
        { error: 'Chefe de equipe (BA-CE) deve ter seção e equipe' },
        { status: 400 }
      )
    }

    // Verificar se o email já existe no auth
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingAuthUser?.users?.find(u => u.email === email)
    
    let authData: any
    let userId: string
    
    if (userExists) {
      // Usuário já existe no auth, usar o ID existente
      console.log('⚠️ Usuário já existe no auth, usando ID existente:', userExists.id)
      userId = userExists.id
      
      // Atualizar senha se fornecida
      if (password) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { password }
        )
        if (updateError) {
          console.error('Erro ao atualizar senha:', updateError)
        }
      }
    } else {
      // Criar novo usuário no auth
      const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          nome_completo,
          perfil
        }
      })

      if (authError) {
        console.error('Erro ao criar usuário no auth:', authError)
        return NextResponse.json(
          { error: authError.message || 'Erro ao criar usuário' },
          { status: 400 }
        )
      }

      if (!newAuthData.user) {
        return NextResponse.json(
          { error: 'Usuário não foi criado' },
          { status: 500 }
        )
      }
      
      authData = newAuthData
      userId = newAuthData.user.id
    }

    // Verificar se o perfil já existe
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, perfil, ativo, secao_id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      // Perfil já existe, atualizar ao invés de criar
      console.log('⚠️ Perfil já existe, atualizando...', existingProfile)
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          nome_completo,
          perfil,
          secao_id: secao_id || null,
          equipe_id: equipe_id || null,
          ativo: true
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Erro ao atualizar perfil existente:', updateError)
        return NextResponse.json(
          { error: updateError.message || 'Erro ao atualizar perfil' },
          { status: 400 }
        )
      }
    } else {
      // Criar novo perfil
      console.log('📝 Criando novo perfil com dados:', {
        id: userId,
        email,
        nome_completo,
        perfil,
        secao_id,
        equipe_id
      })
      
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          nome_completo,
          perfil,
          secao_id: secao_id || null,
          equipe_id: equipe_id || null,
          ativo: true
        })

      if (profileError) {
        // Se falhar ao criar perfil, verificar se é erro de duplicata
        if (profileError.code === '23505') {
          // Perfil já existe (race condition), tentar atualizar
          console.log('⚠️ Perfil já existe (race condition), atualizando...')
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              email,
              nome_completo,
              perfil,
              secao_id: secao_id || null,
              equipe_id: equipe_id || null,
              ativo: true
            })
            .eq('id', userId)

          if (updateError) {
            console.error('Erro ao atualizar perfil após race condition:', updateError)
            return NextResponse.json(
              { error: 'Erro ao criar/atualizar perfil. O usuário pode já existir.' },
              { status: 400 }
            )
          }
        } else {
          // Outro erro, tentar deletar o usuário criado apenas se foi criado agora
          if (!userExists && authData?.user) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          }
          console.error('Erro ao criar perfil:', profileError)
          return NextResponse.json(
            { error: profileError.message || 'Erro ao criar perfil' },
            { status: 400 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: email
      }
    })
  } catch (error: any) {
    console.error('❌ Erro na API de criação de usuário:', error)
    console.error('❌ Stack:', error.stack)
    console.error('❌ Tipo do erro:', error.constructor.name)
    
    // Retornar mensagem de erro mais detalhada em desenvolvimento
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Erro interno do servidor'
      : 'Erro interno do servidor. Tente novamente mais tarde.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

