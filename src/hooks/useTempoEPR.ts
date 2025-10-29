import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Funcionario {
  id: string;
  nome_completo: string;
  equipe_id: string;
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
    
    if (totalSegundos <= 50) return 'Ideal';        // Até 00:50
    if (totalSegundos <= 60) return 'Tolerável';    // De 00:51 até 01:00
    return 'Reprovado';                              // Acima de 01:00
  };

  // Validar formato de tempo (MM:SS)
  const validarFormatoTempo = (tempo: string): boolean => {
    const regex = /^([0-5]?[0-9]):([0-5][0-9])$/;
    return regex.test(tempo);
  };

  // Atualizar tempo de um funcionário
  const atualizarTempo = (funcionarioId: string, tempo: string) => {
    setTemposEPR(prev => ({
      ...prev,
      [funcionarioId]: tempo
    }));
  };

  // Validar formulário de seleção
  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    if (!dataSelecionada) {
      novosErros.data = 'Data é obrigatória';
    }
    
    if (!equipeSelecionada) {
      novosErros.equipe = 'Equipe é obrigatória';
    }
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Validar tempos EPR
  const validarTemposEPR = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    funcionarios.forEach(funcionario => {
      const tempo = temposEPR[funcionario.id];
      if (!tempo) {
        novosErros[funcionario.id] = 'Tempo é obrigatório';
      } else if (!validarFormatoTempo(tempo)) {
        novosErros[funcionario.id] = 'Formato inválido (MM:SS)';
      }
    });
    
    setErrors(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // Prosseguir para tabela de tempos
  const prosseguirParaTabela = async (): Promise<boolean> => {
    if (!validarFormulario()) return false;
    
    await buscarFuncionariosPorEquipe(equipeSelecionada);
    setEtapaAtual('tabela');
    return true;
  };

  // Voltar para seleção
  const voltarParaSelecao = () => {
    setEtapaAtual('selecao');
    setFuncionarios([]);
    setTemposEPR({});
    setErrors({});
  };

  // Resetar formulário
  const resetarFormulario = () => {
    setBaseSelecionada('');
    setDataSelecionada('');
    setEquipeSelecionada('');
    setFuncionarios([]);
    setTemposEPR({});
    setErrors({});
    setEtapaAtual('selecao');
  };

  // Salvar tempos EPR
  const salvarTemposEPR = async (secaoId: string): Promise<boolean> => {
    if (!validarTemposEPR()) return false;
    
    try {
      setIsLoading(true);
      
      // Obter dados do usuário logado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar dados da equipe selecionada
      const equipe = equipes.find(e => e.id === equipeSelecionada);
      if (!equipe) {
        throw new Error('Equipe não encontrada');
      }
      
      // Preparar dados para inserção
      const dadosParaInserir: TempoEPRData[] = funcionarios.map(funcionario => ({
        secao_id: secaoId,
        equipe_id: equipeSelecionada,
        usuario_id: user.id,
        data_referencia: dataSelecionada,
        nome_cidade: equipe.nome_cidade,
        data_exercicio_epr: dataSelecionada,
        nome_completo: funcionario.nome_completo,
        tempo_epr: temposEPR[funcionario.id],
        status: calcularStatus(temposEPR[funcionario.id]),
        equipe: equipe.nome
      }));
      
      // Verificar duplicatas
      const { data: existingData, error: checkError } = await supabase
        .from('tempo_epr')
        .select('id')
        .eq('secao_id', secaoId)
        .eq('equipe_id', equipeSelecionada)
        .eq('data_exercicio_epr', dataSelecionada);
      
      if (checkError) throw checkError;
      
      if (existingData && existingData.length > 0) {
        throw new Error('Já existem registros para esta equipe nesta data');
      }
      
      // Inserir dados
      const { error: insertError } = await supabase
        .from('tempo_epr')
        .insert(dadosParaInserir);
      
      if (insertError) throw insertError;
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar tempos EPR:', error);
      setErrors(prev => ({ 
        ...prev, 
        geral: error instanceof Error ? error.message : 'Erro ao salvar dados' 
      }));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estados
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
    buscarEquipesPorBase,
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