import { useState, useEffect, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useLocalStorage } from './useLocalStorage'
import type { UserProfile, AuthUser } from '@/types/auth'

const PROFILE_TIMEOUT_MS = 12_000
const SESSION_TIMEOUT_MS = 10_000

async function fetchUserProfileWithTimeout(userId: string): Promise<UserProfile | null> {
  try {
    const queryPromise = supabase
      .from('profiles')
      .select(
        `
        *,
        secao:secoes(*),
        equipe:equipes(*)
      `,
      )
      .eq('id', userId)
      .eq('ativo', true)
      .single()

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) => {
      setTimeout(() => resolve({ data: null, error: { message: 'Timeout' } }), PROFILE_TIMEOUT_MS)
    })

    const { data, error } = await Promise.race([
      queryPromise as unknown as Promise<{ data: unknown; error: any }>,
      timeoutPromise,
    ])

    if (error?.message === 'Timeout') {
      return null
    }

    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        const { data: dataWithoutActive, error: errorWithoutActive } = await supabase
          .from('profiles')
          .select(
            `
            *,
            secao:secoes(*),
            equipe:equipes(*)
          `,
          )
          .eq('id', userId)
          .single()

        if (errorWithoutActive) return null
        return dataWithoutActive as UserProfile
      }
      return null
    }

    return data as UserProfile
  } catch (err: any) {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useLocalStorage('rememberMe', false)

  const updateUserData = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setUser(null)
      setProfile(null)
      return
    }

    const userProfile = await fetchUserProfileWithTimeout(authUser.id)

    setUser({
      id: authUser.id,
      email: authUser.email || '',
      profile: userProfile ?? undefined,
    })

    setProfile(userProfile)

    if (userProfile) {
      supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', authUser.id)
        .then(() => undefined, () => undefined)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let sessionTimeoutId: ReturnType<typeof setTimeout> | null = null

    async function init() {
      setLoading(true)
      setError(null)

      try {
        let resolved = false

        const sessionPromise = supabase.auth.getSession().then((result) => {
          resolved = true
          if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
          return result
        })

        const timeoutPromise = new Promise<{ data: { session: null }; error: null }>((resolve) => {
          sessionTimeoutId = setTimeout(() => {
            if (!resolved) {
              resolved = true
              resolve({ data: { session: null }, error: null })
            }
          }, SESSION_TIMEOUT_MS)
        })

        const result = await Promise.race([sessionPromise, timeoutPromise])
        if (!isMounted) return

        const {
          data: { session },
          error: sessionError,
        } = result as any

        if (sessionError) {
          setError('Erro ao conectar com o servidor de autenticação.')
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setSession(session ?? null)
        await updateUserData(session?.user ?? null)
        setLoading(false)
      } catch (err) {
        if (!isMounted) return
        console.error('useAuth - Erro na inicialização:', err)
        setError('Erro inesperado na inicialização da autenticação.')
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      try {
        if (event === 'SIGNED_IN' && newSession?.user) {
          setLoading(true)
          setSession(newSession)
          await updateUserData(newSession.user)
          setError(null)
          setLoading(false)
          return
        }

        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setProfile(null)
          setError(null)
          setLoading(false)
          return
        }

        if (event === 'TOKEN_REFRESHED') {
          if (!newSession) {
            setSession(null)
            setUser(null)
            setProfile(null)
            setError('Sessão expirada. Por favor, faça login novamente.')
            setLoading(false)
            return
          }

          setSession(newSession)
          await updateUserData(newSession.user)
          setError(null)
          setLoading(false)
          return
        }

        setSession(newSession ?? null)
        await updateUserData(newSession?.user ?? null)
        setError(null)
        setLoading(false)
      } catch (err: any) {
        console.error('useAuth - Erro em onAuthStateChange:', err)
        setError('Erro ao atualizar estado de autenticação.')
        setLoading(false)
      }
    })

    return () => {
      isMounted = false
      if (sessionTimeoutId) clearTimeout(sessionTimeoutId)
      subscription.unsubscribe()
    }
  }, [updateUserData])

  const signIn = useCallback(
    async (email: string, password: string, remember = false) => {
      setLoading(true)
      setError(null)

      try {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError('Email ou senha incorretos.')
          setLoading(false)
          return { data: null, error: signInError }
        }

        setRememberMe(remember)

        if (data.user) {
          await updateUserData(data.user)
        }

        setLoading(false)
        return { data, error: null }
      } catch (err) {
        console.error('useAuth - Erro no login:', err)
        setError('Erro ao fazer login. Tente novamente.')
        setLoading(false)
        return { data: null, error: err }
      }
    },
    [setRememberMe, updateUserData],
  )

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await supabase.auth.signOut()
    } catch {
      // ignora erros de rede
    } finally {
      setSession(null)
      setUser(null)
      setProfile(null)
      setRememberMe(false)
      setLoading(false)
    }

    return { error: null }
  }, [setRememberMe])

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return { error }
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      userData: {
        nome_completo: string
        perfil: 'gestor_pop' | 'gerente_secao' | 'ba_ce' | 'chefe_equipe'
        secao_id?: string
        equipe_id?: string
      },
    ) => {
      setLoading(true)
      setError(null)

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
            },
          },
        })

        if (error) {
          setError(error.message || 'Erro ao cadastrar usuário.')
          return { data: null, error }
        }

        setLoading(false)
        return { data, error: null }
      } catch (err: any) {
        setError('Erro ao cadastrar usuário.')
        setLoading(false)
        return { data: null, error: err }
      }
    },
    [],
  )

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await updateUserData(session.user)
    }
  }, [session, updateUserData])

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
