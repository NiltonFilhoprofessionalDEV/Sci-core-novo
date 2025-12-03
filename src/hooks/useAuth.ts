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

  // Função para buscar perfil do usuário com timeout
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('🔍 useAuth - Buscando perfil para userId:', userId)
      
      // Adicionar timeout de 8 segundos para busca de perfil
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      try {
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
          .abortSignal(controller.signal)

        clearTimeout(timeoutId)

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
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout')) {
          console.warn('⚠️ useAuth - Timeout ao buscar perfil, continuando sem perfil')
          return null
        }
        throw fetchError
      }
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

      // Atualizar last_login se perfil existe (com timeout)
      if (userProfile) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          
          await supabase
            .from('profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', authUser.id)
            .abortSignal(controller.signal)
          
          clearTimeout(timeoutId)
        } catch (error: any) {
          // Ignorar erros de timeout silenciosamente
          if (error.name !== 'AbortError' && !error.message?.includes('timeout')) {
            console.warn('⚠️ useAuth - Erro ao atualizar last_login:', error)
          }
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
    let sessionTimeoutId: NodeJS.Timeout | null = null
    let isInitialized = false
    let isMounted = true

    const initializeAuth = async () => {
      if (isInitialized || !isMounted) return
      isInitialized = true
      
      try {
        console.log('🔄 useAuth - Inicializando autenticação...')
        setError(null)
        
        // Timeout geral de 8 segundos para melhor responsividade
        timeoutId = setTimeout(() => {
          if (!isMounted) return
          console.log('⏰ useAuth - Timeout na inicialização da autenticação (8s)')
          // Não definir erro, apenas continuar sem sessão
          setLoading(false)
        }, 8000)

        // Obter sessão inicial com timeout melhorado (sem gerar erro no console)
        let sessionResolved = false
        
        const sessionPromise = supabase.auth.getSession().then(result => {
          sessionResolved = true
          if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
          return result
        })
        
        const timeoutPromise = new Promise<{ data: { session: null }, error: null }>((resolve) => {
          sessionTimeoutId = setTimeout(() => {
            if (!sessionResolved) {
              sessionResolved = true
              console.log('⚠️ useAuth - Timeout na sessão (5s), continuando sem autenticação')
              resolve({ data: { session: null }, error: null })
            }
          }, 5000) // Timeout de 5 segundos para melhor responsividade
        })

        const result = await Promise.race([sessionPromise, timeoutPromise])
        
        if (!isMounted) return

        const { data: { session }, error: sessionError } = result as any

        // Se não há sessão e não há erro, provavelmente foi timeout
        if (!session && !sessionError) {
          console.log('⚠️ useAuth - Continuando sem sessão')
          setSession(null)
          setUser(null)
          setProfile(null)
          if (timeoutId) clearTimeout(timeoutId)
          if (isMounted) setLoading(false)
          return
        }
        
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
        
        // Tratar erros de forma silenciosa se for timeout
        if (error instanceof Error && error.message === 'Session timeout') {
          console.log('⚠️ useAuth - Timeout na sessão, continuando sem autenticação')
          setSession(null)
          setUser(null)
          setProfile(null)
        } else {
          console.error('❌ useAuth - Erro na inicialização:', error)
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
        
        // Limpar timeouts quando há mudança de estado (evita timeouts durante navegação)
        if (timeoutId) clearTimeout(timeoutId)
        if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
        
        // Tratar erros de refresh token inválido
        if (_event === 'SIGNED_OUT' || _event === 'TOKEN_REFRESHED') {
          // Se foi token refresh e não há sessão, significa que o refresh token é inválido
          if (_event === 'TOKEN_REFRESHED' && !session) {
            console.warn('⚠️ useAuth - Token refresh falhou, refresh token inválido')
            // Limpar estado e tokens inválidos
            setUser(null)
            setProfile(null)
            setSession(null)
            setError('Sessão expirada. Por favor, faça login novamente.')
            
            // Limpar localStorage de tokens do Supabase
            if (typeof window !== 'undefined') {
              try {
                const keys = Object.keys(localStorage)
                keys.forEach(key => {
                  if (key.includes('supabase.auth')) {
                    localStorage.removeItem(key)
                  }
                })
              } catch (e) {
                console.warn('⚠️ useAuth - Erro ao limpar localStorage:', e)
              }
            }
            
            if (isMounted) setLoading(false)
            
            // Redirecionar para login após um breve delay
            if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
              setTimeout(() => {
                window.location.href = '/login'
              }, 1000)
            }
            return
          }
          
          // Token refresh bem-sucedido
          if (_event === 'TOKEN_REFRESHED' && session) {
            setSession(session)
            return
          }
        }
        
        setSession(session)
        await updateUserData(session?.user ?? null)
        if (isMounted) {
          setLoading(false)
          setError(null) // Limpar erros anteriores quando há mudança de estado
        }
      } catch (error: any) {
        if (!isMounted) return
        
        // Verificar se é erro de refresh token inválido
        const isInvalidRefreshToken = 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.message?.includes('Refresh Token Not Found') ||
          error?.message?.includes('refresh_token_not_found') ||
          error?.status === 401
        
        if (isInvalidRefreshToken) {
          console.warn('⚠️ useAuth - Refresh token inválido detectado, limpando sessão')
          
          // Limpar estado
          setUser(null)
          setProfile(null)
          setSession(null)
          setError('Sessão expirada. Por favor, faça login novamente.')
          
          // Limpar tokens do localStorage
          if (typeof window !== 'undefined') {
            try {
              const keys = Object.keys(localStorage)
              keys.forEach(key => {
                if (key.includes('supabase.auth')) {
                  localStorage.removeItem(key)
                }
              })
              
              // Tentar fazer logout no Supabase (sem bloquear se falhar)
              supabase.auth.signOut().catch(() => {
                // Ignorar erros de logout se já está desconectado
              })
            } catch (e) {
              console.warn('⚠️ useAuth - Erro ao limpar tokens:', e)
            }
          }
          
          if (isMounted) setLoading(false)
          
          // Redirecionar para login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            setTimeout(() => {
              window.location.href = '/login'
            }, 1000)
          }
          return
        }
        
        console.error('❌ useAuth - Erro na mudança de estado:', error)
        // Não definir erro crítico durante navegação, apenas logar
        if (isMounted) setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (timeoutId) clearTimeout(timeoutId)
      if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
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