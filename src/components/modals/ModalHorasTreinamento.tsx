'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, X, Save, BookOpen } from 'lucide-react'
import { useHorasTreinamento, HorasTreinamentoResultado, HorasTreinamentoRegistro } from '@/hooks/useHorasTreinamento'
import { toast } from 'sonner'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

interface ModalHorasTreinamentoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ModalHorasTreinamento({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalHorasTreinamentoProps) {
  const {
    secoes,
    equipes,
    funcionarios,
    loading,
    saving,
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    validarHoras,
    verificarDuplicatas,
    salvarHorasTreinamento
  } = useHorasTreinamento()

  // Estado do formulário
  const [formData, setFormData] = useState({
    secao_id: '',
    equipe_id: '',
    data_ptr_ba: '',
    hora_ptr_diaria: 0.5
  })
  const [resultados, setResultados] = useState<HorasTreinamentoResultado[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [modalStep, setModalStep] = useState<'selection' | 'details'>('selection')
  // Removido: const [isSubmitting, setIsSubmitting] = useState(false)
  const [showEquipeChangeConfirm, setShowEquipeChangeConfirm] = useState(false)
  const [pendingEquipeId, setPendingEquipeId] = useState<string>('')

  // Debug logs
  console.log('🔍 Horas Treinamento Modal Debug:', {
    isOpen,
    loading,
    saving,
    modalStep,
    secoesCount: secoes.length,
    equipesCount: equipes.length,
    funcionariosCount: funcionarios.length,
    formData,
    resultadosCount: resultados.length
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal Horas Treinamento aberto, resetando formulário...')
      setFormData({
        secao_id: '',
        equipe_id: '',
        data_ptr_ba: '',
        hora_ptr_diaria: 0.5
      })
      setResultados([])
      setValidationErrors({})
      setShowSuccess(false)
      setModalStep('selection')
      // Removido: setIsSubmitting(false)
    }
  }, [isOpen])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.secao_id) {
      console.log('👥 Seção selecionada, carregando equipes para:', formData.secao_id)
      
      // Tentar carregar equipes com fallback
      const loadEquipes = async () => {
        try {
          await fetchEquipesPorSecao(formData.secao_id)
        } catch (error) {
          console.error('❌ Erro ao carregar equipes, usando fallback:', error)
          // Fallback: mostrar mensagem amigável e permitir retry manual
          toast.error('Erro ao carregar equipes. Clique aqui para tentar novamente.', {
            action: {
              label: 'Tentar novamente',
              onClick: () => {
                console.log('🔄 Tentando carregar equipes novamente...')
                fetchEquipesPorSecao(formData.secao_id)
              }
            },
            duration: 10000 // Toast fica visível por mais tempo
          })
        }
      }
      
      loadEquipes()
      
      // Limpar equipe selecionada e funcionários
      setFormData(prev => ({ ...prev, equipe_id: '' }))
      setResultados([])
    }
  }, [formData.secao_id, fetchEquipesPorSecao])

  // Buscar funcionários quando equipe mudar
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👤 Equipe selecionada, carregando funcionários para:', formData.equipe_id)
      
      // Tentar carregar funcionários com fallback
      const loadFuncionarios = async () => {
        try {
          await fetchFuncionariosPorEquipe(formData.equipe_id)
        } catch (error) {
          console.error('❌ Erro ao carregar funcionários, usando fallback:', error)
          // Fallback: mostrar mensagem amigável e permitir retry manual
          toast.error('Erro ao carregar funcionários. Clique aqui para tentar novamente.', {
            action: {
              label: 'Tentar novamente',
              onClick: () => {
                console.log('🔄 Tentando carregar funcionários novamente...')
                fetchFuncionariosPorEquipe(formData.equipe_id)
              }
            },
            duration: 10000 // Toast fica visível por mais tempo
          })
        }
      }
      
      loadFuncionarios()
    }
  }, [formData.equipe_id, fetchFuncionariosPorEquipe])

  // Inicializar resultados quando funcionários carregarem
  useEffect(() => {
    if (funcionarios.length > 0) {
      console.log('👥 Inicializando resultados para', funcionarios.length, 'funcionários')
      const novosResultados: HorasTreinamentoResultado[] = funcionarios.map(funcionario => ({
        funcionario_id: funcionario.id,
        nome: funcionario.nome_completo,
        hora_ptr_diaria: formData.hora_ptr_diaria
      }))
      setResultados(novosResultados)
    }
  }, [funcionarios, formData.hora_ptr_diaria])

  // Atualizar campo do formulário
  const updateField = (field: string, value: string | number) => {
    // Se estamos na segunda etapa e mudando a equipe, verificar se há dados preenchidos
    if (modalStep === 'details' && field === 'equipe_id' && value !== formData.equipe_id) {
      const hasData = resultados.some(r => r.hora_ptr_diaria > 0)
      if (hasData && value) {
        setPendingEquipeId(value as string)
        setShowEquipeChangeConfirm(true)
        return
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Se mudou a hora diária, atualizar todos os resultados
    if (field === 'hora_ptr_diaria' && typeof value === 'number') {
      setResultados(prev => prev.map(resultado => ({
        ...resultado,
        hora_ptr_diaria: value
      })))
    }

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
  const updateResultado = (funcionarioId: string, field: keyof HorasTreinamentoResultado, value: string | number) => {
    setResultados(prev => prev.map(resultado => {
      if (resultado.funcionario_id === funcionarioId) {
        return { ...resultado, [field]: value }
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

  // Manipular mudança de horas
  const handleHorasChange = (funcionarioId: string, value: string) => {
    const horas = parseFloat(value)
    if (!isNaN(horas) && horas >= 0) {
      updateResultado(funcionarioId, 'hora_ptr_diaria', horas)
    }
  }

  // Prosseguir para segunda etapa
  const handleProceedToDetails = async () => {
    const errors: Record<string, string> = {}

    // Validar campos básicos
    if (!formData.secao_id) errors.secao_id = 'Base é obrigatória'
    if (!formData.data_ptr_ba) errors.data_ptr_ba = 'Data é obrigatória'
    if (!formData.equipe_id) errors.equipe_id = 'Equipe é obrigatória'
    if (formData.hora_ptr_diaria <= 0) errors.hora_ptr_diaria = 'Hora de treinamento deve ser maior que zero'

    // Validar data não futura
    if (formData.data_ptr_ba) {
      const hoje = new Date()
      const dataProvaSelecionada = new Date(formData.data_ptr_ba)
      if (dataProvaSelecionada > hoje) {
        errors.data_ptr_ba = 'A data não pode ser futura'
      }
    }

    // Validar horas
    if (!validarHoras(formData.hora_ptr_diaria.toString())) {
      errors.hora_ptr_diaria = 'Horas devem ser positivas com máximo 2 casas decimais'
    }

    // Verificar se há erros de validação ANTES de prosseguir
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Corrija os erros no formulário')
      return
    }

    if (funcionarios.length === 0) {
      toast.error('Nenhum funcionário encontrado para esta equipe')
      return
    }

    // Verificar duplicatas APENAS após todas as validações passarem
    try {
      // Garantir que os campos obrigatórios estão preenchidos antes da verificação
      if (formData.data_ptr_ba && formData.equipe_id) {
        const temDuplicatas = await verificarDuplicatas(formData.data_ptr_ba, formData.equipe_id)
        if (temDuplicatas) {
          toast.error('Já existem registros de horas de treinamento para esta data e equipe')
          return
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar duplicatas:', error)
      toast.error('Erro ao verificar duplicatas. Tente novamente.')
      return
    }

    setModalStep('details')
  }

  // Voltar para primeira etapa
  const handleBackToSelection = () => {
    setModalStep('selection')
    setValidationErrors({})
  }

  // Nova função de salvar com controle de estado robusto
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    // Prevenir comportamento padrão de formulário
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Evitar múltiplas submissões usando o estado saving do hook
    if (saving) {
      console.log('⚠️ Tentativa de submissão bloqueada - já está processando')
      return
    }

    console.log('🚀 Iniciando submissão de horas de treinamento...')
    
    try {
      const errors: Record<string, string> = {}

      // Validar resultados dos funcionários
      let hasValidData = false
      resultados.forEach(resultado => {
        const prefix = resultado.funcionario_id

        // Verificar se tem horas válidas
        if (resultado.hora_ptr_diaria > 0) {
          hasValidData = true
        }

        // Validar horas
        if (!validarHoras(resultado.hora_ptr_diaria.toString())) {
          errors[`${prefix}_hora_ptr_diaria`] = 'Horas devem ser positivas com máximo 2 casas decimais'
        }
      })

      // Verificar se há dados válidos
      if (!hasValidData) {
        toast.error('Preencha pelo menos uma hora de treinamento válida')
        return
      }

      // Verificar se há erros de validação
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        toast.error('Corrija os erros no formulário')
        return
      }

      // Preparar dados para salvar
      const dadosParaSalvar: HorasTreinamentoRegistro = {
        secao_id: formData.secao_id,
        equipe_id: formData.equipe_id,
        data_ptr_ba: formData.data_ptr_ba,
        hora_ptr_diaria: formData.hora_ptr_diaria,
        resultados: resultados.filter(r => r.hora_ptr_diaria > 0)
      }

      console.log('💾 Salvando dados:', dadosParaSalvar)
      const success = await salvarHorasTreinamento(dadosParaSalvar)
      
      if (success) {
        console.log('✅ Dados salvos com sucesso!')
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          onSuccess?.()
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar horas de treinamento:', error)
      toast.error('Erro inesperado ao salvar dados')
    }
    // Removido o bloco finally que resetava isSubmitting
  }

  // Função para lidar com tecla Enter nos inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevenir submissão automática
      e.stopPropagation()
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
              <div className="p-2 bg-[#fa4b00]/10 rounded-lg">
                <Clock className="w-6 h-6 text-[#fa4b00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  PTR-BA - Horas de Treinamento
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-700 font-medium">
                    Registre as horas de treinamento diário da equipe.
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
                <p className="text-green-800 font-medium">Horas de treinamento registradas com sucesso!</p>
              </div>
            </div>
          )}

          {/* Primeira etapa: Seleção básica */}
          {modalStep === 'selection' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Base */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                    <Building2 className="w-4 h-4" />
                    Base *
                  </label>
                  <select
                    value={formData.secao_id}
                    onChange={(e) => updateField('secao_id', e.target.value)}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      validationErrors.secao_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione a base</option>
                    {secoes.map((secao, index) => (
                      <option key={`secao-${secao.id}-${index}`} value={secao.id}>
                        {secao.nome} - {secao.cidade}
                      </option>
                    ))}
                  </select>
                  {validationErrors.secao_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.secao_id}</p>
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
                    value={formData.data_ptr_ba}
                    onChange={(e) => updateField('data_ptr_ba', e.target.value)}
                    max={getMaxDate()}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      validationErrors.data_ptr_ba ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {validationErrors.data_ptr_ba && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.data_ptr_ba}</p>
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
                    <option value="">
                      {!formData.secao_id ? 'Selecione uma base primeiro' : 'Selecione a equipe'}
                    </option>
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

                {/* Hora de treinamento diário */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-black mb-2">
                    <Clock className="w-4 h-4" />
                    Hora de treinamento diário *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.hora_ptr_diaria}
                    onChange={(e) => updateField('hora_ptr_diaria', parseFloat(e.target.value) || 0)}
                    disabled={loading}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      validationErrors.hora_ptr_diaria ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    placeholder="Ex: 2.5"
                  />
                  {validationErrors.hora_ptr_diaria && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.hora_ptr_diaria}</p>
                  )}
                </div>
              </div>

              {/* Botão para prosseguir */}
              <div className="flex justify-end pt-6">
                <button
                  onClick={handleProceedToDetails}
                  disabled={loading || !formData.secao_id || !formData.equipe_id || !formData.data_ptr_ba}
                  className="px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Carregando...' : 'Prosseguir'}
                </button>
              </div>
            </div>
          )}

          {/* Segunda etapa: Detalhes dos funcionários */}
          {modalStep === 'details' && (
            <div className="space-y-6">
              {/* Informações selecionadas */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Base:</span>
                    <p className="text-black">
                      {secoes.find(s => s.id === formData.secao_id)?.nome} - {secoes.find(s => s.id === formData.secao_id)?.cidade}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Data:</span>
                    <p className="text-black">
                      {new Date(formData.data_ptr_ba).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Equipe:</span>
                    <p className="text-black">
                      {equipes.find(e => e.id === formData.equipe_id)?.nome}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Horas padrão:</span>
                    <p className="text-black">{formData.hora_ptr_diaria}h</p>
                  </div>
                </div>
              </div>

              {/* Tabela de funcionários */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Funcionários da Equipe
                </h3>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">
                            Nome do Funcionário
                          </th>
                          <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[150px]">
                            Hora de treinamento
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
                              <div className="font-medium text-gray-900 text-sm">
                                {resultado.nome}
                              </div>
                            </td>

                            {/* Hora de treinamento */}
                            <td className="py-2 px-3">
                              <div className="relative">
                                <input
                                  type="number"
                                  step="0.5"
                                  min="0"
                                  max="24"
                                  value={resultado.hora_ptr_diaria}
                                  onChange={(e) => handleHorasChange(resultado.funcionario_id, e.target.value)}
                                  onKeyDown={handleKeyDown}
                                  disabled={loading || saving || isSubmitting}
                                  className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-500 ${
                                    validationErrors[`${resultado.funcionario_id}_hora_ptr_diaria`] 
                                      ? 'border-red-300 bg-red-50' 
                                      : 'border-gray-300 hover:border-gray-400'
                                  } ${loading || saving || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  placeholder="0.0"
                                />
                                {validationErrors[`${resultado.funcionario_id}_hora_ptr_diaria`] && (
                                  <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                    {validationErrors[`${resultado.funcionario_id}_hora_ptr_diaria`]}
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

              {/* Botões de ação */}
              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBackToSelection}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e)}
                  disabled={saving || resultados.every(r => r.hora_ptr_diaria <= 0)}
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
            <h3 className="text-lg font-semibold text-black mb-4">Confirmar mudança de equipe</h3>
            <p className="text-gray-600 mb-6">
              Você já preencheu dados para alguns funcionários. Ao mudar a equipe, esses dados serão perdidos. Deseja continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelEquipeChange}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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