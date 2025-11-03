import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSecoes, useEquipesBySecao } from '@/contexts/SecoesContext';
import { toast } from 'sonner';

export interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
}

export interface TAFResultado {
  funcionario_id: string;
  nome: string;
  idade: number | null;
  tempo_total: string;
  desempenho: number | null;
  observacoes: string;
}

export interface TAFRegistro {
  secao_id: string;
  equipe_id: string;
  data_teste: string;
  resultados: TAFResultado[];
}

export const useTAF = (secaoId?: string) => {
  const { secoes, loading: secoesLoading, getSecaoByUser } = useSecoes();
  const { equipes, loading: equipesLoading, refresh: refreshEquipes } = useEquipesBySecao(secaoId);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Função otimizada para buscar equipes por seção (usa o contexto)
  const fetchEquipesPorSecao = useCallback(async (targetSecaoId: string) => {
    try {
      await refreshEquipes();
      return equipes;
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      toast.error('Erro ao carregar equipes');
      throw error;
    }
  }, [refreshEquipes, equipes]);

  // Buscar funcionários por equipe
  const fetchFuncionariosPorEquipe = useCallback(async (equipeId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, equipe_id')
        .eq('equipe_id', equipeId)
        .order('nome_completo');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular desempenho baseado na idade e tempo
  const calcularDesempenho = (idade: number, tempo: string): number | null => {
    if (!tempo || tempo === '00:00:00') return null;

    // Converter tempo HH:MM:SS para segundos
    const [horas, minutos, segundos] = tempo.split(':').map(Number);
    const tempoSegundos = horas * 3600 + minutos * 60 + segundos;

    let desempenho: number;

    if (idade <= 39) {
      // Critérios para idade <= 39 anos
      if (tempoSegundos <= 120) { // 00:02:00
        desempenho = 10;
      } else if (tempoSegundos <= 140) { // 00:02:20
        desempenho = 9;
      } else if (tempoSegundos <= 160) { // 00:02:40
        desempenho = 8;
      } else if (tempoSegundos <= 180) { // 00:03:00
        desempenho = 7;
      } else {
        desempenho = 0; // Reprovado
      }
    } else {
      // Critérios para idade >= 40 anos
      if (tempoSegundos <= 180) { // 00:03:00
        desempenho = 10;
      } else if (tempoSegundos <= 200) { // 00:03:20
        desempenho = 9;
      } else if (tempoSegundos <= 220) { // 00:03:40
        desempenho = 8;
      } else if (tempoSegundos <= 240) { // 00:04:00
        desempenho = 7;
      } else {
        desempenho = 0; // Reprovado
      }
    }

    return desempenho;
  };

  // Validar formato de tempo HH:MM:SS
  const validarTempo = (tempo: string): boolean => {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return regex.test(tempo);
  };

  // Salvar dados do TAF
  const salvarTAF = async (dados: TAFRegistro): Promise<boolean> => {
    try {
      setSaving(true);

      // Validações
      if (!dados.secao_id || !dados.equipe_id || !dados.data_teste) {
        toast.error('Preencha todos os campos obrigatórios');
        return false;
      }

      // Validar se a data não é futura
      const hoje = new Date();
      const dataTesteSelecionada = new Date(dados.data_teste);
      if (dataTesteSelecionada > hoje) {
        toast.error('A data do teste não pode ser futura');
        return false;
      }

      // Validar resultados
      for (const resultado of dados.resultados) {
        if (resultado.idade === null || resultado.idade <= 0) {
          toast.error(`Idade obrigatória para ${resultado.nome}`);
          return false;
        }

        if (resultado.tempo_total && !validarTempo(resultado.tempo_total)) {
          toast.error(`Formato de tempo inválido para ${resultado.nome}. Use HH:MM:SS`);
          return false;
        }

        // Deve ter pelo menos tempo OU observações preenchidas
        const temTempo = resultado.tempo_total && resultado.tempo_total !== '00:00:00';
        const temObservacoes = resultado.observacoes && resultado.observacoes.trim();
        
        if (!temTempo && !temObservacoes) {
          toast.error(`${resultado.nome} deve ter pelo menos tempo ou observações preenchidas`);
          return false;
        }
      }

      // Buscar informações da equipe para obter nome_cidade e nome da equipe
      const { data: equipeData, error: equipeError } = await supabase
        .from('equipes')
        .select('nome_cidade, nome')
        .eq('id', dados.equipe_id)
        .single();

      if (equipeError) throw equipeError;

      // Iniciar transação
      const { data: registroData, error: registroError } = await supabase
        .from('taf_registros')
        .insert({
          secao_id: dados.secao_id,
          equipe_id: dados.equipe_id,
          data_teste: dados.data_teste
        })
        .select()
        .single();

      if (registroError) throw registroError;

      // Inserir resultados individuais
      const resultadosParaInserir = dados.resultados.map(resultado => ({
        taf_registro_id: registroData.id,
        funcionario_id: resultado.funcionario_id,
        idade: resultado.idade,
        tempo_total: resultado.tempo_total || null,
        desempenho: resultado.desempenho,
        observacoes: resultado.observacoes || null,
        nome_completo: resultado.nome,
        nome_cidade: equipeData.nome_cidade,
        nome_equipe: equipeData.nome,
        data_taf: dados.data_teste
      }));

      const { error: resultadosError } = await supabase
        .from('taf_resultados')
        .insert(resultadosParaInserir);

      if (resultadosError) throw resultadosError;

      toast.success('TAF salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('Erro ao salvar TAF:', error);
      toast.error('Erro ao salvar TAF');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    // Estados otimizados
    secoes,
    equipes,
    funcionarios,
    loading: loading || secoesLoading,
    loadingEquipes: equipesLoading,
    saving,
    
    // Funções otimizadas
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    calcularDesempenho,
    validarTempo,
    salvarTAF,
    getSecaoByUser,
    
    // Estados de cache
    isSecoesLoaded: secoes.length > 0
  };
};