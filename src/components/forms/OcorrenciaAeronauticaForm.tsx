'use client'

import React, { useState, useEffect } from 'react'
import { Building2, Users, Calendar, FileText, Clock, X, RotateCcw, Save } from 'lucide-react'
import { useOcorrenciasAeronauticas, FormData } from '@/hooks/useOcorrenciasAeronauticas'

interface OcorrenciaAeronauticaFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const OcorrenciaAeronauticaForm: React.FC<OcorrenciaAeronauticaFormProps> = ({
  onSuccess,
  onCancel
}) => {
  console.log('🚀 OcorrenciaAeronauticaForm renderizado!')
  
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
    setError,
    setEquipes
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
    console.log('🔄 useEffect disparado - formData.secao_id:', formData.secao_id)
    console.log('📊 Estado atual das equipes:', equipes)
    console.log('⏳ Estado de loading:', loading)
    
    if (formData.secao_id) {
      console.log('📞 Chamando fetchEquipesBySecao para seção:', formData.secao_id)
      fetchEquipesBySecao(formData.secao_id)
      // Limpar equipe selecionada
      setFormData(prev => ({ ...prev, equipe_id: '' }))
      console.log('🧹 Equipe limpa do formulário')
    } else {
      console.log('⚠️ Nenhuma seção selecionada, limpando equipes')
      setEquipes([])
    }
  }, [formData.secao_id, fetchEquipesBySecao])

  // Debug adicional para monitorar mudanças no estado das equipes
  useEffect(() => {
    console.log('🔍 Estado das equipes mudou:', {
      quantidade: equipes.length,
      equipes: equipes,
      loading: loading
    })
  }, [equipes, loading])

  // Log adicional para verificar renderização do select
  useEffect(() => {
    console.log('🎨 Renderizando select de equipes:', {
      secaoSelecionada: formData.secao_id,
      equipesDisponiveis: equipes.length,
      loading: loading,
      equipesData: equipes
    })
  }, [formData.secao_id, equipes, loading])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpar erro do campo quando usuário começar a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Função para lidar com seleção de equipe
  const handleEquipeChange = (equipeId: string) => {
    const equipeSelecionada = equipes.find(equipe => equipe.id === equipeId)
    const secaoSelecionada = secoes.find(secao => secao.id === formData.secao_id)
    
    setFormData(prev => ({
      ...prev,
      equipe_id: equipeId,
      equipe: equipeSelecionada?.nome || '',
      cidade_aeroporto: secaoSelecionada?.cidade || ''
    }))
    
    // Limpar erro do campo quando usuário selecionar
    if (fieldErrors.equipe_id) {
      setFieldErrors(prev => ({ ...prev, equipe_id: '' }))
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!formData.secao_id) errors.secao_id = 'Base é obrigatória'
    if (!formData.equipe_id) errors.equipe_id = 'Equipe é obrigatória'
    if (!formData.equipe) errors.equipe = 'Nome da equipe é obrigatório'
    if (!formData.cidade_aeroporto) errors.cidade_aeroporto = 'Cidade do aeroporto é obrigatória'
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
      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Linha 1: Base e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="secao_id" className="flex items-center gap-2 text-base font-semibold text-black mb-3 leading-relaxed">
              <Building2 className="w-4 h-4 text-[#7a5b3e]" />
              Base *
            </label>
            <select
              id="secao_id"
              value={formData.secao_id}
              onChange={(e) => handleInputChange('secao_id', e.target.value)}
              className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
                fieldErrors.secao_id ? 'border-red-500' : 'border-gray-400'
              }`}
              disabled={loading}
            >
              <option value="" className="text-gray-700">Selecione uma base</option>
              {secoes.map((secao) => (
                <option key={secao.id} value={secao.id} className="text-black">
                  {secao.nome} - {secao.cidade}/{secao.estado}
                </option>
              ))}
            </select>
            {fieldErrors.secao_id && (
              <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.secao_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="data_ocorrencia" className="flex items-center gap-2 text-base font-semibold text-black mb-3 leading-relaxed">
              <Calendar className="w-4 h-4 text-[#7a5b3e]" />
              Data da ocorrência *
            </label>
            <input
              type="date"
              id="data_ocorrencia"
              value={formData.data_ocorrencia}
              onChange={(e) => handleInputChange('data_ocorrencia', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
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
            <label htmlFor="equipe_id" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
              <Users className="w-4 h-4 text-[#7a5b3e]" />
              Equipe * {loading && <span className="text-orange-500">(Carregando...)</span>}
            </label>
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
              Selecione a base para poder selecionar a equipe.
            </p>
            <select
              id="equipe_id"
              value={formData.equipe_id}
              onChange={(e) => handleEquipeChange(e.target.value)}
              className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
                fieldErrors.equipe_id ? 'border-red-500' : 'border-gray-400'
              }`}
              disabled={loading || !formData.secao_id}
            >
              <option value="" className="text-gray-700">
                {!formData.secao_id 
                  ? 'Selecione uma base primeiro' 
                  : loading 
                    ? 'Carregando equipes...' 
                    : equipes.length === 0 
                      ? 'Nenhuma equipe encontrada'
                      : 'Selecione uma equipe'
                }
              </option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id} className="text-black">
                  {equipe.nome}
                </option>
              ))}
            </select>
            {fieldErrors.equipe_id && (
              <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.equipe_id}</p>
            )}
          </div>

          <div>
            <label htmlFor="tipo_ocorrencia" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
              <FileText className="w-4 h-4 text-[#7a5b3e]" />
              Tipo de ocorrência
            </label>
            <p className="mb-3 text-sm text-gray-600 leading-relaxed">
              Esse item é preenchido automaticamente pelo sistema.
            </p>
            <input
              type="text"
              id="tipo_ocorrencia"
              value={formData.tipo_ocorrencia}
              readOnly
              className="w-full px-4 py-3 text-base border border-gray-400 rounded-lg bg-gray-100 text-black font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Linha 3: Posicionamento/Intervenção */}
        <div>
          <label htmlFor="posicionamento_intervencao" className="flex items-center gap-2 text-base font-semibold text-black mb-3 leading-relaxed">
            <FileText className="w-4 h-4 text-[#7a5b3e]" />
            Posicionamento/Intervenção *
          </label>
          <select
            id="posicionamento_intervencao"
            value={formData.posicionamento_intervencao}
            onChange={(e) => handleInputChange('posicionamento_intervencao', e.target.value)}
            className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed ${
              fieldErrors.posicionamento_intervencao ? 'border-red-500' : 'border-gray-400'
            }`}
          >
            <option value="" className="text-gray-700">Selecione uma opção</option>
            <option value="Posicionamento" className="text-black">Posicionamento</option>
            <option value="Intervenção" className="text-black">Intervenção</option>
          </select>
          {fieldErrors.posicionamento_intervencao && (
            <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.posicionamento_intervencao}</p>
          )}
        </div>

        {/* Linha 4: Local da Ocorrência */}
        <div>
          <label htmlFor="local_ocorrencia" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
            <FileText className="w-4 h-4 text-[#7a5b3e]" />
            Local da Ocorrência *
          </label>
          <p className="mb-3 text-sm text-gray-600 leading-relaxed">
            Preencha o local com a localização pelo mapa de Grade interno (EX: G-11,W-13), com o nome da Taxway ou cabeceira (EX:Taxway T , Cabeceira 14), com O nome da Instalação ou Hangar juntamente com a posição no mapa de grade (EX: Teca: H-14 ou Hangar da Sette; J-23)
          </p>
          <input
            type="text"
            id="local_ocorrencia"
            value={formData.local_ocorrencia}
            onChange={(e) => handleInputChange('local_ocorrencia', e.target.value)}
            placeholder="EX: G-11,W-13 , Taxway T , Cabeceira 14, Teca: H-14"
            className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 ${
              fieldErrors.local_ocorrencia ? 'border-red-500' : 'border-gray-400'
            }`}
          />
          {fieldErrors.local_ocorrencia && (
            <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.local_ocorrencia}</p>
          )}
        </div>

        {/* Seção de Horários */}
        <div className="border-t border-gray-300 pt-8">
          <h3 className="text-xl font-bold text-black mb-6 leading-relaxed">Horários da Ocorrência</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="hora_acionamento" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
                <Clock className="w-4 h-4 text-[#7a5b3e]" />
                Hora do acionamento *
              </label>
              <div className="h-12 mb-3 flex items-start">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Horário em que a equipe da SCI foi acionada via sirene ou rádio.
                </p>
              </div>
              <input
                type="text"
                id="hora_acionamento"
                value={formData.hora_acionamento}
                onChange={(e) => handleTimeInputChange('hora_acionamento', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.hora_acionamento ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.hora_acionamento && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.hora_acionamento}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="tempo_chegada_primeiro_cci" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
                <Clock className="w-4 h-4 text-[#7a5b3e]" />
                Tempo para chegada do 1º CCI *
              </label>
              <div className="h-12 mb-3 flex items-start">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tempo cronometrado do tempo em que o primeiro CCI se posicionou ou realizou a intervenção.
                </p>
              </div>
              <input
                type="text"
                id="tempo_chegada_primeiro_cci"
                value={formData.tempo_chegada_primeiro_cci}
                onChange={(e) => handleTimeInputChange('tempo_chegada_primeiro_cci', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.tempo_chegada_primeiro_cci ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.tempo_chegada_primeiro_cci && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.tempo_chegada_primeiro_cci}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="tempo_chegada_ultimo_cci" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
                <Clock className="w-4 h-4 text-[#7a5b3e]" />
                Tempo para chegada do último CCI *
              </label>
              <div className="h-12 mb-3 flex items-start">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tempo cronometrado do tempo em que o último CCI se posicionou ou realizou a intervenção.
                </p>
              </div>
              <input
                type="text"
                id="tempo_chegada_ultimo_cci"
                value={formData.tempo_chegada_ultimo_cci}
                onChange={(e) => handleTimeInputChange('tempo_chegada_ultimo_cci', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
                  fieldErrors.tempo_chegada_ultimo_cci ? 'border-red-500' : 'border-gray-400'
                }`}
              />
              {fieldErrors.tempo_chegada_ultimo_cci && (
                <p className="mt-2 text-base text-red-700 font-medium">{fieldErrors.tempo_chegada_ultimo_cci}</p>
              )}
            </div>

            <div className="flex flex-col">
              <label htmlFor="hora_termino" className="flex items-center gap-2 text-base font-semibold text-black mb-2 leading-relaxed">
                <Clock className="w-4 h-4 text-[#7a5b3e]" />
                Hora do término *
              </label>
              <div className="h-12 mb-3 flex items-start">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Hora em que o BA-CE deu por encerrado a ocorrência.
                </p>
              </div>
              <input
                type="text"
                id="hora_termino"
                value={formData.hora_termino}
                onChange={(e) => handleTimeInputChange('hora_termino', e.target.value)}
                placeholder="HH:MM:SS"
                maxLength={8}
                className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 leading-relaxed placeholder-gray-600 font-mono ${
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
            <label className="flex items-center gap-2 text-base font-semibold text-black mb-3 leading-relaxed">
              <Clock className="w-4 h-4 text-[#7a5b3e]" />
              Tempo da Ocorrência (calculado automaticamente)
            </label>
            <input
              type="text"
              value={tempoTotal}
              readOnly
              className="w-full md:w-48 px-4 py-3 text-base border border-gray-400 rounded-lg bg-gray-100 text-black font-mono font-semibold leading-relaxed"
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
        <div className="flex justify-end gap-4 pt-8 border-t border-gray-300">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-8 py-3 text-base font-normal text-black hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed transition-colors duration-200"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="px-8 py-3 text-base font-normal bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 leading-relaxed transition-colors duration-200"
          >
            {isSubmitting ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}