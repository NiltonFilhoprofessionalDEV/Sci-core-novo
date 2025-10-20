'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { useAuthContext } from '@/contexts/AuthContext'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn } = useAuthContext()

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
          <div className="flex-1 bg-gradient-to-br from-[#7a5b3e]/90 to-[#cdbdae]/90 p-12 flex flex-col justify-center relative overflow-hidden">
            {/* Elementos geométricos abstratos */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-[#fa4b00]/20 rounded-full blur-xl"></div>
            <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rotate-45"></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-[#fa4b00]/30 rounded-full"></div>
            <div className="absolute bottom-32 right-12 w-24 h-24 bg-white/5 rotate-12"></div>
            
            <div className="relative z-10">
              <div className="mb-8">
                <div className="w-12 h-12 bg-[#fa4b00] rounded-lg mb-6 flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
              </div>
              
              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Bem-vindo!
              </h1>
              

            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="flex-1 p-12 flex flex-col justify-center bg-white/5 backdrop-blur-sm">
            <div className="max-w-md mx-auto w-full">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#1f1f1f] mb-2">Entrar</h2>
                <p className="text-[#7a5b3e]/70">Entre com suas credenciais</p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Campo Email */}
                <div>
                  <label className="block text-[#1f1f1f] text-sm font-medium mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a5b3e]/50 w-5 h-5" />
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="seu@email.com"
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-[#cdbdae]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa4b00]/50 focus:border-[#fa4b00] transition-all duration-300 text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Campo Senha */}
                <div>
                  <label className="block text-[#1f1f1f] text-sm font-medium mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#7a5b3e]/50 w-5 h-5" />
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 bg-white/50 border border-[#cdbdae]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fa4b00]/50 focus:border-[#fa4b00] transition-all duration-300 text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
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
                      className="w-4 h-4 text-[#fa4b00] bg-white/50 border-[#cdbdae]/30 rounded focus:ring-[#fa4b00]/50 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-[#1f1f1f]">Lembrar-me</span>
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-sm text-[#fa4b00] hover:text-[#fa4b00]/80 transition-colors"
                  >
                    Esqueci minha senha
                  </a>
                </div>

                {/* Botão de Login */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#fa4b00] to-[#fa4b00]/80 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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