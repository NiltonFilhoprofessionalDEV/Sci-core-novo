'use client'

import React, { useState, useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle, MapPin, Users, Calendar, Building2, X, Save, Hash } from 'lucide-react'
import { useVerificacaoTPs, VerificacaoTPsFormData } from '@/hooks/useVerificacaoTPs'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { ConnectionStatus } from '@/components/ui/ConnectionStatus'

interface ModalVerificacaoTPsProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ModalVerificacaoTPs({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalVerificacaoTPsProps) {
  const {
    equipes,
    loading,
    saving,
    fetchEquipesPorSecao,
    validarData,
    validarTPs,
    verificarDuplicatas,
    salvarVerificacaoTPs
  } = useVerificacaoTPs()

  // Dados do usuário logado
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Refs para acessibilidade
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLSelectElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)

  // Estado do formulário
  const [formData, setFormData] = useState<VerificacaoTPsFormData>({
    secao_id: '',
    data: '',
    equipe: '',
    tp_conforme: 0,
    tp_verificado: 0,
    tp_total: 0
  })
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug logs
  console.log('🔍 Verificação TPs Modal Debug:', {
    isOpen,
    loading,
    saving,
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
      console.log('📂 Modal Verificação TPs aberto, resetando formulário...')
      setFormData({
        secao_id: secaoId || '',
        data: '',
        equipe: '',
        tp_conforme: 0,
        tp_verificado: 0,
        tp_total: 0
      })
      setValidationErrors({})
      setShowSuccess(false)
    }
  }, [isOpen, secaoId])

  // Definir automaticamente a secao_id quando o modal abrir
  useEffect(() => {
    if (isOpen && secaoId && !formData.secao_id) {
      setFormData(prev => ({
        ...prev,
        secao_id: secaoId
      }))
    }
  }, [isOpen, secaoId, formData.secao_id])

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
  const updateField = (field: keyof VerificacaoTPsFormData, value: string | number) => {
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
    if (!formData.secao_id && !secaoId) {
      errors.secao_id = 'Usuário deve ter uma base associada'
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
        const dataInformada = new Date(`${formData.data}T00:00:00`)
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

    if (formData.tp_verificado < 0) {
      errors.tp_verificado = 'TPs verificados não pode ser negativo'
    }

    if (formData.tp_conforme < 0) {
      errors.tp_conforme = 'TPs conformes não pode ser negativo'
    }

    // Validar consistência dos valores
    const validacaoTPs = validarTPs(formData.tp_conforme, formData.tp_verificado, formData.tp_total)
    if (!validacaoTPs.isValid) {
      errors.tp_valores = validacaoTPs.message || 'Valores de TPs inválidos'
    }

    // Verificar duplicatas apenas no momento do salvamento
     if (formData.secao_id && formData.data && formData.equipe) {
       try {
         const isDuplicate = await verificarDuplicatas(formData.data, formData.secao_id, formData.equipe)
         if (isDuplicate) {
           errors.duplicate = 'Já existe um registro para esta seção, data e equipe'
         }
       } catch (error) {
         console.error('Erro ao verificar duplicatas:', error)
         errors.duplicate = 'Erro ao verificar duplicatas. Tente novamente.'
       }
     }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Manipular mudança de valores de TPs com validação em tempo real
  const handleTPChange = (field: 'tp_conforme' | 'tp_verificado' | 'tp_total', value: string) => {
    // Permitir apenas números inteiros positivos
    const numValue = Math.max(0, parseInt(value) || 0)
    updateField(field, numValue)

    // Validação em tempo real para feedback imediato
    setTimeout(() => {
      const currentValues = {
        tp_conforme: field === 'tp_conforme' ? numValue : formData.tp_conforme,
        tp_verificado: field === 'tp_verificado' ? numValue : formData.tp_verificado,
        tp_total: field === 'tp_total' ? numValue : formData.tp_total
      }
      
      const validacao = validarTPs(currentValues.tp_conforme, currentValues.tp_verificado, currentValues.tp_total)
      
      if (!validacao.isValid && validacao.message) {
        setValidationErrors(prev => ({ ...prev, tp_valores: validacao.message! }))
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.tp_valores
          return newErrors
        })
      }
    }, 100)
  }

  // Manipular teclas nos inputs numéricos
  const handleNumericKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // Permitir apenas números, backspace, delete, tab, escape, enter e setas
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
    ]
    
    if (!allowedKeys.includes(event.key) && !/^[0-9]$/.test(event.key)) {
      event.preventDefault()
    }
  }

  // Salvar dados
  const handleSave = async () => {
    try {
      console.log('💾 Iniciando salvamento de verificação de TPs...')

      // Validar formulário
      const isValid = await validateForm()
      if (!isValid) {
        toast.error('Corrija os erros no formulário')
        // Focar no primeiro campo com erro
        const firstErrorField = Object.keys(validationErrors)[0]
        const errorElement = document.querySelector(`[data-field="${firstErrorField}"]`) as HTMLElement
        errorElement?.focus()
        return
      }

      console.log('💾 Salvando dados:', formData)
      const success = await salvarVerificacaoTPs(formData)
      
      if (success) {
        console.log('✅ Dados salvos com sucesso!')
        setShowSuccess(true)
        toast.success('Verificação de TPs salva com sucesso!')
        setTimeout(() => {
          setShowSuccess(false)
          onSuccess?.()
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Erro ao salvar verificação de TPs:', error)
      toast.error('Erro inesperado ao salvar dados')
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (saving) {
      toast.warning('Aguarde o salvamento terminar')
      return
    }
    onClose()
  }

  // Obter data máxima (hoje)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        ref={modalRef}
        className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Hash className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 id="modal-title" className="text-xl font-bold text-[#1f1f1f]">
                Verificação de TPs
              </h2>
              <p id="modal-description" className="text-sm text-[#7a5b3e]/70">
                Registre a verificação de Trabalhos Práticos
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-[#1f1f1f]" />
          </button>
        </div>

        {/* Status de Conexão */}
        <div className="px-6 pt-4">
          <ConnectionStatus />
        </div>

        {/* Mensagem de Sucesso */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">Verificação de TPs salva com sucesso!</span>
          </div>
        )}

        {/* Formulário */}
        <div className="p-6 space-y-6">
          {/* Base do Usuário */}
          <div className="space-y-2">
            <label htmlFor="secao-select" className="block text-sm font-medium text-[#1f1f1f]">
              <Building2 className="w-4 h-4 inline mr-2" />
              Base *
            </label>
            <div className={`w-full px-3 py-2 border rounded-lg text-gray-900 ${
              validationErrors.secao_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
            }`}>
              {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
            </div>
            {validationErrors.secao_id && (
              <p id="secao-error" className="text-sm text-red-600" role="alert">
                {validationErrors.secao_id}
              </p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label htmlFor="data-input" className="block text-sm font-medium text-[#1f1f1f]">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data *
            </label>
            <input
              id="data-input"
              data-field="data"
              type="date"
              value={formData.data}
              onChange={(e) => updateField('data', e.target.value)}
              max={getMaxDate()}
              disabled={loading || saving}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent disabled:opacity-50 text-gray-900 ${
                validationErrors.data ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={validationErrors.data ? 'data-error' : undefined}
              aria-required="true"
            />
            {validationErrors.data && (
              <p id="data-error" className="text-sm text-red-600" role="alert">
                {validationErrors.data}
              </p>
            )}
          </div>

          {/* Equipe */}
          <div className="space-y-2">
            <label htmlFor="equipe-select" className="block text-sm font-medium text-[#1f1f1f]">
              <Users className="w-4 h-4 inline mr-2" />
              Equipe *
            </label>
            <select
              id="equipe-select"
              data-field="equipe"
              value={formData.equipe}
              onChange={(e) => updateField('equipe', e.target.value)}
              disabled={loading || saving || !formData.secao_id}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent disabled:opacity-50 text-gray-900 ${
                validationErrors.equipe ? 'border-red-500' : 'border-gray-300'
              }`}
              aria-describedby={validationErrors.equipe ? 'equipe-error' : undefined}
              aria-required="true"
            >
              <option value="">
                {!formData.secao_id ? 'Selecione uma base primeiro' : 'Selecione uma equipe'}
              </option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.nome}>
                  {equipe.nome}
                </option>
              ))}
            </select>
            {validationErrors.equipe && (
              <p id="equipe-error" className="text-sm text-red-600" role="alert">
                {validationErrors.equipe}
              </p>
            )}
            {validationErrors.duplicate && (
              <p className="text-sm text-red-600" role="alert">
                {validationErrors.duplicate}
              </p>
            )}
          </div>

          {/* Valores de TPs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* TPs Conformes */}
            <div className="space-y-2">
              <label htmlFor="tp-conforme" className="block text-sm font-medium text-[#1f1f1f]">
                TPs Conformes *
              </label>
              <input
                id="tp-conforme"
                data-field="tp_conforme"
                type="number"
                min="0"
                value={formData.tp_conforme}
                onChange={(e) => handleTPChange('tp_conforme', e.target.value)}
                onKeyDown={handleNumericKeyDown}
                disabled={loading || saving}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent disabled:opacity-50 text-gray-900 ${
                  validationErrors.tp_conforme ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby="tp-conforme-help"
                aria-required="true"
              />
              <p id="tp-conforme-help" className="text-xs text-[#7a5b3e]/70">
                Número de TPs que estão conformes
              </p>
            </div>

            {/* TPs Verificados */}
            <div className="space-y-2">
              <label htmlFor="tp-verificado" className="block text-sm font-medium text-[#1f1f1f]">
                TPs Verificados *
              </label>
              <input
                id="tp-verificado"
                data-field="tp_verificado"
                type="number"
                min="0"
                value={formData.tp_verificado}
                onChange={(e) => handleTPChange('tp_verificado', e.target.value)}
                onKeyDown={handleNumericKeyDown}
                disabled={loading || saving}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent disabled:opacity-50 text-gray-900 ${
                  validationErrors.tp_verificado ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby="tp-verificado-help"
                aria-required="true"
              />
              <p id="tp-verificado-help" className="text-xs text-[#7a5b3e]/70">
                Número de TPs que foram verificados
              </p>
            </div>

            {/* TPs Total */}
            <div className="space-y-2">
              <label htmlFor="tp-total" className="block text-sm font-medium text-[#1f1f1f]">
                Total de TPs *
              </label>
              <input
                id="tp-total"
                data-field="tp_total"
                type="number"
                min="1"
                value={formData.tp_total}
                onChange={(e) => handleTPChange('tp_total', e.target.value)}
                onKeyDown={handleNumericKeyDown}
                disabled={loading || saving}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent disabled:opacity-50 text-gray-900 ${
                  validationErrors.tp_total ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby="tp-total-help"
                aria-required="true"
              />
              <p id="tp-total-help" className="text-xs text-[#7a5b3e]/70">
                Número total de TPs disponíveis
              </p>
            </div>
          </div>




        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/20">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-[#1f1f1f] hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            ref={saveButtonRef}
            onClick={handleSave}
            disabled={saving || loading || Object.keys(validationErrors).length > 0 || !secaoId}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            aria-describedby="save-button-help"
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
          <p id="save-button-help" className="sr-only">
            Salvar verificação de TPs. Botão desabilitado se houver erros de validação.
          </p>
        </div>
      </div>
    </div>
  )
}