'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, FileText, X, Save, Loader2 } from 'lucide-react'
import { useOcorrenciasNaoAeronauticas, OcorrenciaNaoAeronautica, TIPOS_OCORRENCIA } from '@/hooks/useOcorrenciasNaoAeronauticas'
import { useAuth } from '@/hooks/useAuth'

interface OcorrenciaNaoAeronauticaFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function OcorrenciaNaoAeronauticaForm({ 
  isOpen, 
  onClose, 
  onSuccess 
}: OcorrenciaNaoAeronauticaFormProps) {
  const { user } = useAuth()
  const {
    loading,
    error,
    equipes,
    saveOcorrencia,
    applyTimeMask,
    fetchEquipesBySecao,
    validateForm,
    setError
  } = useOcorrenciasNaoAeronauticas()

  // Estados do formulário
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  // Dados do usuário
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id
  const cidadeAeroporto = user?.profile?.secao?.nome?.split(' - ')[1] || 'Cidade não identificada'

  // Estado do formulário
  const [formData, setFormData] = useState<OcorrenciaNaoAeronautica>({
    secao_id: '',
    data_ocorrencia: new Date().toISOString().split('T')[0], // Data atual por padrão
    equipe_id_form: '',
    tipo_ocorrencia: '',
    local_ocorrencia: '',
    hora_acionamento: '',
    hora_chegada: '',
    hora_termino: '',
    equipe: '',
    cidade_aeroporto: ''
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen && secaoId) {
      setFormData({
        secao_id: secaoId,
        data_ocorrencia: new Date().toISOString().split('T')[0],
        equipe_id_form: '',
        tipo_ocorrencia: '',
        local_ocorrencia: '',
        hora_acionamento: '',
        hora_chegada: '',
        hora_termino: '',
        equipe: '',
        cidade_aeroporto: cidadeAeroporto
      })
      setValidationErrors({})
      setError(null)
      setShowSuccess(false)
      setIsSubmitting(false)
      
      // Buscar equipes da seção
      if (secaoId) {
        fetchEquipesBySecao(secaoId)
      }
    }
  }, [isOpen, secaoId, cidadeAeroporto])

  // Atualizar campo do formulário
  const updateField = (field: keyof OcorrenciaNaoAeronautica, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começa a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // Atualizar nome da equipe quando equipe_id_form mudar
    if (field === 'equipe_id_form' && value) {
      const equipeSelecionada = equipes.find(eq => eq.id === value)
      if (equipeSelecionada) {
        setFormData(prev => ({ ...prev, equipe: equipeSelecionada.nome }))
      }
    }
  }

  // Aplicar máscara de tempo
  const handleTimeInput = (field: keyof OcorrenciaNaoAeronautica, value: string) => {
    const maskedValue = applyTimeMask(value)
    updateField(field, maskedValue)
  }

  // Validar formulário localmente
  const validateFormData = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.data_ocorrencia) {
      errors.data_ocorrencia = 'Data da ocorrência é obrigatória'
    }

    if (!formData.equipe_id_form) {
      errors.equipe_id_form = 'Equipe é obrigatória'
    }

    if (!formData.tipo_ocorrencia) {
      errors.tipo_ocorrencia = 'Tipo de ocorrência é obrigatório'
    }

    if (!formData.local_ocorrencia?.trim()) {
      errors.local_ocorrencia = 'Local da ocorrência é obrigatório'
    }

    if (!formData.hora_acionamento) {
      errors.hora_acionamento = 'Hora do acionamento é obrigatória'
    }

    if (!formData.hora_chegada) {
      errors.hora_chegada = 'Hora da chegada é obrigatória'
    }

    if (!formData.hora_termino) {
      errors.hora_termino = 'Hora do término é obrigatória'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Submeter formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação local primeiro
    if (!validateFormData()) {
      return
    }

    if (!secaoId) {
      setError('Seção do usuário não encontrada')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Preparar dados completos
      const dadosCompletos = {
        ...formData,
        secao_id: secaoId,
        cidade_aeroporto: cidadeAeroporto
      }

      const success = await saveOcorrencia(dadosCompletos)
      
      if (success) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          onClose()
          if (onSuccess) {
            onSuccess()
          }
        }, 2000)
      }
    } catch (err) {
      console.error('Erro ao salvar:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Não renderizar se modal não estiver aberto
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Nova Ocorrência Não Aeronáutica
              </h2>
              <p className="text-sm text-gray-500">
                Registrar nova ocorrência não aeronáutica
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mensagem de Sucesso */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-green-800 font-medium">
                Ocorrência salva com sucesso!
              </span>
            </div>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-800 font-medium">
                {error}
              </span>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Primeira linha - Base e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                Base
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                {nomeBase}
              </div>
            </div>

            <div>
              <label htmlFor="data_ocorrencia" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 text-orange-600" />
                Data da Ocorrência *
              </label>
              <input
                id="data_ocorrencia"
                type="date"
                value={formData.data_ocorrencia}
                onChange={(e) => updateField('data_ocorrencia', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                  validationErrors.data_ocorrencia ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {validationErrors.data_ocorrencia && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.data_ocorrencia}</p>
              )}
            </div>
          </div>

          {/* Segunda linha - Equipe e Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="equipe_id_form" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users className="w-4 h-4 text-orange-600" />
                Equipe *
              </label>
              <select
                id="equipe_id_form"
                value={formData.equipe_id_form}
                onChange={(e) => updateField('equipe_id_form', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                  validationErrors.equipe_id_form ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Carregando equipes...' : 'Selecione uma equipe'}
                </option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nome}
                  </option>
                ))}
              </select>
              {validationErrors.equipe_id_form && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.equipe_id_form}</p>
              )}
            </div>

            <div>
              <label htmlFor="tipo_ocorrencia" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 text-orange-600" />
                Tipo de Ocorrência *
              </label>
              <select
                id="tipo_ocorrencia"
                value={formData.tipo_ocorrencia}
                onChange={(e) => updateField('tipo_ocorrencia', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                  validationErrors.tipo_ocorrencia ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione o tipo</option>
                {TIPOS_OCORRENCIA.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
              {validationErrors.tipo_ocorrencia && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.tipo_ocorrencia}</p>
              )}
            </div>
          </div>

          {/* Local da Ocorrência */}
          <div>
            <label htmlFor="local_ocorrencia" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 text-orange-600" />
              Local da Ocorrência *
            </label>
            <input
              id="local_ocorrencia"
              type="text"
              value={formData.local_ocorrencia}
              onChange={(e) => updateField('local_ocorrencia', e.target.value)}
              placeholder="Digite o local da ocorrência"
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black ${
                validationErrors.local_ocorrencia ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {validationErrors.local_ocorrencia && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.local_ocorrencia}</p>
            )}
          </div>

          {/* Horários */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              Horários da Ocorrência
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="hora_acionamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora do Acionamento *
                </label>
                <input
                  id="hora_acionamento"
                  type="text"
                  value={formData.hora_acionamento}
                  onChange={(e) => handleTimeInput('hora_acionamento', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-black ${
                    validationErrors.hora_acionamento ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_acionamento && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.hora_acionamento}</p>
                )}
              </div>

              <div>
                <label htmlFor="hora_chegada" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora da Chegada *
                </label>
                <input
                  id="hora_chegada"
                  type="text"
                  value={formData.hora_chegada}
                  onChange={(e) => handleTimeInput('hora_chegada', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-black ${
                    validationErrors.hora_chegada ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_chegada && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.hora_chegada}</p>
                )}
              </div>

              <div>
                <label htmlFor="hora_termino" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora do Término *
                </label>
                <input
                  id="hora_termino"
                  type="text"
                  value={formData.hora_termino}
                  onChange={(e) => handleTimeInput('hora_termino', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono text-black ${
                    validationErrors.hora_termino ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_termino && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.hora_termino}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
        </form>
      </div>
    </div>
  )
}