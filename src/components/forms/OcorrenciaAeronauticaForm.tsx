'use client'

import React, { useState, useEffect } from 'react'
import { useOcorrenciasAeronauticas, FormData } from '@/hooks/useOcorrenciasAeronauticas'

interface OcorrenciaAeronauticaFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const OcorrenciaAeronauticaForm: React.FC<OcorrenciaAeronauticaFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const {
    secoes,
    equipes,
    loading,
    error,
    fetchEquipesBySecao,
    saveOcorrencia,
    validateTimeFormat,
    validateDate,
    calculateTotalTime,
    validateTimeSequence,
    setError
  } = useOcorrenciasAeronauticas()

  const [formData, setFormData] = useState<FormData>({
    secao_id: '',
    equipe_id: '',
    data_ocorrencia: '',
    tipo_ocorrencia: 'Emergência Aeronáutica',
    posicionamento_intervencao: '',
    local_ocorrencia: '',
    hora_acionamento: '',
    tempo_chegada_primeiro_cci: '',
    tempo_chegada_ultimo_cci: '',
    hora_termino: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [tempoTotal, setTempoTotal] = useState<string>('00:00:00')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calcular tempo total quando horários mudarem
  useEffect(() => {
    if (formData.hora_acionamento && formData.hora_termino) {
      if (validateTimeFormat(formData.hora_acionamento) && validateTimeFormat(formData.hora_termino)) {
        const total = calculateTotalTime(formData.hora_acionamento, formData.hora_termino)
        setTempoTotal(total)
      }
    }
  }, [formData.hora_acionamento, formData.hora_termino, calculateTotalTime, validateTimeFormat])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.secao_id) {
      fetchEquipesBySecao(formData.secao_id)
      setFormData(prev => ({ ...prev, equipe_id: '' })) // Limpar equipe selecionada
    }
  }, [formData.secao_id, fetchEquipesBySecao])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!formData.secao_id) errors.secao_id = 'Base é obrigatória'
    if (!formData.equipe_id) errors.equipe_id = 'Equipe é obrigatória'
    if (!formData.data_ocorrencia) errors.data_ocorrencia = 'Data da ocorrência é obrigatória'
    if (!formData.posicionamento_intervencao) errors.posicionamento_intervencao = 'Posicionamento/Intervenção é obrigatório'
    if (!formData.local_ocorrencia.trim()) errors.local_ocorrencia = 'Local da ocorrência é obrigatório'
    if (!formData.hora_acionamento) errors.hora_acionamento = 'Hora do acionamento é obrigatória'
    if (!formData.tempo_chegada_primeiro_cci) errors.tempo_chegada_primeiro_cci = 'Tempo para chegada do 1º CCI é obrigatório'
    if (!formData.tempo_chegada_ultimo_cci) errors.tempo_chegada_ultimo_cci = 'Tempo para chegada do último CCI é obrigatório'
    if (!formData.hora_termino) errors.hora_termino = 'Hora do término é obrigatória'

    // Validar formato de data
    if (formData.data_ocorrencia && !validateDate(formData.data_ocorrencia)) {
      errors.data_ocorrencia = 'Data não pode ser futura'
    }

    // Validar formato de horários
    if (formData.hora_acionamento && !validateTimeFormat(formData.hora_acionamento)) {
      errors.hora_acionamento = 'Formato inválido (HH:MM:SS)'
    }
    if (formData.tempo_chegada_primeiro_cci && !validateTimeFormat(formData.tempo_chegada_primeiro_cci)) {
      errors.tempo_chegada_primeiro_cci = 'Formato inválido (HH:MM:SS)'
    }
    if (formData.tempo_chegada_ultimo_cci && !validateTimeFormat(formData.tempo_chegada_ultimo_cci)) {
      errors.tempo_chegada_ultimo_cci = 'Formato inválido (HH:MM:SS)'
    }
    if (formData.hora_termino && !validateTimeFormat(formData.hora_termino)) {
      errors.hora_termino = 'Formato inválido (HH:MM:SS)'
    }

    // Validar sequência lógica de horários
    if (formData.hora_acionamento && formData.hora_termino && 
        validateTimeFormat(formData.hora_acionamento) && validateTimeFormat(formData.hora_termino)) {
      if (!validateTimeSequence(formData.hora_acionamento, formData.hora_termino)) {
        errors.hora_termino = 'Hora de término deve ser posterior ao acionamento'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const success = await saveOcorrencia(formData)
      if (success) {
        onSuccess?.()
      }
    } catch (err) {
      console.error('Erro ao salvar ocorrência:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setFormData({
      secao_id: '',
      equipe_id: '',
      data_ocorrencia: '',
      tipo_ocorrencia: 'Emergência Aeronáutica',
      posicionamento_intervencao: '',
      local_ocorrencia: '',
      hora_acionamento: '',
      tempo_chegada_primeiro_cci: '',
      tempo_chegada_ultimo_cci: '',
      hora_termino: ''
    })
    setFieldErrors({})
    setTempoTotal('00:00:00')
    setError(null)
  }

  const formatTimeInput = (value: string): string => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '')
    
    // Aplica máscara HH:MM:SS
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}:${numbers.slice(4, 6)}`
    }
  }

  const handleTimeInputChange = (field: keyof FormData, value: string) => {
    const formattedValue = formatTimeInput(value)
    handleInputChange(field, formattedValue)
  }

  return (
    <div className="p-6">
      {/* Cabeçalho com alerta */}
      <div className="mb-8">
        <div className="flex items-start gap-4 p-5 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex-shrink-0 w-6 h-6 mt-1">
            <svg className="w-6 h-6 text-orange-700" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-orange-900 leading-relaxed">
              Deve ser preenchido sempre que houver uma ocorrência aeronáutica.
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Linha 1: Base e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="secao_id" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
              Base *
            </label>
            <select
              id="secao_id"
              value={formData.secao_id}
              onChange={(e) => handleInputChange('secao_id', e.target.value)}
              className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
                fieldErrors.secao_id ? 'border-red-500' : 'border-gray-400'
              }`}
              disabled={loading}
            >
              <option value="" className="text-gray-700">Selecione uma base</option>
              {secoes.map((secao) => (
                <option key={secao.id} value={secao.id} className="text-gray-900">
                  {secao.nome} - {secao.cidade}/{secao.estado}
                </option>
              ))}
            </select>
            {fieldErrors.secao_id && (
              <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.secao_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="data_ocorrencia" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
              Data da ocorrência *
            </label>
            <input
              type="date"
              id="data_ocorrencia"
              value={formData.data_ocorrencia}
              onChange={(e) => handleInputChange('data_ocorrencia', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
                fieldErrors.data_ocorrencia ? 'border-red-500' : 'border-gray-400'
              }`}
            />
            {fieldErrors.data_ocorrencia && (
              <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.data_ocorrencia}</p>
            )}
          </div>
        </div>

        {/* Linha 2: Equipe e Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="equipe_id" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
              Equipe *
            </label>
            <select
              id="equipe_id"
              value={formData.equipe_id}
              onChange={(e) => handleInputChange('equipe_id', e.target.value)}
              className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
                fieldErrors.equipe_id ? 'border-red-500' : 'border-gray-400'
              }`}
              disabled={loading || !formData.secao_id}
            >
              <option value="" className="text-gray-700">Selecione uma equipe</option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id} className="text-gray-900">
                  {equipe.nome} ({equipe.codigo})
                </option>
              ))}
            </select>
            {fieldErrors.equipe_id && (
              <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.equipe_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="tipo_ocorrencia" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
              Tipo de ocorrência
            </label>
            <input
              type="text"
              id="tipo_ocorrencia"
              value={formData.tipo_ocorrencia}
              readOnly
              className="w-full px-4 py-3 text-base border border-gray-400 rounded-lg bg-gray-100 text-gray-800 font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Linha 3: Posicionamento/Intervenção */}
        <div>
          <label htmlFor="posicionamento_intervencao" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
            Posicionamento/Intervenção *
          </label>
          <select
            id="posicionamento_intervencao"
            value={formData.posicionamento_intervencao}
            onChange={(e) => handleInputChange('posicionamento_intervencao', e.target.value)}
            className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
              fieldErrors.posicionamento_intervencao ? 'border-red-500' : 'border-gray-400'
            }`}
          >
            <option value="" className="text-gray-700">Selecione uma opção</option>
            <option value="Posicionamento" className="text-gray-900">Posicionamento</option>
            <option value="Intervenção" className="text-gray-900">Intervenção</option>
          </select>
          {fieldErrors.posicionamento_intervencao && (
            <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.posicionamento_intervencao}</p>
          )}
        </div>

        {/* Linha 4: Local da Ocorrência */}
        <div>
          <label htmlFor="local_ocorrencia" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
            Local da Ocorrência *
          </label>
          <input
            type="text"
            id="local_ocorrencia"
            value={formData.local_ocorrencia}
            onChange={(e) => handleInputChange('local_ocorrencia', e.target.value)}
            placeholder="Ex: Grade A1, Taxway B, Pista 09/27, Prédio Terminal"
            className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 ${
              fieldErrors.local_ocorrencia ? 'border-red-500' : 'border-gray-400'
            }`}
          />
          {fieldErrors.local_ocorrencia && (
            <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.local_ocorrencia}</p>
          )}
        </div>

        {/* Seção de Horários */}
        <div className="border-t border-gray-300 pt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">Horários da Ocorrência</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="hora_acionamento" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                Hora do acionamento *
              </label>
              <input
                type="text"
                id="hora_acionamento"
                value={formData.hora_acionamento}
                onChange={(e) => handleTimeInputChange('hora_acionamento', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.hora_acionamento ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.hora_acionamento && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.hora_acionamento}</p>
              )}
            </div>

            <div>
              <label htmlFor="tempo_chegada_primeiro_cci" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                Tempo para chegada do 1º CCI *
              </label>
              <input
                type="text"
                id="tempo_chegada_primeiro_cci"
                value={formData.tempo_chegada_primeiro_cci}
                onChange={(e) => handleTimeInputChange('tempo_chegada_primeiro_cci', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.tempo_chegada_primeiro_cci ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.tempo_chegada_primeiro_cci && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.tempo_chegada_primeiro_cci}</p>
              )}
            </div>

            <div>
              <label htmlFor="tempo_chegada_ultimo_cci" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                Tempo para chegada do último CCI *
              </label>
              <input
                type="text"
                id="tempo_chegada_ultimo_cci"
                value={formData.tempo_chegada_ultimo_cci}
                onChange={(e) => handleTimeInputChange('tempo_chegada_ultimo_cci', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.tempo_chegada_ultimo_cci ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.tempo_chegada_ultimo_cci && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.tempo_chegada_ultimo_cci}</p>
              )}
            </div>

            <div>
              <label htmlFor="hora_termino" className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
                Hora do término *
              </label>
              <input
                type="text"
                id="hora_termino"
                value={formData.hora_termino}
                onChange={(e) => handleTimeInputChange('hora_termino', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-gray-900 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.hora_termino ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.hora_termino && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.hora_termino}</p>
              )}
            </div>
          </div>

          {/* Tempo Total Calculado */}
          <div className="mt-6">
            <label className="block text-base font-semibold text-gray-900 mb-3 leading-relaxed">
              Tempo da Ocorrência (calculado automaticamente)
            </label>
            <input
              type="text"
              value={tempoTotal}
              readOnly
              className="w-full md:w-48 px-4 py-3 text-base border border-gray-400 rounded-lg bg-gray-100 text-gray-800 font-mono font-semibold leading-relaxed"
            />
          </div>
        </div>

        {/* Mensagem de erro geral */}
        {error && (
          <div className="p-5 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-base text-red-800 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-300">
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="px-8 py-3 text-base font-semibold border border-gray-400 text-gray-800 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed transition-colors duration-200"
          >
            Limpar formulário
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-8 py-3 text-base font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 leading-relaxed transition-colors duration-200"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-8 py-3 text-base font-semibold text-gray-800 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}