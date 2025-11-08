import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Tipos de dados
export interface OcorrenciaNaoAeronautica {
  id?: string
  secao_id?: string
  equipe_id?: string | null
  usuario_id?: string
  data_referencia?: string
  data_ocorrencia: string
  equipe_id_form: string // Campo para o formulário
  tipo_ocorrencia: string
  local_ocorrencia: string
  hora_acionamento: string
  hora_chegada: string
  hora_termino: string
  equipe: string // Nome da equipe selecionada
  cidade_aeroporto: string // Nome da cidade do aeroporto
  created_at?: string
  updated_at?: string
}

export interface Equipe {
  id: string
  nome: string
  ativa: boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export interface TimeValidation {
  isValid: boolean
  message?: string
}

// Tipos de ocorrência predefinidos
export const TIPOS_OCORRENCIA = [
  'Incêndios ou Vazamentos de Combustíveis no PAA',
  'Condições de Baixa Visibilidade',
  'Atendimento a Aeronave Presidencial',
  'Incêndio em Instalações Aeroportuárias',
  'Ocorrências com Artigos Perigosos',
  'Remoção de Animais e Dispersão de Avifauna',
  'Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo',
  'Emergências Médicas em Geral',
  'Iluminação de Emergência em Pista de Pouso e Decolagem'
] as const

// Sugestões de locais
export const SUGESTOES_LOCAIS = [
  'Terminal de Passageiros',
  'Pista de Pouso e Decolagem',
  'Pátio de Aeronaves',
  'Hangar de Manutenção',
  'Torre de Controle',
  'Área de Combustível',
  'Estacionamento',
  'Área Administrativa',
  'Área de Carga',
  'Área Restrita'
] as const

// Equipes padrão
export const EQUIPES_PADRAO = [
  'Equipe Alpha',
  'Equipe Bravo',
  'Equipe Charlie',
  'Equipe Delta',
  'Equipe Echo'
] as const

export const useOcorrenciasNaoAeronauticas = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [equipes, setEquipes] = useState<Equipe[]>([])

