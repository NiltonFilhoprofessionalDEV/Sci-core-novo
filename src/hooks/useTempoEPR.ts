import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
}

interface Base {
  id: string;
  nome: string;
}

interface Equipe {
  id: string;
  nome: string;
  secao_id: string;
  nome_cidade: string;
}

interface TempoEPRData {
  secao_id: string;
  equipe_id: string;
  usuario_id: string;
  data_referencia: string;
  nome_cidade: string;
  data_exercicio_epr: string;
  nome_completo: string;
  tempo_epr: string;
  status: string;
  equipe: string;
}

export const useTempoEPR = () => {
  const [bases, setBases] = useState<Base[]>([]);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [temposEPR, setTemposEPR] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estados do formulário
  const [baseSelecionada, setBaseSelecionada] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [equipeSelecionada, setEquipeSelecionada] = useState('');
  const [etapaAtual, setEtapaAtual] = useState<'selecao' | 'tabela'>('selecao');

  // Buscar bases disponíveis
  const buscarBases = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('secoes')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setBases(data || []);
    } catch (error) {
      console.error('Erro ao buscar bases:', error);
      setErrors(prev => ({ ...prev, bases: 'Erro ao carregar bases' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar equipes por base
  const buscarEquipesPorBase = async (baseId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome, secao_id, nome_cidade')
        .eq('secao_id', baseId)
        .order('nome');

      if (error) throw error;
      setEquipes(data || []);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      setErrors(prev => ({ ...prev, equipes: 'Erro ao carregar equipes' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar funcionários por equipe
  const buscarFuncionariosPorEquipe = async (equipeId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome_completo, equipe_id')
        .eq('equipe_id', equipeId)
        .order('nome_completo');

      if (error) throw error;
      setFuncionarios(data || []);
      
      // Inicializar tempos EPR vazios para cada funcionário
      const temposIniciais: Record<string, string> = {};
      (data || []).forEach(funcionario => {
        temposIniciais[funcionario.id] = '';
      });
      setTemposEPR(temposIniciais);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      setErrors(prev => ({ ...prev, funcionarios: 'Erro ao carregar funcionários' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Calcular status baseado no tempo
  const calcularStatus = (tempo: string): string => {
    if (!tempo || !tempo.includes(':')) return '';
    
    const [minutos, segundos] = tempo.split(':').map(Number);
    const totalSegundos = (minutos * 60) + segundos;
    
    if (totalSegundos <= 50) return 'Ideal';
    if (totalSegundos <= 60) return 'Tolerável';
    return 'Reprovado';
  };

  // Validar formato de tempo MM:SS
  const validarFormatoTempo = (tempo: string): boolean => {
    const regex = /^[0-5][0-9]:[0-9][0-9]$/;
    return regex.test(tempo);
  };

  // Validar data (não pode ser futura)
  const validarData = (data: string): boolean => {
    const hoje = new Date();
    const dataInformada = new Date(data);
    return dataInformada <= hoje;
  };

  // Verificar duplicatas
  const verificarDuplicatas = async (equipeId: string, data: string): Promise<boolean> => {
    try {
      const { data: registros, error } = await supabase
        .from('tempo_epr')
        .select('id')
        .eq('equipe_id', equipeId)
        .eq('data_exercicio_epr', data);

      if (error) throw error;
      return (registros || []).length > 0;
    } catch (error) {
      console.error('Erro ao verificar duplicatas:', error);
      return false;
    }
  };

  // Validar formulário
  const validarFormulario = async (): Promise<boolean> => {
    const novosErros: Record<string, string> = {};

    if (!baseSelecionada) {
      novosErros.base = 'Base é obrigatória';
    }

    if (!dataSelecionada) {
      novosErros.data = 'Data é obrigatória';
    } else if (!validarData(dataSelecionada)) {
      novosErros.data = 'Data não pode ser futura';
    }

    if (!equipeSelecionada) {
      novosErros.equipe = 'Equipe é obrigatória';
    }

    // Verificar duplicatas se todos os campos estão preenchidos
    if (equipeSelecionada && dataSelecionada && !novosErros.data) {
      const temDuplicata = await verificarDuplicatas(equipeSelecionada, dataSelecionada);
      if (temDuplicata) {
        novosErros.duplicata = 'Já existem registros para esta equipe nesta data';
      }
    }

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Validar tempos EPR
  const validarTemposEPR = (): boolean => {
    const novosErros: Record<string, string> = {};

    Object.entries(temposEPR).forEach(([funcionarioId, tempo]) => {
      if (!tempo) {
        novosErros[`tempo_${funcionarioId}`] = 'Tempo é obrigatório';
      } else if (!validarFormatoTempo(tempo)) {
        novosErros[`tempo_${funcionarioId}`] = 'Formato inválido (MM:SS)';
      }
    });

    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Salvar dados no Supabase
  const salvarTemposEPR = async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Validar tempos antes de salvar
      if (!validarTemposEPR()) {
        return false;
      }

      // Buscar informações da equipe selecionada
      const equipe = equipes.find(e => e.id === equipeSelecionada);
      if (!equipe) {
        setErrors(prev => ({ ...prev, geral: 'Equipe não encontrada' }));
        return false;
      }

      // Obter usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setErrors(prev => ({ ...prev, geral: 'Usuário não autenticado' }));
        return false;
      }

      // Preparar dados para inserção
      const dadosParaInserir: TempoEPRData[] = funcionarios.map(funcionario => {
        const tempo = temposEPR[funcionario.id];
        return {
          secao_id: baseSelecionada,
          equipe_id: equipeSelecionada,
          usuario_id: user.id,
          data_referencia: dataSelecionada,
          nome_cidade: equipe.nome_cidade,
          data_exercicio_epr: dataSelecionada,
          nome_completo: funcionario.nome_completo,
          tempo_epr: tempo,
          status: calcularStatus(tempo),
          equipe: equipe.nome
        };
      });

      // Inserir no Supabase
      const { error } = await supabase
        .from('tempo_epr')
        .insert(dadosParaInserir);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Erro ao salvar tempos EPR:', error);
      setErrors(prev => ({ ...prev, geral: 'Erro ao salvar dados' }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Resetar formulário
  const resetarFormulario = () => {
    setBaseSelecionada('');
    setDataSelecionada('');
    setEquipeSelecionada('');
    setEquipes([]);
    setFuncionarios([]);
    setTemposEPR({});
    setEtapaAtual('selecao');
    setErrors({});
  };

  // Atualizar tempo de um funcionário
  const atualizarTempo = (funcionarioId: string, tempo: string) => {
    setTemposEPR(prev => ({
      ...prev,
      [funcionarioId]: tempo
    }));
    
    // Limpar erro específico se existir
    if (errors[`tempo_${funcionarioId}`]) {
      setErrors(prev => {
        const novosErros = { ...prev };
        delete novosErros[`tempo_${funcionarioId}`];
        return novosErros;
      });
    }
  };

  // Prosseguir para tabela
  const prosseguirParaTabela = async () => {
    const valido = await validarFormulario();
    if (valido) {
      await buscarFuncionariosPorEquipe(equipeSelecionada);
      setEtapaAtual('tabela');
    }
  };

  // Voltar para seleção
  const voltarParaSelecao = () => {
    setEtapaAtual('selecao');
    setFuncionarios([]);
    setTemposEPR({});
  };

  // Carregar bases ao inicializar
  useEffect(() => {
    buscarBases();
  }, []);

  // Buscar equipes quando base for selecionada
  useEffect(() => {
    if (baseSelecionada) {
      buscarEquipesPorBase(baseSelecionada);
      setEquipeSelecionada(''); // Reset equipe quando base muda
    } else {
      setEquipes([]);
      setEquipeSelecionada('');
    }
  }, [baseSelecionada]);

  return {
    // Estados
    bases,
    equipes,
    funcionarios,
    temposEPR,
    isLoading,
    errors,
    baseSelecionada,
    dataSelecionada,
    equipeSelecionada,
    etapaAtual,

    // Setters
    setBaseSelecionada,
    setDataSelecionada,
    setEquipeSelecionada,

    // Funções
    calcularStatus,
    validarFormulario,
    validarTemposEPR,
    salvarTemposEPR,
    resetarFormulario,
    atualizarTempo,
    prosseguirParaTabela,
    voltarParaSelecao,
    validarFormatoTempo
  };
};