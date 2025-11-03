'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, Users, ShirtIcon, Shield, FileText, Save, AlertCircle } from 'lucide-react';
import { useControleUniformesRecebidos, ControleUniformesFormData } from '@/hooks/useControleUniformesRecebidos';
import { useAuth } from '@/hooks/useAuth';

interface ModalControleUniformesRecebidosProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalControleUniformesRecebidos: React.FC<ModalControleUniformesRecebidosProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    loading,
    error,
    validationErrors,
    bases,
    equipes,
    funcionarios,
    funcionariosUniformes,
    equipesDisponiveis,
    cidadesDisponiveis,
    salvarRegistro,
    verificarDuplicata,
    calcularPorcentagens,
    limparErros,
    fetchBases,
    fetchEquipesByBase,
    fetchFuncionariosPorEquipe,
    atualizarFuncionarioUniforme,
    limparTabelaFuncionarios,
  } = useControleUniformesRecebidos();

  // Dados do usuário logado
  const { user } = useAuth();
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada';
  const secaoId = user?.profile?.secao?.id;

  const [formData, setFormData] = useState<ControleUniformesFormData>({
    nome_cidade: '',
    equipe: '',
    data: '',
    observacoes: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [duplicataWarning, setDuplicataWarning] = useState(false);

  // Carregar bases quando modal abrir
  useEffect(() => {
    if (isOpen) {
      fetchBases();
    }
  }, [isOpen, fetchBases]);

  // Resetar formulário quando modal abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        nome_cidade: secaoId || '',
        equipe: '',
        data: '',
        observacoes: '',
      });
      setShowSuccess(false);
      setDuplicataWarning(false);
      limparErros();
    }
  }, [isOpen, secaoId]);

  // Definir automaticamente a nome_cidade quando o modal abrir
  useEffect(() => {
    if (isOpen && secaoId && !formData.nome_cidade) {
      setFormData(prev => ({
        ...prev,
        nome_cidade: secaoId
      }));
    }
  }, [isOpen, secaoId, formData.nome_cidade]);

  // Verificar duplicatas quando dados relevantes mudarem
  useEffect(() => {
    const verificarDuplicataAsync = async () => {
      if (formData.data && formData.equipe && formData.nome_cidade) {
        const isDuplicata = await verificarDuplicata(formData.data, formData.equipe, formData.nome_cidade);
        setDuplicataWarning(isDuplicata);
      } else {
        setDuplicataWarning(false);
      }
    };

    verificarDuplicataAsync();
  }, [formData.data, formData.equipe, formData.nome_cidade]);

  // Carregar equipes quando base for selecionada
  useEffect(() => {
    console.log('🔍 Verificando carregamento de equipes:', {
      nome_cidade: formData.nome_cidade,
      bases: bases?.length,
      secaoId
    });
    
    if (formData.nome_cidade && bases && bases.length > 0) {
      // Se nome_cidade é um ID (secaoId), buscar diretamente por ID
      let baseSelecionada;
      
      if (formData.nome_cidade === secaoId) {
        // Buscar por ID
        baseSelecionada = bases.find(base => base.id === formData.nome_cidade);
        console.log('🎯 Buscando base por ID:', formData.nome_cidade, 'Encontrada:', baseSelecionada);
      } else {
        // Buscar por nome (caso seja um nome)
        baseSelecionada = bases.find(base => base.nome === formData.nome_cidade);
        console.log('🎯 Buscando base por nome:', formData.nome_cidade, 'Encontrada:', baseSelecionada);
      }
      
      if (baseSelecionada) {
        console.log('✅ Base encontrada, carregando equipes para:', baseSelecionada.id);
        fetchEquipesByBase(baseSelecionada.id);
      } else {
        console.log('❌ Base não encontrada. Bases disponíveis:', bases.map(b => ({ id: b.id, nome: b.nome })));
      }
    }
  }, [formData.nome_cidade, bases, secaoId, fetchEquipesByBase]);

  // Carregar funcionários quando equipe for selecionada
  useEffect(() => {
    if (formData.equipe && equipes.length > 0) {
      const equipeSelecionada = equipes.find(equipe => equipe.nome === formData.equipe);
      if (equipeSelecionada) {
        console.log('👤 Equipe selecionada, carregando funcionários para:', equipeSelecionada.id);
        fetchFuncionariosPorEquipe(equipeSelecionada.id);
      }
    } else {
      // Limpar funcionários quando não há equipe selecionada
      limparTabelaFuncionarios();
    }
  }, [formData.equipe, equipes.length]);

  const handleInputChange = (field: keyof ControleUniformesFormData, value: string | number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Se mudou a base, limpar a equipe selecionada
      if (field === 'nome_cidade') {
        newData.equipe = '';
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se há erros de validação ANTES de prosseguir
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const sucesso = await salvarRegistro(formData);
    
    if (sucesso) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    limparErros();
    onClose();
  };

  const getPercentageColor = (percentage: number): string => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseDate = (dateString: string): string => {
    if (!dateString) return '';
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) return dateString;
    // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[#7a5b3e]">
              Controle de Uniformes Recebidos
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mx-6 mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            <div className="flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Registro salvo com sucesso!
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Duplicata Warning */}
        {duplicataWarning && (
          <div className="mx-6 mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Já existe um registro para esta equipe nesta data e base.
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Primeira linha: Base e Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Base do Usuário */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Base *
              </label>
              <div className={`w-full px-3 py-2 border rounded-lg text-gray-900 ${
                validationErrors.nome_cidade ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
              </div>
              {validationErrors.nome_cidade && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.nome_cidade}</p>
              )}
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data *
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange('data', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 ${
                  validationErrors.data ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {validationErrors.data && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.data}</p>
              )}
            </div>
          </div>

          {/* Segunda linha: Equipe */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Equipe *
            </label>
            <select
              value={formData.equipe}
              onChange={(e) => handleInputChange('equipe', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 ${
                validationErrors.equipe ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={!formData.nome_cidade || equipes.length === 0}
            >
              <option value="">
                {!formData.nome_cidade 
                  ? 'Selecione uma base primeiro' 
                  : equipes.length === 0 
                    ? 'Carregando equipes...' 
                    : 'Selecione a equipe'
                }
              </option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.nome}>
                  {equipe.nome}
                </option>
              ))}
            </select>
            {validationErrors.equipe && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.equipe}</p>
            )}
          </div>



          {/* Tabela de Funcionários */}
          {formData.equipe && funcionarios.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Membros da Equipe ({funcionarios.length})
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-black">
                        Nome do Funcionário
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        EPI Entregue
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        EPI Previsto
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        Percentual EPI
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        Uniforme Entregue
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        Uniforme Previsto
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-black">
                        Percentual Uniforme
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {funcionarios.map((funcionario) => {
                      const dadosUniforme = funcionariosUniformes[funcionario.id] || {
                        epi_entregue: 0,
                        epi_previsto: 0,
                        uniforme_entregue: 0,
                        uniforme_previsto: 0,
                        percentual: 0
                      };

                      return (
                        <tr key={funcionario.id} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">
                            {funcionario.nome_completo}
                          </td>
                          <td className="border border-gray-300 px-2 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={dadosUniforme.epi_entregue}
                              onChange={(e) => atualizarFuncionarioUniforme(
                                funcionario.id,
                                'epi_entregue',
                                Number(e.target.value) || 0
                              )}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={dadosUniforme.epi_previsto}
                              onChange={(e) => atualizarFuncionarioUniforme(
                                funcionario.id,
                                'epi_previsto',
                                Number(e.target.value) || 0
                              )}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPercentageColor(dadosUniforme.percentual_epi || 0)}`}>
                              {(dadosUniforme.percentual_epi || 0).toFixed(1)}%
                            </span>
                          </td>
                          <td className="border border-gray-300 px-2 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={dadosUniforme.uniforme_entregue}
                              onChange={(e) => atualizarFuncionarioUniforme(
                                funcionario.id,
                                'uniforme_entregue',
                                Number(e.target.value) || 0
                              )}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-3 text-center">
                            <input
                              type="number"
                              min="0"
                              value={dadosUniforme.uniforme_previsto}
                              onChange={(e) => atualizarFuncionarioUniforme(
                                funcionario.id,
                                'uniforme_previsto',
                                Number(e.target.value) || 0
                              )}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPercentageColor(dadosUniforme.percentual_uniforme || 0)}`}>
                              {(dadosUniforme.percentual_uniforme || 0).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading de funcionários */}
          {formData.equipe && loading && funcionarios.length === 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Carregando funcionários...</span>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Observações
            </label>
            <textarea
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none text-gray-900 ${
                validationErrors.observacoes ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              maxLength={500}
              placeholder="Informações adicionais sobre a entrega (opcional)"
            />
            <div className="flex justify-between items-center mt-1">
              {validationErrors.observacoes && (
                <p className="text-sm text-red-600">{validationErrors.observacoes}</p>
              )}
              <p className="text-sm text-gray-900 ml-auto">
                {formData.observacoes.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || Object.keys(validationErrors).length > 0 || !secaoId}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};