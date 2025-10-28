'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Save, AlertCircle, Clock, MapPin, Users, Calendar, Building2 } from 'lucide-react'
import { useTempoResposta, type ViaturaTempo, type Equipe, type Funcionario } from '@/hooks/useTempoResposta'
import { toast } from 'sonner'

interface ModalTempoRespostaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ModalTempoResposta({ isOpen, onClose, onSuccess }: ModalTempoRespostaProps) {
  const {
    loading,
    error,
    secoes,
    equipes,
    funcionarios,
    fetchEquipesBySecao,
    fetchFuncionariosByEquipe,
    saveTempoResposta,
    validateTimeFormat,
    formatTime,
    setError
  } = useTempoResposta()

  // Estados do formulário
  const [formData, setFormData] = useState({
    secao_id: '',
    equipe_id: '',
    data_tempo_resposta: '',
  })

  // Estados do modal
  const [modalStep, setModalStep] = useState<'selection' | 'details'>('selection')
  const [viaturas, setViaturas] = useState<ViaturaTempo[]>([])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal Tempo Resposta aberto, resetando formulário...')
      setFormData({
        secao_id: '',
        equipe_id: '',
        data_tempo_resposta: '',
      })
      setViaturas([])
      setValidationErrors({})
      setShowSuccess(false)
      setModalStep('selection')
      setError(null)
    }
  }, [isOpen, setError])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.secao_id) {
      console.log('👥 Seção selecionada, carregando equipes para:', formData.secao_id)
      fetchEquipesBySecao(formData.secao_id)
      
      // Limpar equipe selecionada
      setFormData(prev => ({ ...prev, equipe_id: '' }))
      setViaturas([])
    }
  }, [formData.secao_id, fetchEquipesBySecao])

  // Buscar funcionários quando equipe mudar
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👤 Equipe selecionada, carregando funcionários para:', formData.equipe_id)
      fetchFuncionariosByEquipe(formData.equipe_id)
    }
  }, [formData.equipe_id, fetchFuncionariosByEquipe])

  // Inicializar viaturas quando funcionários carregarem
  useEffect(() => {
    if (funcionarios.length > 0 && modalStep === 'details' && viaturas.length === 0) {
      console.log('👥 Inicializando viaturas para', funcionarios.length, 'funcionários')
      const newViatura: ViaturaTempo = {
        id: Date.now().toString(),
        nome_completo: '',
        local_posicionamento: '',
        cci_utilizado: '',
        tempo_exercicio: '',
        observacoes: ''
      }
      setViaturas([newViatura])
    }
  }, [funcionarios.length, modalStep, viaturas.length])

  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro de validação
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validar primeira etapa
  const validateFirstStep = () => {
    const errors: Record<string, string> = {}

    if (!formData.secao_id) {
      errors.secao_id = 'Base é obrigatória'
    }

    if (!formData.data_tempo_resposta) {
      errors.data_tempo_resposta = 'Data é obrigatória'
    } else {
      const selectedDate = new Date(formData.data_tempo_resposta)
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      
      if (selectedDate > today) {
        errors.data_tempo_resposta = 'Data não pode ser futura'
      }
    }

    if (!formData.equipe_id) {
      errors.equipe_id = 'Equipe é obrigatória'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Validar viaturas
  const validateViaturas = () => {
    const errors: Record<string, string> = {}
    let hasValidData = false

    viaturas.forEach((viatura, index) => {
      const prefix = `viatura_${index}`

      if (viatura.nome_completo) {
        hasValidData = true

        if (!viatura.local_posicionamento) {
          errors[`${prefix}_local`] = 'Local é obrigatório'
        }

        if (!viatura.cci_utilizado) {
          errors[`${prefix}_cci`] = 'CCI é obrigatório'
        }

        if (!viatura.tempo_exercicio) {
          errors[`${prefix}_tempo`] = 'Tempo é obrigatório'
        } else if (!validateTimeFormat(viatura.tempo_exercicio)) {
          errors[`${prefix}_tempo`] = 'Formato inválido (HH:MM:SS)'
        }
      }
    })

    if (!hasValidData) {
      toast.error('Preencha pelo menos uma viatura')
      return false
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

  // Adicionar nova viatura
  const addViatura = () => {
    const newViatura: ViaturaTempo = {
      id: Date.now().toString(),
      nome_completo: '',
      local_posicionamento: '',
      cci_utilizado: '',
      tempo_exercicio: '',
      observacoes: ''
    }
    setViaturas(prev => [...prev, newViatura])
  }

  // Remover viatura
  const removeViatura = (id: string) => {
    setViaturas(prev => prev.filter(v => v.id !== id))
  }

  // Atualizar viatura
  const updateViatura = (id: string, field: keyof ViaturaTempo, value: string) => {
    setViaturas(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))

    // Limpar erro de validação
    const index = viaturas.findIndex(v => v.id === id)
    const errorKey = `viatura_${index}_${field === 'nome_completo' ? 'nome' : 
                      field === 'local_posicionamento' ? 'local' : 
                      field === 'cci_utilizado' ? 'cci' : 
                      field === 'tempo_exercicio' ? 'tempo' : field}`
    
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }

  // Formatar tempo automaticamente
  const formatTimeInput = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 6 dígitos (HHMMSS)
    const limitedNumbers = numbers.slice(0, 6)
    
    // Aplica formatação HH:MM:SS
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 4) {
      return `${limitedNumbers.slice(0, 2)}:${limitedNumbers.slice(2)}`
    } else {
      return `${limitedNumbers.slice(0, 2)}:${limitedNumbers.slice(2, 4)}:${limitedNumbers.slice(4)}`
    }
  }

  const handleTimeChange = (id: string, value: string) => {
    const formattedValue = formatTimeInput(value)
    updateViatura(id, 'tempo_exercicio', formattedValue)
  }

  const handleTimeBlur = (id: string, value: string) => {
    // Validar e completar o formato se necessário
    if (value) {
      const numbers = value.replace(/\D/g, '')
      if (numbers.length > 0) {
        // Preencher com zeros se necessário
        const paddedNumbers = numbers.padEnd(6, '0')
        const formatted = `${paddedNumbers.slice(0, 2)}:${paddedNumbers.slice(2, 4)}:${paddedNumbers.slice(4, 6)}`
        
        // Validar se é um tempo válido
        const [hours, minutes, seconds] = formatted.split(':').map(Number)
        if (hours <= 23 && minutes <= 59 && seconds <= 59) {
          updateViatura(id, 'tempo_exercicio', formatted)
        }
      }
    }
  }

  // Salvar dados
  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (loading) {
      console.log('⚠️ Tentativa de submissão bloqueada - já está processando')
      return
    }

    if (!validateViaturas()) {
      return
    }

    console.log('🚀 Iniciando submissão de tempo resposta...')
    
    try {
      const equipe = equipes.find(e => e.id === formData.equipe_id)
      if (!equipe) {
        toast.error('Equipe não encontrada')
        return
      }

      const viaturasValidas = viaturas.filter(v => v.nome_completo)
      
      console.log('💾 Salvando dados:', {
        secao_id: formData.secao_id,
        equipe: equipe.nome,
        equipe_id: formData.equipe_id,
        data: formData.data_tempo_resposta,
        viaturas: viaturasValidas.length
      })

      const secao = secoes.find(s => s.id === formData.secao_id)
      if (!secao) {
        toast.error('Seção não encontrada')
        return
      }

      await saveTempoResposta(
        secao.cidade,
        equipe.nome,
        formData.equipe_id,
        formData.data_tempo_resposta,
        viaturasValidas
      )

      console.log('✅ Dados salvos com sucesso!')
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess?.()
        onClose()
      }, 2000)

    } catch (error) {
      console.error('❌ Erro ao salvar tempo resposta:', error)
      toast.error('Erro inesperado ao salvar dados')
    }
  }

  // Função para lidar com tecla Enter nos inputs
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  // Obter data máxima (hoje)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white shadow-2xl rounded-2xl overflow-hidden border border-[#cdbdae]/20 transform transition-all duration-300 ease-out scale-100 opacity-100 translate-y-0 flex flex-col backdrop-blur-sm">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-[#cdbdae]/30 bg-gradient-to-r from-[#cdbdae]/10 to-transparent flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-black leading-tight tracking-tight">
              {modalStep === 'details' ? 'Registro de Viaturas - Tempo Resposta' : 'Tempo Resposta'}
            </h2>
            {modalStep === 'details' && (
              <p className="text-sm text-gray-600 mt-1">
                Registre as informações das viaturas para o exercício
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-3 hover:bg-[#fa4b00]/10 rounded-xl border border-transparent hover:border-[#fa4b00]/20 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-800 font-medium">Tempo de resposta registrado com sucesso!</p>
              </div>
            </div>
          )}

          {/* Mensagem de erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
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
                  <select
                    value={formData.secao_id}
                    onChange={(e) => updateField('secao_id', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                      validationErrors.secao_id 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                    }`}
                  >
                    <option value="">Selecione a base</option>
                    {secoes.map((secao) => (
                      <option key={secao.id} value={secao.id}>
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
                    Data do Exercício *
                  </label>
                  <input
                    type="date"
                    value={formData.data_tempo_resposta}
                    max={getMaxDate()}
                    onChange={(e) => updateField('data_tempo_resposta', e.target.value)}
                    onKeyDown={handleKeyDown}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                      validationErrors.data_tempo_resposta 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                    }`}
                  />
                  {validationErrors.data_tempo_resposta && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.data_tempo_resposta}</p>
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
                    onKeyDown={handleKeyDown}
                    disabled={!formData.secao_id || loading}
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                      validationErrors.equipe_id 
                        ? 'border-red-300 bg-red-50' 
                        : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                    } ${(!formData.secao_id || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione a equipe</option>
                    {equipes.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                  {validationErrors.equipe_id && (
                    <p className="text-red-600 text-sm mt-1">{validationErrors.equipe_id}</p>
                  )}
                </div>
              </div>

              {/* Botões da primeira etapa */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Cancelar
                </button>
                
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={loading}
                  className={`px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors font-medium ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {/* Segunda etapa: Detalhes das viaturas */}
          {modalStep === 'details' && (
            <div className="space-y-6">
              {/* Informações da seleção */}
              <div className="bg-[#cdbdae]/10 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-black">Base:</span>
                    <span className="ml-2 text-black">
                      {secoes.find(s => s.id === formData.secao_id)?.nome} - {secoes.find(s => s.id === formData.secao_id)?.cidade}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Data:</span>
                    <span className="ml-2 text-black">
                      {new Date(formData.data_tempo_resposta).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Equipe:</span>
                    <span className="ml-2 text-black">
                      {equipes.find(e => e.id === formData.equipe_id)?.nome}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão Adicionar Viatura */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-black">Viaturas</h3>
                <button
                  type="button"
                  onClick={addViatura}
                  disabled={loading}
                  className={`flex items-center gap-2 px-4 py-2 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] transition-colors font-medium ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Viatura
                </button>
              </div>

              {/* Tabela de Viaturas */}
              {viaturas.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border border-[#cdbdae]/30 rounded-lg overflow-hidden">
                    <thead className="bg-[#cdbdae]/20">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Nome do BA-MC</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Local Posicionamento</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">CCI Utilizado</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Tempo Atendido</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-black">Observações</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-black w-16">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viaturas.map((viatura, index) => (
                        <tr 
                          key={viatura.id}
                          className={`border-b border-[#cdbdae]/20 transition-colors duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-[#cdbdae]/5'
                          } hover:bg-[#cdbdae]/10`}
                        >
                          {/* Nome do BA-MC */}
                          <td className="px-4 py-3">
                            <select
                              value={viatura.nome_completo}
                              onChange={(e) => updateViatura(viatura.id, 'nome_completo', e.target.value)}
                              onKeyDown={handleKeyDown}
                              className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                                validationErrors[`viatura_${index}_nome`] 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                              }`}
                            >
                              <option value="">Selecione o BA-MC</option>
                              {funcionarios.map((funcionario) => (
                                <option key={funcionario.id} value={funcionario.nome_completo}>
                                  {funcionario.nome_completo}
                                </option>
                              ))}
                            </select>
                            {validationErrors[`viatura_${index}_nome`] && (
                              <p className="text-red-600 text-xs mt-1">{validationErrors[`viatura_${index}_nome`]}</p>
                            )}
                          </td>

                          {/* Local Posicionamento */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={viatura.local_posicionamento}
                              onChange={(e) => updateViatura(viatura.id, 'local_posicionamento', e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Ex: Cabeceira 14"
                              className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                                validationErrors[`viatura_${index}_local`] 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                              }`}
                            />
                            {validationErrors[`viatura_${index}_local`] && (
                              <p className="text-red-600 text-xs mt-1">{validationErrors[`viatura_${index}_local`]}</p>
                            )}
                          </td>

                          {/* CCI Utilizado */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={viatura.cci_utilizado}
                              onChange={(e) => updateViatura(viatura.id, 'cci_utilizado', e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Ex: CCI-01"
                              className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                                validationErrors[`viatura_${index}_cci`] 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                              }`}
                            />
                            {validationErrors[`viatura_${index}_cci`] && (
                              <p className="text-red-600 text-xs mt-1">{validationErrors[`viatura_${index}_cci`]}</p>
                            )}
                          </td>

                          {/* Tempo Atendido */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={viatura.tempo_exercicio}
                              onChange={(e) => handleTimeChange(viatura.id, e.target.value)}
                              onBlur={(e) => handleTimeBlur(viatura.id, e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="HH:MM:SS"
                              className={`w-full px-3 py-2 rounded border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black ${
                                validationErrors[`viatura_${index}_tempo`] 
                                  ? 'border-red-300 bg-red-50' 
                                  : 'border-[#cdbdae]/30 hover:border-[#cdbdae]/50'
                              }`}
                            />
                            {validationErrors[`viatura_${index}_tempo`] && (
                              <p className="text-red-600 text-xs mt-1">{validationErrors[`viatura_${index}_tempo`]}</p>
                            )}
                          </td>

                          {/* Observações */}
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={viatura.observacoes}
                              onChange={(e) => updateViatura(viatura.id, 'observacoes', e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder="Observações (opcional)"
                              className="w-full px-3 py-2 rounded border border-[#cdbdae]/30 hover:border-[#cdbdae]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] text-black"
                            />
                          </td>

                          {/* Ações */}
                          <td className="px-4 py-3 text-center">
                            {viaturas.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeViatura(viatura.id)}
                                disabled={loading}
                                className={`p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                                  loading ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                title="Remover viatura"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Botões da segunda etapa */}
              <div className="flex justify-between gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setModalStep('selection')}
                  disabled={loading}
                  className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Voltar
                </button>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className={`px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || viaturas.every(v => !v.nome_completo)}
                    className="flex items-center gap-2 px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63946] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#fa4b00] focus:ring-offset-2"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}