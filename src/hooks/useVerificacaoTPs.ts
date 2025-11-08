import { useState, useCallback } from 'react';
import { supabase, withRetry, checkConnection } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Equipe {
  id: string;
  nome: string;
  secao_id: string;
  nome_cidade: string;
}

export interface VerificacaoTPsRegistro {
  secao_id: string;
  equipe: string;
  data: string;
  tp_conforme: number;
  tp_verificado: number;
  tp_total: number;
}

export function useVerificacaoTPs() {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);



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
          .eq('ativa', true)
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

  // Validar data (não pode ser futura)
  const validarData = useCallback((data: string): boolean => {
    if (!data) return false;
    
    const dataEscolhida = new Date(`${data}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999); // Fim do dia atual
    
    return dataEscolhida <= hoje;
  }, []);

  // Validar valores de TPs (devem ser números positivos e seguir a regra: conforme ≤ verificado ≤ total)
  const validarTPs = useCallback((conforme: number, verificado: number, total: number): { isValid: boolean; message?: string } => {
    // Verificar se são números válidos
    if (isNaN(conforme) || isNaN(verificado) || isNaN(total)) {
      return { isValid: false, message: 'Todos os valores devem ser números válidos' };
    }

    // Verificar se são números positivos
    if (conforme < 0 || verificado < 0 || total < 0) {
      return { isValid: false, message: 'Os valores não podem ser negativos' };
    }

    // Verificar se são números inteiros
    if (!Number.isInteger(conforme) || !Number.isInteger(verificado) || !Number.isInteger(total)) {
      return { isValid: false, message: 'Os valores devem ser números inteiros' };
    }

    // Verificar a regra: conforme ≤ verificado ≤ total
    if (conforme > verificado) {
      return { isValid: false, message: 'TPs conformes não pode ser maior que TPs verificados' };
    }

    if (verificado > total) {
      return { isValid: false, message: 'TPs verificados não pode ser maior que TPs total' };
    }

    return { isValid: true };
  }, []);

  // Verificar se já existem registros para a mesma data/seção/equipe
  const verificarDuplicatas = async (data: string, secaoId: string, equipe: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando duplicatas para:', { data, secaoId, equipe });
      
      const { data: registros, error } = await supabase
        .from('verificacao_tps')
        .select('id')
        .eq('data', data)
        .eq('secao_id', secaoId)
        .eq('equipe', equipe)
        .limit(1);

      if (error) {
        console.error('❌ Erro ao verificar duplicatas:', error);
        return false;
      }

      const temDuplicatas = registros && registros.length > 0;
      console.log('📊 Resultado verificação duplicatas:', temDuplicatas);
      return temDuplicatas;
    } catch (error) {
      console.error('❌ Erro inesperado ao verificar duplicatas:', error);
      return false;
    }
  };

  // Salvar dados de verificação de TPs
  const salvarVerificacaoTPs = async (dados: VerificacaoTPsFormData): Promise<boolean> => {
    setSaving(true);
    
    try {
      console.log('💾 Salvando verificação de TPs:', dados);

      // Validar data
      if (!validarData(dados.data)) {
        toast.error('Data inválida ou futura não é permitida');
        setSaving(false);
        return false;
      }

      // Validar valores de TPs
      const validacaoTPs = validarTPs(dados.tp_conforme, dados.tp_verificado, dados.tp_total);
      if (!validacaoTPs.isValid) {
        toast.error(validacaoTPs.message || 'Valores de TPs inválidos');
        setSaving(false);
        return false;
      }

      // Verificar duplicatas antes de salvar
      const temDuplicatas = await verificarDuplicatas(dados.data, dados.secao_id, dados.equipe);
      if (temDuplicatas) {
        toast.error('Já existe um registro de verificação de TPs para esta data, seção e equipe');
        setSaving(false);
        return false;
      }

      // Buscar o usuário logado para obter informações do usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Erro ao obter usuário logado:', userError);
        toast.error('Erro ao identificar usuário logado');
        setSaving(false);
        return false;
      }

      // Buscar o equipe_id baseado no nome da equipe selecionada
      let equipe_id: string | null = null;
      if (dados.equipe) {
        const { data: equipeData, error: equipeError } = await supabase
          .from('equipes')
          .select('id')
          .eq('nome', dados.equipe)
          .eq('secao_id', dados.secao_id)
          .single();

        if (equipeError) {
          console.error('❌ Erro ao buscar equipe_id:', equipeError);
        } else {
          equipe_id = equipeData?.id || null;
        }
      }

      // Preparar dados para inserção (nome_cidade e nome_usuario serão preenchidos pelo trigger)
      const registroParaInserir = {
        secao_id: dados.secao_id,
        data: dados.data,
        equipe: dados.equipe,
        equipe_id: equipe_id,
        tp_conforme: dados.tp_conforme,
        tp_verificado: dados.tp_verificado,
        tp_total: dados.tp_total,
        usuario_id: user.id,
      };

      console.log('📝 Inserindo registro:', registroParaInserir);

      // Inserir dados na tabela verificacao_tps
      const { error: insertError } = await supabase
        .from('verificacao_tps')
        .insert([registroParaInserir]);

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError);
        
        // Tratamento de erros específicos
        if (insertError.message.includes('permission denied')) {
          toast.error('Sem permissão para salvar dados. Verifique suas credenciais.');
        } else if (insertError.message.includes('duplicate key')) {
          toast.error('Já existe um registro para esta combinação de dados');
        } else {
          toast.error('Erro ao salvar verificação de TPs');
        }
        setSaving(false);
        return false;
      }

      console.log('✅ Verificação de TPs salva com sucesso!');
      toast.success('Verificação de TPs registrada com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar verificação de TPs:', error);
      toast.error('Erro inesperado ao salvar dados');
      return false;
    } finally {
      // Garantir que o estado saving seja sempre resetado
      setSaving(false);
    }
  };

  return {
    // Estados
    equipes,
    loading,
    saving,
    
    // Funções
    fetchEquipesPorSecao,
    validarData,
    validarTPs,
    verificarDuplicatas,
    salvarVerificacaoTPs
  };
}