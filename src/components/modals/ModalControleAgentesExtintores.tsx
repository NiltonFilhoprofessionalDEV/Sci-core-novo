'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Calendar, Building2, Users, X, Save, Package, Beaker, Zap } from 'lucide-react'
import { useControleAgentesExtintores, ControleFormData, FuncionarioControle } from '@/hooks/useControleAgentesExtintores'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

interface ModalControleAgentesExtintoresProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ModalControleAgentesExtintores({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalControleAgentesExtintoresProps) {
  const {
    secoes,
    equipes,
    loading,
    saving,
    fetchSecoes,
    fetchEquipesBySecao,
    salvarControleAgentesExtintores,
    validarDados
  } = useControleAgentesExtintores()

  // Obter dados do usuário logado
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Estado do formulário
  const [formData, setFormData] = useState<ControleFormData>({
    base_id: '',
    equipe_id: '',
    data: '',
    funcionarios: []
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [modalStep, setModalStep] = useState<'selection' | 'details'>('selection')
  const [showEquipeChangeConfirm, setShowEquipeChangeConfirm] = useState(false)
  const [pendingEquipeId, setPendingEquipeId] = useState<string>('')

  // Debug logs
  console.log('🔍 Controle Agentes Extintores Modal Debug:', {
    isOpen,
    loading,
    saving,
    modalStep,
    secoesCount: 0,
    equipesCount: equipes.length,
    formData,
    funcionariosControleCount: formData.funcionarios.length
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal Controle Agentes Extintores aberto, resetando formulário...')
      setFormData({
        base_id: secaoId || '',
        equipe_id: '',
        data: '',
        funcionarios: []
      })
      setValidationErrors({})
      setShowSuccess(false)
      setModalStep('selection')
      
      // Carregar seções
      fetchSecoes()
    }
  }, [isOpen, fetchSecoes, secaoId])

  // Preencher automaticamente a base do usuário logado
  useEffect(() => {
    if (isOpen && secaoId) {
      setFormData(prev => ({ ...prev, base_id: secaoId }))
    }
  }, [isOpen, secaoId])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.base_id) {
      console.log('👥 Base selecionada, carregando equipes para:', formData.base_id)
      
      const loadEquipes = async () => {
        try {
          await fetchEquipesBySecao(formData.base_id)
        } catch (error) {
          console.error('❌ Erro ao carregar equipes:', error)
          toast.error('Erro ao carregar equipes. Tente novamente.')
        }
      }
      
      loadEquipes()
      
      // Limpar equipe selecionada e funcionários
      setFormData(prev => ({ ...prev, equipe_id: '', funcionarios: [] }))
    }
  }, [formData.base_id, fetchEquipesBySecao])

  // Inicializar um funcionário padrão quando equipe for selecionada
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👤 Equipe selecionada, inicializando funcionário padrão para:', formData.equipe_id)
      
      // Criar um funcionário padrão para controle
      const funcionarioPadrao: FuncionarioControle = {
        id: `funcionario-${Date.now()}`,
        nome_completo: 'Funcionário',
        quantidade_estoque_po_quimico: 0,
        quantidade_estoque_lge: 0,
        quantidade_estoque_nitrogenio: 0,
        quantidade_exigida_po_quimico: 0,
        quantidade_exigida_lge: 0,
        quantidade_exigida_nitrogenio: 0,
        observacoes: ''
      }
      
      setFormData(prev => ({ ...prev, funcionarios: [funcionarioPadrao] }))
    }
  }, [formData.equipe_id])

  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    // Se estamos na segunda etapa e mudando a equipe, verificar se há dados preenchidos
    if (modalStep === 'details' && field === 'equipe_id' && value !== formData.equipe_id) {
      const hasData = formData.funcionarios.some(f => 
        f.quantidade_estoque_po_quimico > 0 || 
        f.quantidade_estoque_lge > 0 || 
        f.quantidade_estoque_nitrogenio > 0 ||
        f.quantidade_exigida_po_quimico > 0 || 
        f.quantidade_exigida_lge > 0 || 
        f.quantidade_exigida_nitrogenio > 0 ||
        f.observacoes.trim() !== ''
      )
      if (hasData && value) {
        setPendingEquipeId(value)
        setShowEquipeChangeConfirm(true)
        return
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }))

    // Limpar erro de validação do campo
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Atualizar funcionário de controle
  const updateFuncionarioControle = (funcionarioId: string, field: keyof FuncionarioControle, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      funcionarios: prev.funcionarios.map(funcionario => {
        if (funcionario.id === funcionarioId) {
          return { ...funcionario, [field]: value }
        }
        return funcionario
      })
    }))

    // Limpar erro de validação do funcionário
    const errorKey = `${funcionarioId}_${field}`
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Validar primeira etapa
  const validateFirstStep = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.base_id || !secaoId) {
      errors.base_id = 'Usuário deve ter uma base associada'
    }

    if (!formData.equipe_id) {
      errors.equipe_id = 'Equipe é obrigatória'
    }

    if (!formData.data) {
      errors.data = 'Data é obrigatória'
    } else {
      const dataReferencia = new Date(`${formData.data}T00:00:00`)
      const hoje = new Date()
      hoje.setHours(23, 59, 59, 999)
      
      if (dataReferencia > hoje) {
        errors.data = 'Data não pode ser futura'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Avançar para próxima etapa
  const handleNextStep = () => {
    if (validateFirstStep()) {
      setModalStep('details')
    }
  }

  // Voltar para primeira etapa
  const handleBackToSelection = () => {
    setModalStep('selection')
    setValidationErrors({})
  }

  // Confirmar mudança de equipe
  const handleConfirmEquipeChange = () => {
    setFormData(prev => ({ ...prev, equipe_id: pendingEquipeId, funcionarios: [] }))
    setShowEquipeChangeConfirm(false)
    setPendingEquipeId('')
  }

  // Cancelar mudança de equipe
  const handleCancelEquipeChange = () => {
    setShowEquipeChangeConfirm(false)
    setPendingEquipeId('')
  }

  // Salvar dados
  const handleSave = async () => {
    try {
      console.log('💾 Iniciando salvamento do controle de agentes extintores...')
      
      const sucesso = await salvarControleAgentesExtintores(formData)
      
      if (sucesso) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
          onSuccess?.()
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar controle de agentes extintores:', error)
      toast.error('Erro ao salvar controle de agentes extintores')
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!loading && !saving) {
      onClose()
    }
  }

  // Formatação de data para exibição
  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    // Parse a string YYYY-MM-DD e cria a data no fuso horário local
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month é 0-indexed
    return date.toLocaleDateString('pt-BR')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white text-gray-900 p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-[#fa4b00]" />
              <h2 className="text-xl font-bold">Controle de Agentes Extintores</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={loading || saving}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Status de conexão */}
          <div className="mt-4">
            <ConnectionStatus />
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-8">
          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-800 font-medium">
                  Controle de agentes extintores salvo com sucesso!
                </p>
              </div>
            </div>
          )}

          {/* Primeira etapa: Seleção */}
          {modalStep === 'selection' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Base *
                  </label>
                  {!secaoId ? (
                    <div className="w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                      Usuário sem base associada
                    </div>
                  ) : (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      {nomeBase}
                    </div>
                  )}
                  {validationErrors.base_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.base_id}</p>
                  )}
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => updateField('data', e.target.value)}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black ${
                      validationErrors.data 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.data && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.data}</p>
                  )}
                </div>

                {/* Equipe */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-black flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Equipe *
                  </label>
                  <select
                    value={formData.equipe_id}
                    onChange={(e) => updateField('equipe_id', e.target.value)}
                    disabled={loading || !formData.base_id}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black ${
                      validationErrors.equipe_id 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    } ${loading || !formData.base_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="" className="text-black">
                      {!formData.base_id ? 'Selecione uma base primeiro' : 'Selecione a equipe'}
                    </option>
                    {equipes.map((equipe, index) => (
                      <option key={`equipe-${equipe.id}-${index}`} value={equipe.id} className="text-black">
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                  {validationErrors.equipe_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.equipe_id}</p>
                  )}
                </div>
              </div>

              {/* Botão Continuar */}
              <div className="flex justify-end">
                <button
                  onClick={handleNextStep}
                  disabled={loading || !formData.base_id || !formData.equipe_id || !formData.data || !secaoId}
                  className="px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Segunda etapa: Detalhes dos funcionários */}
          {modalStep === 'details' && (
            <div className="space-y-6">
              {/* Informações selecionadas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-black">Base:</span>
                    <p className="text-black">
                      {secoes.find(s => s.id === formData.base_id)?.nome} - {secoes.find(s => s.id === formData.base_id)?.cidade}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-black">Data:</span>
                    <p className="text-black">{formatDate(formData.data)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-black">Equipe:</span>
                    <p className="text-black">{equipes.find(e => e.id === formData.equipe_id)?.nome}</p>
                  </div>
                </div>
              </div>

              {/* Tabela de controle de agentes extintores */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Controle de Agentes Extintores
                </h3>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Beaker className="w-3 h-3" />
                              Estoque Pó Químico (Kg)
                            </div>
                          </th>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Beaker className="w-3 h-3" />
                              Estoque LGE (Lts)
                            </div>
                          </th>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3" />
                              Estoque Nitrogênio (und)
                            </div>
                          </th>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Beaker className="w-3 h-3" />
                              Exigido Pó Químico (Kg)
                            </div>
                          </th>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Beaker className="w-3 h-3" />
                              Exigido LGE (Lts)
                            </div>
                          </th>
                          <th className="py-3 px-3 text-center text-xs font-medium text-black uppercase tracking-wider">
                            <div className="flex items-center justify-center gap-1">
                              <Zap className="w-3 h-3" />
                              Exigido Nitrogênio (und)
                            </div>
                          </th>
                          <th className="py-3 px-4 text-left text-xs font-medium text-black uppercase tracking-wider">
                            Observações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.funcionarios.map((funcionario, index) => (
                          <tr 
                            key={`funcionario-${funcionario.id}-${index}`} 
                            className={`
                              border-b border-gray-100 transition-all duration-200 hover:bg-gray-50/80
                              ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                            `}
                          >
                            {/* Estoque Pó Químico */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={funcionario.quantidade_estoque_po_quimico}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_estoque_po_quimico', parseFloat(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_estoque_po_quimico`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Estoque LGE */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={funcionario.quantidade_estoque_lge}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_estoque_lge', parseFloat(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_estoque_lge`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Estoque Nitrogênio */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={funcionario.quantidade_estoque_nitrogenio}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_estoque_nitrogenio', parseInt(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_estoque_nitrogenio`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Exigido Pó Químico */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={funcionario.quantidade_exigida_po_quimico}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_exigida_po_quimico', parseFloat(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_exigida_po_quimico`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Exigido LGE */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={funcionario.quantidade_exigida_lge}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_exigida_lge', parseFloat(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_exigida_lge`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Exigido Nitrogênio */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  value={funcionario.quantidade_exigida_nitrogenio}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'quantidade_exigida_nitrogenio', parseInt(e.target.value) || 0)}
                                  disabled={loading || saving}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 ${
                                    validationErrors[`${funcionario.id}_quantidade_exigida_nitrogenio`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>

                            {/* Observações */}
                            <td className="py-2 px-4">
                              <div className="relative">
                                <textarea
                                  value={funcionario.observacoes}
                                  onChange={(e) => updateFuncionarioControle(funcionario.id, 'observacoes', e.target.value)}
                                  disabled={loading || saving}
                                  placeholder="Observações..."
                                  rows={2}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-400 resize-none ${
                                    validationErrors[`${funcionario.id}_observacoes`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-between">
                <button
                  onClick={handleBackToSelection}
                  disabled={loading || saving}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading || saving || formData.funcionarios.length === 0 || !secaoId}
                  className="px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de mudança de equipe */}
      {showEquipeChangeConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-lg font-semibold text-black">Confirmar mudança</h3>
            </div>
            <p className="text-black mb-6">
              Ao alterar a equipe, todos os dados preenchidos serão perdidos. Deseja continuar?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelEquipeChange}
                className="px-4 py-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmEquipeChange}
                className="px-4 py-2 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}