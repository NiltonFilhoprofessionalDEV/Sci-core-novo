'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle, MapPin, Users, Calendar, Building2, X, Save, Hash, Droplets } from 'lucide-react'
import { useHigienizacaoTPS, HigienizacaoTPSFormData } from '@/hooks/useHigienizacaoTPS'
import { toast } from 'sonner'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

interface ModalHigienizacaoTPSProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ModalHigienizacaoTPS({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalHigienizacaoTPSProps) {
  const {
    secoes,
    equipes,
    loading,
    saving,
    fetchEquipesPorSecao,
    validarData,
    validarTPs,
    verificarDuplicatas,
    salvarHigienizacaoTPS
  } = useHigienizacaoTPS()

  // Refs para acessibilidade
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLSelectElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // Estado do formulário
  const [formData, setFormData] = useState<HigienizacaoTPSFormData>({
    secao_id: '',
    data: '',
    equipe: '',
    tp_higienizado: 0,
    tp_total: 0
  })
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug logs
  console.log('🧽 Higienização TPS Modal Debug:', {
    isOpen,
    loading,
    saving,
    secoesCount: secoes.length,
    equipesCount: equipes.length,
    formData
  })

  // Foco inicial e trap de foco para acessibilidade
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Delay para garantir que o modal esteja renderizado
      setTimeout(() => {
        firstInputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Navegação por teclado (ESC para fechar)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // Prevenir scroll do body quando modal está aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal Higienização TPS aberto, resetando formulário...')
      setFormData({
        secao_id: '',
        data: '',
        equipe: '',
        tp_higienizado: 0,
        tp_total: 0
      })
      setValidationErrors({})
      setShowSuccess(false)
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
      
      // Limpar equipe selecionada
      setFormData(prev => ({ ...prev, equipe: '' }))
    }
  }, [formData.secao_id, fetchEquipesPorSecao])

  // Atualizar campo do formulário
  const updateField = (field: keyof HigienizacaoTPSFormData, value: string | number) => {
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

  // Validar formulário com validações mais robustas
  const validateForm = async (): Promise<boolean> => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!formData.secao_id) {
      errors.secao_id = 'Base é obrigatória'
    }

    if (!formData.data) {
      errors.data = 'Data é obrigatória'
    } else {
      // Validação mais robusta de data
      const dataValidation = validarData(formData.data)
      if (!dataValidation) {
        errors.data = 'Data inválida ou futura não é permitida'
      } else {
        // Verificar se a data não é muito antiga (mais de 1 ano)
        const dataInformada = new Date(formData.data)
        const umAnoAtras = new Date()
        umAnoAtras.setFullYear(umAnoAtras.getFullYear() - 1)
        
        if (dataInformada < umAnoAtras) {
          errors.data = 'Data não pode ser anterior a um ano'
        }
      }
    }

    if (!formData.equipe) {
      errors.equipe = 'Equipe é obrigatória'
    }

    // Validar valores de TPs com regras mais específicas
    if (formData.tp_total <= 0) {
      errors.tp_total = 'Total de TPs deve ser maior que zero'
    }

    if (formData.tp_higienizado < 0) {
      errors.tp_higienizado = 'TPs higienizados não pode ser negativo'
    }

    // Validar consistência dos valores usando o hook
    const validacaoTPs = validarTPs(formData.tp_higienizado, formData.tp_total)
    if (!validacaoTPs.isValid) {
      errors.tp_higienizado = validacaoTPs.message || 'Valores de TPs inválidos'
    }

    // Verificar duplicatas se todos os campos necessários estão preenchidos
    if (formData.secao_id && formData.data && formData.equipe) {
      try {
        const temDuplicata = await verificarDuplicatas(formData.secao_id, formData.data, formData.equipe)
        if (temDuplicata) {
          errors.duplicata = 'Já existe um registro de higienização para esta equipe nesta data'
        }
      } catch (error) {
        console.error('❌ Erro ao verificar duplicatas:', error)
        // Não bloquear o salvamento por erro de verificação de duplicatas
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Salvar dados
  const handleSave = async () => {
    console.log('💾 Iniciando salvamento de higienização de TPS...')
    
    // Verificar se há erros de validação ANTES de prosseguir
    const isValid = await validateForm()
    if (!isValid) {
      console.log('❌ Formulário inválido, não salvando')
      toast.error('Por favor, corrija os erros antes de salvar')
      return
    }

    try {
      const success = await salvarHigienizacaoTPS(formData)
      
      if (success) {
        console.log('✅ Higienização de TPS salva com sucesso!')
        setShowSuccess(true)
        
        // Chamar callback de sucesso se fornecido
        if (onSuccess) {
          onSuccess()
        }
        
        // Fechar modal após um breve delay para mostrar feedback
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar higienização de TPS:', error)
      toast.error('Erro inesperado ao salvar dados')
    }
  }

  // Cancelar e fechar modal
  const handleCancel = () => {
    console.log('❌ Cancelando higienização de TPS...')
    onClose()
  }

  // Não renderizar se não estiver aberto
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        // Fechar modal se clicar no backdrop
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="sticky top-0 bg-gradient-to-r from-[#cdbdae]/10 to-[#7a5b3e]/5 px-6 py-4 border-b border-[#cdbdae]/20 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fa4b00]/10 rounded-lg">
                <Droplets className="w-6 h-6 text-[#fa4b00]" />
              </div>
              <div>
                <h2 id="modal-title" className="text-xl font-semibold text-[#7a5b3e]">
                  Higienização de TPS
                </h2>
                <p className="text-sm text-gray-600">
                  Registrar limpeza e desinfecção de equipamentos
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#fa4b00]/10 rounded-lg transition-colors"
              aria-label="Fechar modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Status de Conexão */}
        <div className="px-6 pt-4">
          <ConnectionStatus />
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 space-y-6">
          {/* Mensagem de Sucesso */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium">Sucesso!</p>
                <p className="text-green-700 text-sm">Higienização de TPS registrada com sucesso.</p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base */}
            <div className="md:col-span-2">
              <label htmlFor="secao" className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline mr-2" />
                Base *
              </label>
              <select
                id="secao"
                ref={firstInputRef}
                value={formData.secao_id}
                onChange={(e) => updateField('secao_id', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors text-black ${
                  validationErrors.secao_id ? 'border-red-500 bg-red-50' : 'border-[#cdbdae]'
                }`}
                disabled={loading}
                aria-describedby={validationErrors.secao_id ? 'secao-error' : undefined}
              >
                <option value="">Selecione uma base</option>
                {secoes.map((secao) => (
                  <option key={secao.id} value={secao.id}>
                    {secao.nome} - {secao.cidade}
                  </option>
                ))}
              </select>
              {validationErrors.secao_id && (
                <p id="secao-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors.secao_id}
                </p>
              )}
            </div>

            {/* Data */}
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data *
              </label>
              <input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => updateField('data', e.target.value)}
                max={new Date().toISOString().split('T')[0]} // Não permitir datas futuras
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors text-black ${
                  validationErrors.data ? 'border-red-500 bg-red-50' : 'border-[#cdbdae]'
                }`}
                aria-describedby={validationErrors.data ? 'data-error' : undefined}
              />
              {validationErrors.data && (
                <p id="data-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors.data}
                </p>
              )}
            </div>

            {/* Equipe */}
            <div>
              <label htmlFor="equipe" className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                Equipe *
              </label>
              <select
                id="equipe"
                value={formData.equipe}
                onChange={(e) => updateField('equipe', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors text-black ${
                  validationErrors.equipe_id ? 'border-red-500 bg-red-50' : 'border-[#cdbdae]'
                }`}
                disabled={!formData.secao_id || loading}
                aria-describedby={validationErrors.equipe ? 'equipe-error' : undefined}
              >
                <option value="">
                  {!formData.secao_id 
                    ? 'Selecione uma base primeiro' 
                    : loading 
                    ? 'Carregando equipes...' 
                    : 'Selecione uma equipe'
                  }
                </option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.nome}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
              {validationErrors.equipe && (
                <p id="equipe-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors.equipe}
                </p>
              )}
            </div>

            {/* TPs Higienizados */}
            <div>
              <label htmlFor="tp_higienizado" className="block text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 inline mr-2" />
                TPs Higienizados no Mês *
              </label>
              <input
                id="tp_higienizado"
                type="number"
                min="0"
                value={formData.tp_higienizado}
                onChange={(e) => updateField('tp_higienizado', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors text-black ${
                  validationErrors.tp_higienizado ? 'border-red-500 bg-red-50' : 'border-[#cdbdae]'
                }`}
                placeholder="0"
                aria-describedby={validationErrors.tp_higienizado ? 'tp-higienizado-error' : undefined}
              />
              {validationErrors.tp_higienizado && (
                <p id="tp-higienizado-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors.tp_higienizado}
                </p>
              )}
            </div>

            {/* TPs Total */}
            <div>
              <label htmlFor="tp_total" className="block text-sm font-medium text-gray-700 mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Total de TPs *
              </label>
              <input
                id="tp_total"
                type="number"
                min="1"
                value={formData.tp_total}
                onChange={(e) => updateField('tp_total', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors text-black ${
                  validationErrors.tp_total ? 'border-red-500 bg-red-50' : 'border-[#cdbdae]'
                }`}
                placeholder="0"
                aria-describedby={validationErrors.tp_total ? 'tp-total-error' : undefined}
              />
              {validationErrors.tp_total && (
                <p id="tp-total-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {validationErrors.tp_total}
                </p>
              )}
            </div>
          </div>

          {/* Erro de Duplicata */}
          {validationErrors.duplicata && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Registro Duplicado</p>
                <p className="text-red-700 text-sm">{validationErrors.duplicata}</p>
              </div>
            </div>
          )}


        </div>

        {/* Footer com Botões */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              ref={saveButtonRef}
              onClick={handleSave}
              disabled={saving || showSuccess}
              className="px-6 py-2 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63e00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}