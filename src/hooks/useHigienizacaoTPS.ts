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

export interface HigienizacaoTPSFormData {
  secao_id: string;
  data: string;
  equipe: string;
  tp_higienizado: number;
  tp_total: number;
}

export interface HigienizacaoTPSRegistro {
  id?: string;
  secao_id: string;
  data: string;
  equipe: string;
  equipe_id: string;
  tp_higienizado: number;
  tp_total: number;
  nome_cidade?: string;
  nome_usuario?: string;
  usuario_id?: string;
  created_at?: string;
  updated_at?: string;
}

export function useHigienizacaoTPS() {
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Buscar seções
  const fetchSecoes = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🏢 Buscando seções para higienização de TPS...');
      
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
          .eq('ativa', true)
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
          toast.error('Erro ao carregar seções');
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
          toast.error('Erro inesperado ao carregar seções');
        }
      } else {
        toast.error('Erro inesperado ao carregar seções');
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
    
    const dataEscolhida = new Date(data);
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999); // Fim do dia atual
    
    return dataEscolhida <= hoje;
  }, []);

  // Validar valores de TPs (devem ser números positivos e seguir a regra: higienizado ≤ total)
  const validarTPs = useCallback((higienizado: number, total: number): { isValid: boolean; message?: string } => {
    // Verificar se são números válidos
    if (isNaN(higienizado) || isNaN(total)) {
      return { isValid: false, message: 'Todos os valores devem ser números válidos' };
    }

    // Verificar se são números positivos
    if (higienizado < 0 || total < 0) {
      return { isValid: false, message: 'Os valores não podem ser negativos' };
    }

    // Verificar se são números inteiros
    if (!Number.isInteger(higienizado) || !Number.isInteger(total)) {
      return { isValid: false, message: 'Os valores devem ser números inteiros' };
    }

    // Verificar a regra: higienizado ≤ total
    if (higienizado > total) {
      return { isValid: false, message: 'TPs higienizados não pode ser maior que TPs total' };
    }

    // Verificar se o total é maior que zero
    if (total <= 0) {
      return { isValid: false, message: 'Total de TPs deve ser maior que zero' };
    }

    return { isValid: true };
  }, []);

  // Verificar duplicatas
  const verificarDuplicatas = useCallback(async (secaoId: string, data: string, equipe: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando duplicatas para higienização de TPS:', { secaoId, data, equipe });
      
      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Buscar o equipe_id baseado no nome da equipe
      const { data: equipeData, error: equipeError } = await withRetry(async () => {
        return await supabase
          .from('equipes')
          .select('id')
          .eq('nome', equipe)
          .eq('secao_id', secaoId)
          .single();
      }, 3, 1000);

      if (equipeError || !equipeData) {
        console.error('❌ Erro ao buscar equipe:', equipeError);
        return false;
      }

      // Usar retry logic para verificar duplicatas
      const { data: duplicatas, error } = await withRetry(async () => {
        return await supabase
          .from('higienizacao_tps')
          .select('id')
          .eq('secao_id', secaoId)
          .eq('data', data)
          .eq('equipe_id', equipeData.id);
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao verificar duplicatas:', error);
        return false;
      }

      const temDuplicata = duplicatas && duplicatas.length > 0;
      console.log('✅ Verificação de duplicatas concluída:', temDuplicata ? 'Encontrada' : 'Não encontrada');
      
      return temDuplicata;
    } catch (error) {
      console.error('❌ Erro inesperado ao verificar duplicatas:', error);
      return false;
    }
  }, []);

  // Salvar higienização de TPS
  const salvarHigienizacaoTPS = useCallback(async (formData: HigienizacaoTPSFormData): Promise<boolean> => {
    try {
      setSaving(true);
      console.log('💾 Salvando higienização de TPS:', formData);

      // Validar dados antes de salvar
      if (!formData.secao_id || !formData.data || !formData.equipe) {
        toast.error('Todos os campos obrigatórios devem ser preenchidos');
        return false;
      }

      // Validar data
      if (!validarData(formData.data)) {
        toast.error('Data não pode ser futura');
        return false;
      }

      // Validar valores de TPs
      const validacaoTPs = validarTPs(formData.tp_higienizado, formData.tp_total);
      if (!validacaoTPs.isValid) {
        toast.error(validacaoTPs.message || 'Valores de TPs inválidos');
        return false;
      }

      // Verificar duplicatas
      const temDuplicata = await verificarDuplicatas(formData.secao_id, formData.data, formData.equipe);
      if (temDuplicata) {
        toast.error('Já existe um registro de higienização para esta equipe nesta data');
        return false;
      }

      // Verificar conectividade antes de fazer a requisição
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      // Obter o usuário atual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ Erro ao obter usuário:', userError);
        toast.error('Erro de autenticação. Faça login novamente.');
        return false;
      }

      // Buscar o equipe_id baseado no nome da equipe
      const { data: equipeData, error: equipeError } = await withRetry(async () => {
        return await supabase
          .from('equipes')
          .select('id')
          .eq('nome', formData.equipe)
          .eq('secao_id', formData.secao_id)
          .single();
      }, 3, 1000);

      if (equipeError || !equipeData) {
        console.error('❌ Erro ao buscar equipe:', equipeError);
        toast.error('Erro ao identificar a equipe selecionada');
        return false;
      }

      // Preparar dados para inserção
      const dadosInsercao = {
        secao_id: formData.secao_id,
        data: formData.data,
        equipe: formData.equipe,
        equipe_id: equipeData.id,
        tp_higienizado: formData.tp_higienizado,
        tp_total: formData.tp_total,
        usuario_id: user.id
      };

      console.log('📝 Dados preparados para inserção:', dadosInsercao);

      // Usar retry logic para inserir os dados
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('higienizacao_tps')
          .insert([dadosInsercao])
          .select();
      }, 3, 1000);

      if (error) {
        console.error('❌ Erro ao salvar higienização de TPS:', error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('duplicate key')) {
          toast.error('Já existe um registro para esta equipe nesta data');
        } else if (error.message.includes('Failed to fetch')) {
          toast.error('Erro de conexão. Verifique sua internet e tente novamente.');
        } else if (error.message.includes('timeout')) {
          toast.error('Tempo limite excedido. Tente novamente.');
        } else {
          toast.error('Erro ao salvar dados');
        }
        return false;
      }

      console.log('✅ Higienização de TPS salva com sucesso:', data);
      toast.success('Higienização de TPS registrada com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar higienização de TPS:', error);
      
      // Tratamento de erro mais específico
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_')) {
          toast.error('Problema de conexão. Verifique sua internet e tente novamente.');
        } else {
          toast.error('Erro inesperado ao salvar dados');
        }
      } else {
        toast.error('Erro inesperado ao salvar dados');
      }
      return false;
    } finally {
      setSaving(false);
    }
  }, [validarData, validarTPs, verificarDuplicatas]);

  // Carregar seções ao inicializar o hook
  useEffect(() => {
    fetchSecoes();
  }, [fetchSecoes]);

  return {
    // Estados
    secoes,
    equipes,
    loading,
    saving,
    
    // Funções
    fetchSecoes,
    fetchEquipesPorSecao,
    validarData,
    validarTPs,
    verificarDuplicatas,
    salvarHigienizacaoTPS
  };
}