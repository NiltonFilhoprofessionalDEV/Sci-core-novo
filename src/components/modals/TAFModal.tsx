'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, FileText, X, Save, Activity, Timer } from 'lucide-react'
import { useTAF, TAFResultado, TAFRegistro } from '@/hooks/useTAF'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface TAFModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TAFModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: TAFModalProps) {
  const {
    secoes,
    equipes,
    funcionarios,
    loading,
    saving,
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    calcularDesempenho,
    validarTempo,
    salvarTAF
  } = useTAF()

  // Obter dados do usuário logado
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Estado do formulário
  const [formData, setFormData] = useState({
    secao_id: '',
    equipe_id: '',
    data_teste: ''
  })

  // Estado dos resultados dos funcionários
  const [resultados, setResultados] = useState<TAFResultado[]>([])

  // Estado de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug logs
  console.log('🔍 TAF Modal Debug:', {
    isOpen,
    loading,
    saving,
    secoesCount: 0,
    equipesCount: equipes.length,
    funcionariosCount: funcionarios.length,
    formData,
    resultadosCount: resultados.length
  })

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 TAF Modal aberto, resetando formulário...')
      setFormData({
        secao_id: secaoId || '',
        equipe_id: '',
        data_teste: ''
      })
      setResultados([])
      setValidationErrors({})
      setShowSuccess(false)
    }
  }, [isOpen, secaoId])

  // Preencher automaticamente a base do usuário logado
  useEffect(() => {
    if (isOpen && secaoId) {
      setFormData(prev => ({ ...prev, secao_id: secaoId }))
    }
  }, [isOpen, secaoId])

  // Buscar equipes quando seção mudar
  useEffect(() => {
    if (formData.secao_id) {
      console.log('👥 Seção selecionada, carregando equipes para:', formData.secao_id)
      fetchEquipesPorSecao(formData.secao_id)
      // Limpar equipe selecionada e funcionários
      setFormData(prev => ({ ...prev, equipe_id: '' }))
      setResultados([])
    }
  }, [formData.secao_id]) // Removido fetchEquipesPorSecao das dependências

  // Buscar funcionários quando equipe mudar
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👤 Equipe selecionada, carregando funcionários para:', formData.equipe_id)
      fetchFuncionariosPorEquipe(formData.equipe_id)
    }
  }, [formData.equipe_id]) // Removido fetchFuncionariosPorEquipe das dependências

  // Inicializar resultados quando funcionários carregarem
  useEffect(() => {
    if (funcionarios.length > 0) {
      console.log('👥 Inicializando resultados para', funcionarios.length, 'funcionários')
      const novosResultados: TAFResultado[] = funcionarios.map(funcionario => ({
        funcionario_id: funcionario.id,
        nome: funcionario.nome_completo,
        idade: null,
        tempo_total: '',
        desempenho: null,
        observacoes: ''
      }))
      setResultados(novosResultados)
    }
  }, [funcionarios])

  // Atualizar campo do formulário
  const updateField = (field: string, value: string) => {
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

  // Atualizar resultado de funcionário
  const updateResultado = (funcionarioId: string, field: keyof TAFResultado, value: string | number | null) => {
    setResultados(prev => prev.map(resultado => {
      if (resultado.funcionario_id === funcionarioId) {
        const novoResultado = { ...resultado, [field]: value }
        
        // Recalcular desempenho se idade ou tempo mudaram
        if ((field === 'idade' || field === 'tempo_total') && novoResultado.idade && novoResultado.tempo_total) {
          novoResultado.desempenho = calcularDesempenho(novoResultado.idade, novoResultado.tempo_total)
        }
        
        return novoResultado
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

  // Aplicar máscara de tempo HH:MM:SS
  const applyTimeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara HH:MM:SS
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}:${numbers.slice(4, 6)}`
    }
  }

  // Manipular mudança de tempo
  const handleTimeChange = (funcionarioId: string, value: string) => {
    const maskedValue = applyTimeMask(value)
    updateResultado(funcionarioId, 'tempo_total', maskedValue)
  }

  // Obter texto do desempenho
  const getDesempenhoText = (desempenho: number | null): string => {
    if (desempenho === null) return '-'
    if (desempenho === 0) return 'Reprovado'
    return `Nota ${desempenho}`
  }

  // Obter cor do desempenho
  const getDesempenhoColor = (desempenho: number | null): string => {
    if (desempenho === null) return 'text-gray-500'
    if (desempenho === 0) return 'text-red-600'
    if (desempenho >= 8) return 'text-green-600'
    if (desempenho >= 7) return 'text-yellow-600'
    return 'text-orange-600'
  }

  // Salvar TAF
  const handleSave = async () => {
    const errors: Record<string, string> = {}

    // Validar campos básicos
    if (!secaoId) errors.secao_id = 'Usuário deve ter uma base associada'
    if (!formData.data_teste) errors.data_teste = 'Data é obrigatória'
    if (!formData.equipe_id) errors.equipe_id = 'Equipe é obrigatória'

    // Validar data não futura
    if (formData.data_teste) {
      const hoje = new Date()
      const dataTesteSelecionada = new Date(formData.data_teste)
      if (dataTesteSelecionada > hoje) {
        errors.data_teste = 'A data não pode ser futura'
      }
    }

    // Validar resultados dos funcionários
    resultados.forEach(resultado => {
      const prefix = resultado.funcionario_id

      if (resultado.idade === null || resultado.idade <= 0) {
        errors[`${prefix}_idade`] = 'Idade obrigatória'
      }

      if (resultado.tempo_total && !validarTempo(resultado.tempo_total)) {
        errors[`${prefix}_tempo_total`] = 'Formato inválido (HH:MM:SS)'
      }

      // Se não realizou o TAF, observações são obrigatórias
      if ((!resultado.tempo_total || resultado.tempo_total === '00:00:00') && !resultado.observacoes.trim()) {
        errors[`${prefix}_observacoes`] = 'Observações obrigatórias quando não realizado'
      }
    })

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      toast.error('Corrija os erros no formulário')
      return
    }

    // Preparar dados para salvar
    const dadosParaSalvar: TAFRegistro = {
      secao_id: formData.secao_id,
      equipe_id: formData.equipe_id,
      data_teste: formData.data_teste,
      resultados: resultados
    }

    const success = await salvarTAF(dadosParaSalvar)
    
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
    if (!loading && !saving) {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho com alerta */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#fa4b00]/10 rounded-lg">
                <Timer className="w-6 h-6 text-[#fa4b00]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  TAF
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-amber-700 font-medium">
                    Deve ser preenchido sempre que realizado.
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
                <p className="text-green-800 font-medium">TAF registrado com sucesso!</p>
              </div>
            </div>
          )}

          {/* Campos básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Base */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                <Building2 className="w-4 h-4" />
                Base *
              </label>
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
              </div>
              {!secaoId && (
                <p className="text-red-600 text-sm mt-1">Usuário deve ter uma base associada</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
                <Calendar className="w-4 h-4" />
                Data *
              </label>
              <input
                type="date"
                value={formData.data_teste}
                onChange={(e) => updateField('data_teste', e.target.value)}
                max={getMaxDate()}
                disabled={loading}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                  validationErrors.data_teste ? 'border-red-300 bg-red-50' : 'border-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              {validationErrors.data_teste && (
                <p className="text-red-600 text-sm mt-1">{validationErrors.data_teste}</p>
              )}
            </div>

            {/* Equipe */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900 mb-2">
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
                <option value="">Selecione a equipe</option>
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
          </div>

          {/* Tabela de funcionários */}
          {resultados.length > 0 && (
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
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[80px]">
                          Idade <span className="text-red-500">*</span>
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[100px]">
                          Tempo Total
                        </th>
                        <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[100px]">
                          Desempenho
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm min-w-[200px]">
                          Observações
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

                          {/* Idade */}
                          <td className="py-2 px-3">
                            <div className="relative">
                              <input
                                type="number"
                                min="18"
                                max="70"
                                value={resultado.idade || ''}
                                onChange={(e) => updateResultado(resultado.funcionario_id, 'idade', parseInt(e.target.value) || null)}
                                disabled={loading || saving}
                                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-500 ${
                                  validationErrors[`${resultado.funcionario_id}_idade`] 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                                } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="35"
                              />
                              {validationErrors[`${resultado.funcionario_id}_idade`] && (
                                <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                  {validationErrors[`${resultado.funcionario_id}_idade`]}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Tempo Total */}
                          <td className="py-2 px-3">
                            <div className="relative">
                              <input
                                type="text"
                                value={resultado.tempo_total}
                                onChange={(e) => handleTimeChange(resultado.funcionario_id, e.target.value)}
                                disabled={loading || saving}
                                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-500 font-mono ${
                                  validationErrors[`${resultado.funcionario_id}_tempo_total`] 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                                } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="HH:MM:SS"
                                maxLength={8}
                              />
                              {validationErrors[`${resultado.funcionario_id}_tempo_total`] && (
                                <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                  {validationErrors[`${resultado.funcionario_id}_tempo_total`]}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Desempenho */}
                          <td className="py-2 px-3">
                            <div className={`
                              px-2 py-1.5 text-sm rounded text-center font-medium border transition-all
                              ${resultado.desempenho === null 
                                ? 'bg-gray-100 border-gray-200 text-gray-500' 
                                : resultado.desempenho === 0 
                                  ? 'bg-red-50 border-red-200 text-red-700' 
                                  : resultado.desempenho >= 8 
                                    ? 'bg-green-50 border-green-200 text-green-700' 
                                    : resultado.desempenho >= 7 
                                      ? 'bg-yellow-50 border-yellow-200 text-yellow-700' 
                                      : 'bg-orange-50 border-orange-200 text-orange-700'
                              }
                            `}>
                              {getDesempenhoText(resultado.desempenho)}
                            </div>
                          </td>

                          {/* Observações */}
                          <td className="py-2 px-4">
                            <div className="relative">
                              <textarea
                                value={resultado.observacoes}
                                onChange={(e) => updateResultado(resultado.funcionario_id, 'observacoes', e.target.value)}
                                disabled={loading || saving}
                                className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all resize-none text-black placeholder-gray-500 ${
                                  validationErrors[`${resultado.funcionario_id}_observacoes`] 
                                    ? 'border-red-300 bg-red-50' 
                                    : 'border-gray-300 hover:border-gray-400'
                                } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                placeholder="Ex: Férias, atestado médico, recusa..."
                                rows={1}
                                onFocus={(e) => {
                                  e.target.rows = 2
                                }}
                                onBlur={(e) => {
                                  if (!e.target.value.trim()) {
                                    e.target.rows = 1
                                  }
                                }}
                              />
                              {validationErrors[`${resultado.funcionario_id}_observacoes`] && (
                                <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                  {validationErrors[`${resultado.funcionario_id}_observacoes`]}
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

              {/* Legenda de campos obrigatórios */}
              <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                <span className="text-red-500">*</span>
                <span>Campos obrigatórios</span>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={loading || saving}
              className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving || resultados.length === 0 || !secaoId}
              className="px-6 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar TAF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}