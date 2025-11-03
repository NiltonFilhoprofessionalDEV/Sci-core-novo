import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useSecoes, useEquipesBySecao } from '@/contexts/SecoesContext'
import { toast } from 'sonner'

interface ControleTrocasData {
  nome_cidade: string
  nome_usuario: string
  equipe: string
  data_referencia: string
  quantidade_troca: number
  observacoes?: string
  secao_id?: string
  equipe_id?: string
}

export const useControleTrocas = (secaoId?: string) => {
  const { user } = useAuth()
  const { secoes, loading: secoesLoading, getSecaoByUser } = useSecoes()
  const { equipes, loading: equipesLoading, refresh: refreshEquipes } = useEquipesBySecao(secaoId)
  const [loading, setLoading] = useState(false)

  // Função otimizada para buscar equipes por seção (usa o contexto)
  const fetchEquipesBySecao = useCallback(async (targetSecaoId: string) => {
    try {
      await refreshEquipes()
      return equipes
    } catch (error) {
      console.error('Erro ao buscar equipes:', error)
      toast.error('Erro ao carregar equipes')
      throw error
    }
  }, [refreshEquipes, equipes])

  // Função para obter seção do usuário automaticamente
  const getSecaoUsuario = useCallback(() => {
    return getSecaoByUser()
  }, [getSecaoByUser])

  // Validar dados antes de salvar
  const validarDados = (dados: ControleTrocasData): string[] => {
    const erros: string[] = []

    if (!dados.nome_cidade?.trim()) {
      erros.push('Base é obrigatória')
    }

    if (!dados.data_referencia) {
      erros.push('Data é obrigatória')
    }

    if (!dados.equipe?.trim()) {
      erros.push('Equipe é obrigatória')
    }

    if (!dados.quantidade_troca || dados.quantidade_troca < 0) {
      erros.push('Quantidade de trocas deve ser um número válido maior ou igual a zero')
    }

    if (!dados.nome_usuario?.trim()) {
      erros.push('Usuário não identificado')
    }

    return erros
  }

  // Salvar dados de controle de trocas
  const salvarControleTrocas = useCallback(async (dados: ControleTrocasData) => {
    try {
      setLoading(true)

      // Validar dados
      const erros = validarDados(dados)
      if (erros.length > 0) {
        throw new Error(erros.join(', '))
      }

      // Preparar dados para inserção
      const dadosParaInserir = {
        nome_cidade: dados.nome_cidade.trim(),
        nome_usuario: dados.nome_usuario.trim(),
        equipe: dados.equipe.trim(),
        data_referencia: dados.data_referencia,
        quantidade_troca: Math.round(Number(dados.quantidade_troca)),
        observacoes: dados.observacoes?.trim() || null,
        // Campos obrigatórios para compatibilidade com a estrutura existente
        secao_id: dados.secao_id || null, // Usar o secao_id dos dados
        equipe_id: dados.equipe_id || null, // Usar o equipe_id dos dados
        usuario_id: user?.id || null
      }

      const { data, error } = await supabase
        .from('controle_trocas')
        .insert([dadosParaInserir])
        .select()

      if (error) {
        console.error('Erro ao salvar controle de trocas:', error)
        throw error
      }

      return data?.[0]
    } catch (error) {
      console.error('Erro ao salvar controle de trocas:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  return {
    // Estados otimizados
    loading: loading || secoesLoading,
    loadingEquipes: equipesLoading,
    equipes,
    secoes,
    
    // Funções otimizadas
    fetchEquipesBySecao,
    salvarControleTrocas,
    validarDados,
    getSecaoUsuario,
    
    // Estados de cache
    isSecoesLoaded: secoes.length > 0
  }
}