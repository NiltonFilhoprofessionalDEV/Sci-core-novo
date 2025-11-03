import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useSecoes, useEquipesBySecao } from '@/contexts/SecoesContext';

export interface TempoRespostaData {
  id?: string;
  nome_cidade: string;
  equipe: string;
  data_tempo_resposta: string;
  nome_completo: string;
  local_posicionamento: string;
  cci_utilizado: string;
  tempo_exercicio: string;
  observacoes?: string;
  secao_id: string;
  equipe_id: string;
  usuario_id: string;
}

export interface ViaturaTempo {
  id: string;
  nome_completo: string;
  local_posicionamento: string;
  cci_utilizado: string;
  tempo_exercicio: string;
  observacoes: string;
}

export interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
}

export const useTempoResposta = (secaoId?: string) => {
  const { user, profile } = useAuth();
  const { secoes, loading: secoesLoading, getSecaoByUser, isSecoesLoaded } = useSecoes();
  const { equipes, loading: equipesLoading, refresh } = useEquipesBySecao(secaoId);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Buscar equipes por seção (agora usa o contexto otimizado)
  const fetchEquipesBySecao = useCallback(async (secaoId: string) => {
    console.log('👥 Equipes disponíveis via contexto para seção:', secaoId, equipes?.length || 0);
    // As equipes já estão disponíveis via contexto, apenas força refresh se necessário
    if (secaoId && equipes.length === 0) {
      await refresh();
    }
    return equipes || [];
  }, [equipes, refresh]);

  // Buscar funcionários por equipe
  const fetchFuncionariosByEquipe = useCallback(async (equipeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, equipe_id')
        .eq('equipe_id', equipeId)
        .order('nome_completo');

      if (error) throw error;
      setFuncionarios(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar funcionários:', err);
      setError('Erro ao carregar funcionários');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar dados de tempo de resposta
  const saveTempoResposta = useCallback(async (data: TempoRespostaData[]): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError('Usuário não autenticado');
        return false;
      }

      // Adicionar usuario_id aos dados
      const dataWithUserId = data.map(item => ({
        ...item,
        usuario_id: user.id
      }));

      const { error } = await supabase
        .from('tempo_resposta')
        .insert(dataWithUserId);

      if (error) {
        console.error('Erro ao salvar tempo de resposta:', error);
        setError('Erro ao salvar dados');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao salvar dados');
      return false;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Buscar dados de tempo de resposta
  const fetchTempoResposta = useCallback(async (filters?: {
    secaoId?: string;
    equipeId?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('tempo_resposta')
        .select('*')
        .order('data_tempo_resposta', { ascending: false });

      if (filters?.secaoId) {
        query = query.eq('secao_id', filters.secaoId);
      }

      if (filters?.equipeId) {
        query = query.eq('equipe_id', filters.equipeId);
      }

      if (filters?.dataInicio) {
        query = query.gte('data_tempo_resposta', filters.dataInicio);
      }

      if (filters?.dataFim) {
        query = query.lte('data_tempo_resposta', filters.dataFim);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar tempo de resposta:', error);
        setError('Erro ao carregar dados');
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError('Erro inesperado ao carregar dados');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar formato de tempo (HH:MM:SS)
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // Formatar tempo para HH:MM:SS
  const formatTime = (input: string): string => {
    // Remove todos os caracteres não numéricos
    const numbers = input.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4).padStart(2, '0');
      return `${hours}:${minutes}:00`;
    } else {
      const hours = numbers.slice(0, 2);
      const minutes = numbers.slice(2, 4);
      const seconds = numbers.slice(4, 6).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  return {
    // Estados otimizados
    loading: secoesLoading || equipesLoading || loading,
    loadingEquipes: equipesLoading,
    error,
    secoes,
    equipes,
    funcionarios,
    
    // Funções otimizadas
    fetchEquipesBySecao,
    fetchFuncionariosByEquipe,
    saveTempoResposta,
    fetchTempoResposta,
    validateTimeFormat,
    formatTime,
    setError,
    getSecaoByUser,
    isSecoesLoaded
  };
};