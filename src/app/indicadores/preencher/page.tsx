'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { usePermissions } from '@/hooks/usePermissions'
import { Modal } from '@/components/ui/Modal'
import { OcorrenciaAeronauticaForm } from '@/components/forms/OcorrenciaAeronauticaForm'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { 
  Plane, 
  AlertTriangle, 
  Wrench, 
  Cloud, 
  GraduationCap, 
  Clock, 
  Truck, 
  Timer, 
  Zap, 
  Droplets, 
  RefreshCw, 
  CheckCircle, 
  Sparkles, 
  Package,
  ArrowLeft,
  ChevronRight,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Tema {
  id: string
  nome: string
  descricao: string
  icon: any
  color: string
  bgColor: string
  borderColor: string
}

export default function PreencherIndicadoresPage() {
  const { canFillIndicators } = usePermissions()
  const [selectedTema, setSelectedTema] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalTema, setModalTema] = useState<Tema | null>(null)

  const temas: Tema[] = [
    {
      id: 'ocorrencias-aeronauticas',
      nome: 'Ocorrências Aeronáuticas',
      descricao: 'Registro de eventos relacionados a aeronaves e operações aéreas',
      icon: Plane,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'ocorrencia-nao-aeronautica',
      nome: 'Ocorrência Não Aeronáutica',
      descricao: 'Eventos e emergências não relacionados a aeronaves',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      id: 'atividades-acessorias',
      nome: 'Atividades Acessórias',
      descricao: 'Atividades complementares e de apoio às operações',
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 'taf',
      nome: 'TAF',
      descricao: 'Terminal Aerodrome Forecast - Previsão meteorológica',
      icon: Cloud,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200'
    },
    {
      id: 'ptr-ba-prova-teorica',
      nome: 'PTR-BA - Prova Teórica',
      descricao: 'Registro de provas teóricas do programa de treinamento',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      id: 'ptr-ba-horas-treinamento',
      nome: 'PTR-BA - Horas de Treinamento',
      descricao: 'Controle de horas práticas de treinamento',
      icon: Clock,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      id: 'inspecoes-viaturas',
      nome: 'Inspeções de Viaturas',
      descricao: 'Verificações e manutenção preventiva de veículos',
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 'tempo-epr',
      nome: 'Tempo EPR',
      descricao: 'Controle de tempo de Equipamento de Proteção Respiratória',
      icon: Timer,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      id: 'tempo-resposta',
      nome: 'Tempo Resposta',
      descricao: 'Medição de tempos de resposta a emergências',
      icon: Zap,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      id: 'controle-agentes-extintores',
      nome: 'Controle de Agentes Extintores',
      descricao: 'Gestão e controle de agentes químicos extintores',
      icon: Droplets,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    {
      id: 'controle-trocas',
      nome: 'Controle de Trocas',
      descricao: 'Gerenciamento de trocas de plantão e escalas',
      icon: RefreshCw,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      id: 'verificacao-tps',
      nome: 'Verificação de TPS',
      descricao: 'Verificação de Equipamentos de Proteção Individual',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      id: 'higienizacao-tps',
      nome: 'Higienização de TPS',
      descricao: 'Limpeza e desinfecção de equipamentos de proteção',
      icon: Sparkles,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      id: 'controle-uniformes-recebidos',
      nome: 'Controle de Uniformes Recebidos',
      descricao: 'Gestão de recebimento e distribuição de uniformes',
      icon: Package,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    }
  ]

  const handleTemaClick = (temaId: string) => {
    setSelectedTema(selectedTema === temaId ? null : temaId)
  }

  const handlePreencherClick = (tema: Tema) => {
    setModalTema(tema)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalTema(null)
  }

  const handleFormSuccess = () => {
    setIsModalOpen(false)
    setModalTema(null)
    // Aqui você pode adicionar uma notificação de sucesso se desejar
  }

  if (!canFillIndicators) {
    return (
      <AuthenticatedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-[#fa4b00] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#1f1f1f] mb-2">Acesso Restrito</h2>
              <p className="text-[#7a5b3e]/70">Você não tem permissão para preencher indicadores.</p>
            </div>
          </div>
        </DashboardLayout>
      </AuthenticatedRoute>
    )
  }

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/indicadores"
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-[#1f1f1f]" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-[#1f1f1f]">Preencher Indicadores</h1>
                  <p className="text-[#7a5b3e]/70 text-sm">Selecione um tema para registrar informações</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#fa4b00]" />
                <span className="text-sm text-[#1f1f1f] font-medium">{temas.length} temas disponíveis</span>
              </div>
            </div>
          </div>

          {/* Informações de Uso */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-[#fa4b00]/20 rounded-full">
                <CheckCircle className="w-4 h-4 text-[#fa4b00]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#1f1f1f] mb-1">Como usar esta página</h3>
                <p className="text-sm text-[#7a5b3e]/70">
                  Clique em qualquer tema abaixo para acessar o formulário de preenchimento específico.
                </p>
              </div>
            </div>
          </div>

          {/* Grid Unificado de Temas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {temas.map((tema) => {
              const IconComponent = tema.icon
              const isSelected = selectedTema === tema.id
              
              return (
                <div
                  key={tema.id}
                  onClick={() => handleTemaClick(tema.id)}
                  className={`
                    relative cursor-pointer group transition-all duration-200 
                    ${isSelected 
                      ? 'bg-white/30 backdrop-blur-lg border-2 border-[#fa4b00] shadow-lg scale-105' 
                      : 'bg-white/20 backdrop-blur-lg border border-white/30 hover:shadow-md hover:scale-102 hover:bg-white/25'
                    }
                    rounded-lg p-4
                  `}
                >
                  {/* Indicador de Seleção */}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#fa4b00] rounded-full flex items-center justify-center shadow-sm">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Conteúdo do Card */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#fa4b00]/20' : 'bg-white/20'} backdrop-blur-sm`}>
                        <IconComponent className={`w-6 h-6 ${isSelected ? 'text-[#fa4b00]' : tema.color}`} />
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'rotate-90 text-[#fa4b00]' : 'group-hover:translate-x-1 text-[#7a5b3e]/50'}`} />
                    </div>

                    <div>
                      <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-[#1f1f1f]' : 'text-[#1f1f1f]'}`}>
                        {tema.nome}
                      </h3>
                      <p className="text-xs text-[#7a5b3e]/70 leading-relaxed">
                        {tema.descricao}
                      </p>
                    </div>

                    {/* Status/Ação */}
                    <div className="pt-2 border-t border-white/20">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#7a5b3e]/60">
                          {isSelected ? 'Selecionado' : 'Clique para selecionar'}
                        </span>
                        {isSelected && (
                          <Button
                            size="sm"
                            className="text-xs px-3 py-1 bg-[#fa4b00] hover:bg-[#e63d00] text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreencherClick(tema)
                            }}
                          >
                            Preencher
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rodapé com Estatísticas */}
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-[#1f1f1f]">{temas.length}</div>
                <div className="text-sm text-[#7a5b3e]/70">Temas Disponíveis</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#fa4b00]">1</div>
                <div className="text-sm text-[#7a5b3e]/70">Layout Unificado</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-[#7a5b3e]/70">Preenchidos Hoje</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">0</div>
                <div className="text-sm text-[#7a5b3e]/70">Pendentes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={modalTema ? modalTema.nome : ''}
        >
          {modalTema && modalTema.id === 'ocorrencias-aeronauticas' && (
            <OcorrenciaAeronauticaForm
              onSuccess={handleFormSuccess}
              onCancel={handleCloseModal}
            />
          )}
          {modalTema && modalTema.id !== 'ocorrencias-aeronauticas' && (
            <div className="p-6 text-center text-gray-500">
              <p>Formulário para {modalTema.nome} em desenvolvimento...</p>
            </div>
          )}
        </Modal>
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}