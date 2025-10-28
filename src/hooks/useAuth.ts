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
  const [rememberMe, setRememberMe] = useLocalStorage('rememberMe', false)

  // Função para buscar perfil do usuário
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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

      if (error) {
        console.error('Erro ao buscar perfil:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return null
    }
  }

  // Função para atualizar dados do usuário
  const updateUserData = async (authUser: User | null) => {
    if (authUser) {
      const userProfile = await fetchUserProfile(authUser.id)
      
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
      setUser(null)
      setProfile(null)
    }
  }

  useEffect(() => {
    // Obter sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      await updateUserData(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      await updateUserData(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
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
    rememberMe,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  }
}