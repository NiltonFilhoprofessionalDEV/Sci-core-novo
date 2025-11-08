'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, FileText, X, Save, BookOpen, GraduationCap } from 'lucide-react'
import { usePTRBA, PTRBAResultado, PTRBARegistro } from '@/hooks/usePTRBA'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface PTRBAModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PTRBAModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: PTRBAModalProps) {
  const {
    secoes,
    equipes,
    funcionarios,
    loading,
    saving,
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    calcularStatus,
    validarNota,
    salvarPTRBA
  } = usePTRBA()

  // Obter dados do usuário logado
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Estado do formulário
  const [formData, setFormData] = useState({
    secao_id: '',
    equipe_id: '',
    data_prova: ''
  })

  // Estado dos resultados dos funcionários
  const [resultados, setResultados] = useState<PTRBAResultado[]>([])

  // Estado de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Estado do modal (primeira etapa ou segunda etapa)
  const [modalStep, setModalStep] = useState<'selection' | 'details'>('selection')

  // Estado para controlar mudança de equipe
  const [showEquipeChangeConfirm, setShowEquipeChangeConfirm] = useState(false)
  const [pendingEquipeId, setPendingEquipeId] = useState('')

  // Debug logs
  console.log('🔍 PTR-BA Modal Debug:', {
    isOpen,
    loading,
    saving,
    modalStep,
    secoesCount: 0,
    equipesCount: equipes.length,
    funcionariosCount: funcionarios.length,
    formData,
    resultadosCount: resultados.length
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 PTR-BA Modal aberto, resetando formulário...')
      setFormData({
        secao_id: secaoId || '',
        equipe_id: '',
        data_prova: ''
      })
      setResultados([])
      setValidationErrors({})
      setShowSuccess(false)
      setModalStep('selection')
    }
  }, [isOpen, secaoId])

  // Preencher automaticamente a base do usuário logado
  useEffect(() => {
    if (isOpen && secaoId) {
      setFormData(prev => ({ ...prev, secao_id: secaoId }))
    }
  }, [isOpen, secaoId])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.secao_id) {
      console.log('👥 Seção selecionada, carregando equipes para:', formData.secao_id)
      fetchEquipesPorSecao(formData.secao_id)
      // Limpar equipe selecionada e funcionários
      setFormData(prev => ({ ...prev, equipe_id: '' }))
      setResultados([])
    }
  }, [formData.secao_id])

  // Buscar funcionários quando equipe mudar
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👤 Equipe selecionada, carregando funcionários para:', formData.equipe_id)
      fetchFuncionariosPorEquipe(formData.equipe_id)
    }
  }, [formData.equipe_id])

  // Inicializar resultados quando funcionários carregarem
  useEffect(() => {
    if (funcionarios.length > 0) {
      console.log('👥 Inicializando resultados para', funcionarios.length, 'funcionários')
      const novosResultados: PTRBAResultado[] = funcionarios.map(funcionario => ({
        funcionario_id: funcionario.id,
        nome: funcionario.nome_completo,
        nota_prova: null,
        status: null,
        observacoes: ''
      }))
      setResultados(novosResultados)
    }
  }, [funcionarios])

  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    // Se estamos na segunda etapa e mudando a equipe, verificar se há dados preenchidos
    if (modalStep === 'details' && field === 'equipe_id' && value !== formData.equipe_id) {
      const hasData = resultados.some(r => r.nota_prova !== null || r.observacoes.trim())
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

  // Atualizar resultado de funcionário
  const updateResultado = (funcionarioId: string, field: keyof PTRBAResultado, value: string | number | null) => {
    setResultados(prev => prev.map(resultado => {
      if (resultado.funcionario_id === funcionarioId) {
        const novoResultado = { ...resultado, [field]: value }
        
        // Recalcular status se nota mudou
        if (field === 'nota_prova' && typeof value === 'number') {
          novoResultado.status = calcularStatus(value)
        }
        
        return novoResultado
      }
      return resultado
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

  // Manipular mudança de nota
  const handleNotaChange = (funcionarioId: string, value: string) => {
    if (value === '') {
      updateResultado(funcionarioId, 'nota_prova', null)
      updateResultado(funcionarioId, 'status', null)
      return
    }

    const nota = parseFloat(value)
    if (!isNaN(nota) && nota >= 0 && nota <= 10) {
      updateResultado(funcionarioId, 'nota_prova', nota)
    }
  }

  // Obter cor do status
  const getStatusColor = (status: string | null): string => {
    if (!status) return 'text-gray-500'
    if (status === 'Aprovado') return 'text-green-600'
    return 'text-red-600'
  }

  // Prosseguir para segunda etapa
  const handleProceedToDetails = () => {
    const errors: Record<string, string> = {}

    // Validar campos básicos
    if (!formData.secao_id || !secaoId) errors.secao_id = 'Usuário deve ter uma base associada'
    if (!formData.data_prova) errors.data_prova = 'Data é obrigatória'
    if (!formData.equipe_id) errors.equipe_id = 'Equipe é obrigatória'

    // Validar data não futura
    if (formData.data_prova) {
      const hoje = new Date()
      const dataProvaSelecionada = new Date(`${formData.data_prova}T00:00:00`)
      if (dataProvaSelecionada > hoje) {
        errors.data_prova = 'A data não pode ser futura'
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Corrija os erros no formulário')
      return
    }

    if (funcionarios.length === 0) {
      toast.error('Nenhum funcionário encontrado para esta equipe')
      return
    }

    setModalStep('details')
  }

  // Voltar para primeira etapa
  const handleBackToSelection = () => {
    setModalStep('selection')
    setValidationErrors({})
  }

  // Salvar PTR-BA
  const handleSave = async () => {
    const errors: Record<string, string> = {}

    // Validar resultados dos funcionários
    let hasValidData = false
    resultados.forEach(resultado => {
      const prefix = resultado.funcionario_id

      // Verificar se tem nota ou observações
      if (resultado.nota_prova !== null || resultado.observacoes.trim()) {
        hasValidData = true
      }

      // Se tem nota, validar se está no range correto
      if (resultado.nota_prova !== null) {
        if (resultado.nota_prova < 0 || resultado.nota_prova > 10) {
          errors[`${prefix}_nota_prova`] = 'Nota deve estar entre 0,0 e 10,0'
        }
      }
    })

    if (!hasValidData) {
      toast.error('Preencha pelo menos uma nota ou observação')
      return
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Corrija os erros no formulário')
      return
    }

    // Preparar dados para salvar
    const dadosParaSalvar: PTRBARegistro = {
      secao_id: formData.secao_id,
      equipe_id: formData.equipe_id,
      data_prova: formData.data_prova,
      resultados: resultados
    }

    const success = await salvarPTRBA(dadosParaSalvar)
    
    if (success) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess?.()
        onClose()
      }, 2000)
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!loading && !saving) {
      onClose()
    }
  }

  // Confirmar mudança de equipe
  const handleConfirmEquipeChange = () => {
    setFormData(prev => ({ ...prev, equipe_id: pendingEquipeId }))
    setResultados([]) // Limpar resultados atuais
    setShowEquipeChangeConfirm(false)
    setPendingEquipeId('')
    toast.success('Equipe alterada. Os funcionários serão recarregados.')
  }

  // Cancelar mudança de equipe
  const handleCancelEquipeChange = () => {
    setShowEquipeChangeConfirm(false)
    setPendingEquipeId('')
  }

  // Obter data máxima (hoje)
  const getMaxDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho com alerta */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#ff6600]/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-[#ff6600]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  PTR-BA - Prova Teórica
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-700 font-medium">
                    Deve ser preenchido sempre que realizado.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading || saving}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
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
                <p className="text-green-800 font-medium">Prova teórica registrada com sucesso!</p>
              </div>
            </div>
          )}

          {/* Primeira etapa: Seleção básica */}
          {modalStep === 'selection' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Base */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                    <Building2 className="w-4 h-4" />
                    Base *
                  </label>
                  <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-black">
                    {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
                  </div>
                  {!secaoId && (
                    <p className="text-red-600 text-sm mt-1">Usuário deve ter uma base associada</p>
                  )}
                </div>

                {/* Data */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                    <Calendar className="w-4 h-4" />
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.data_prova}
                    onChange={(e) => updateField('data_prova', e.target.value)}
                    max={getMaxDate()}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      validationErrors.data_prova ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.data_prova && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.data_prova}</p>
                  )}
                </div>

                {/* Equipe */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                    <Users className="w-4 h-4" />
                    Equipe *
                  </label>
                  <select
                    value={formData.equipe_id}
                    onChange={(e) => updateField('equipe_id', e.target.value)}
                    disabled={loading || !formData.secao_id}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      validationErrors.equipe_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading || !formData.secao_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione a equipe</option>
                    {equipes.map((equipe, index) => (
                      <option key={`equipe-${equipe.id}-${index}`} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                  {validationErrors.equipe_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.equipe_id}</p>
                  )}
                </div>
              </div>

              {/* Botão para prosseguir */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleProceedToDetails}
                  disabled={loading || !secaoId}
                  className="px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Carregando...' : 'Prosseguir'}
                </button>
              </div>
            </div>
          )}

          {/* Segunda etapa: Detalhamento */}
          {modalStep === 'details' && (
            <div className="space-y-6">
              {/* Editar Informações da Prova */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-black mb-4">Editar Informações da Prova</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Base readonly */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                      <MapPin className="w-4 h-4" />
                      Base *
                    </label>
                    <div className={`w-full px-3 py-2 border rounded-lg bg-gray-50 text-black text-sm ${
                      !secaoId ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300'
                    }`}>
                      {secaoId ? nomeBase : 'Usuário sem base associada'}
                    </div>
                    {validationErrors.secao_id && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.secao_id}</p>
                    )}
                  </div>

                  {/* Data editável */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                      <Calendar className="w-4 h-4" />
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.data_prova}
                      onChange={(e) => updateField('data_prova', e.target.value)}
                      max={getMaxDate()}
                      disabled={loading || saving}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black text-sm ${
                        validationErrors.data_prova ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {validationErrors.data_prova && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.data_prova}</p>
                    )}
                  </div>

                  {/* Equipe editável */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                      <Users className="w-4 h-4" />
                      Equipe *
                    </label>
                    <select
                      value={formData.equipe_id}
                      onChange={(e) => updateField('equipe_id', e.target.value)}
                      disabled={loading || saving || !formData.secao_id}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black text-sm ${
                        validationErrors.equipe_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      } ${loading || saving || !formData.secao_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="">Selecione a equipe</option>
                      {equipes.map((equipe, index) => (
                        <option key={`equipe-${equipe.id}-${index}`} value={equipe.id}>
                          {equipe.nome}
                        </option>
                      ))}
                    </select>
                    {validationErrors.equipe_id && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.equipe_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabela de funcionários */}
              {resultados.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Funcionários da Equipe
                  </h3>

                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-semibold text-black text-sm">
                              Nome do Funcionário
                            </th>
                            <th className="text-left py-3 px-3 font-semibold text-black text-sm min-w-[120px]">
                              Nota (0,0-10,0)
                            </th>
                            <th className="text-left py-3 px-3 font-semibold text-black text-sm min-w-[100px]">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-black text-sm min-w-[200px]">
                              Observações
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultados.map((resultado, index) => (
                            <tr 
                              key={`resultado-${resultado.funcionario_id}-${index}`} 
                              className={`
                                border-b border-gray-100 transition-all duration-200 hover:bg-gray-50/80
                                ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                              `}
                            >
                              {/* Nome */}
                              <td className="py-2 px-4">
                                <div className="font-medium text-black text-sm">
                                  {resultado.nome}
                                </div>
                              </td>

                              {/* Nota */}
                              <td className="py-2 px-3">
                                <div className="relative">
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={resultado.nota_prova || ''}
                                    onChange={(e) => handleNotaChange(resultado.funcionario_id, e.target.value)}
                                    disabled={loading || saving}
                                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-500 ${
                                      validationErrors[`${resultado.funcionario_id}_nota_prova`] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="0,0"
                                  />
                                  {validationErrors[`${resultado.funcionario_id}_nota_prova`] && (
                                    <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                      {validationErrors[`${resultado.funcionario_id}_nota_prova`]}
                                    </div>
                                  )}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="py-2 px-3">
                                <div className={`
                                  px-2 py-1.5 text-sm rounded text-center font-medium border transition-all
                                  ${resultado.status === null || resultado.status === '-'
                                    ? 'bg-gray-100 border-gray-200 text-gray-500' 
                                    : resultado.status === 'Aprovado'
                                      ? 'bg-green-50 border-green-200 text-green-700' 
                                      : resultado.status === 'Reprovado'
                                        ? 'bg-red-50 border-red-200 text-red-700'
                                        : 'bg-gray-100 border-gray-200 text-gray-500'
                                  }
                                `}>
                                  {resultado.status || '-'}
                                </div>
                              </td>

                              {/* Observações */}
                              <td className="py-2 px-4">
                                <div className="relative">
                                  <textarea
                                    value={resultado.observacoes}
                                    onChange={(e) => updateResultado(resultado.funcionario_id, 'observacoes', e.target.value)}
                                    disabled={loading || saving}
                                    className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all resize-none text-black placeholder-gray-500 ${
                                      validationErrors[`${resultado.funcionario_id}_observacoes`] 
                                        ? 'border-red-300 bg-red-50' 
                                        : 'border-gray-300 hover:border-gray-400'
                                    } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder="Observações sobre a prova..."
                                    rows={1}
                                    onFocus={(e) => {
                                      e.target.rows = 2
                                    }}
                                    onBlur={(e) => {
                                      if (!e.target.value.trim()) {
                                        e.target.rows = 1
                                      }
                                    }}
                                  />
                                  {validationErrors[`${resultado.funcionario_id}_observacoes`] && (
                                    <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                      {validationErrors[`${resultado.funcionario_id}_observacoes`]}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBackToSelection}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Voltar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !secaoId}
                  className="px-6 py-3 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Salvar Prova Teórica
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de confirmação para mudança de equipe */}
        {showEquipeChangeConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-black">Confirmar Mudança de Equipe</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                  Você já preencheu algumas informações. Ao alterar a equipe, todos os dados preenchidos (notas e observações) serão perdidos. Deseja continuar?
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleCancelEquipeChange}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmEquipeChange}
                    className="px-4 py-2 bg-[#ff6600] text-white rounded-lg hover:bg-[#ff6600]/90 transition-colors font-medium"
                  >
                    Confirmar Mudança
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}