  // Buscar equipes por seção
  const fetchEquipesBySecao = async (secaoId: string) => {
    console.log('🔍 Buscando equipes para seção:', secaoId)
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, ativa')
        .eq('secao_id', secaoId)
        .eq('ativa', true)
        .order('nome')

      if (error) {
        console.error('❌ Erro na query de equipes:', error)
        throw error
      }

      console.log('✅ Equipes encontradas:', data)
      setEquipes(data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar equipes:', err)
      setError('Erro ao carregar equipes')
      setEquipes([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar equipes disponíveis (todas)
  const fetchEquipes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, ativa')
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      setEquipes(data || [])
    } catch (err) {
      console.error('Erro ao buscar equipes:', err)
      setError('Erro ao carregar equipes')
    }
  }

  // Validar formato de horário HH:MM:SS
  const validateTimeFormat = (time: string): TimeValidation => {
    if (!time) {
      return { isValid: false, message: 'Horário é obrigatório' }
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/
    if (!timeRegex.test(time)) {
      return { isValid: false, message: 'Formato deve ser HH:MM:SS' }
    }

    return { isValid: true }
  }

  // Validar sequência temporal de horários
  const validateTimeSequence = (acionamento: string, chegada: string, termino: string): TimeValidation => {
    if (!acionamento || !chegada || !termino) {
      return { isValid: false, message: 'Todos os horários são obrigatórios' }
    }

    // Converter para minutos para comparação
    const timeToMinutes = (time: string): number => {
      const [hours, minutes, seconds] = time.split(':').map(Number)
      return hours * 60 + minutes + seconds / 60
    }

    const acionamentoMinutes = timeToMinutes(acionamento)
    const chegadaMinutes = timeToMinutes(chegada)
    const terminoMinutes = timeToMinutes(termino)

    if (acionamentoMinutes > chegadaMinutes) {
      return { isValid: false, message: 'Hora de chegada deve ser posterior ao acionamento' }
    }

    if (chegadaMinutes > terminoMinutes) {
      return { isValid: false, message: 'Hora de término deve ser posterior à chegada' }
    }

    return { isValid: true }
  }

  // Validar data
  const validateDate = (date: string): TimeValidation => {
    if (!date) {
      return { isValid: false, message: 'Data é obrigatória' }
    }

    const selectedDate = new Date(`${date}T00:00:00`)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Final do dia atual

    if (selectedDate > today) {
      return { isValid: false, message: 'Data não pode ser futura' }
    }

    return { isValid: true }
  }

  // Validar formulário completo
  const validateForm = (data: OcorrenciaNaoAeronautica): ValidationResult => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!data.secao_id?.trim()) {
      errors.secao_id = 'Base é obrigatória'
    }

    if (!data.data_ocorrencia) {
      errors.data_ocorrencia = 'Data da ocorrência é obrigatória'
    } else {
      const dateValidation = validateDate(data.data_ocorrencia)
      if (!dateValidation.isValid) {
        errors.data_ocorrencia = dateValidation.message || 'Data inválida'
      }
    }

    if (!data.equipe_id_form?.trim()) {
      errors.equipe_id_form = 'Equipe é obrigatória'
    }

    if (!data.equipe?.trim()) {
      errors.equipe = 'Nome da equipe é obrigatório'
    }

    if (!data.cidade_aeroporto?.trim()) {
      errors.cidade_aeroporto = 'Cidade do aeroporto é obrigatória'
    }

    if (!data.tipo_ocorrencia?.trim()) {
      errors.tipo_ocorrencia = 'Tipo de ocorrência é obrigatório'
    }

    if (!data.local_ocorrencia?.trim()) {
      errors.local_ocorrencia = 'Local da ocorrência é obrigatório'
    }

    // Validar horários
    const acionamentoValidation = validateTimeFormat(data.hora_acionamento)
    if (!acionamentoValidation.isValid) {
      errors.hora_acionamento = acionamentoValidation.message || 'Horário inválido'
    }

    const chegadaValidation = validateTimeFormat(data.hora_chegada)
    if (!chegadaValidation.isValid) {
      errors.hora_chegada = chegadaValidation.message || 'Horário inválido'
    }

    const terminoValidation = validateTimeFormat(data.hora_termino)
    if (!terminoValidation.isValid) {
      errors.hora_termino = terminoValidation.message || 'Horário inválido'
    }

    // Validar sequência temporal se todos os horários são válidos
    if (acionamentoValidation.isValid && chegadaValidation.isValid && terminoValidation.isValid) {
      const sequenceValidation = validateTimeSequence(
        data.hora_acionamento,
        data.hora_chegada,
        data.hora_termino
      )
      if (!sequenceValidation.isValid) {
        errors.sequencia_horarios = sequenceValidation.message || 'Sequência de horários inválida'
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // Salvar ocorrência
  const saveOcorrencia = async (data: OcorrenciaNaoAeronautica): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Validar dados antes de salvar
      const validation = validateForm(data)
      if (!validation.isValid) {
        const errorMessages = Object.values(validation.errors).join(', ')
        throw new Error(`Dados inválidos: ${errorMessages}`)
      }

      // Buscar dados do usuário atual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar seção do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('secao_id')
        .eq('id', user.id)
        .single()

      if (!profile?.secao_id) {
        throw new Error('Seção do usuário não encontrada')
      }

      // Validar campos obrigatórios adicionais
      if (!data.equipe || !data.cidade_aeroporto) {
        throw new Error('Nome da equipe e cidade do aeroporto são obrigatórios')
      }

      // Preparar dados para inserção
      console.log('📝 Dados do formulário recebidos:', data)
      console.log('👤 Usuário autenticado:', user.id)
      console.log('🏢 Seção do usuário:', profile.secao_id)
      console.log('🎯 Equipe selecionada (ID):', data.equipe_id_form)

      const insertData = {
        secao_id: data.secao_id || profile.secao_id, // Usar seção selecionada no formulário ou do perfil
        usuario_id: user.id,
        data_referencia: data.data_ocorrencia,
        equipe_id: data.equipe_id_form, // Salvar o ID da equipe
        equipe: data.equipe, // Nome da equipe
        cidade_aeroporto: data.cidade_aeroporto, // Nome da cidade do aeroporto
        data_ocorrencia: data.data_ocorrencia,
        tipo_ocorrencia: data.tipo_ocorrencia,
        local_ocorrencia: data.local_ocorrencia,
        hora_acionamento: data.hora_acionamento,
        hora_chegada: data.hora_chegada,
        hora_termino: data.hora_termino
      }

      console.log('💾 Dados preparados para inserção:', insertData)

      const { data: insertResult, error: insertError } = await supabase
        .from('ocorrencias_nao_aeronauticas')
        .insert([insertData])
        .select()

      if (insertError) {
        console.error('❌ Erro ao inserir no Supabase:', insertError)
        throw insertError
      }

      console.log('✅ Ocorrência salva com sucesso:', insertResult)
      return true
    } catch (err: any) {
      console.error('Erro ao salvar ocorrência:', err)
      setError(err.message || 'Erro ao salvar ocorrência')
      return false
    } finally {
      setLoading(false)
    }
  }

  // Buscar ocorrências
  const fetchOcorrencias = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('ocorrencias_nao_aeronauticas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (err: any) {
      console.error('Erro ao buscar ocorrências:', err)
      setError(err.message || 'Erro ao carregar ocorrências')
      return []
    } finally {
      setLoading(false)
    }
  }

  // Aplicar máscara de horário
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

  // Carregar equipes na inicialização
  useEffect(() => {
    fetchEquipes()
  }, [])

  return {
    // Estados
    loading,
    error,
    equipes,
    
    // Dados de referência
    tiposOcorrencia: TIPOS_OCORRENCIA,
    sugestoesLocais: SUGESTOES_LOCAIS,
    equipesPadrao: EQUIPES_PADRAO,
    
    // Funções de validação
    validateTimeFormat,
    validateTimeSequence,
    validateDate,
    validateForm,
    applyTimeMask,
    
    // Funções de dados
    saveOcorrencia,
    fetchOcorrencias,
    fetchEquipes,
    fetchEquipesBySecao,
    setEquipes,
    
    // Utilitários
    setError
  }
}