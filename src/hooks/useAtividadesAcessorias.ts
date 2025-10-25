import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

// Tipos de dados
export interface AtividadeAcessoria {
  id?: string
  base_id: string
  data_atividade: string
  equipe_id: string
  tipo_atividade: string
  qtd_equipamentos: number | string
  qtd_bombeiros: number | string
  tempo_gasto: string
  cidade_aeroporto?: string
  equipe_nome?: string
  created_at?: string
  updated_at?: string
}

export interface Base {
  id: string
  nome: string
  cidade: string
  codigo: string
  ativa: boolean
}

export interface Equipe {
  id: string
  nome: string
  ativa: boolean
  secao_id: string
}

export interface TipoAtividade {
  id: string
  nome: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

// Tipos de atividade predefinidos
export const TIPOS_ATIVIDADE = [
  'Inspeção de extintores'
] as const

export const useAtividadesAcessorias = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bases, setBases] = useState<Base[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [tiposAtividade] = useState<TipoAtividade[]>([
    { id: '1', nome: 'Inspeção de extintores' }
  ])

  // Buscar bases disponíveis
  const fetchBases = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade, codigo, ativa')
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      setBases(data || [])
    } catch (err: any) {
      console.error('Erro ao buscar bases:', err)
      setError('Erro ao carregar bases')
      toast.error('Erro ao carregar bases')
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar equipes por base
  const fetchEquipesByBase = useCallback(async (baseId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, ativa, secao_id')
        .eq('secao_id', baseId)
        .eq('ativa', true)
        .order('nome')

      if (error) throw error
      setEquipes(data || [])
    } catch (err: any) {
      console.error('Erro ao buscar equipes:', err)
      setError('Erro ao carregar equipes')
      toast.error('Erro ao carregar equipes')
      setEquipes([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Aplicar máscara de horário HH:MM
  const applyTimeMask = useCallback((value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '')
    
    // Aplica a máscara HH:MM
    if (numbers.length <= 2) {
      return numbers
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}:${numbers.slice(2)}`
    } else {
      return `${numbers.slice(0, 2)}:${numbers.slice(2, 4)}`
    }
  }, [])

  // Validar formato de horário HH:MM
  const validateTimeFormat = useCallback((time: string): boolean => {
    if (!time) return false
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    return timeRegex.test(time)
  }, [])

  // Validar data (não pode ser futura)
  const validateDate = useCallback((date: string): boolean => {
    if (!date) return false
    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual
    return selectedDate <= today
  }, [])

  // Validar formulário completo
  const validateForm = useCallback((data: AtividadeAcessoria): ValidationResult => {
    const errors: Record<string, string> = {}

    // Validar campos obrigatórios
    if (!data.base_id?.trim()) {
      errors.base_id = 'Base é obrigatória'
    }

    if (!data.data_atividade) {
      errors.data_atividade = 'Data da atividade é obrigatória'
    } else if (!validateDate(data.data_atividade)) {
      errors.data_atividade = 'Data não pode ser futura'
    }

    if (!data.equipe_id?.trim()) {
      errors.equipe_id = 'Equipe é obrigatória'
    }

    if (!data.tipo_atividade?.trim()) {
      errors.tipo_atividade = 'Tipo de atividade é obrigatório'
    }

    if (!data.qtd_equipamentos || Number(data.qtd_equipamentos) <= 0) {
      errors.qtd_equipamentos = 'Quantidade de equipamentos deve ser maior que zero'
    }

    if (!data.qtd_bombeiros || Number(data.qtd_bombeiros) <= 0) {
      errors.qtd_bombeiros = 'Quantidade de bombeiros deve ser maior que zero'
    }

    if (!data.tempo_gasto?.trim()) {
      errors.tempo_gasto = 'Tempo gasto é obrigatório'
    } else if (!validateTimeFormat(data.tempo_gasto)) {
      errors.tempo_gasto = 'Formato deve ser HH:MM'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }, [validateDate, validateTimeFormat])

  // Salvar atividade acessória
  const saveAtividade = useCallback(async (data: AtividadeAcessoria): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      // Obter usuário autenticado
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError || !userData.user) {
        throw new Error('Usuário não autenticado')
      }

      // Buscar dados da base selecionada
      const baseSelecionada = bases.find(base => base.id === data.base_id)
      
      // Buscar dados da equipe selecionada
      const equipeSelecionada = equipes.find(equipe => equipe.id === data.equipe_id)

      // Preparar dados para inserção
      const atividadeData = {
        secao_id: data.base_id,
        data_atividade: data.data_atividade,
        equipe_id: data.equipe_id,
        tipo_atividade: data.tipo_atividade,
        qtd_equipamentos: Number(data.qtd_equipamentos),
        qtd_bombeiros: Number(data.qtd_bombeiros),
        tempo_gasto: `${data.tempo_gasto}:00`, // Adicionar segundos
        cidade_aeroporto: baseSelecionada?.cidade || '',
        equipe_nome: equipeSelecionada?.nome || '',
        usuario_id: userData.user.id // Adicionar ID do usuário autenticado
      }

      console.log('💾 Salvando atividade acessória:', atividadeData)

      const { error } = await supabase
        .from('atividades_acessorias')
        .insert([atividadeData])

      if (error) {
        console.error('❌ Erro ao salvar atividade:', error)
        throw error
      }

      console.log('✅ Atividade acessória salva com sucesso')
      toast.success('Atividade acessória registrada com sucesso!')
      return true

    } catch (err: any) {
      console.error('❌ Erro ao salvar atividade acessória:', err)
      const errorMessage = err.message || 'Erro ao salvar atividade acessória'
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [bases, equipes])

  return {
    // Estados
    loading,
    error,
    bases,
    equipes,
    tiposAtividade,

    // Funções
    fetchBases,
    fetchEquipesByBase,
    applyTimeMask,
    validateForm,
    saveAtividade,
    setError
  }
}