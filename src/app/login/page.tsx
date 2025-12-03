'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { useAuthContext } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn } = useAuthContext()

  // Verificar se a sessão expirou
  useEffect(() => {
    const sessionExpired = searchParams?.get('session_expired')
    if (sessionExpired === 'true') {
      setError('Sua sessão expirou. Por favor, faça login novamente.')
      // Limpar o parâmetro da URL
      router.replace('/login')
    }
  }, [searchParams, router])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError('')

    try {
      const { error } = await signIn(data.email, data.password, data.rememberMe)
      
      if (error) {
        setError('Email ou senha incorretos')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex min-h-[600px]">
          {/* Lado esquerdo - Boas-vindas */}
          <div className="flex-1 bg-white p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Elementos geométricos abstratos */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rotate-45"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-primary/30 rounded-full"></div>
            <div className="absolute bottom-32 right-12 w-24 h-24 bg-white/5 rotate-12"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="w-12 h-12 bg-primary rounded-lg mb-6 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-primary mb-6 leading-tight">
                Bem-vindo!
              </h1>
              

            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white/5 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-black mb-2">Entrar</h2>
                <p className="text-[#7a5b3e]/70">Entre com suas credenciais</p>
              </div>

              {error && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo Email */}
                <div>
                  <label className="block text-black text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a5b3e]/50 w-5 h-5" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-white border border-[#cdbdae]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 !text-black placeholder:text-[#7a5b3e]/60"
                      style={{ color: '#000000' }}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-black text-sm font-medium mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a5b3e]/50 w-5 h-5" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 bg-white border border-[#cdbdae]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 !text-black placeholder:text-[#7a5b3e]/60"
                      style={{ color: '#000000' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#7a5b3e]/50 hover:text-[#7a5b3e] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Lembrar-me e Esqueci senha */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="w-4 h-4 text-primary bg-white/50 border-[#cdbdae]/30 rounded focus:ring-primary/50 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-black">Lembrar-me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueci minha senha
                  </a>
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>


            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <Layout>
        <div className="w-full max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex min-h-[600px] items-center justify-center">
            <div className="text-center">
              <p className="text-black">Carregando...</p>
            </div>
          </div>
        </div>
      </Layout>
    }>
      <LoginForm />
    </Suspense>
  )
}