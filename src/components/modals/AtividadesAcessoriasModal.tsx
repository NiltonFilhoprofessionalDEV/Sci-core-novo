'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, FileText, X, Save, Activity } from 'lucide-react'
import { useAtividadesAcessorias, AtividadeAcessoria } from '@/hooks/useAtividadesAcessorias'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface AtividadesAcessoriasModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AtividadesAcessoriasModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: AtividadesAcessoriasModalProps) {
  const {
    loading,
    error,
    equipes,
    tiposAtividade,
    fetchEquipesByBase,
    applyTimeMask,
    validateForm,
    saveAtividade,
    setError
  } = useAtividadesAcessorias()

  // Obter dados do usuário logado
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Estado do formulário
  const [formData, setFormData] = useState<AtividadeAcessoria>({
    base_id: '',
    data_atividade: '',
    equipe_id: '',
    tipo_atividade: 'Inspeção de extintores',
    qtd_equipamentos: '',
    qtd_bombeiros: '',
    tempo_gasto: ''
  })

  // Estado de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug logs
  console.log('🔍 Modal Debug:', {
    isOpen,
    loading,
    error,
    equipesCount: equipes?.length || 0,
    tiposAtividadeCount: tiposAtividade?.length || 0,
    formData
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal aberto, resetando formulário...')
      // Resetar formulário
      setFormData({
        base_id: secaoId || '',
        data_atividade: '',
        equipe_id: '',
        tipo_atividade: 'Inspeção de extintores',
        qtd_equipamentos: '',
        qtd_bombeiros: '',
        tempo_gasto: ''
      })
      setValidationErrors({})
      setError(null)
      setShowSuccess(false)
    }
  }, [isOpen, setError, secaoId])

  // Preencher automaticamente a base do usuário logado
  useEffect(() => {
    if (isOpen && secaoId) {
      setFormData(prev => ({ ...prev, base_id: secaoId }))
    }
  }, [isOpen, secaoId])

  // Buscar equipes quando base mudar
  useEffect(() => {
    if (formData.base_id) {
      console.log('👥 Base selecionada, carregando equipes para:', formData.base_id)
      fetchEquipesByBase(formData.base_id)
      // Limpar equipe selecionada
      setFormData(prev => ({ ...prev, equipe_id: '' }))
    }
  }, [formData.base_id, fetchEquipesByBase])

  // Atualizar campo do formulário
  const updateField = (field: keyof AtividadeAcessoria, value: string) => {
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

  // Aplicar máscara de horário
  const handleTimeChange = (value: string) => {
    const maskedValue = applyTimeMask(value)
    updateField('tempo_gasto', maskedValue)
  }

  // Salvar atividade
  const handleSave = async () => {
    // Verificar se o usuário tem uma base associada
    if (!secaoId) {
      setValidationErrors({ base_id: 'Usuário deve ter uma base associada' })
      return
    }

    // Validar formulário
    const validation = validateForm(formData)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    // Salvar dados
    const success = await saveAtividade(formData)
    
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
    if (!loading) {
      onClose()
    }
  }

  // Obter data máxima (hoje)
  const getMaxDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho com alerta */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fa4b00]/10 rounded-lg">
                <Activity className="w-6 h-6 text-[#fa4b00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#7a5b3e]">
                  Atividades Acessórias
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-600 font-medium">
                    Deve ser preenchido 1 vez por mês sempre que realizada a atividade.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-8">
          {/* Mensagem de erro geral */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <p className="text-red-700 font-medium">Erro</p>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-700 font-medium">Atividade registrada com sucesso!</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4" />
                Base *
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
              </div>
              {!secaoId && (
                <p className="text-red-500 text-sm mt-1">Usuário deve ter uma base associada</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4" />
                Data *
              </label>
              <input
                type="date"
                value={formData.data_atividade}
                onChange={(e) => updateField('data_atividade', e.target.value)}
                max={getMaxDate()}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.data_atividade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.data_atividade && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.data_atividade}</p>
              )}
            </div>

            {/* Equipe */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Equipe *
              </label>
              <select
                value={formData.equipe_id}
                onChange={(e) => updateField('equipe_id', e.target.value)}
                disabled={loading || !formData.base_id}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.equipe_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading || !formData.base_id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {!formData.base_id ? 'Selecione uma base primeiro' : 'Selecione uma equipe'}
                </option>
                {equipes.map((equipe, index) => (
                  <option key={`equipe-${equipe.id}-${index}`} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
              {validationErrors.equipe_id && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.equipe_id}</p>
              )}
            </div>

            {/* Atividade */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4" />
                Atividade *
              </label>
              <select
                value={formData.tipo_atividade}
                onChange={(e) => updateField('tipo_atividade', e.target.value)}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.tipo_atividade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tiposAtividade.map((tipo, index) => (
                  <option key={`tipo-${tipo.id}-${index}`} value={tipo.nome}>
                    {tipo.nome}
                  </option>
                ))}
              </select>
              {validationErrors.tipo_atividade && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.tipo_atividade}</p>
              )}
            </div>

            {/* Quantidade de equipamentos */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4" />
                Quantidade de equipamentos inspecionados *
              </label>
              <input
                type="number"
                min="1"
                value={formData.qtd_equipamentos}
                onChange={(e) => updateField('qtd_equipamentos', e.target.value)}
                disabled={loading}
                placeholder="Ex: 15"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.qtd_equipamentos ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.qtd_equipamentos && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.qtd_equipamentos}</p>
              )}
            </div>

            {/* Quantidade de bombeiros */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4" />
                Quantidade de bombeiros na atividade *
              </label>
              <input
                type="number"
                min="1"
                value={formData.qtd_bombeiros}
                onChange={(e) => updateField('qtd_bombeiros', e.target.value)}
                disabled={loading}
                placeholder="Ex: 3"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.qtd_bombeiros ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.qtd_bombeiros && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.qtd_bombeiros}</p>
              )}
            </div>

            {/* Tempo gasto */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4" />
                Tempo gasto (HH:MM) *
              </label>
              <input
                type="text"
                value={formData.tempo_gasto}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={loading}
                placeholder="Ex: 02:30"
                maxLength={5}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-gray-900 ${
                  validationErrors.tempo_gasto ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.tempo_gasto && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.tempo_gasto}</p>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-8 py-3 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !secaoId}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63d00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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