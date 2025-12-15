import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Perfis autorizados a criar/editar usuários
const ALLOWED_PROFILES = ['gestor_pop', 'gerente_secao'] as const
type AllowedPerfil = (typeof ALLOWED_PROFILES)[number]

// Client público só para validar token / ler perfil
function getSupabaseAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Variáveis de ambiente do Supabase (públicas) não configuradas')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Client admin (service role) – CUIDADO: ignora RLS, só usar após checar permissão
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Variáveis de ambiente do Supabase (service role) não configuradas')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // 1) Autenticação obrigatória via Bearer token
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '').trim()
    if (!accessToken) {
      return NextResponse.json({ error: 'Token de acesso inválido' }, { status: 401 })
    }

    // 2) Validar usuário + perfil com client público
    const supabaseAuth = getSupabaseAuthClient()

    const {
      data: { user },
      error: userError,
    } = await supabaseAuth.auth.getUser(accessToken)

    if (userError || !user) {
      return NextResponse.json({ error: 'Token inválido ou sessão expirada' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAuth
      .from('profiles')
      .select('id, perfil')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Perfil do usuário autenticado não encontrado' },
        { status: 403 },
      )
    }

    const isAllowed = ALLOWED_PROFILES.includes(profile.perfil as AllowedPerfil)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Usuário autenticado não possui permissão para criar usuários' },
        { status: 403 },
      )
    }

    // 3) Autorizado: usar client admin com service role
    const supabaseAdmin = getSupabaseAdmin()

    const body = await request.json()
    const { email, password, nome_completo, perfil: perfilNovo, secao_id, equipe_id } = body

    // Validações de entrada (mantidas da versão original)
    if (!email || !password || !nome_completo || !perfilNovo) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Validar que ba_ce (chefe de equipe) deve ter seção e equipe
    if ((perfilNovo === 'chefe_equipe' || perfilNovo === 'ba_ce') && (!secao_id || !equipe_id)) {
      return NextResponse.json(
        { error: 'Chefe de equipe (BA-CE) deve ter seção e equipe' },
        { status: 400 }
      )
    }

    // === A partir daqui é basicamente a lógica original (ajustada para usar supabaseAdmin) ===

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
          perfil: perfilNovo
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
      // Atualizar perfil existente
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email,
          nome_completo,
          perfil: perfilNovo,
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
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email,
          nome_completo,
          perfil: perfilNovo,
          secao_id: secao_id || null,
          equipe_id: equipe_id || null,
          ativo: true
        })

      if (profileError) {
        // Se falhar ao criar perfil, verificar se é erro de duplicata
        if (profileError.code === '23505') {
          // Duplicata – tentar atualizar
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              email,
              nome_completo,
              perfil: perfilNovo,
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
          // Outro erro – se criou o usuário agora, tenta deletar
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
        email
      }
    })
  } catch (error: any) {
    console.error('❌ Erro na API de criação de usuário:', error)
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Erro interno do servidor'
      : 'Erro interno do servidor. Tente novamente mais tarde.'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

