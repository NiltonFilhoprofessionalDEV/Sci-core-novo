import { useState, useEffect, useCallback } from 'react';
import { supabase, withRetry, checkConnection } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Secao {
  id: string;
  nome: string;
  cidade: string;
}

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

export interface HorasTreinamentoResultado {
  funcionario_id: string;
  nome: string;
  hora_ptr_diaria: number;
}

export interface HorasTreinamentoRegistro {
  secao_id: string;
  equipe_id: string;
  data_ptr_ba: string;
  hora_ptr_diaria: number;
  resultados: HorasTreinamentoResultado[];
}

export function useHorasTreinamento() {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Buscar seções
  const fetchSecoes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🏢 Buscando seções para horas de treinamento...');
      
      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Usar retry logic para a requisição
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('secoes')
          .select('id, nome, cidade')
          .order('nome');
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao buscar seções:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Failed to fetch')) {
          toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('timeout')) {
          toast.error('Tempo limite excedido. Tente novamente.');
        } else {
          toast.error('Erro ao carregar bases');
        }
        return;
      }

      console.log('✅ Seções carregadas:', data?.length || 0);
      setSecoes(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar seções:', error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_')) {
          toast.error('Problema de conexão. Verifique sua internet e tente novamente.');
        } else {
          toast.error('Erro inesperado ao carregar bases');
        }
      } else {
        toast.error('Erro inesperado ao carregar bases');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar equipes por seção
  const fetchEquipesPorSecao = useCallback(async (secaoId: string) => {
    try {
      setLoading(true);
      console.log('👥 Buscando equipes para seção:', secaoId);
      
      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Usar retry logic para a requisição
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('equipes')
          .select('id, nome, secao_id, nome_cidade')
          .eq('secao_id', secaoId)
          .order('nome');
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao buscar equipes:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Failed to fetch')) {
          toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('timeout')) {
          toast.error('Tempo limite excedido. Tente novamente.');
        } else {
          toast.error('Erro ao carregar equipes');
        }
        return;
      }

      console.log('✅ Equipes carregadas:', data?.length || 0);
      setEquipes(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar equipes:', error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_')) {
          toast.error('Problema de conexão. Verifique sua internet e tente novamente.');
        } else {
          toast.error('Erro inesperado ao carregar equipes');
        }
      } else {
        toast.error('Erro inesperado ao carregar equipes');
      }
      
      // Definir equipes como array vazio em caso de erro
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar funcionários por equipe
  const fetchFuncionariosPorEquipe = useCallback(async (equipeId: string) => {
    try {
      setLoading(true);
      console.log('👤 Buscando funcionários para equipe:', equipeId);
      
      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Usar retry logic para a requisição
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('funcionarios')
          .select('id, nome_completo, equipe_id')
          .eq('equipe_id', equipeId)
          .order('nome_completo');
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao buscar funcionários:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Failed to fetch')) {
          toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('timeout')) {
          toast.error('Tempo limite excedido. Tente novamente.');
        } else {
          toast.error('Erro ao carregar funcionários');
        }
        return;
      }

      console.log('✅ Funcionários carregados:', data?.length || 0);
      setFuncionarios(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar funcionários:', error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_')) {
          toast.error('Problema de conexão. Verifique sua internet e tente novamente.');
        } else {
          toast.error('Erro inesperado ao carregar funcionários');
        }
      } else {
        toast.error('Erro inesperado ao carregar funcionários');
      }
      
      // Definir funcionários como array vazio em caso de erro
      setFuncionarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar horas (deve ser positivo e máximo 2 casas decimais)
  const validarHoras = (horas: string): boolean => {
    const numeroHoras = parseFloat(horas);
    if (isNaN(numeroHoras) || numeroHoras <= 0) return false;
    
    // Verificar se tem no máximo 2 casas decimais
    const decimalPart = horas.split('.')[1];
    if (decimalPart && decimalPart.length > 2) return false;
    
    return true;
  };

  // Verificar se já existem registros para a mesma data/equipe
  const verificarDuplicatas = async (data_ptr_ba: string, equipe_id: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando duplicatas para:', { data_ptr_ba, equipe_id });
      
      const { data, error } = await supabase
        .from('ptr_ba_horas_treinamento')
        .select('id')
        .eq('data_ptr_ba', data_ptr_ba)
        .eq('equipe_id', equipe_id)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar duplicatas:', error);
        return false;
      }

      const temDuplicatas = data && data.length > 0;
      console.log('📊 Resultado verificação duplicatas:', temDuplicatas);
      return temDuplicatas;
    } catch (error) {
      console.error('❌ Erro inesperado ao verificar duplicatas:', error);
      return false;
    }
  };

  // Salvar dados de horas de treinamento
  const salvarHorasTreinamento = async (dados: HorasTreinamentoRegistro): Promise<boolean> => {
    setSaving(true);
    
    try {
      console.log('💾 Salvando horas de treinamento:', dados);

      // Verificar duplicatas antes de salvar
      const temDuplicatas = await verificarDuplicatas(dados.data_ptr_ba, dados.equipe_id);
      if (temDuplicatas) {
        toast.error('Já existem registros de horas de treinamento para esta data e equipe');
        setSaving(false);
        return false;
      }

      // Buscar informações da seção para obter nome da cidade
      const { data: secaoData, error: secaoError } = await supabase
        .from('secoes')
        .select('cidade')
        .eq('id', dados.secao_id)
        .single();

      if (secaoError) {
        console.error('❌ Erro ao buscar dados da seção:', secaoError);
        toast.error('Erro ao obter dados da base');
        setSaving(false);
        return false;
      }

      // Buscar o usuário logado para obter o usuario_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Erro ao obter usuário logado:', userError);
        toast.error('Erro ao identificar usuário logado');
        setSaving(false);
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
        setSaving(false);
        return false;
      }

      // Preparar dados para inserção
      const registrosParaInserir = dados.resultados
        .filter(resultado => resultado.hora_ptr_diaria > 0)
        .map(resultado => ({
          secao_id: dados.secao_id,           // Campo obrigatório
          equipe_id: dados.equipe_id,         // Campo obrigatório
          usuario_id: user.id,                // Campo obrigatório - usuário logado
          nome_cidade: secaoData.cidade,
          data_ptr_ba: dados.data_ptr_ba,
          nome_completo: resultado.nome,
          hora_ptr_diaria: resultado.hora_ptr_diaria,
          equipe: equipeData.nome,            // Nome da equipe
          // mes_referencia será preenchido automaticamente pelo trigger
        }));

      if (registrosParaInserir.length === 0) {
        toast.error('Nenhum dado válido para salvar');
        return false;
      }

      console.log('📝 Inserindo registros:', registrosParaInserir.length);
      console.log('🔍 Dados para inserção:', registrosParaInserir[0]); // Log do primeiro registro para debug

      // Inserir dados na tabela ptr_ba_horas_treinamento
      const { error: insertError } = await supabase
        .from('ptr_ba_horas_treinamento')
        .insert(registrosParaInserir);

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError);
        toast.error('Erro ao salvar horas de treinamento');
        setSaving(false);
        return false;
      }

      console.log('✅ Horas de treinamento salvas com sucesso!');
      toast.success(`Horas de treinamento registradas com sucesso! ${registrosParaInserir.length} funcionário(s) processado(s).`);
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar horas de treinamento:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      // Garantir que o estado saving seja sempre resetado
      setSaving(false);
    }
  };

  // Carregar seções na inicialização
  useEffect(() => {
    fetchSecoes();
  }, [fetchSecoes]);

  return {
    // Estados
    secoes,
    equipes,
    funcionarios,
    loading,
    saving,
    
    // Funções
    fetchSecoes,
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    validarHoras,
    verificarDuplicatas,
    salvarHorasTreinamento
  };
}