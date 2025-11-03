'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft } from 'lucide-react'
import { Layout } from '@/components/Layout'
import { useAuthContext } from '@/contexts/AuthContext'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { resetPassword } = useAuthContext()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        setError('Erro ao enviar email de recuperação. Tente novamente.')
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Layout>
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Esqueci minha senha
        </h1>
        <p className="text-muted-foreground">
            Digite seu email para receber as instruções de recuperação
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Email enviado com sucesso!</p>
              <p className="text-sm mt-1">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/50 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all duration-300"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enviando...' : 'Enviar instruções'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-[#fa4b00] hover:text-[#fa4b00]/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para o login
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}