'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, Calendar, Building2, Users, ArrowLeftRight } from 'lucide-react'
import { useControleTrocas } from '@/hooks/useControleTrocas'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface ModalControleTrocasProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormData {
  base_id: string
  equipe_id: string
  data: string
  quantidade_troca: string
  observacoes: string
}

export function ModalControleTrocas({ 
  isOpen, 
  onClose, 
  onSuccess 
}: ModalControleTrocasProps) {
  const { user } = useAuth()
  const secaoId = user?.profile?.secao?.id

  const {
    secoes,
    equipes,
    loading,
    loadingEquipes,
    fetchEquipesBySecao,
    salvarControleTrocas,
    getSecaoUsuario,
    isSecoesLoaded
  } = useControleTrocas(secaoId)

  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    base_id: '',
    equipe_id: '',
    data: '',
    quantidade_troca: '',
    observacoes: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  // Debug logs
  console.log('🔍 Controle Trocas Modal Debug:', {
    isOpen,
    loading,
    loadingEquipes,
    saving,
    secoesCount: 0,
    equipesCount: equipes.length,
    formData,
    user: user?.email
  })

  // Resetar formulário quando modal abre com preenchimento automático otimizado
  useEffect(() => {
    if (isOpen && isSecoesLoaded) {
      console.log('📂 Modal Controle de Trocas aberto, preenchimento automático...')
      
      // Obter seção do usuário automaticamente
      const secaoUsuario = getSecaoUsuario()
      const baseId = secaoUsuario?.id || secaoId || ''
      
      setFormData({
        base_id: baseId,
        equipe_id: '',
        data: '',
        quantidade_troca: '',
        observacoes: ''
      })
      setValidationErrors({})
      setSaving(false)
      
      console.log('✅ Base preenchida automaticamente:', secaoUsuario?.nome || 'Não encontrada')
    }
  }, [isOpen, isSecoesLoaded, getSecaoUsuario, secaoId])

  // Buscar equipes quando base mudar (otimizado com contexto)
  useEffect(() => {
    if (formData.base_id) {
      console.log('👥 Base selecionada, equipes já disponíveis no contexto:', formData.base_id)
      
      // Limpar equipe selecionada quando base muda
      setFormData(prev => ({ ...prev, equipe_id: '' }))
    }
  }, [formData.base_id])

  // Atualizar campo do formulário
  const updateField = (field: keyof FormData, value: string) => {
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

  // Validar formulário
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.base_id && !secaoId) {
      errors.base_id = 'Usuário deve ter uma base associada'
    }

    if (!formData.equipe_id) {
      errors.equipe_id = 'Equipe é obrigatória'
    }

    if (!formData.data) {
      errors.data = 'Data é obrigatória'
    } else {
      const dataReferencia = new Date(formData.data)
      const hoje = new Date()
      hoje.setHours(23, 59, 59, 999)
      
      if (dataReferencia > hoje) {
        errors.data = 'Data não pode ser futura'
      }
    }

    if (!formData.quantidade_troca || formData.quantidade_troca.trim() === '') {
      errors.quantidade_troca = 'Quantidade de trocas é obrigatória'
    } else {
      const quantidade = Number(formData.quantidade_troca)
      if (isNaN(quantidade) || quantidade < 0) {
        errors.quantidade_troca = 'Quantidade deve ser um número válido maior ou igual a zero'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Salvar dados
  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    if (!user) {
      toast.error('Usuário não autenticado')
      return
    }

    try {
      setSaving(true)

      // Buscar dados da base e equipe selecionadas
      const baseSelecionada = secoes.find(s => s.id === formData.base_id)
      const equipeSelecionada = equipes.find(e => e.id === formData.equipe_id)

      if (!baseSelecionada || !equipeSelecionada) {
        throw new Error('Base ou equipe não encontrada')
      }

      const dadosParaSalvar = {
        nome_cidade: baseSelecionada.nome_cidade || baseSelecionada.cidade || baseSelecionada.nome,
        nome_usuario: user.email || 'Usuário',
        equipe: equipeSelecionada.nome,
        data_referencia: formData.data,
        quantidade_troca: Number(formData.quantidade_troca),
        observacoes: formData.observacoes.trim() || undefined,
        secao_id: formData.base_id,
        equipe_id: formData.equipe_id
      }

      console.log('💾 Salvando controle de trocas:', dadosParaSalvar)

      await salvarControleTrocas(dadosParaSalvar)

      toast.success('Controle de trocas salvo com sucesso!')
      
      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess()
      }
      
      // Fechar modal
      onClose()
    } catch (error) {
      console.error('❌ Erro ao salvar controle de trocas:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      toast.error(`Erro ao salvar: ${errorMessage}`)
    } finally {
      setSaving(false)
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (saving) return
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ArrowLeftRight className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-black">Controle de Trocas</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 space-y-6">
          {/* Base do Usuário */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Base *
            </label>
            <div className={`w-full px-3 py-2 border rounded-lg text-black ${
              validationErrors.base_id ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
            }`}>
              {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
            </div>
            {validationErrors.base_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.base_id}</p>
            )}
          </div>

          {/* Campo de Data */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data *
            </label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => updateField('data', e.target.value)}
              disabled={saving}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                validationErrors.data ? 'border-red-500' : 'border-gray-300'
              } ${saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {validationErrors.data && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.data}</p>
            )}
          </div>

          {/* Seleção de Equipe */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Equipe *
            </label>
            <select
              value={formData.equipe_id}
              onChange={(e) => updateField('equipe_id', e.target.value)}
              disabled={!formData.base_id || loadingEquipes || saving}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                validationErrors.equipe_id ? 'border-red-500' : 'border-gray-300'
              } ${!formData.base_id || loadingEquipes || saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            >
              <option value="">
                {!formData.base_id 
                  ? 'Selecione uma base primeiro' 
                  : loadingEquipes 
                    ? 'Carregando equipes...' 
                    : 'Selecione uma equipe'
                }
              </option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id} className="text-black">
                  {equipe.nome}
                </option>
              ))}
            </select>
            {validationErrors.equipe_id && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.equipe_id}</p>
            )}
          </div>

          {/* Quantidade de Trocas */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <ArrowLeftRight className="w-4 h-4 inline mr-2" />
              Quantidade de troca mensal da equipe *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.quantidade_troca}
              onChange={(e) => updateField('quantidade_troca', e.target.value)}
              disabled={saving}
              placeholder="Digite a quantidade de trocas"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                validationErrors.quantidade_troca ? 'border-red-500' : 'border-gray-300'
              } ${saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {validationErrors.quantidade_troca && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.quantidade_troca}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => updateField('observacoes', e.target.value)}
              disabled={saving}
              placeholder="Observações adicionais (opcional)"
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black resize-vertical min-h-[80px] ${
                saving ? 'bg-gray-100 cursor-not-allowed' : 'bg-white border-gray-300'
              }`}
            />
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading || !secaoId}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
  )
}