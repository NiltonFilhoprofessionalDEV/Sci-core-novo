'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { getPerfilDisplayName } from '@/types/auth'
import { Settings, User, Lock, Bell, Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function ConfiguracoesPage() {
  const { user, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Estados do formulário de perfil
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: ''
  })
  
  // Estados do formulário de senha
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Carregar dados do usuário
  useEffect(() => {
    if (user?.profile) {
      setFormData({
        nome_completo: user.profile.nome_completo || '',
        email: user.profile.email || user.email || ''
      })
    }
  }, [user])

  // Salvar perfil
  const handleSaveProfile = async () => {
    if (!user?.id) return
    
    try {
      setSaving(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: formData.nome_completo.trim()
        })
        .eq('id', user.id)

      if (error) throw error

      // Atualizar o perfil no contexto
      await refreshProfile()

      setSuccessMessage('Perfil atualizado com sucesso!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error)
      setErrorMessage(error.message || 'Erro ao atualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  // Alterar senha
  const handleChangePassword = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setErrorMessage('Preencha todos os campos de senha')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('As senhas não coincidem')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setSaving(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setSuccessMessage('Senha alterada com sucesso!')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error)
      setErrorMessage(error.message || 'Erro ao alterar senha')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-orange-500" />
            Configurações
          </h1>
          <p className="text-gray-600">
            Gerencie suas preferências e informações da conta
          </p>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Seção: Perfil */}
          <div className="bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Informações do Perfil</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Atualize suas informações pessoais
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  placeholder="Seu email"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O email não pode ser alterado
                </p>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !formData.nome_completo.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seção: Segurança */}
          <div className="bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Segurança</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Altere sua senha para manter sua conta segura
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Digite a nova senha"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Confirme a nova senha"
                />
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleChangePassword}
                  disabled={saving || !passwordData.newPassword || !passwordData.confirmPassword}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Alterando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Alterar Senha
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Seção: Informações da Conta */}
          <div className="bg-white rounded-lg border border-orange-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-gray-900">Informações da Conta</h2>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Detalhes sobre sua conta e permissões
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Perfil
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.profile?.perfil ? getPerfilDisplayName(user.profile.perfil) : 'Não definido'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Base/Seção
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user?.profile?.secao?.nome || 'Não definida'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Status
                  </label>
                  <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.profile?.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user?.profile?.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
                
                {user?.profile?.equipe && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Equipe
                    </label>
                    <div className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                      {user.profile.equipe.nome}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

