'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, FileText, X, Save } from 'lucide-react'
import { useOcorrenciasNaoAeronauticas, OcorrenciaNaoAeronautica } from '@/hooks/useOcorrenciasNaoAeronauticas'
import { useOcorrenciasAeronauticas } from '@/hooks/useOcorrenciasAeronauticas'

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
  const {
    loading,
    error,
    equipes,
    tiposOcorrencia,
    sugestoesLocais,
    equipesPadrao,
    validateForm,
    saveOcorrencia,
    applyTimeMask,
    fetchEquipesBySecao,
    setEquipes,
    setError
  } = useOcorrenciasNaoAeronauticas()

  // Hook para buscar seções
  const { secoes } = useOcorrenciasAeronauticas()

  // Estado do formulário - atualizado para usar secao_id
  const [formData, setFormData] = useState<OcorrenciaNaoAeronautica>({
    secao_id: '',
    data_ocorrencia: '',
    equipe_id_form: '',
    tipo_ocorrencia: '',
    local_ocorrencia: '',
    hora_acionamento: '',
    hora_chegada: '',
    hora_termino: ''
  })

  // Estado de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        secao_id: '',
        data_ocorrencia: '',
        equipe_id_form: '',
        tipo_ocorrencia: '',
        local_ocorrencia: '',
        hora_acionamento: '',
        hora_chegada: '',
        hora_termino: ''
      })
      setValidationErrors({})
      setError(null)
      setShowSuccess(false)
      setEquipes([]) // Limpar equipes quando modal abre
    }
  }, [isOpen])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    console.log('🔄 useEffect disparado - formData.secao_id:', formData.secao_id)
    console.log('📊 Estado atual das equipes:', equipes)
    console.log('⏳ Estado de loading:', loading)
    
    if (formData.secao_id) {
      console.log('📞 Chamando fetchEquipesBySecao para seção:', formData.secao_id)
      fetchEquipesBySecao(formData.secao_id)
      // Limpar equipe selecionada
      setFormData(prev => ({ ...prev, equipe_id_form: '' }))
      console.log('🧹 Equipe limpa do formulário')
    } else {
      console.log('⚠️ Nenhuma seção selecionada, limpando equipes')
      setEquipes([])
    }
  }, [formData.secao_id])

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
  }

  // Função para lidar com seleção de equipe
  const handleEquipeChange = (equipeId: string) => {
    const equipeSelecionada = equipes.find(equipe => equipe.id === equipeId)
    const secaoSelecionada = secoes.find(secao => secao.id === formData.secao_id)
    
    setFormData(prev => ({
      ...prev,
      equipe_id_form: equipeId,
      equipe: equipeSelecionada?.nome || '',
      cidade_aeroporto: secaoSelecionada?.cidade || ''
    }))
    
    // Limpar erro do campo quando usuário selecionar
    if (validationErrors.equipe_id_form) {
      setValidationErrors(prev => ({ ...prev, equipe_id_form: '' }))
    }
  }

  // Aplicar máscara de horário
  const handleTimeChange = (field: keyof OcorrenciaNaoAeronautica, value: string) => {
    const maskedValue = applyTimeMask(value)
    updateField(field, maskedValue)
  }



  // Salvar ocorrência
  const handleSave = async () => {
    // Validar formulário
    const validation = validateForm(formData)
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      return
    }

    // Salvar dados
    const success = await saveOcorrencia(formData)
    
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho com alerta */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fa4b00]/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-[#fa4b00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#7a5b3e]">
                  Ocorrência não aeronáutica
                </h2>
                <p className="text-sm text-amber-600 mt-1">
                  ⚠️ Realizar o preenchimento sempre que houver ocorrência.
                </p>
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
        <div className="px-8 py-6">
          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-800 font-medium">
                  Ocorrência registrada com sucesso!
                </p>
              </div>
            </div>
          )}

          {/* Mensagem de erro geral */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Erro de sequência de horários */}
          {validationErrors.sequencia_horarios && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800">{validationErrors.sequencia_horarios}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seção de Identificação */}
            <div className="space-y-6">
              <div className="border-l-4 border-[#fa4b00] pl-4">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Identificação
                </h3>
              </div>

              {/* Base */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Building2 className="w-4 h-4 text-[#7a5b3e]" />
                  Base *
                </label>
                <select
                  value={formData.secao_id}
                  onChange={(e) => updateField('secao_id', e.target.value)}
                  className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.secao_id ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="" className="text-gray-600">Selecione uma base</option>
                  {secoes.map((secao) => (
                    <option key={secao.id} value={secao.id} className="text-black">
                      {secao.nome} - {secao.cidade}/{secao.estado}
                    </option>
                  ))}
                </select>
                {validationErrors.secao_id && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.secao_id}</p>
                )}
              </div>

              {/* Data da ocorrência */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Calendar className="w-4 h-4 text-[#7a5b3e]" />
                  Data da ocorrência
                </label>
                <input
                  type="date"
                  value={formData.data_ocorrencia}
                  onChange={(e) => updateField('data_ocorrencia', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 text-black border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.data_ocorrencia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.data_ocorrencia && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.data_ocorrencia}</p>
                )}
              </div>

            </div>

            {/* Seção de Classificação */}
            <div className="space-y-6">
              <div className="border-l-4 border-[#7a5b3e] pl-4">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Classificação
                </h3>
              </div>

              {/* Equipe */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Users className="w-4 h-4 text-[#7a5b3e]" />
                  Equipe * {loading && <span className="text-orange-500">(Carregando...)</span>}
                </label>
                <select
                  value={formData.equipe_id_form}
                  onChange={(e) => {
                    console.log('🎯 Equipe selecionada:', e.target.value)
                    handleEquipeChange(e.target.value)
                  }}
                  className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.equipe_id_form ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  disabled={loading || !formData.secao_id}
                >
                  <option value="" className="text-gray-600">
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
                {validationErrors.equipe_id_form && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.equipe_id_form}</p>
                )}
              </div>

              {/* Tipo de ocorrência */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <FileText className="w-4 h-4 text-[#7a5b3e]" />
                  Tipo de ocorrência
                </label>
                <select
                  value={formData.tipo_ocorrencia}
                  onChange={(e) => updateField('tipo_ocorrencia', e.target.value)}
                  className={`w-full px-4 py-3 text-base text-black border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.tipo_ocorrencia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="" className="text-gray-600">Selecione o tipo de ocorrência</option>
                  {tiposOcorrencia.map((tipo) => (
                    <option key={tipo} value={tipo} className="text-black">
                      {tipo}
                    </option>
                  ))}
                </select>
                {validationErrors.tipo_ocorrencia && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.tipo_ocorrencia}</p>
                )}
              </div>
            </div>
          </div>

          {/* Local da ocorrência - Campo expandido para toda a largura */}
          <div className="mt-6">
            <div className="border-l-4 border-[#7a5b3e] pl-4 mb-4">
              <h3 className="text-lg font-semibold text-black mb-2">
                Local da Ocorrência
              </h3>
            </div>
            
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                <MapPin className="w-4 h-4 text-[#7a5b3e]" />
                Local da Ocorrência
              </label>
              <p className="mb-3 text-sm text-gray-600 leading-relaxed">
                Preencha o local com a localização pelo mapa de Grade interno (EX: G-11,W-13), com o nome da Taxway ou cabeceira (EX:Taxway T , Cabeceira 14), com O nome da Instalação ou Hangar juntamente com a posição no mapa de grade (EX: Teca: H-14 ou Hangar da Sette; J-23)
              </p>
              <input
                type="text"
                value={formData.local_ocorrencia}
                onChange={(e) => updateField('local_ocorrencia', e.target.value)}
                placeholder="Descreva o local específico da ocorrência"
                className={`w-full px-4 py-3 text-black border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                  validationErrors.local_ocorrencia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {validationErrors.local_ocorrencia && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.local_ocorrencia}</p>
              )}
            </div>
          </div>

          {/* Seção de Horários */}
          <div className="mt-8">
            <div className="border-l-4 border-[#cdbdae] pl-4 mb-6">
              <h3 className="text-lg font-semibold text-black mb-2">
                Horários
              </h3>
              <p className="text-sm text-gray-600">
                Informe os horários no formato HH:MM:SS
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hora do acionamento */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Clock className="w-4 h-4 text-[#7a5b3e]" />
                  Hora do acionamento
                </label>
                <input
                  type="text"
                  value={formData.hora_acionamento}
                  onChange={(e) => handleTimeChange('hora_acionamento', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-4 py-3 text-black border rounded-lg font-mono focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.hora_acionamento ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_acionamento && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.hora_acionamento}</p>
                )}
              </div>

              {/* Hora de chegada ao local */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Clock className="w-4 h-4 text-[#7a5b3e]" />
                  Hora de chegada ao local
                </label>
                <input
                  type="text"
                  value={formData.hora_chegada}
                  onChange={(e) => handleTimeChange('hora_chegada', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-4 py-3 text-black border rounded-lg font-mono focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.hora_chegada ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_chegada && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.hora_chegada}</p>
                )}
              </div>

              {/* Hora do término */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-black mb-2">
                  <Clock className="w-4 h-4 text-[#7a5b3e]" />
                  Hora do término
                </label>
                <input
                  type="text"
                  value={formData.hora_termino}
                  onChange={(e) => handleTimeChange('hora_termino', e.target.value)}
                  placeholder="HH:MM:SS"
                  maxLength={8}
                  className={`w-full px-4 py-3 text-black border rounded-lg font-mono focus:ring-2 focus:ring-[#fa4b00] focus:border-[#fa4b00] transition-colors ${
                    validationErrors.hora_termino ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {validationErrors.hora_termino && (
                  <p className="text-red-600 text-sm mt-1">{validationErrors.hora_termino}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rodapé com botões */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-2xl">
          <div className="flex justify-end gap-4">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-8 py-3 text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
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