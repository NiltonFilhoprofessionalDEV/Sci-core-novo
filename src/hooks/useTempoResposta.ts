import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

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

export interface Equipe {
  id: string;
  nome: string;
  nome_cidade: string;
  secao_id: string;
}

export interface Secao {
  id: string;
  nome: string;
  cidade: string;
  codigo: string;
  estado: string;
}

export const useTempoResposta = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);

  // Buscar seções disponíveis
  const fetchSecoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade, codigo, estado')
        .eq('ativa', true)
        .order('cidade');

      if (error) throw error;
      setSecoes(data || []);
    } catch (err) {
      console.error('Erro ao buscar seções:', err);
      setError('Erro ao carregar seções');
    } finally {
      setLoading(false);
    }
  };

  // Buscar equipes por seção
  const fetchEquipesBySecao = useCallback(async (secaoId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, nome_cidade, secao_id')
        .eq('secao_id', secaoId)
        .order('nome');

      if (error) throw error;
      setEquipes(data || []);
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar equipes:', err);
      setError('Erro ao carregar equipes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

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

  // Buscar seção por nome da cidade
  const getSecaoByNomeCidade = async (nomeCidade: string) => {
    try {
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade')
        .eq('cidade', nomeCidade)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao buscar seção por cidade:', err);
      return null;
    }
  };

  // Salvar tempos de resposta
  const saveTempoResposta = async (
    nomeCidade: string,
    equipeNome: string,
    equipeId: string,
    dataTempoResposta: string,
    viaturas: ViaturaTempo[]
  ) => {
    if (!user || !profile) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);
      setError(null);

      // Buscar seção baseada na cidade
      const secao = await getSecaoByNomeCidade(nomeCidade);
      if (!secao) {
        throw new Error('Seção não encontrada para a cidade selecionada');
      }

      // Verificar duplicatas
      const { data: existingData, error: checkError } = await supabase
        .from('tempo_resposta')
        .select('id')
        .eq('secao_id', secao.id)
        .eq('equipe_id', equipeId)
        .eq('data_tempo_resposta', dataTempoResposta);

      if (checkError) throw checkError;

      if (existingData && existingData.length > 0) {
        throw new Error('Já existe registro de tempo de resposta para esta equipe nesta data');
      }

      // Preparar dados para inserção
      const tempoRespostaData: Omit<TempoRespostaData, 'id'>[] = viaturas.map(viatura => ({
        nome_cidade: nomeCidade,
        equipe: equipeNome,
        data_tempo_resposta: dataTempoResposta,
        nome_completo: viatura.nome_completo,
        local_posicionamento: viatura.local_posicionamento,
        cci_utilizado: viatura.cci_utilizado,
        tempo_exercicio: viatura.tempo_exercicio,
        observacoes: viatura.observacoes || null,
        secao_id: secao.id,
        equipe_id: equipeId,
        usuario_id: user.id
      }));

      // Inserir dados
      const { error: insertError } = await supabase
        .from('tempo_resposta')
        .insert(tempoRespostaData);

      if (insertError) throw insertError;

      return { success: true };
    } catch (err: any) {
      console.error('Erro ao salvar tempo de resposta:', err);
      const errorMessage = err.message || 'Erro ao salvar tempo de resposta';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Buscar registros de tempo de resposta
  const fetchTempoResposta = async () => {
    if (!profile?.secao_id) return [];

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tempo_resposta')
        .select(`
          *,
          equipes:equipe_id(nome, nome_cidade),
          secoes:secao_id(nome, nome_cidade)
        `)
        .eq('secao_id', profile.secao_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar tempo de resposta:', err);
      setError('Erro ao carregar registros');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Validar formato de tempo HH:MM:SS
  const validateTimeFormat = (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // Formatar tempo para HH:MM:SS
  const formatTime = (time: string): string => {
    // Remove caracteres não numéricos
    const numbers = time.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers.padStart(2, '0') + ':00:00';
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

  useEffect(() => {
    fetchSecoes();
  }, []);

  return {
    loading,
    error,
    secoes,
    equipes,
    funcionarios,
    fetchSecoes,
    fetchEquipesBySecao,
    fetchFuncionariosByEquipe,
    saveTempoResposta,
    fetchTempoResposta,
    validateTimeFormat,
    formatTime,
    setError
  };
};