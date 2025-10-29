import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export interface ControleUniformesRecebidos {
  id?: string;
  nome_cidade: string;
  nome_usuario: string;
  equipe: string;
  data: string;
  observacoes?: string;
  usuario_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ControleUniformesFormData {
  nome_cidade: string;
  equipe: string;
  data: string;
  observacoes: string;
}

export interface ValidationErrors {
  nome_cidade?: string;
  equipe?: string;
  data?: string;
  observacoes?: string;
}

export interface Base {
  id: string;
  nome: string;
  cidade: string;
  codigo: string;
  ativa: boolean;
}

export interface Equipe {
  id: string;
  nome: string;
  ativa: boolean;
  secao_id: string;
}

export interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
}

export interface FuncionarioUniforme {
  funcionario_id: string;
  nome_completo: string;
  epi_entregue: number;
  epi_previsto: number;
  uniforme_entregue: number;
  uniforme_previsto: number;
  percentual: number; // Mantido para compatibilidade
  percentual_epi: number;
  percentual_uniforme: number;
}

export const useControleUniformesRecebidos = () => {
  const { user } = useAuth();
  const [registros, setRegistros] = useState<ControleUniformesRecebidos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [bases, setBases] = useState<Base[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [funcionariosUniformes, setFuncionariosUniformes] = useState<Record<string, FuncionarioUniforme>>({});

  // Equipes pré-definidas conforme especificação
  const equipesDisponiveis = [
    'Equipe Alpha',
    'Equipe Beta',
    'Equipe Gamma',
    'Equipe Delta',
    'Equipe Epsilon'
  ];

  // Cidades/bases disponíveis (baseado no sistema existente)
  const cidadesDisponiveis = [
    'Brasília',
    'Goiânia',
    'Confins',
    'São Paulo',
    'Rio de Janeiro'
  ];

  // Buscar bases disponíveis
  const fetchBases = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome, cidade, codigo, ativa')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setBases(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar bases:', err);
      setError('Erro ao carregar bases');
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar equipes por base
  const fetchEquipesByBase = useCallback(async (baseId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, ativa, secao_id')
        .eq('secao_id', baseId)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setEquipes(data || []);
    } catch (err: any) {
      console.error('Erro ao buscar equipes:', err);
      setError('Erro ao carregar equipes');
      setEquipes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para calcular porcentagens automaticamente
  const calcularPorcentagens = useCallback((
    entregue: number,
    previsto: number
  ): number => {
    if (previsto === 0) return 0;
    return Math.round((entregue / previsto) * 100 * 100) / 100; // Arredonda para 2 casas decimais
  }, []);

  // Função para validar dados do formulário
  const validarDados = (dados: ControleUniformesFormData): ValidationErrors => {
    const erros: ValidationErrors = {};

    // Validar campos obrigatórios
    if (!dados.nome_cidade.trim()) {
      erros.nome_cidade = 'Base é obrigatória';
    }

    if (!dados.equipe.trim()) {
      erros.equipe = 'Equipe é obrigatória';
    }

    if (!dados.data.trim()) {
      erros.data = 'Data é obrigatória';
    } else {
      // Validar formato de data (YYYY-MM-DD)
      const dataRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dataRegex.test(dados.data)) {
        erros.data = 'Formato de data inválido';
      } else {
        // Validar se a data não é futura
        const dataInformada = new Date(dados.data);
        const hoje = new Date();
        hoje.setHours(23, 59, 59, 999); // Fim do dia atual
        
        if (dataInformada > hoje) {
          erros.data = 'Data não pode ser futura';
        }
      }
    }



    // Validar observações (opcional, mas se preenchido, não pode ser muito longo)
    if (dados.observacoes && dados.observacoes.length > 500) {
      erros.observacoes = 'Observações não podem exceder 500 caracteres';
    }

    return erros;
  };

  // Função para buscar registros existentes
  const buscarRegistros = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('controle_uniformes_recebidos')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setRegistros(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar registros';
      setError(errorMessage);
      console.error('Erro ao buscar registros de controle de uniformes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar novo registro
  const salvarRegistro = async (dados: ControleUniformesFormData): Promise<boolean> => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    // Validar dados antes de salvar
    const erros = validarDados(dados);
    setValidationErrors(erros);

    if (Object.keys(erros).length > 0) {
      setError('Por favor, corrija os erros no formulário');
      return false;
    }

    // Verificar se há funcionários selecionados
    if (funcionarios.length === 0) {
      setError('Nenhum funcionário encontrado para a equipe selecionada');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // Debug logs para investigar os valores
      console.log('🔍 Debug salvarRegistro:');
      console.log('dados.nome_cidade:', dados.nome_cidade);
      console.log('dados.equipe:', dados.equipe);
      console.log('bases disponíveis:', bases.map(b => ({ id: b.id, nome: b.nome })));
      console.log('equipes disponíveis:', equipes.map(e => ({ id: e.id, nome: e.nome })));

      // Validar se os arrays estão populados
      if (!bases || bases.length === 0) {
        throw new Error('Nenhuma base disponível. Verifique se as bases foram carregadas.');
      }

      if (!equipes || equipes.length === 0) {
        throw new Error('Nenhuma equipe disponível. Verifique se as equipes foram carregadas.');
      }

      // Buscar base - pode ser por ID ou por nome
      let baseSelecionada = bases.find(base => base.id === dados.nome_cidade);
      if (!baseSelecionada) {
        baseSelecionada = bases.find(base => base.nome === dados.nome_cidade);
      }

      // Buscar equipe por nome
      const equipeSelecionada = equipes.find(equipe => equipe.nome === dados.equipe);

      console.log('baseSelecionada encontrada:', baseSelecionada);
      console.log('equipeSelecionada encontrada:', equipeSelecionada);

      if (!baseSelecionada) {
        throw new Error(`Base não encontrada. Valor procurado: "${dados.nome_cidade}". Bases disponíveis: ${bases.map(b => b.nome).join(', ')}`);
      }

      if (!equipeSelecionada) {
        throw new Error(`Equipe não encontrada. Valor procurado: "${dados.equipe}". Equipes disponíveis: ${equipes.map(e => e.nome).join(', ')}`);
      }

      // Criar um registro para cada funcionário da equipe
      const registrosParaSalvar = funcionarios.map(funcionario => {
        const dadosFuncionario = funcionariosUniformes[funcionario.id] || {
          epi_entregue: 0,
          epi_previsto: 0,
          uniforme_entregue: 0,
          uniforme_previsto: 0
        };

        // Extrair apenas o nome da cidade da base selecionada
        const nomeCidade = baseSelecionada.cidade || baseSelecionada.nome.split(' - ')[1] || baseSelecionada.nome;

        return {
          secao_id: baseSelecionada.id,
          equipe_id: equipeSelecionada.id,
          funcionario_id: funcionario.id,
          nome_completo: funcionario.nome_completo,
          usuario_id: user.id,
          data_referencia: dados.data,
          nome_cidade: nomeCidade,
          nome_usuario: user.user_metadata?.name || user.email || 'Usuário',
          equipe: dados.equipe,
          data: dados.data,
          epi_entregue: dadosFuncionario.epi_entregue,
          epi_previsto: dadosFuncionario.epi_previsto,
          uniforme_entregue: dadosFuncionario.uniforme_entregue,
          uniforme_previsto: dadosFuncionario.uniforme_previsto,
          porcentagem_epi: calcularPercentualEPI(dadosFuncionario.epi_entregue, dadosFuncionario.epi_previsto),
          porcentagem_uniforme: calcularPercentualUniforme(dadosFuncionario.uniforme_entregue, dadosFuncionario.uniforme_previsto),
          observacoes: dados.observacoes || null
        };
      });

      const { data: registrosSalvos, error: supabaseError } = await supabase
        .from('controle_uniformes_recebidos')
        .insert(registrosParaSalvar)
        .select();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      // Atualizar lista local (convertendo para o formato esperado)
      const registrosConvertidos = registrosSalvos?.map(registro => ({
        id: registro.id,
        nome_cidade: registro.nome_cidade,
        nome_usuario: registro.nome_usuario,
        equipe: registro.equipe,
        data: registro.data,
        observacoes: registro.observacoes,
        usuario_id: registro.usuario_id,
        created_at: registro.created_at,
        updated_at: registro.updated_at
      })) || [];

      setRegistros(prev => [...registrosConvertidos, ...prev]);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar registro';
      setError(errorMessage);
      console.error('Erro ao salvar registro de controle de uniformes:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar duplicatas (mesmo dia, equipe e cidade)
  const verificarDuplicata = useCallback(async (
    data: string,
    equipe: string,
    cidade: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: registrosExistentes, error } = await supabase
        .from('controle_uniformes_recebidos')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('data', data)
        .eq('equipe', equipe)
        .eq('nome_cidade', cidade);

      if (error) {
        console.error('Erro ao verificar duplicatas:', error);
        return false;
      }

      return (registrosExistentes?.length || 0) > 0;
    } catch (err) {
      console.error('Erro ao verificar duplicatas:', err);
      return false;
    }
  }, [user]);

  // Função para limpar erros de validação
  const limparErros = () => {
    setError(null);
    setValidationErrors({});
  };

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

      if (error) throw error;
      
      setFuncionarios(data || []);
      
      // Inicializar dados da tabela de uniformes para cada funcionário
      const funcionariosUniformesIniciais: Record<string, FuncionarioUniforme> = {};
      (data || []).forEach(funcionario => {
        funcionariosUniformesIniciais[funcionario.id] = {
          funcionario_id: funcionario.id,
          nome_completo: funcionario.nome_completo,
          epi_entregue: 0,
          epi_previsto: 0,
          uniforme_entregue: 0,
          uniforme_previsto: 0,
          percentual: 0,
          percentual_epi: 0,
          percentual_uniforme: 0
        };
      });
      
      setFuncionariosUniformes(funcionariosUniformesIniciais);
      
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setError('Erro ao carregar funcionários');
      setFuncionarios([]);
      setFuncionariosUniformes({});
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para calcular percentual de um funcionário específico
  const calcularPercentualFuncionario = useCallback((funcionarioData: FuncionarioUniforme): number => {
    const totalEntregue = funcionarioData.epi_entregue + funcionarioData.uniforme_entregue;
    const totalPrevisto = funcionarioData.epi_previsto + funcionarioData.uniforme_previsto;
    
    if (totalPrevisto === 0) return 0;
    return Math.round((totalEntregue / totalPrevisto) * 100 * 100) / 100;
  }, []);

  // Função para calcular percentual de EPI
  const calcularPercentualEPI = useCallback((epi_entregue: number, epi_previsto: number): number => {
    if (epi_previsto === 0) return 0;
    return Math.round((epi_entregue / epi_previsto) * 100 * 100) / 100;
  }, []);

  // Função para calcular percentual de Uniforme
  const calcularPercentualUniforme = useCallback((uniforme_entregue: number, uniforme_previsto: number): number => {
    if (uniforme_previsto === 0) return 0;
    return Math.round((uniforme_entregue / uniforme_previsto) * 100 * 100) / 100;
  }, []);

  // Função para atualizar dados de um funcionário na tabela
  const atualizarFuncionarioUniforme = useCallback((funcionarioId: string, campo: keyof Omit<FuncionarioUniforme, 'funcionario_id' | 'nome_completo' | 'percentual' | 'percentual_epi' | 'percentual_uniforme'>, valor: number) => {
    setFuncionariosUniformes(prev => {
      const funcionarioAtual = prev[funcionarioId];
      if (funcionarioAtual) {
        const funcionarioAtualizado = { ...funcionarioAtual, [campo]: valor };
        funcionarioAtualizado.percentual = calcularPercentualFuncionario(funcionarioAtualizado);
        funcionarioAtualizado.percentual_epi = calcularPercentualEPI(funcionarioAtualizado.epi_entregue, funcionarioAtualizado.epi_previsto);
        funcionarioAtualizado.percentual_uniforme = calcularPercentualUniforme(funcionarioAtualizado.uniforme_entregue, funcionarioAtualizado.uniforme_previsto);
        return { ...prev, [funcionarioId]: funcionarioAtualizado };
      }
      return prev;
    });
  }, [calcularPercentualFuncionario, calcularPercentualEPI, calcularPercentualUniforme]);

  // Função para limpar dados da tabela de funcionários
  const limparTabelaFuncionarios = useCallback(() => {
    setFuncionarios([]);
    setFuncionariosUniformes({});
  }, []);

  // Carregar registros quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      buscarRegistros();
    }
  }, [user]);

  return {
    // Estados
    registros,
    loading,
    error,
    validationErrors,
    bases,
    equipes,
    funcionarios,
    funcionariosUniformes,
    
    // Dados estáticos (mantidos para compatibilidade)
    equipesDisponiveis,
    cidadesDisponiveis,
    
    // Funções
    buscarRegistros,
    salvarRegistro,
    verificarDuplicata,
    validarDados,
    calcularPorcentagens,
    limparErros,
    fetchBases,
    fetchEquipesByBase,
    fetchFuncionariosPorEquipe,
    atualizarFuncionarioUniforme,
    limparTabelaFuncionarios,
  };
};