'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Save, AlertCircle, Clock, MapPin, Users, Calendar, Building2, Timer, Trash2 } from 'lucide-react'
import { useTempoResposta, type ViaturaTempo, type Equipe, type Funcionario, type TempoRespostaData } from '@/hooks/useTempoResposta'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'

interface ModalTempoRespostaProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ModalTempoResposta({ isOpen, onClose, onSuccess }: ModalTempoRespostaProps) {
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  // Debug logs
  console.log('🚨 MODAL TEMPO RESPOSTA - DEBUG:', {
    user: !!user,
    profile: !!user?.profile,
    secao: !!user?.profile?.secao,
    secaoId,
    nomeBase
  })

  const {
    loading,
    loadingEquipes,
    error,
    equipes,
    funcionarios,
    fetchEquipesBySecao,
    fetchFuncionariosByEquipe,
    saveTempoResposta,
    validateTimeFormat,
    formatTime,
    setError,
    getSecaoByUser,
    isSecoesLoaded
  } = useTempoResposta(secaoId)

  // Estados do formulário
  const [etapaAtual, setEtapaAtual] = useState<'selecao' | 'viaturas'>('selecao')
  const [formData, setFormData] = useState({
    data_tempo_resposta: '',
    equipe_id: ''
  })
  const [viaturas, setViaturas] = useState<ViaturaTempo[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  // Resetar formulário quando modal abre
  useEffect(() => {
    if (isOpen) {
      console.log('📂 Modal aberto, resetando formulário...')
      setFormData({
        data_tempo_resposta: '',
        equipe_id: ''
      })
      setViaturas([])
      setErrors({})
      setEtapaAtual('selecao')
      setShowSuccess(false)
      setError(null)
    }
  }, [isOpen, setError])

  // Preenchimento automático otimizado quando modal abre
  useEffect(() => {
    if (isOpen && isSecoesLoaded) {
      console.log('📂 Modal Tempo Resposta aberto, preenchimento automático...')
      
      // Obter seção do usuário automaticamente
      const secaoUsuario = getSecaoByUser()
      
      if (secaoUsuario?.id && secaoId) {
        console.log('✅ Seção do usuário identificada:', secaoUsuario.nome)
        // As equipes já estão disponíveis via contexto
        console.log('👥 Equipes disponíveis via contexto:', equipes?.length || 0)
      }
    }
  }, [isOpen, isSecoesLoaded, getSecaoByUser, secaoId, equipes])

  // Buscar equipes quando modal abre e há secaoId (agora usa contexto)
  useEffect(() => {
    if (isOpen && secaoId && equipes.length === 0) {
      console.log('🔍 Forçando refresh de equipes para secaoId:', secaoId)
      fetchEquipesBySecao(secaoId)
    }
  }, [isOpen, secaoId, fetchEquipesBySecao, equipes.length])

  // Buscar funcionários quando equipe é selecionada
  useEffect(() => {
    if (formData.equipe_id) {
      console.log('👥 Buscando funcionários para equipe:', formData.equipe_id)
      fetchFuncionariosByEquipe(formData.equipe_id)
    }
  }, [formData.equipe_id, fetchFuncionariosByEquipe])

  // Função para obter data máxima (hoje)
  const getMaxDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Validar primeira etapa
  const validarSelecao = () => {
    const newErrors: Record<string, string> = {}

    if (!secaoId) {
      newErrors.secao = 'Usuário deve ter uma base associada'
    }

    if (!formData.data_tempo_resposta) {
      newErrors.data = 'Data é obrigatória'
    }

    if (!formData.equipe_id) {
      newErrors.equipe = 'Equipe é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Prosseguir para etapa de viaturas
  const prosseguirParaViaturas = () => {
    if (validarSelecao()) {
      setEtapaAtual('viaturas')
      // Adicionar primeira viatura vazia
      if (viaturas.length === 0) {
        adicionarViatura()
      }
    }
  }

  // Voltar para seleção
  const voltarParaSelecao = () => {
    setEtapaAtual('selecao')
  }

  // Adicionar nova viatura
  const adicionarViatura = () => {
    const novaViatura: ViaturaTempo = {
      id: Date.now().toString(),
      nome_completo: '',
      local_posicionamento: '',
      cci_utilizado: '',
      tempo_exercicio: '',
      observacoes: ''
    }
    setViaturas([...viaturas, novaViatura])
  }

  // Remover viatura
  const removerViatura = (id: string) => {
    setViaturas(viaturas.filter(v => v.id !== id))
  }

  // Atualizar viatura
  const atualizarViatura = (id: string, campo: keyof ViaturaTempo, valor: string) => {
    setViaturas(viaturas.map(v => 
      v.id === id ? { ...v, [campo]: valor } : v
    ))
  }

  // Aplicar máscara de tempo HH:MM:SS
  const aplicarMascaraTempo = (value: string): string => {
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

  // Validar formato de tempo HH:MM:SS
  const validarFormatoTempo = (time: string): boolean => {
    if (!time) return false
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    return timeRegex.test(time)
  }

  // Validar viaturas
  const validarViaturas = () => {
    const newErrors: Record<string, string> = {}

    if (viaturas.length === 0) {
      newErrors.viaturas = 'Adicione pelo menos uma viatura'
      setErrors(newErrors)
      return false
    }

    viaturas.forEach((viatura, index) => {
      if (!viatura.nome_completo) {
        newErrors[`nome_${index}`] = 'Nome é obrigatório'
      }
      if (!viatura.local_posicionamento) {
        newErrors[`local_${index}`] = 'Local é obrigatório'
      }
      if (!viatura.cci_utilizado) {
        newErrors[`cci_${index}`] = 'CCI é obrigatório'
      }
      if (!viatura.tempo_exercicio) {
        newErrors[`tempo_${index}`] = 'Tempo é obrigatório'
      } else if (!validarFormatoTempo(viatura.tempo_exercicio)) {
        newErrors[`tempo_${index}`] = 'Formato inválido (HH:MM:SS)'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar dados
  const handleSave = async () => {
    if (!validarViaturas()) return

    try {
      setSaving(true)
      
      const equipeSelecionada = equipes.find(e => e.id === formData.equipe_id)
      if (!equipeSelecionada) {
        toast.error('Equipe não encontrada')
        return
      }

      const dadosParaSalvar: TempoRespostaData[] = viaturas.map(viatura => ({
        nome_cidade: equipeSelecionada.nome_cidade,
        equipe: equipeSelecionada.nome,
        data_tempo_resposta: formData.data_tempo_resposta,
        nome_completo: viatura.nome_completo,
        local_posicionamento: viatura.local_posicionamento,
        cci_utilizado: viatura.cci_utilizado,
        tempo_exercicio: viatura.tempo_exercicio,
        observacoes: viatura.observacoes || '',
        secao_id: secaoId!,
        equipe_id: formData.equipe_id,
        usuario_id: user!.id
      }))

      const sucesso = await saveTempoResposta(dadosParaSalvar)
      
      if (sucesso) {
        setShowSuccess(true)
        toast.success('Tempos de resposta registrados com sucesso!')
        
        setTimeout(() => {
          handleClose()
          onSuccess?.()
        }, 1500)
      } else {
        toast.error('Erro ao salvar dados')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro inesperado ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Fechar modal
  const handleClose = () => {
    if (!loading && !saving) {
      setFormData({
        data_tempo_resposta: '',
        equipe_id: ''
      })
      setViaturas([])
      setErrors({})
      setEtapaAtual('selecao')
      setShowSuccess(false)
      onClose()
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
              <h2 className="text-xl font-bold text-gray-900">Registro de Viaturas - Tempo Resposta</h2>
              <p className="text-sm text-gray-600">Registre as informações das viaturas para o exercício</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading || saving}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          {/* Mensagem de sucesso */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-green-800 font-medium">Tempos de resposta registrados com sucesso!</p>
              </div>
            </div>
          )}

          {/* Erro geral */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {etapaAtual === 'selecao' ? (
            <>
              {/* Etapa de Seleção */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Base */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Base <span className="text-red-500">*</span>
                  </label>
                  <div className={`w-full px-4 py-3 border rounded-lg bg-gray-50 text-black ${
                    !secaoId ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300'
                  }`}>
                    {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
                  </div>
                  {errors.secao && (
                    <p className="text-red-600 text-sm mt-1">{errors.secao}</p>
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
                    value={formData.data_tempo_resposta}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_tempo_resposta: e.target.value }))}
                    max={getMaxDate()}
                    disabled={loading || saving}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      errors.data ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    value={formData.equipe_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, equipe_id: e.target.value }))}
                    disabled={loading || saving || !secaoId}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                      errors.equipe ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    } ${loading || saving || !secaoId ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <option value="">Selecione uma equipe</option>
                    {equipes.map((equipe) => (
                      <option key={equipe.id} value={equipe.id}>
                        {equipe.nome}
                      </option>
                    ))}
                  </select>
                  {errors.equipe && (
                    <p className="text-red-600 text-sm mt-1">{errors.equipe}</p>
                  )}
                </div>
              </div>

              {/* Botão Prosseguir */}
              <div className="flex justify-end">
                <button
                  onClick={prosseguirParaViaturas}
                  disabled={loading || saving || !secaoId}
                  className={`px-6 py-3 bg-[#fa4b00] text-white rounded-lg hover:bg-[#e63e00] transition-colors flex items-center gap-2 ${
                    loading || saving || !secaoId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
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
              {/* Etapa de Viaturas */}
              {/* Informações selecionadas */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-black">Base:</span>
                    <span className="ml-2 text-gray-900">{nomeBase}</span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Data:</span>
                    <span className="ml-2 text-gray-900">
                      {(() => {
                        if (!formData.data_tempo_resposta) return ''
                        const [year, month, day] = formData.data_tempo_resposta.split('-').map(Number)
                        return new Date(year, month - 1, day).toLocaleDateString('pt-BR')
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-black">Equipe:</span>
                    <span className="ml-2 text-gray-900">
                      {equipes.find(e => e.id === formData.equipe_id)?.nome}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lista de Viaturas */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Viaturas</h3>
                  <button
                    onClick={adicionarViatura}
                    disabled={loading || saving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Viatura
                  </button>
                </div>

                {errors.viaturas && (
                  <p className="text-red-600 text-sm">{errors.viaturas}</p>
                )}

                {viaturas.map((viatura, index) => (
                  <div key={viatura.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Viatura {index + 1}</h4>
                      {viaturas.length > 1 && (
                        <button
                          onClick={() => removerViatura(viatura.id)}
                          disabled={loading || saving}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome Completo */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={viatura.nome_completo}
                          onChange={(e) => atualizarViatura(viatura.id, 'nome_completo', e.target.value)}
                          disabled={loading || saving}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                            errors[`nome_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="">Selecione um funcionário</option>
                          {funcionarios.map((funcionario) => (
                            <option key={funcionario.id} value={funcionario.nome_completo}>
                              {funcionario.nome_completo}
                            </option>
                          ))}
                        </select>
                        {errors[`nome_${index}`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`nome_${index}`]}</p>
                        )}
                      </div>

                      {/* Local de Posicionamento */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Local de Posicionamento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={viatura.local_posicionamento}
                          onChange={(e) => atualizarViatura(viatura.id, 'local_posicionamento', e.target.value)}
                          disabled={loading || saving}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                            errors[`local_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="Ex: Pista 09L/27R"
                        />
                        {errors[`local_${index}`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`local_${index}`]}</p>
                        )}
                      </div>

                      {/* CCI Utilizado */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          CCI Utilizado <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={viatura.cci_utilizado}
                          onChange={(e) => atualizarViatura(viatura.id, 'cci_utilizado', e.target.value)}
                          disabled={loading || saving}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black ${
                            errors[`cci_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="Ex: CCI-01"
                        />
                        {errors[`cci_${index}`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`cci_${index}`]}</p>
                        )}
                      </div>

                      {/* Tempo de Exercício */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-1">
                          Tempo de Exercício <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={viatura.tempo_exercicio}
                          onChange={(e) => {
                            const maskedValue = aplicarMascaraTempo(e.target.value)
                            atualizarViatura(viatura.id, 'tempo_exercicio', maskedValue)
                          }}
                          disabled={loading || saving}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black font-mono ${
                            errors[`tempo_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          } ${loading || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          placeholder="Ex: 01:30:45"
                          maxLength={8}
                        />
                        {errors[`tempo_${index}`] && (
                          <p className="text-red-600 text-sm mt-1">{errors[`tempo_${index}`]}</p>
                        )}
                      </div>

                      {/* Observações */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <textarea
                          value={viatura.observacoes}
                          onChange={(e) => atualizarViatura(viatura.id, 'observacoes', e.target.value)}
                          disabled={loading || saving}
                          rows={2}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent transition-colors text-black resize-none ${
                            loading || saving ? 'opacity-50 cursor-not-allowed' : 'border-gray-300'
                          }`}
                          placeholder="Observações adicionais (opcional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões */}
              <div className="flex justify-between">
                <button
                  onClick={voltarParaSelecao}
                  disabled={loading || saving}
                  className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    disabled={loading || saving}
                    className="px-6 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading || saving || viaturas.length === 0}
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
                        Salvar Registros
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