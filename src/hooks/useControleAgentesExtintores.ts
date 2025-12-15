import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ControleAgentesExtintoresData {
  id?: string;
  secao_id: string;
  equipe_id: string;
  usuario_id: string;
  data_referencia: string;
  nome_cidade: string;
  equipe: string;
  nome_completo: string;
  quantidade_estoque_po_quimico: number;
  quantidade_estoque_lge: number;
  quantidade_estoque_nitrogenio: number;
  quantidade_exigida_po_quimico: number;
  quantidade_exigida_lge: number;
  quantidade_exigida_nitrogenio: number;
  observacoes?: string | null;
}

export interface ControleFormData {
  base_id: string;
  equipe_id: string;
  data: string;
  funcionarios: FuncionarioControle[];
}

export interface FuncionarioControle {
  id: string;
  nome_completo: string;
  quantidade_estoque_po_quimico: number;
  quantidade_estoque_lge: number;
  quantidade_estoque_nitrogenio: number;
  quantidade_exigida_po_quimico: number;
  quantidade_exigida_lge: number;
  quantidade_exigida_nitrogenio: number;
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

export const useControleAgentesExtintores = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [secoes, setSecoes] = useState<Secao[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);


  // Verificar conectividade
  const checkConnection = async (): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('secoes')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  };

  // Buscar seções disponíveis
  const fetchSecoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 Buscando seções para controle de agentes extintores...');
      
      // Verificar conectividade
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade, codigo, estado')
        .eq('ativa', true)
        .order('cidade');

      if (error) {
        console.error('❌ Erro ao buscar seções:', error);
        toast.error('Erro ao carregar seções');
        return;
      }

      console.log('✅ Seções carregadas:', data?.length || 0);
      setSecoes(data || []);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar seções:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else {
          toast.error('Erro ao carregar seções');
        }
        setError(error.message);
      } else {
        toast.error('Erro inesperado ao carregar seções');
        setError('Erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar equipes por seção
  const fetchEquipesBySecao = useCallback(async (secaoId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('👥 Buscando equipes para seção:', secaoId);
      
      // Verificar conectividade
      const isConnected = await checkConnection();
      if (!isConnected) {
        throw new Error('Sem conexão com o servidor. Verifique sua conexão com a internet.');
      }

      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, nome_cidade, secao_id')
        .eq('secao_id', secaoId)
        .eq('ativa', true)
        .order('nome');

      if (error) {
        console.error('❌ Erro ao buscar equipes:', error);
        toast.error('Erro ao carregar equipes');
        return [];
      }

      console.log('✅ Equipes carregadas:', data?.length || 0);
      setEquipes(data || []);
      return data || [];
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar equipes:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Sem conexão')) {
          toast.error(error.message);
        } else {
          toast.error('Erro ao carregar equipes');
        }
        setError(error.message);
      } else {
        toast.error('Erro inesperado ao carregar equipes');
        setError('Erro inesperado');
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);



  // Validar dados do formulário
  const validarDados = (dados: ControleFormData): string[] => {
    const erros: string[] = [];

    if (!dados.base_id) {
      erros.push('Base é obrigatória');
    }

    if (!dados.equipe_id) {
      erros.push('Equipe é obrigatória');
    }

    if (!dados.data) {
      erros.push('Data é obrigatória');
    } else {
      const dataReferencia = new Date(`${dados.data}T00:00:00`);
      const hoje = new Date();
      hoje.setHours(23, 59, 59, 999); // Final do dia atual
      
      if (dataReferencia > hoje) {
        erros.push('Data não pode ser futura');
      }
    }

    if (!dados.funcionarios || dados.funcionarios.length === 0) {
      erros.push('Pelo menos um funcionário deve ser selecionado');
    }

    // Validar dados dos funcionários
    dados.funcionarios.forEach((funcionario, index) => {
      if (funcionario.quantidade_estoque_po_quimico < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade de estoque de pó químico não pode ser negativa`);
      }
      
      if (funcionario.quantidade_estoque_lge < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade de estoque de LGE não pode ser negativa`);
      }
      
      if (funcionario.quantidade_estoque_nitrogenio < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade de estoque de nitrogênio não pode ser negativa`);
      }
      
      if (funcionario.quantidade_exigida_po_quimico < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade exigida de pó químico não pode ser negativa`);
      }
      
      if (funcionario.quantidade_exigida_lge < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade exigida de LGE não pode ser negativa`);
      }
      
      if (funcionario.quantidade_exigida_nitrogenio < 0) {
        erros.push(`Funcionário ${index + 1}: Quantidade exigida de nitrogênio não pode ser negativa`);
      }
    });

    return erros;
  };

  // Verificar duplicatas
  const verificarDuplicatas = async (secaoId: string, equipeId: string, dataReferencia: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('controle_agentes_extintores')
        .select('id')
        .eq('secao_id', secaoId)
        .eq('equipe_id', equipeId)
        .eq('data_referencia', dataReferencia);

      if (error) throw error;

      return (data && data.length > 0);
    } catch (error) {
      console.error('❌ Erro ao verificar duplicatas:', error);
      return false;
    }
  };

  // Salvar dados de controle de agentes extintores
  const salvarControleAgentesExtintores = async (dados: ControleFormData): Promise<boolean> => {
    if (!user || !profile) {
      toast.error('Usuário não autenticado');
      return false;
    }

    setSaving(true);
    
    try {
      console.log('💾 Salvando controle de agentes extintores:', dados);

      // Validar dados
      const erros = validarDados(dados);
      if (erros.length > 0) {
        toast.error(`Erro de validação: ${erros[0]}`);
        return false;
      }

      // Verificar duplicatas
      const existeDuplicata = await verificarDuplicatas(dados.base_id, dados.equipe_id, dados.data);
      if (existeDuplicata) {
        toast.error('Já existe registro de controle de agentes extintores para esta equipe nesta data');
        return false;
      }

      const equipeSelecionada = equipes.find(eq => eq.id === dados.equipe_id)
      const secaoSelecionada = secoes.find(secao => secao.id === dados.base_id)

      const nomeCidade =
        equipeSelecionada?.nome_cidade ||
        secaoSelecionada?.cidade ||
        profile?.secao?.cidade ||
        ''

      const nomeEquipe =
        equipeSelecionada?.nome ||
        profile?.equipe?.nome ||
        ''

      if (!nomeCidade) {
        toast.error('Não foi possível identificar a cidade da base selecionada.')
        return false
      }

      if (!nomeEquipe) {
        toast.error('Não foi possível identificar o nome da equipe selecionada.')
        return false
      }

      // Preparar dados para inserção
      const registrosParaInserir: Omit<ControleAgentesExtintoresData, 'id'>[] = dados.funcionarios.map(funcionario => ({
        secao_id: dados.base_id,
        equipe_id: dados.equipe_id,
        usuario_id: user.id,
        data_referencia: dados.data,
        nome_cidade: nomeCidade,
        equipe: nomeEquipe,
        nome_completo: funcionario.nome_completo,
        quantidade_estoque_po_quimico: Math.round(Number(funcionario.quantidade_estoque_po_quimico)),
        quantidade_estoque_lge: Math.round(Number(funcionario.quantidade_estoque_lge)),
        quantidade_estoque_nitrogenio: Math.round(Number(funcionario.quantidade_estoque_nitrogenio)),
        quantidade_exigida_po_quimico: Math.round(Number(funcionario.quantidade_exigida_po_quimico)),
        quantidade_exigida_lge: Math.round(Number(funcionario.quantidade_exigida_lge)),
        quantidade_exigida_nitrogenio: Math.round(Number(funcionario.quantidade_exigida_nitrogenio)),
        observacoes: funcionario.observacoes || null
      }))

      console.log('📝 Dados preparados para inserção:', registrosParaInserir)

      const { data: insertData, error } = await supabase
        .from('controle_agentes_extintores')
        .insert(registrosParaInserir)
        .select('id')

      console.log('🔍 Supabase insert retorno:', { insertData, error })

      if (error) {
        console.error('❌ Supabase error (raw):', error)
        console.error('❌ Supabase error (JSON):', JSON.stringify(error, Object.getOwnPropertyNames(error)))
        console.error('❌ Supabase error (details):', {
          code: (error as any).code,
          message: (error as any).message,
          hint: (error as any).hint,
          details: (error as any).details
        })
        throw error
      }

      console.log('✅ Controle de agentes extintores salvo com sucesso');
      toast.success('Controle de agentes extintores salvo com sucesso!');
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado ao salvar:', error);
      toast.error('Erro inesperado ao salvar controle de agentes extintores');
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    // Estados
    loading,
    saving,
    error,
    secoes,
    equipes,
    
    // Funções
    fetchSecoes,
    fetchEquipesBySecao,
    salvarControleAgentesExtintores,
    validarDados
  };
};