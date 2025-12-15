'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Users, UserPlus, Edit, Trash2, Shield, AlertCircle, Loader2, X, Save, CheckCircle } from 'lucide-react'

interface Funcionario {
  id: string
  nome_completo: string
  email: string | null
  cargo: string
  secao_id: string
  equipe_id: string
  created_at: string
  updated_at: string
  equipe?: {
    id: string
    nome: string
  }
}

interface BA_CE {
  id: string
  email: string
  nome_completo: string
  perfil: string
  secao_id: string
  equipe_id: string | null
  ativo: boolean
  created_at?: string
  updated_at?: string
  equipe?: {
    id: string
    nome: string
  } | null
}

interface Equipe {
  id: string
  nome: string
  ativa: boolean
}

function MinhaSecaoPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'funcionarios' | 'chefes'>('funcionarios')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [chefes, setChefes] = useState<BA_CE[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  // Estados para modais
  const [showFuncionarioModal, setShowFuncionarioModal] = useState(false)
  const [showChefeModal, setShowChefeModal] = useState(false)
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | null>(null)
  const [editingChefe, setEditingChefe] = useState<BA_CE | null>(null)
  
  // Estados para formulários
  const [formFuncionario, setFormFuncionario] = useState({
    nome_completo: '',
    email: '',
    cargo: '',
    equipe_id: ''
  })
  
  const [formChefe, setFormChefe] = useState({
    nome_completo: '',
    email: '',
    equipe_id: '',
    senha: ''
  })
  
  const [saving, setSaving] = useState(false)

  // Obter secaoId de múltiplas fontes possíveis
  const secaoId = user?.profile?.secao_id ?? user?.profile?.secao?.id
  
  // Carregar equipes da seção
  useEffect(() => {
    if (!secaoId) return
    
    const loadEquipes = async () => {
      try {
        const { data, error } = await supabase
          .from('equipes')
          .select('id, nome, ativa')
          .eq('secao_id', secaoId)
          .order('nome')
        
        if (error) {
          console.error('❌ Erro ao carregar equipes:', error)
          setError(`Erro ao carregar equipes: ${error.message || error.code || 'Erro desconhecido'}`)
          setEquipes([])
          return
        }
        
        // Filtrar apenas equipes ativas no frontend
        const equipesAtivas = (data || []).filter(eq => eq.ativa !== false)
        setEquipes(equipesAtivas)
      } catch (err: any) {
        console.error('❌ Erro ao carregar equipes:', err)
        setError(`Erro ao carregar equipes: ${err?.message || 'Erro desconhecido'}`)
        setEquipes([])
      }
    }
    
    loadEquipes()
  }, [secaoId])

  // Carregar funcionários
  useEffect(() => {
    if (!secaoId || activeTab !== 'funcionarios') return
    
    const loadFuncionarios = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('funcionarios')
          .select(`
            id,
            nome_completo,
            email,
            cargo,
            secao_id,
            equipe_id,
            created_at,
            updated_at,
            equipe:equipes(id, nome)
          `)
          .eq('secao_id', secaoId)
          .order('nome_completo')
        
        if (error) throw error
        // O embed `equipe:equipes(...)` pode vir como array dependendo do relacionamento inferido.
        const normalized = (data || []).map((f: any) => ({
          ...f,
          equipe: Array.isArray(f.equipe) ? f.equipe[0] : f.equipe,
        }))
        setFuncionarios(normalized)
      } catch (err: any) {
        console.error('Erro ao carregar funcionários:', err)
        setError(err.message || 'Erro ao carregar funcionários')
      } finally {
        setLoading(false)
      }
    }
    
    loadFuncionarios()
  }, [secaoId, activeTab])

  // Carregar chefes de equipe da seção
  const loadChefes = useCallback(async () => {
    if (!secaoId) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Buscar apenas perfis ba_ce da seção
      const { data: dataSimples, error: errorSimples } = await supabase
        .from('profiles')
        .select('id, email, nome_completo, perfil, secao_id, equipe_id, ativo, created_at, updated_at')
        .eq('secao_id', secaoId)
        .eq('perfil', 'ba_ce')
        .order('nome_completo')
      
      if (errorSimples) {
        console.error('❌ Erro ao carregar chefes:', errorSimples)
        setError(`Erro ao carregar chefes: ${errorSimples.message}`)
        setChefes([])
        return
      }
      
      if (dataSimples && dataSimples.length > 0) {
        // Buscar equipes
        const equipeIds = dataSimples.filter(c => c.equipe_id).map(c => c.equipe_id)
        let equipesMap: Record<string, any> = {}
        
        if (equipeIds.length > 0) {
          const { data: equipesData } = await supabase
            .from('equipes')
            .select('id, nome')
            .in('id', equipeIds)
          
          if (equipesData) {
            equipesMap = equipesData.reduce((acc, eq) => {
              acc[eq.id] = eq
              return acc
            }, {} as Record<string, any>)
          }
        }
        
        const chefesComEquipe = dataSimples.map(c => ({
          ...c,
          equipe: equipesMap[c.equipe_id || ''] || null,
          created_at: c.created_at || new Date().toISOString(),
          updated_at: c.updated_at || new Date().toISOString()
        }))
        
        setChefes(chefesComEquipe)
      } else {
        setChefes([])
      }
    } catch (err: any) {
      console.error('❌ Erro ao carregar chefes (catch):', err)
      setError(`Erro ao carregar chefes: ${err?.message || 'Erro desconhecido'}`)
      setChefes([])
    } finally {
      setLoading(false)
    }
  }, [secaoId])

  useEffect(() => {
    if (activeTab === 'chefes') {
      loadChefes()
    }
  }, [activeTab, loadChefes])

  // Abrir modal de funcionário
  const openFuncionarioModal = (funcionario?: Funcionario) => {
    if (funcionario) {
      setEditingFuncionario(funcionario)
      setFormFuncionario({
        nome_completo: funcionario.nome_completo,
        email: funcionario.email || '',
        cargo: funcionario.cargo,
        equipe_id: funcionario.equipe_id
      })
    } else {
      setEditingFuncionario(null)
      setFormFuncionario({
        nome_completo: '',
        email: '',
        cargo: '',
        equipe_id: equipes.length > 0 ? equipes[0].id : ''
      })
    }
    setShowFuncionarioModal(true)
  }

  // Abrir modal de chefe
  const openChefeModal = (chefe?: BA_CE) => {
    if (chefe) {
      setEditingChefe(chefe)
      setFormChefe({
        nome_completo: chefe.nome_completo,
        email: chefe.email,
        equipe_id: chefe.equipe_id || '',
        senha: ''
      })
    } else {
      setEditingChefe(null)
      setFormChefe({
        nome_completo: '',
        email: '',
        equipe_id: equipes.length > 0 ? equipes[0].id : '',
        senha: ''
      })
    }
    setShowChefeModal(true)
  }

  // Salvar funcionário
  const saveFuncionario = async () => {
    if (!secaoId || !formFuncionario.nome_completo || !formFuncionario.cargo || !formFuncionario.equipe_id) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (editingFuncionario) {
        // Atualizar
        const { error } = await supabase
          .from('funcionarios')
          .update({
            nome_completo: formFuncionario.nome_completo,
            email: formFuncionario.email || null,
            cargo: formFuncionario.cargo,
            equipe_id: formFuncionario.equipe_id
          })
          .eq('id', editingFuncionario.id)
          .eq('secao_id', secaoId)

        if (error) throw error
        
        setSuccessMessage('Funcionário atualizado com sucesso!')
      } else {
        // Criar
        const { error } = await supabase
          .from('funcionarios')
          .insert({
            nome_completo: formFuncionario.nome_completo,
            email: formFuncionario.email || null,
            cargo: formFuncionario.cargo,
            secao_id: secaoId,
            equipe_id: formFuncionario.equipe_id
          })

        if (error) throw error
        
        setSuccessMessage('Funcionário cadastrado com sucesso!')
      }

      // Limpar formulário e fechar modal
      setFormFuncionario({
        nome_completo: '',
        email: '',
        cargo: '',
        equipe_id: ''
      })
      setEditingFuncionario(null)
      setShowFuncionarioModal(false)
      
      // Recarregar lista
      if (activeTab === 'funcionarios') {
        const { data } = await supabase
          .from('funcionarios')
          .select(`
            id,
            nome_completo,
            email,
            cargo,
            secao_id,
            equipe_id,
            created_at,
            updated_at,
            equipe:equipes(id, nome)
          `)
          .eq('secao_id', secaoId)
          .order('nome_completo')
        const normalized = (data || []).map((f: any) => ({
          ...f,
          equipe: Array.isArray(f.equipe) ? f.equipe[0] : f.equipe,
        }))
        setFuncionarios(normalized)
      }
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar funcionário:', err)
      setError(err.message || 'Erro ao salvar funcionário')
      setSuccessMessage(null)
    } finally {
      setSaving(false)
    }
  }

  // Salvar chefe de equipe
  const saveChefe = async () => {
    if (!secaoId) {
      setError('Não foi possível identificar a seção')
      return
    }

    if (!formChefe.nome_completo?.trim()) {
      setError('O nome completo é obrigatório')
      return
    }

    if (!formChefe.email?.trim()) {
      setError('O email é obrigatório')
      return
    }

    if (!formChefe.equipe_id) {
      setError('A equipe é obrigatória')
      return
    }

    if (!editingChefe && !formChefe.senha?.trim()) {
      setError('A senha é obrigatória para novos chefes de equipe')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (editingChefe) {
        // Atualizar chefe existente
        const response = await fetch('/api/users/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: editingChefe.id,
            nome_completo: formChefe.nome_completo.trim(),
            email: formChefe.email.trim().toLowerCase(),
            equipe_id: formChefe.equipe_id,
            password: formChefe.senha?.trim() || undefined
          })
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          let errorMessage = data.error || 'Erro ao atualizar chefe de equipe'
          if (errorMessage.includes('already') || errorMessage.includes('duplicate')) {
            errorMessage = 'Este email já está cadastrado. Use outro email.'
          }
          throw new Error(errorMessage)
        }
        
        setSuccessMessage('Chefe de equipe atualizado com sucesso!')
      } else {
        // Criar novo chefe
        const response = await fetch('/api/users/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formChefe.email.trim().toLowerCase(),
            password: formChefe.senha.trim(),
            nome_completo: formChefe.nome_completo.trim(),
            perfil: 'ba_ce',
            secao_id: secaoId,
            equipe_id: formChefe.equipe_id
          })
        })

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          let errorMessage = data.error || 'Erro ao criar chefe de equipe'
          if (errorMessage.includes('already been registered') || errorMessage.includes('already exists')) {
            errorMessage = 'Este email já está cadastrado. Use outro email ou edite o usuário existente.'
          } else if (errorMessage.includes('invalid email')) {
            errorMessage = 'O email fornecido não é válido.'
          } else if (errorMessage.includes('password')) {
            errorMessage = 'A senha não atende aos requisitos mínimos.'
          }
          throw new Error(errorMessage)
        }
        
        setSuccessMessage('Chefe de equipe cadastrado com sucesso!')
      }

      // Limpar formulário e fechar modal
      setFormChefe({
        nome_completo: '',
        email: '',
        equipe_id: '',
        senha: ''
      })
      setEditingChefe(null)
      setShowChefeModal(false)

      // Aguardar um pouco e recarregar lista
      await new Promise(resolve => setTimeout(resolve, 500))
      await loadChefes()
      
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar chefe:', err)
      setError(err.message || 'Erro ao salvar chefe de equipe')
      setSuccessMessage(null)
    } finally {
      setSaving(false)
    }
  }

  // Excluir funcionário
  const deleteFuncionario = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este funcionário?')) return

    try {
      const { error } = await supabase
        .from('funcionarios')
        .delete()
        .eq('id', id)
        .eq('secao_id', secaoId)

      if (error) throw error

      setFuncionarios(funcionarios.filter(f => f.id !== id))
      setSuccessMessage('Funcionário excluído com sucesso!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao excluir funcionário:', err)
      setError(err.message || 'Erro ao excluir funcionário')
    }
  }

  // Excluir (desativar) chefe
  const deleteChefe = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar este chefe de equipe?')) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error

      await loadChefes()
      setSuccessMessage('Chefe de equipe desativado com sucesso!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error('Erro ao excluir chefe:', err)
      setError(err.message || 'Erro ao excluir chefe de equipe')
    }
  }

  if (!secaoId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Seção não identificada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Seção</h1>
          <p className="text-gray-600">
            Gerencie funcionários e chefes de equipe da sua base
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('funcionarios')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'funcionarios'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Funcionários
              </button>
              <button
                onClick={() => setActiveTab('chefes')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chefes'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Chefes de Equipe
              </button>
            </nav>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : activeTab === 'funcionarios' ? (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => openFuncionarioModal()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Funcionário
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cargo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Equipe</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {funcionarios.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum funcionário cadastrado
                      </td>
                    </tr>
                  ) : (
                    funcionarios.map((funcionario) => (
                      <tr key={funcionario.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {funcionario.nome_completo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {funcionario.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {funcionario.cargo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {funcionario.equipe?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openFuncionarioModal(funcionario)}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => deleteFuncionario(funcionario.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => openChefeModal()}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Adicionar Chefe de Equipe
              </button>
            </div>

            <div className="bg-card rounded-lg shadow-sm overflow-hidden border border-border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Equipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Perfil</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  {chefes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Nenhum BA-CE cadastrado
                      </td>
                    </tr>
                  ) : (
                    chefes.map((chefe) => (
                      <tr key={chefe.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {chefe.nome_completo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {chefe.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {chefe.equipe?.nome || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                            BA-CE
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            chefe.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {chefe.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openChefeModal(chefe)}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </button>
                          <button
                            onClick={() => deleteChefe(chefe.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Modal Funcionário */}
        {showFuncionarioModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formFuncionario.nome_completo}
                    onChange={(e) => setFormFuncionario({ ...formFuncionario, nome_completo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formFuncionario.email}
                    onChange={(e) => setFormFuncionario({ ...formFuncionario, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formFuncionario.cargo}
                    onChange={(e) => setFormFuncionario({ ...formFuncionario, cargo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipe *
                  </label>
                  <select
                    value={formFuncionario.equipe_id}
                    onChange={(e) => setFormFuncionario({ ...formFuncionario, equipe_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecione uma equipe</option>
                    {equipes.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowFuncionarioModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveFuncionario}
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Chefe */}
        {showChefeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingChefe ? 'Editar Chefe de Equipe' : 'Novo Chefe de Equipe'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formChefe.nome_completo}
                    onChange={(e) => setFormChefe({ ...formChefe, nome_completo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formChefe.email}
                    onChange={(e) => setFormChefe({ ...formChefe, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipe *
                  </label>
                  <select
                    value={formChefe.equipe_id}
                    onChange={(e) => setFormChefe({ ...formChefe, equipe_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecione uma equipe</option>
                    {equipes.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                </div>
                {!editingChefe && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      value={formChefe.senha}
                      onChange={(e) => setFormChefe({ ...formChefe, senha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                )}
                {editingChefe && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nova Senha (deixe em branco para manter a atual)
                    </label>
                    <input
                      type="password"
                      value={formChefe.senha}
                      onChange={(e) => setFormChefe({ ...formChefe, senha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowChefeModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveChefe}
                  disabled={saving}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MinhaSecaoPage

