import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Equipe {
  id: string;
  nome: string;
  secao_id: string;
  nome_cidade: string;
}

export interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
}

export interface PTRBAResultado {
  funcionario_id: string;
  nome: string;
  nota_prova: number | null;
  status: string | null;
  observacoes: string;
}

export interface PTRBARegistro {
  secao_id: string;
  equipe_id: string;
  data_prova: string;
  resultados: PTRBAResultado[];
}

export function usePTRBA() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);



  // Buscar equipes por seção
  const fetchEquipesPorSecao = useCallback(async (secaoId: string) => {
    try {
      setLoading(true);
      console.log('👥 Buscando equipes para seção:', secaoId);
      
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, secao_id, nome_cidade')
        .eq('secao_id', secaoId)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao buscar equipes:', error);
        toast.error('Erro ao carregar equipes');
        return;
      }

      console.log('✅ Equipes carregadas:', data?.length || 0);
      setEquipes(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar equipes:', error);
      toast.error('Erro inesperado ao carregar equipes');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar funcionários por equipe
  const fetchFuncionariosPorEquipe = useCallback(async (equipeId: string) => {
    try {
      setLoading(true);
      console.log('👤 Buscando funcionários para equipe:', equipeId);
      
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, equipe_id')
        .eq('equipe_id', equipeId)
        .order('nome_completo');

      if (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        toast.error('Erro ao carregar funcionários');
        return;
      }

      console.log('✅ Funcionários carregados:', data?.length || 0);
      setFuncionarios(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar funcionários:', error);
      toast.error('Erro inesperado ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular status baseado na nota
  const calcularStatus = (nota: number | null): string | null => {
    if (nota === null || nota === undefined) return null;
    return nota >= 8.0 ? 'Aprovado' : 'Reprovado';
  };

  // Validar nota (0.0 a 10.0)
  const validarNota = (nota: string): boolean => {
    const numeroNota = parseFloat(nota);
    return !isNaN(numeroNota) && numeroNota >= 0.0 && numeroNota <= 10.0;
  };

  // Salvar dados do PTR-BA
  const salvarPTRBA = async (dados: PTRBARegistro): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('💾 Salvando dados PTR-BA:', dados);

      // Buscar informações da seção para obter nome da cidade
      const { data: secaoData, error: secaoError } = await supabase
        .from('secoes')
        .select('cidade')
        .eq('id', dados.secao_id)
        .single();

      if (secaoError) {
        console.error('❌ Erro ao buscar dados da seção:', secaoError);
        toast.error('Erro ao obter dados da base');
        return false;
      }

      // Buscar o usuário logado para obter o usuario_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Erro ao obter usuário logado:', userError);
        toast.error('Erro ao identificar usuário logado');
        return false;
      }

      // Buscar informações da equipe para obter nome da equipe
      const { data: equipeData, error: equipeError } = await supabase
        .from('equipes')
        .select('nome')
        .eq('id', dados.equipe_id)
        .single();

      if (equipeError) {
        console.error('❌ Erro ao buscar dados da equipe:', equipeError);
        toast.error('Erro ao obter dados da equipe');
        return false;
      }

      // Preparar dados para inserção
      const registrosParaInserir = dados.resultados
        .filter(resultado => resultado.nota_prova !== null || resultado.observacoes.trim() !== '')
        .map(resultado => ({
          secao_id: dados.secao_id,           // Campo obrigatório
          equipe_id: dados.equipe_id,         // Campo obrigatório
          usuario_id: user.id,                // Campo obrigatório - usuário logado
          nome_cidade: secaoData.cidade,
          data_prova: dados.data_prova,
          nome_completo: resultado.nome,
          nota_prova: resultado.nota_prova || 0.0,
          status: resultado.status || 'Reprovado',
          observacoes: resultado.observacoes || '',
          equipe: equipeData.nome             // Nome da equipe
        }));

      if (registrosParaInserir.length === 0) {
        toast.error('Nenhum dado válido para salvar');
        return false;
      }

      console.log('📝 Inserindo registros:', registrosParaInserir.length);
      console.log('🔍 Dados para inserção:', registrosParaInserir[0]); // Log do primeiro registro para debug

      // Inserir dados na tabela ptr_ba_provas_teoricas
      const { error: insertError } = await supabase
        .from('ptr_ba_provas_teoricas')
        .insert(registrosParaInserir);

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError);
        toast.error('Erro ao salvar dados da prova teórica');
        return false;
      }

      console.log('✅ Dados salvos com sucesso!');
      toast.success(`Prova teórica registrada com sucesso! ${registrosParaInserir.length} funcionário(s) processado(s).`);
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar PTR-BA:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    // Estados
    equipes,
    funcionarios,
    loading,
    saving,
    
    // Funções
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    calcularStatus,
    validarNota,
    salvarPTRBA
  };
}