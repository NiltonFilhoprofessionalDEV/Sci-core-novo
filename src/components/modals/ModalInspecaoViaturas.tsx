'use client';

import React, { useState, useEffect } from 'react';
import { X, Car, Calendar, MapPin, Users, Hash, FileText } from 'lucide-react';
import { useInspecaoViaturas } from '@/hooks/useInspecaoViaturas';
import { useAuth } from '@/hooks/useAuth';

interface ModalInspecaoViaturasProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  base_id: string;
  data: string;
  equipe_id: string;
  quantidade_de_inspecoes: number;
  quantidade_itens_nao_conforme: number;
  observacoes: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const ModalInspecaoViaturas: React.FC<ModalInspecaoViaturasProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth()
  const nomeBase = user?.profile?.secao?.nome || 'Base não identificada'
  const secaoId = user?.profile?.secao?.id

  const {
    equipes,
    loading,
    loadingEquipes,
    buscarEquipesPorBase,
    salvarInspecaoViaturas,
  } = useInspecaoViaturas();

  const [formData, setFormData] = useState<FormData>({
    base_id: '',
    data: '',
    equipe_id: '',
    quantidade_de_inspecoes: 0,
    quantidade_itens_nao_conforme: 0,
    observacoes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Resetar formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      setFormData({
        base_id: secaoId || '',
        data: '',
        equipe_id: '',
        quantidade_de_inspecoes: 0,
        quantidade_itens_nao_conforme: 0,
        observacoes: '',
      });
      setErrors({});
      setSubmitMessage(null);
    }
  }, [isOpen, secaoId]);

  // Definir base automaticamente quando o modal abrir
  useEffect(() => {
    if (isOpen && secaoId && !formData.base_id) {
      setFormData(prev => ({ ...prev, base_id: secaoId }))
    }
  }, [isOpen, secaoId, formData.base_id]);

  // Buscar equipes quando a base mudar
  useEffect(() => {
    if (formData.base_id) {
      buscarEquipesPorBase(formData.base_id);
      // Resetar equipe selecionada quando mudar a base
      setFormData(prev => ({ ...prev, equipe_id: '' }));
    }
  }, [formData.base_id, buscarEquipesPorBase]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantidade_de_inspecoes' ? parseInt(value) || 0 : value,
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.base_id && !secaoId) {
      newErrors.base_id = 'Usuário deve ter uma base associada';
    }

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.equipe_id) {
      newErrors.equipe_id = 'Equipe é obrigatória';
    }

    if (!formData.quantidade_de_inspecoes || formData.quantidade_de_inspecoes < 0) {
      newErrors.quantidade_de_inspecoes = 'Quantidade deve ser um número positivo';
    }

    if (formData.quantidade_itens_nao_conforme < 0) {
      newErrors.quantidade_itens_nao_conforme = 'Quantidade deve ser um número positivo ou zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await salvarInspecaoViaturas(formData);

      if (result.success) {
        setSubmitMessage({
          type: 'success',
          text: result.message,
        });

        // Fechar modal após 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setSubmitMessage({
          type: 'error',
          text: result.message,
        });
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        text: 'Erro inesperado ao salvar dados',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Car className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Inspeção de Viaturas
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Base */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Base *
            </label>
            <div className={`w-full px-3 py-2 border rounded-lg bg-gray-50 text-gray-700 ${
              !secaoId ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-300'
            }`}>
              {secaoId ? nomeBase : 'Usuário deve ter uma base associada'}
            </div>
            {!secaoId && (
              <p className="text-red-500 text-sm mt-1">Usuário deve ter uma base associada</p>
            )}
          </div>

          {/* Data */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Data *
            </label>
            <input
              type="date"
              name="data"
              value={formData.data}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 text-black ${
                errors.data ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.data && (
              <p className="text-red-500 text-sm mt-1">{errors.data}</p>
            )}
          </div>

          {/* Equipe */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              Equipe *
            </label>
            <select
              name="equipe_id"
              value={formData.equipe_id}
              onChange={handleInputChange}
              disabled={isSubmitting || !formData.base_id || loadingEquipes}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 text-black ${
                errors.equipe_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">
                {loadingEquipes
                  ? 'Carregando equipes...'
                  : !formData.base_id
                  ? 'Selecione uma base primeiro'
                  : 'Selecione uma equipe'}
              </option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.nome}
                </option>
              ))}
            </select>
            {errors.equipe_id && (
              <p className="text-red-500 text-sm mt-1">{errors.equipe_id}</p>
            )}
          </div>

          {/* Quantidade de Inspeções */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              Quantidade checklist realizado no mês *
            </label>
            <input
              type="number"
              name="quantidade_de_inspecoes"
              value={formData.quantidade_de_inspecoes}
              onChange={handleInputChange}
              disabled={isSubmitting}
              min="0"
              placeholder="Digite a quantidade de checklists"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 text-black ${
                errors.quantidade_de_inspecoes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantidade_de_inspecoes && (
              <p className="text-red-500 text-sm mt-1">{errors.quantidade_de_inspecoes}</p>
            )}
          </div>

          {/* Quantidade de Itens Não Conforme */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Hash className="w-4 h-4" />
              Quantidade de itens não conforme
            </label>
            <input
              type="number"
              name="quantidade_itens_nao_conforme"
              value={formData.quantidade_itens_nao_conforme}
              onChange={handleInputChange}
              disabled={isSubmitting}
              min="0"
              placeholder="Digite a quantidade de itens não conforme"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 text-black ${
                errors.quantidade_itens_nao_conforme ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.quantidade_itens_nao_conforme && (
              <p className="text-red-500 text-sm mt-1">{errors.quantidade_itens_nao_conforme}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={3}
              placeholder="Observações adicionais (opcional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 resize-none text-black"
            />
          </div>

          {/* Mensagem de feedback */}
          {submitMessage && (
            <div
              className={`p-3 rounded-lg text-sm ${
                submitMessage.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              {submitMessage.text}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || loading || !secaoId}
              className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalInspecaoViaturas;