'use client'

import React, { useState } from 'react'
import { AlertTriangle, Clock, MapPin, Users, Calendar, Building2, X, Save, Timer } from 'lucide-react'
import { useTempoEPR } from '@/hooks/useTempoEPR'
import { toast } from 'sonner'

interface ModalTempoEPRProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ModalTempoEPR({ isOpen, onClose, onSuccess }: ModalTempoEPRProps) {
  const {
    // Estados
    bases,
    equipes,
    funcionarios,
    temposEPR,
    isLoading,
    errors,
    baseSelecionada,
    dataSelecionada,
    equipeSelecionada,
    etapaAtual,

    // Setters
    setBaseSelecionada,
    setDataSelecionada,
    setEquipeSelecionada,

    // Funções
    calcularStatus,
    salvarTemposEPR,
    resetarFormulario,
    atualizarTempo,
    prosseguirParaTabela,
    voltarParaSelecao,
    validarFormatoTempo
  } = useTempoEPR()

  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Aplicar máscara de tempo MM:SS
  const applyTimeMask = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara MM:SS
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
    }
  }

  // Manipular mudança de tempo
  const handleTimeChange = (funcionarioId: string, value: string) => {
    const maskedValue = applyTimeMask(value)
    atualizarTempo(funcionarioId, maskedValue)
  }

  // Salvar dados
  const handleSave = async () => {
    try {
      setSaving(true)
      const sucesso = await salvarTemposEPR()
      
      if (sucesso) {
        setShowSuccess(true)
        toast.success('Tempos de EPR registrados com sucesso!')
        
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 1500)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar dados')
    } finally {
      setSaving(false)
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!isLoading && !saving) {
      resetarFormulario()
      setShowSuccess(false)
      onClose()
    }
  }

  // Obter data máxima (hoje)
  const getMaxDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ideal':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'Tolerável':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'Reprovado':
        return 'bg-red-50 border-red-200 text-red-700'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-500'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#7a5b3e]/5 to-[#fa4b00]/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#fa4b00] to-[#7a5b3e] rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tempo EPR</h2>
              <p className="text-sm text-gray-600">Registro de tempos de Equipamento de Proteção Respiratória</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading || saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Alerta informativo */}
        <div className="mx-6 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Critérios de Avaliação:</p>
              <ul className="space-y-1 text-xs">
                <li><strong>Ideal:</strong> Até 00:50</li>
                <li><strong>Tolerável:</strong> De 00:51 até 01:00</li>
                <li><strong>Reprovado:</strong> Acima de 01:00</li>
              </ul>
            </div>
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
                <p className="text-green-800 font-medium">Tempos de EPR registrados com sucesso!</p>
              </div>
            </div>
          )}

          {etapaAtual === 'selecao' ? (
            <>
              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Base */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Base <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={baseSelecionada}
                    onChange={(e) => setBaseSelecionada(e.target.value)}
                    disabled={isLoading || saving}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      errors.base ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isLoading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione uma base</option>
                    {bases.map((base, index) => (
                      <option key={`base-${base.id}-${index}`} value={base.id}>
                        {base.nome}
                      </option>
                    ))}
                  </select>
                  {errors.base && (
                    <p className="text-red-600 text-sm mt-1">{errors.base}</p>
                  )}
                </div>

                {/* Data */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Data do Exercício <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dataSelecionada}
                    onChange={(e) => setDataSelecionada(e.target.value)}
                    max={getMaxDate()}
                    disabled={isLoading || saving}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      errors.data ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isLoading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  {errors.data && (
                    <p className="text-red-600 text-sm mt-1">{errors.data}</p>
                  )}
                </div>

                {/* Equipe */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Equipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={equipeSelecionada}
                    onChange={(e) => setEquipeSelecionada(e.target.value)}
                    disabled={isLoading || saving || !baseSelecionada}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      errors.equipe ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${isLoading || saving || !baseSelecionada ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione uma equipe</option>
                    {equipes.map((equipe, index) => (
                      <option key={`equipe-${equipe.id}-${index}`} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                  {errors.equipe && (
                    <p className="text-red-600 text-sm mt-1">{errors.equipe}</p>
                  )}
                </div>
              </div>

              {/* Erro de duplicata */}
              {errors.duplicata && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{errors.duplicata}</p>
                </div>
              )}

              {/* Botão Prosseguir */}
              <div className="flex justify-end">
                <button
                  onClick={prosseguirParaTabela}
                  disabled={isLoading || saving || !baseSelecionada || !dataSelecionada || !equipeSelecionada}
                  className="px-6 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63e00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Timer className="w-4 h-4" />
                      Prosseguir
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Informações selecionadas */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Base:</span>
                    <span className="ml-2 text-gray-900">
                      {bases.find(b => b.id === baseSelecionada)?.nome}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Data:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(dataSelecionada + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Equipe:</span>
                    <span className="ml-2 text-gray-900">
                      {equipes.find(e => e.id === equipeSelecionada)?.nome}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela de funcionários */}
              {funcionarios.length > 0 && (
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
                            <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[120px]">
                              Tempo EPR <span className="text-red-500">*</span>
                            </th>
                            <th className="text-left py-3 px-3 font-semibold text-gray-900 text-sm min-w-[100px]">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {funcionarios.map((funcionario, index) => {
                            const tempo = temposEPR[funcionario.id] || ''
                            const status = tempo ? calcularStatus(tempo) : ''
                            
                            return (
                              <tr 
                                key={`funcionario-${funcionario.id}-${index}`} 
                                className={`
                                  border-b border-gray-100 transition-all duration-200 hover:bg-gray-50/80
                                  ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                                `}
                              >
                                {/* Nome */}
                                <td className="py-2 px-4">
                                  <div className="font-medium text-gray-900 text-sm">
                                    {funcionario.nome_completo}
                                  </div>
                                </td>

                                {/* Tempo EPR */}
                                <td className="py-2 px-3">
                                  <div className="relative">
                                    <input
                                      type="text"
                                      value={tempo}
                                      onChange={(e) => handleTimeChange(funcionario.id, e.target.value)}
                                      disabled={isLoading || saving}
                                      className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-1 focus:ring-[#fa4b00] focus:border-transparent transition-all text-black placeholder-gray-500 font-mono ${
                                        errors[`tempo_${funcionario.id}`] 
                                          ? 'border-red-300 bg-red-50' 
                                          : 'border-gray-300 hover:border-gray-400'
                                      } ${isLoading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                      placeholder="MM:SS"
                                      maxLength={5}
                                    />
                                    {errors[`tempo_${funcionario.id}`] && (
                                      <div className="absolute -bottom-5 left-0 text-red-600 text-xs whitespace-nowrap">
                                        {errors[`tempo_${funcionario.id}`]}
                                      </div>
                                    )}
                                  </div>
                                </td>

                                {/* Status */}
                                <td className="py-2 px-3">
                                  <div className={`
                                    px-2 py-1.5 text-sm rounded text-center font-medium border transition-all
                                    ${getStatusColor(status)}
                                  `}>
                                    {status || '-'}
                                  </div>
                                </td>
                              </tr>
                            )
                          })}
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

              {/* Erro geral */}
              {errors.geral && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{errors.geral}</p>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={voltarParaSelecao}
                  disabled={isLoading || saving}
                  className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    disabled={isLoading || saving}
                    className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading || saving || funcionarios.length === 0}
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
                        Salvar Tempos
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}