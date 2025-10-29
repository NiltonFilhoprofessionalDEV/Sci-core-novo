import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useLocalStorage } from './useLocalStorage'
import { UserProfile, AuthUser } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useLocalStorage('rememberMe', false)

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 useAuth - Buscando perfil para userId:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          secao:secoes(*),
          equipe:equipes(*)
        `)
        .eq('id', userId)
        .eq('ativo', true)
        .single()

      if (error) {
        console.error('❌ useAuth - Erro ao buscar perfil:', error)
        return null
      }

      console.log('✅ useAuth - Perfil encontrado:', {
        profile: data,
        hasSecao: !!data?.secao,
        secaoNome: data?.secao?.nome,
        secaoId: data?.secao?.id
      })

      return data
    } catch (error) {
      console.error('❌ useAuth - Erro ao buscar perfil:', error)
      return null
    }
  }

  // Função para atualizar dados do usuário
  const updateUserData = async (authUser: User | null) => {
    console.log('🔄 useAuth - Atualizando dados do usuário:', { authUser: authUser?.id })
    
    if (authUser) {
      const userProfile = await fetchUserProfile(authUser.id)
      
      console.log('👤 useAuth - Criando objeto AuthUser:', {
        userId: authUser.id,
        email: authUser.email,
        profileExists: !!userProfile,
        profileSecao: userProfile?.secao
      })
      
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        profile: userProfile
      })
      setProfile(userProfile)

      // Atualizar last_login se perfil existe
      if (userProfile) {
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', authUser.id)
      }
    } else {
      console.log('🚪 useAuth - Usuário deslogado, limpando dados')
      setUser(null)
      setProfile(null)
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const initializeAuth = async () => {
      try {
        console.log('🔄 useAuth - Inicializando autenticação...')
        setError(null)
        
        // Timeout de segurança para evitar loading infinito
        timeoutId = setTimeout(() => {
          console.error('⏰ useAuth - Timeout na inicialização da autenticação')
          setError('Timeout na conexão. Verifique sua conexão com a internet.')
          setLoading(false)
        }, 15000) // 15 segundos

        // Obter sessão inicial
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('❌ useAuth - Erro ao obter sessão:', sessionError)
          setError('Erro ao conectar com o servidor de autenticação.')
          setLoading(false)
          return
        }

        console.log('✅ useAuth - Sessão obtida:', { hasSession: !!session, userId: session?.user?.id })
        
        setSession(session)
        await updateUserData(session?.user ?? null)
        
        clearTimeout(timeoutId)
        setLoading(false)
      } catch (error) {
        console.error('❌ useAuth - Erro na inicialização:', error)
        setError('Erro inesperado na inicialização.')
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        console.log('🔄 useAuth - Mudança de estado de autenticação:', _event)
        setSession(session)
        await updateUserData(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('❌ useAuth - Erro na mudança de estado:', error)
        setError('Erro ao processar mudança de autenticação.')
        setLoading(false)
      }
    })

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, remember: boolean = false) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      setRememberMe(remember)
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setRememberMe(false)
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signUp = async (email: string, password: string, userData: {
    nome_completo: string
    perfil: 'gestor_pop' | 'gerente_secao' | 'ba_ce' | 'chefe_equipe'
    secao_id?: string
    equipe_id?: string
  }) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome_completo: userData.nome_completo,
            perfil: userData.perfil,
            secao_id: userData.secao_id,
            equipe_id: userData.equipe_id,
          }
        }
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (session?.user) {
      await updateUserData(session.user)
    }
  }

  return {
    user,
    profile,
    session,
    loading,
    error,
    rememberMe,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  }
}