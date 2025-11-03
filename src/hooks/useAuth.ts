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
        try {
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', authUser.id)
        } catch (error) {
          console.warn('⚠️ useAuth - Erro ao atualizar last_login:', error)
        }
      }
    } else {
      console.log('🚪 useAuth - Usuário deslogado, limpando dados')
      setUser(null)
      setProfile(null)
    }
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isInitialized = false
    let isMounted = true

    const initializeAuth = async () => {
      if (isInitialized || !isMounted) return
      isInitialized = true
      
      try {
        console.log('🔄 useAuth - Inicializando autenticação...')
        setError(null)
        
        // Timeout reduzido para 8 segundos
        timeoutId = setTimeout(() => {
          if (!isMounted) return
          console.error('⏰ useAuth - Timeout na inicialização da autenticação')
          setError('Timeout na conexão. Verifique sua conexão com a internet.')
          setLoading(false)
        }, 8000)

        // Obter sessão inicial com timeout próprio
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        })

        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any
        
        if (!isMounted) return

        if (sessionError) {
          console.error('❌ useAuth - Erro ao obter sessão:', sessionError)
          setError('Erro ao conectar com o servidor de autenticação.')
          setLoading(false)
          return
        }

        console.log('✅ useAuth - Sessão obtida:', { hasSession: !!session, userId: session?.user?.id })
        
        setSession(session)
        await updateUserData(session?.user ?? null)
        
        if (timeoutId) clearTimeout(timeoutId)
        if (isMounted) setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error('❌ useAuth - Erro na inicialização:', error)
        
        // Se for timeout, não mostrar como erro crítico
        if (error instanceof Error && error.message === 'Session timeout') {
          console.log('⚠️ useAuth - Timeout na sessão, continuando sem autenticação')
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          setError('Erro inesperado na inicialização.')
        }
        
        if (timeoutId) clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    initializeAuth()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      
      try {
        console.log('🔄 useAuth - Mudança de estado de autenticação:', _event)
        
        // Evita processamento desnecessário se a sessão não mudou
        if (_event === 'TOKEN_REFRESHED') {
          setSession(session)
          return
        }
        
        setSession(session)
        await updateUserData(session?.user ?? null)
        if (isMounted) setLoading(false)
      } catch (error) {
        if (!isMounted) return
        console.error('❌ useAuth - Erro na mudança de estado:', error)
        setError('Erro ao processar mudança de autenticação.')
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, remember: boolean = false) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      setRememberMe(remember)
      return { data, error: null }
    } catch (error) {
      console.error('❌ useAuth - Erro no login:', error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // Tentar fazer logout no Supabase
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('⚠️ useAuth - Erro no logout remoto:', error)
        // Não lançar erro, apenas avisar
      }
    } catch (error) {
      console.warn('⚠️ useAuth - Falha na conexão durante logout:', error)
      // Não lançar erro, continuar com limpeza local
    } finally {
      // Sempre limpar estado local, independente do resultado remoto
      setUser(null)
      setProfile(null)
      setSession(null)
      setRememberMe(false)
      setError(null)
      setLoading(false)
      
      console.log('✅ useAuth - Estado local limpo após logout')
    }
    
    return { error: null }
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