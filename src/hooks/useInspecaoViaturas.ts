import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface Equipe {
  id: string;
  nome: string;
  secao_id: string;
}

interface InspecaoViaturasData {
  secao_id: string;
  equipe_id: string;
  usuario_id: string;
  nome_cidade: string;
  nome_usuario: string;
  equipe: string;
  data: string;
  quantidade_de_inspecoes: number;
  quantidade_itens_nao_conforme: number;
  observacoes?: string;
}

export const useInspecaoViaturas = () => {
  const { user } = useAuth();
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEquipes, setLoadingEquipes] = useState(false);



  // Buscar equipes por base
  const buscarEquipesPorBase = useCallback(async (baseId: string) => {
    if (!baseId) {
      setEquipes([]);
      return;
    }

    try {
      setLoadingEquipes(true);
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, secao_id')
        .eq('secao_id', baseId)
        .order('nome');

      if (error) throw error;

      setEquipes(data || []);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      setEquipes([]);
    } finally {
      setLoadingEquipes(false);
    }
  }, []);

  // Salvar dados de inspeção de viaturas
  const salvarInspecaoViaturas = async (formData: InspecaoViaturasFormData) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setLoading(true);

      // Buscar informações da base selecionada
      const { data: baseData, error: baseError } = await supabase
        .from('secoes')
        .select('nome, cidade')
        .eq('id', formData.base_id)
        .single();

      if (baseError) throw baseError;

      // Buscar informações da equipe selecionada
      const { data: equipeData, error: equipeError } = await supabase
        .from('equipes')
        .select('nome')
        .eq('id', formData.equipe_id)
        .single();

      if (equipeError) throw equipeError;

      // Buscar informações do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      const inspecaoData: InspecaoViaturasData = {
        secao_id: formData.base_id,
        equipe_id: formData.equipe_id,
        usuario_id: user.id,
        nome_cidade: baseData.cidade,
        nome_usuario: userData.nome_completo,
        equipe: equipeData.nome,
        data: formData.data,
        quantidade_de_inspecoes: formData.quantidade_de_inspecoes,
        quantidade_itens_nao_conforme: formData.quantidade_itens_nao_conforme,
        observacoes: formData.observacoes || null,
      };

      const { data, error } = await supabase
        .from('inspecoes_viatura')
        .insert([inspecaoData])
        .select();

      if (error) throw error;

      return {
        success: true,
        message: 'Dados de inspeção de viaturas salvos com sucesso!',
        data: data[0]
      };
    } catch (error: any) {
      console.error('Erro ao salvar dados de inspeção de viaturas:', error);
      return {
        success: false,
        message: error.message || 'Erro ao salvar dados de inspeção de viaturas'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    equipes,
    loading,
    loadingEquipes,
    buscarEquipesPorBase,
    salvarInspecaoViaturas,
  };
};