import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface Secao {
  id: string
  nome: string
  codigo: string
  cidade: string
  estado: string
  ativa: boolean
}

export interface Equipe {
  id: string
  secao_id: string
  nome: string
  codigo: string
  ativa: boolean
}

export interface OcorrenciaAeronautica {
  id?: string
  secao_id: string
  equipe_id: string
  usuario_id: string
  data_referencia: string
  data_ocorrencia: string
  tipo_ocorrencia: string
  posicionamento_intervencao: string
  local_ocorrencia: string
  hora_acionamento: string
  tempo_chegada_primeiro_cci: string
  tempo_chegada_ultimo_cci: string
  hora_termino: string
  tempo_total_ocorrencia?: string
  created_at?: string
  updated_at?: string
}

export interface FormData {
  secao_id: string
  equipe_id: string
  data_ocorrencia: string
  tipo_ocorrencia: string
  posicionamento_intervencao: string
  local_ocorrencia: string
  hora_acionamento: string
  tempo_chegada_primeiro_cci: string
  tempo_chegada_ultimo_cci: string
  hora_termino: string
}

export const useOcorrenciasAeronauticas = () => {
  const [secoes, setSecoes] = useState<Secao[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar seções ativas
  const fetchSecoes = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      setSecoes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar seções')
    } finally {
      setLoading(false)
    }
  }

  // Buscar equipes por seção
  const fetchEquipesBySecao = useCallback(async (secaoId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
        .eq('secao_id', secaoId)
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      setEquipes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar equipes')
    } finally {
      setLoading(false)
    }
  }, [])

  // Salvar ocorrência aeronáutica
  const saveOcorrencia = async (formData: FormData): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      const ocorrenciaData: Omit<OcorrenciaAeronautica, 'id' | 'tempo_total_ocorrencia' | 'created_at' | 'updated_at'> = {
        ...formData,
        usuario_id: user.id,
        data_referencia: formData.data_ocorrencia, // Usar a mesma data como referência
        tipo_ocorrencia: 'Emergência Aeronáutica' // Garantir que seja sempre este valor
      }

      const { error } = await supabase
        .from('ocorrencias_aeronauticas')
        .insert([ocorrenciaData])

      if (error) throw error

      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar ocorrência')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Validar formato de horário HH:MM:SS
  const validateTimeFormat = useCallback((time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    return timeRegex.test(time)
  }, [])

  // Validar data (não pode ser futura)
  const validateDate = useCallback((date: string): boolean => {
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual
    return selectedDate <= today
  }, [])

  // Calcular tempo total da ocorrência
  const calculateTotalTime = useCallback((horaAcionamento: string, horaTermino: string): string => {
    try {
      const [horaInicioH, horaInicioM, horaInicioS] = horaAcionamento.split(':').map(Number)
      const [horaFimH, horaFimM, horaFimS] = horaTermino.split(':').map(Number)

      const inicioEmSegundos = horaInicioH * 3600 + horaInicioM * 60 + horaInicioS
      let fimEmSegundos = horaFimH * 3600 + horaFimM * 60 + horaFimS

      // Se o horário de término for menor que o de início, assumir que é no dia seguinte
      if (fimEmSegundos < inicioEmSegundos) {
        fimEmSegundos += 24 * 3600 // Adicionar 24 horas
      }

      const diferencaEmSegundos = fimEmSegundos - inicioEmSegundos
      
      const horas = Math.floor(diferencaEmSegundos / 3600)
      const minutos = Math.floor((diferencaEmSegundos % 3600) / 60)
      const segundos = diferencaEmSegundos % 60

      return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
    } catch {
      return '00:00:00'
    }
  }, [])

  // Validar sequência lógica de horários
  const validateTimeSequence = useCallback((horaAcionamento: string, horaTermino: string): boolean => {
    if (!validateTimeFormat(horaAcionamento) || !validateTimeFormat(horaTermino)) {
      return false
    }

    const [horaInicioH, horaInicioM, horaInicioS] = horaAcionamento.split(':').map(Number)
    const [horaFimH, horaFimM, horaFimS] = horaTermino.split(':').map(Number)

    const inicioEmSegundos = horaInicioH * 3600 + horaInicioM * 60 + horaInicioS
    let fimEmSegundos = horaFimH * 3600 + horaFimM * 60 + horaFimS

    // Permitir que o término seja no dia seguinte
    if (fimEmSegundos < inicioEmSegundos) {
      fimEmSegundos += 24 * 3600
    }

    return fimEmSegundos > inicioEmSegundos
  }, [validateTimeFormat])

  useEffect(() => {
    fetchSecoes()
  }, [])

  return {
    secoes,
    equipes,
    loading,
    error,
    fetchSecoes,
    fetchEquipesBySecao,
    saveOcorrencia,
    validateTimeFormat,
    validateDate,
    calculateTotalTime,
    validateTimeSequence,
    setError
  }
}