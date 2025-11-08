import { useState, useCallback } from 'react';
import { supabase, withRetry, checkConnection } from '@/lib/supabase';
import { toast } from 'sonner';
import { useSecoes, useEquipesBySecao } from '@/contexts/SecoesContext';

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

export function useHorasTreinamento(secaoId?: string) {
  const { secoes, loading: secoesLoading, getSecaoByUser, isSecoesLoaded } = useSecoes();
  const { equipes, loading: equipesLoading, refresh } = useEquipesBySecao(secaoId);
  
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Buscar equipes por seção (agora usa o contexto otimizado)
  const fetchEquipesPorSecao = useCallback(async (secaoId: string) => {
    console.log('👥 Equipes disponíveis via contexto para seção:', secaoId, equipes?.length || 0);
    // As equipes já estão disponíveis via contexto, apenas força refresh se necessário
    if (secaoId && equipes.length === 0) {
      await refresh();
    }
  }, [equipes, refresh]);

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
    } finally {
      setLoading(false);
    }
  }, []);

  // Validar horas de treinamento
  const validarHoras = useCallback((horas: number): boolean => {
    const MAX_HORAS = 99 + (59 / 60) + (59 / 3600);
    if (horas < 0 || horas > MAX_HORAS) {
      toast.error('As horas devem estar entre 0 e 99:59:59');
      return false;
    }
    return true;
  }, []);

  // Verificar duplicatas
  const verificarDuplicatas = useCallback(async (secaoId: string, equipeId: string, data: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando duplicatas para:', { secaoId, equipeId, data });
      
      const { data: existingData, error } = await supabase
        .from('ptr_ba_horas_treinamento')
        .select('id')
        .eq('secao_id', secaoId)
        .eq('equipe_id', equipeId)
        .eq('data_ptr_ba', data)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar duplicatas:', error);
        return false;
      }

      const hasDuplicate = existingData && existingData.length > 0;
      console.log(hasDuplicate ? '⚠️ Duplicata encontrada' : '✅ Nenhuma duplicata encontrada');
      
      return hasDuplicate;
    } catch (error) {
      console.error('❌ Erro inesperado ao verificar duplicatas:', error);
      return false;
    }
  }, []);

  // Salvar horas de treinamento
  const salvarHorasTreinamento = useCallback(async (registro: HorasTreinamentoRegistro): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('💾 Salvando horas de treinamento:', registro);
      
      // Buscar dados do usuário atual (igual aos outros hooks que funcionam)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ Erro: usuário não está logado');
        toast.error('Erro: usuário não identificado. Faça login novamente.');
        return false;
      }
      
      console.log('🔍 DEBUG - Usuário obtido:', {
        userId: user.id,
        userEmail: user.email
      });

      // Validações básicas
      if (!registro.secao_id || !registro.equipe_id || !registro.data_ptr_ba) {
        toast.error('Todos os campos obrigatórios devem ser preenchidos');
        return false;
      }

      if (!validarHoras(registro.hora_ptr_diaria)) {
        return false;
      }

      if (registro.resultados.length === 0) {
        toast.error('Selecione pelo menos um funcionário');
        return false;
      }

      // Verificar duplicatas
      const hasDuplicate = await verificarDuplicatas(registro.secao_id, registro.equipe_id, registro.data_ptr_ba);
      if (hasDuplicate) {
        toast.error('Já existe um registro para esta equipe nesta data');
        return false;
      }

      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Buscar dados da equipe selecionada para obter nome_cidade e nome da equipe
      const { data: equipeData, error: equipeError } = await supabase
        .from('equipes')
        .select('nome_cidade, nome')
        .eq('id', registro.equipe_id)
        .single();

      if (equipeError) {
        console.error('❌ Erro ao buscar dados da equipe:', equipeError);
        toast.error('Erro ao obter informações da equipe');
        return false;
      }

      if (!equipeData) {
        console.error('❌ Equipe não encontrada:', registro.equipe_id);
        toast.error('Equipe não encontrada');
        return false;
      }

      console.log('🏢 Dados da equipe obtidos:', {
        nome_cidade: equipeData.nome_cidade,
        nome_equipe: equipeData.nome
      });

      // Preparar dados para inserção - incluir usuario_id do usuário logado
      // A tabela não tem funcionario_id, usa nome_completo diretamente
      const registrosParaInserir = registro.resultados.map(resultado => ({
        secao_id: registro.secao_id,
        equipe_id: registro.equipe_id,
        nome_completo: resultado.nome,
        data_ptr_ba: registro.data_ptr_ba,
        hora_ptr_diaria: resultado.hora_ptr_diaria,
        nome_cidade: equipeData.nome_cidade, // Nome da cidade da equipe
        equipe: equipeData.nome, // Nome da equipe
        mes_referencia: 'Placeholder', // Será atualizado pelo trigger automaticamente
        usuario_id: user.id // ID do usuário logado (já validado acima)
      }));

      console.log('📝 Dados preparados para inserção:', registrosParaInserir);
      console.log('🔍 DEBUG - usuario_id sendo enviado:', user.id);

      // Usar retry logic para a inserção
      const { error } = await withRetry(async () => {
        return await supabase
          .from('ptr_ba_horas_treinamento')
          .insert(registrosParaInserir);
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao salvar horas de treinamento:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('Failed to fetch')) {
          toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('timeout')) {
          toast.error('Tempo limite excedido. Tente novamente.');
        } else if (error.message.includes('duplicate') || error.code === '23505') {
          toast.error('Registro duplicado. Já existe um registro para esta combinação.');
        } else {
          toast.error('Erro ao salvar horas de treinamento');
        }
        return false;
      }

      console.log('✅ Horas de treinamento salvas com sucesso');
      toast.success('Horas de treinamento salvas com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar horas de treinamento:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      // Garantir que o estado saving seja sempre resetado
      setSaving(false);
    }
  }, []);

  return {
    // Estados otimizados
    secoes,
    equipes,
    funcionarios,
    loading: secoesLoading || equipesLoading || loading,
    loadingEquipes: equipesLoading,
    saving,
    
    // Funções otimizadas
    fetchEquipesPorSecao,
    fetchFuncionariosPorEquipe,
    validarHoras,
    verificarDuplicatas,
    salvarHorasTreinamento,
    getSecaoByUser,
    isSecoesLoaded
  };
}