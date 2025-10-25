// =====================================================
// FORMULÁRIO DINÂMICO DE INDICADORES
// Sistema de Indicadores Bombeiro MedMais
// =====================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAuthContext } from '@/contexts/AuthContext'
import { 
  Save, 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  Hash,
  Type,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface Indicador {
  id: string
  nome: string
  descricao: string
  tipo_dados: 'texto' | 'numero' | 'tempo' | 'data' | 'data_hora'
  frequencia: 'evento' | 'diario' | 'mensal'
  obrigatorio: boolean
  unidade_medida?: string
}

interface IndicadorFormProps {
  indicador: Indicador
  onSave: (dados: any) => void
  onCancel: () => void
  valorInicial?: any
}

export function IndicadorForm({ indicador, onSave, onCancel, valorInicial }: IndicadorFormProps) {
  const supabase = useSupabaseClient()
  const { user } = useAuthContext()
  const [valor, setValor] = useState<string>('')
  const [observacoes, setObservacoes] = useState<string>('')
  const [dataOcorrencia, setDataOcorrencia] = useState<string>('')
  const [loading, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Inicializar valores se estiver editando
  useEffect(() => {
    if (valorInicial) {
      setValor(valorInicial.valor || '')
      setObservacoes(valorInicial.observacoes || '')
      setDataOcorrencia(valorInicial.data_ocorrencia || '')
    } else {
      // Para indicadores diários, definir data atual
      if (indicador.frequencia === 'diario') {
        setDataOcorrencia(new Date().toISOString().split('T')[0])
      }
    }
  }, [valorInicial, indicador])

  const validarCampos = (): boolean => {
    const novosErrors: Record<string, string> = {}

    // Validar valor obrigatório
    if (indicador.obrigatorio && !valor.trim()) {
      novosErrors.valor = 'Este campo é obrigatório'
    }

    // Validar formato baseado no tipo
    if (valor.trim()) {
      switch (indicador.tipo_dados) {
        case 'numero':
          if (isNaN(Number(valor))) {
            novosErrors.valor = 'Deve ser um número válido'
          }
          break
        case 'tempo':
          // Validar formato HH:MM ou HH:MM:SS
          const tempoRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
          if (!tempoRegex.test(valor)) {
            novosErrors.valor = 'Formato inválido. Use HH:MM ou HH:MM:SS'
          }
          break
        case 'data':
          if (!Date.parse(valor)) {
            novosErrors.valor = 'Data inválida'
          }
          break
        case 'data_hora':
          if (!Date.parse(valor)) {
            novosErrors.valor = 'Data e hora inválidas'
          }
          break
      }
    }

    // Validar data de ocorrência para indicadores por evento
    if (indicador.frequencia === 'evento' && !dataOcorrencia) {
      novosErrors.dataOcorrencia = 'Data de ocorrência é obrigatória para indicadores por evento'
    }

    setErrors(novosErrors)
    return Object.keys(novosErrors).length === 0
  }

  const handleSave = async () => {
    if (!validarCampos()) {
      toast.error('Por favor, corrija os erros no formulário')
      return
    }

    setSaving(true)
    try {
      const dadosPreenchimento = {
        indicador_id: indicador.id,
        usuario_id: user?.id,
        valor: valor.trim(),
        observacoes: observacoes.trim() || null,
        data_ocorrencia: dataOcorrencia || null,
        data_preenchimento: new Date().toISOString()
      }

      await onSave(dadosPreenchimento)
      toast.success('Indicador preenchido com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar indicador:', error)
      toast.error('Erro ao salvar indicador')
    } finally {
      setSaving(false)
    }
  }

  const renderCampoValor = () => {
    const baseProps = {
      value: valor,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValor(e.target.value),
      className: `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent ${
        errors.valor ? 'border-red-500' : 'border-gray-300'
      }`,
      placeholder: getPlaceholderPorTipo()
    }

    switch (indicador.tipo_dados) {
      case 'numero':
        return (
          <div className="relative">
            <Hash className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...baseProps}
              type="number"
              step="any"
              className={`${baseProps.className} pl-10`}
            />
            {indicador.unidade_medida && (
              <span className="absolute right-3 top-3 text-sm text-gray-500">
                {indicador.unidade_medida}
              </span>
            )}
          </div>
        )

      case 'tempo':
        return (
          <div className="relative">
            <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...baseProps}
              type="text"
              pattern="[0-9]{1,2}:[0-9]{2}(:[0-9]{2})?"
              className={`${baseProps.className} pl-10`}
            />
          </div>
        )

      case 'data':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...baseProps}
              type="date"
              className={`${baseProps.className} pl-10`}
            />
          </div>
        )

      case 'data_hora':
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...baseProps}
              type="datetime-local"
              className={`${baseProps.className} pl-10`}
            />
          </div>
        )

      case 'texto':
      default:
        return valor.length > 100 ? (
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              {...baseProps}
              rows={4}
              className={`${baseProps.className} pl-10 resize-none`}
            />
          </div>
        ) : (
          <div className="relative">
            <Type className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              {...baseProps}
              type="text"
              className={`${baseProps.className} pl-10`}
            />
          </div>
        )
    }
  }

  const getPlaceholderPorTipo = () => {
    switch (indicador.tipo_dados) {
      case 'numero': return 'Digite um número...'
      case 'tempo': return 'HH:MM ou HH:MM:SS'
      case 'data': return 'Selecione uma data'
      case 'data_hora': return 'Selecione data e hora'
      case 'texto': return 'Digite o texto...'
      default: return 'Digite o valor...'
    }
  }

  const getTipoLabel = () => {
    switch (indicador.tipo_dados) {
      case 'numero': return 'Número'
      case 'tempo': return 'Tempo'
      case 'data': return 'Data'
      case 'data_hora': return 'Data e Hora'
      case 'texto': return 'Texto'
      default: return 'Valor'
    }
  }

  const getFrequenciaLabel = () => {
    switch (indicador.frequencia) {
      case 'evento': return 'Por Evento'
      case 'diario': return 'Diário'
      case 'mensal': return 'Mensal'
      default: return indicador.frequencia
    }
  }

  return (
    <Card className="bg-white/20 backdrop-blur-lg border-white/30">
      <CardHeader>
        <CardTitle className="text-black flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{indicador.nome}</h3>
            <div className="flex items-center space-x-4 text-sm text-[#7a5b3e]/70 mt-1">
              <span>Tipo: {getTipoLabel()}</span>
              <span>Frequência: {getFrequenciaLabel()}</span>
              {indicador.obrigatorio && (
                <span className="text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Obrigatório
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição do Indicador */}
        {indicador.descricao && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">{indicador.descricao}</p>
          </div>
        )}

        {/* Campo Valor */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Valor {indicador.obrigatorio && <span className="text-red-500">*</span>}
          </label>
          {renderCampoValor()}
          {errors.valor && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.valor}
            </p>
          )}
        </div>

        {/* Data de Ocorrência (para indicadores por evento) */}
        {indicador.frequencia === 'evento' && (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Data de Ocorrência <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={dataOcorrencia}
                onChange={(e) => setDataOcorrencia(e.target.value)}
                className={`w-full pl-10 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent ${
                  errors.dataOcorrencia ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.dataOcorrencia && (
              <p className="text-red-500 text-xs mt-1 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.dataOcorrencia}
              </p>
            )}
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Observações (opcional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fa4b00] focus:border-transparent resize-none"
              placeholder="Adicione observações relevantes..."
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/20">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={loading}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-[#fa4b00] hover:bg-[#e63d00] text-white"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}