'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface Secao {
  id: string
  nome: string
  codigo: string
  cidade: string
  estado: string
}

interface Equipe {
  id: string
  nome: string
  codigo: string
  secao_id: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome_completo: '',
    perfil: 'ba_ce' as 'gestor_pop' | 'gerente_secao' | 'ba_ce' | 'chefe_equipe',
    secao_id: '',
    equipe_id: ''
  })
  
  const [secoes, setSecoes] = useState<Secao[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Carregar seções
  useEffect(() => {
    const fetchSecoes = async () => {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .eq('ativa', true)
        .order('nome')
      
      if (data) setSecoes(data)
    }
    
    fetchSecoes()
  }, [])

  // Carregar equipes quando seção for selecionada
  useEffect(() => {
    const fetchEquipes = async () => {
      if (formData.secao_id) {
        const { data, error } = await supabase
          .from('equipes')
          .select('*')
          .eq('secao_id', formData.secao_id)
          .eq('ativa', true)
          .order('nome')
        
        if (data) setEquipes(data)
      } else {
        setEquipes([])
      }
    }
    
    fetchEquipes()
  }, [formData.secao_id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Limpar equipe quando seção mudar
      ...(name === 'secao_id' ? { equipe_id: '' } : {})
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (formData.perfil === 'gerente_secao' && !formData.secao_id) {
      setError('Gerentes de seção devem selecionar uma seção')
      return
    }

    if (formData.perfil === 'ba_ce' && (!formData.secao_id || !formData.equipe_id)) {
      setError('BACE deve selecionar seção e equipe')
      return
    }

    if (formData.perfil === 'chefe_equipe' && (!formData.secao_id || !formData.equipe_id)) {
      setError('Chefe de equipe deve selecionar seção e equipe')
      return
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        nome_completo: formData.nome_completo,
        perfil: formData.perfil,
        secao_id: formData.secao_id || undefined,
        equipe_id: formData.equipe_id || undefined
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess('Usuário criado com sucesso! Verifique seu email para confirmar a conta.')
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        router.push('/login')
      }, 3000)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1f1f1f] mb-2">Criar Conta</h1>
          <p className="text-[#7a5b3e]/70">Sistema de Indicadores MedMais</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="nome_completo" className="block text-sm font-medium text-[#1f1f1f] mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="nome_completo"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1f1f1f] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
              placeholder="Digite seu email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1f1f1f] mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
              placeholder="Digite sua senha"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1f1f1f] mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f] placeholder:text-[#7a5b3e]/60"
              placeholder="Confirme sua senha"
            />
          </div>

          <div>
            <label htmlFor="perfil" className="block text-sm font-medium text-[#1f1f1f] mb-2">
              Perfil
            </label>
            <select
              id="perfil"
              name="perfil"
              value={formData.perfil}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f]"
            >
              <option value="ba_ce">BACE (Bombeiro de Aeródromo Civil Especializado)</option>
              <option value="chefe_equipe">Chefe de Equipe</option>
              <option value="gerente_secao">Gerente de Seção</option>
              <option value="gestor_pop">Gestor Populacional</option>
            </select>
          </div>

          {(formData.perfil === 'gerente_secao' || formData.perfil === 'ba_ce' || formData.perfil === 'chefe_equipe') && (
            <div>
              <label htmlFor="secao_id" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Seção
              </label>
              <select
                id="secao_id"
                name="secao_id"
                value={formData.secao_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f]"
              >
                <option value="">Selecione uma seção</option>
                {secoes.map((secao) => (
                  <option key={secao.id} value={secao.id}>
                    {secao.nome} - {secao.cidade}/{secao.estado}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(formData.perfil === 'ba_ce' || formData.perfil === 'chefe_equipe') && formData.secao_id && (
            <div>
              <label htmlFor="equipe_id" className="block text-sm font-medium text-[#1f1f1f] mb-2">
                Equipe
              </label>
              <select
                id="equipe_id"
                name="equipe_id"
                value={formData.equipe_id}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-[#7a5b3e]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:border-transparent text-[#1f1f1f]"
              >
                <option value="">Selecione uma equipe</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#7a5b3e] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#6a4b2e] focus:outline-none focus:ring-2 focus:ring-[#7a5b3e] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[#7a5b3e]/70">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-[#7a5b3e] hover:text-[#6a4b2e] font-medium">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}