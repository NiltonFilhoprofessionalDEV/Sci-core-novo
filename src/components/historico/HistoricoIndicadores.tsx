'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { NavbarTemas } from './NavbarTemas'
import { FiltrosHistorico } from './FiltrosHistorico'
import { VisualizacaoTema } from './VisualizacaoTema'
import { useHistoricoData, useContadoresTemas } from '@/hooks/useHistoricoData'
import { FileText } from 'lucide-react'

export interface FiltrosState {
  dataInicio: string
  dataFim: string
  equipeId: string
  mesAno: string
}

export interface TemaInfo {
  id: string
  nome: string
  tabela: string
  icone: string
  descricao: string
}

export const TEMAS_INDICADORES: TemaInfo[] = [
  {
    id: 'ocorrencias-aeronauticas',
    nome: 'Ocorrências Aeronáuticas',
    tabela: 'ocorrencias_aeronauticas',
    icone: 'Plane',
    descricao: 'Registro de eventos relacionados a aeronaves e operações aéreas'
  },
  {
    id: 'ocorrencias-nao-aeronauticas',
    nome: 'Ocorrências Não Aeronáuticas',
    tabela: 'ocorrencias_nao_aeronauticas',
    icone: 'AlertTriangle',
    descricao: 'Eventos e emergências não relacionados a aeronaves'
  },
  {
    id: 'taf',
    nome: 'TAF (Teste de Aptidão Física)',
    tabela: 'taf_resultados',
    icone: 'Activity',
    descricao: 'Resultados do Teste de Aptidão Física realizados pelas equipes'
  },
  {
    id: 'ptr-ba-prova-teorica',
    nome: 'PTR-BA - Prova Teórica',
    tabela: 'ptr_ba_provas_teoricas',
    icone: 'FileText',
    descricao: 'Registro de provas teóricas do programa de treinamento'
  },
  {
    id: 'ptr-ba-horas-treinamento',
    nome: 'PTR-BA - Horas de Treinamento',
    tabela: 'ptr_ba_horas_treinamento',
    icone: 'Clock',
    descricao: 'Controle de horas práticas de treinamento'
  },
  {
    id: 'inspecoes-viaturas',
    nome: 'Inspeções de Viaturas',
    tabela: 'inspecoes_viatura',
    icone: 'Truck',
    descricao: 'Verificações e manutenção preventiva de veículos'
  },
  {
    id: 'tempo-epr',
    nome: 'Tempo EPR',
    tabela: 'tempo_epr',
    icone: 'Timer',
    descricao: 'Controle de tempo de Equipamento de Proteção Respiratória'
  },
  {
    id: 'tempo-resposta',
    nome: 'Tempo Resposta',
    tabela: 'tempo_resposta',
    icone: 'Zap',
    descricao: 'Medição de tempos de resposta a emergências'
  },
  {
    id: 'controle-agentes-extintores',
    nome: 'Controle de Agentes Extintores',
    tabela: 'controle_agentes_extintores',
    icone: 'Shield',
    descricao: 'Gestão e controle de agentes químicos extintores'
  },
  {
    id: 'controle-trocas',
    nome: 'Controle de Trocas',
    tabela: 'controle_trocas',
    icone: 'RefreshCw',
    descricao: 'Gerenciamento de trocas de plantão e escalas'
  },
  {
    id: 'verificacao-tps',
    nome: "Verificação de TP's",
    tabela: 'verificacao_tps',
    icone: 'CheckCircle',
    descricao: 'Verificação de Equipamentos de Proteção Individual'
  },
  {
    id: 'higienizacao-tps',
    nome: "Higienização de TP's",
    tabela: 'higienizacao_tps',
    icone: 'Droplets',
    descricao: 'Limpeza e desinfecção de equipamentos de proteção'
  },
  {
    id: 'controle-uniformes-recebidos',
    nome: 'Controle de Uniformes Recebidos',
    tabela: 'controle_uniformes_recebidos',
    icone: 'Package',
    descricao: 'Gestão de recebimento e distribuição de uniformes'
  },
  {
    id: 'atividades-acessorias',
    nome: 'Atividades Acessórias',
    tabela: 'atividades_acessorias',
    icone: 'Clipboard',
    descricao: 'Registro de atividades complementares e administrativas'
  }
]

export function HistoricoIndicadores() {
  const { user } = useAuth()
  const [temaAtivo, setTemaAtivo] = useState<string>(TEMAS_INDICADORES[0].id)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const registrosPorPagina = 10
  const [filtros, setFiltros] = useState<FiltrosState>({
    dataInicio: '',
    dataFim: '',
    equipeId: '',
    mesAno: ''
  })

  const contentRef = useRef<HTMLDivElement>(null)

  // Hook para contadores dos temas
  const { contadores, buscarContadores } = useContadoresTemas()
  
  // Encontrar tema ativo
  const temaAtivoObj = TEMAS_INDICADORES.find(t => t.id === temaAtivo) || TEMAS_INDICADORES[0]
  
  // Hook para buscar dados com cache
  const { 
    dados, 
    loading, 
    error, 
    totalRegistros,
    refetch,
    excluirRegistro,
    editarRegistro
  } = useHistoricoData({
    tema: temaAtivoObj,
    filtros,
    paginaAtual,
    registrosPorPagina
  })

  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina))

  useEffect(() => {
    setPaginaAtual(1)
  }, [temaAtivo, filtros.dataInicio, filtros.dataFim, filtros.equipeId, filtros.mesAno])

  useEffect(() => {
    const maxPagina = Math.max(1, Math.ceil(totalRegistros / registrosPorPagina))
    if (paginaAtual > maxPagina) {
      setPaginaAtual(maxPagina)
    }
  }, [totalRegistros, paginaAtual, registrosPorPagina])

  const handlePaginaChange = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas || pagina === paginaAtual) return
    setPaginaAtual(pagina)
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
  
  // Efeito para buscar contadores quando os temas mudarem
  useEffect(() => {
    buscarContadores(TEMAS_INDICADORES)
  }, [buscarContadores])

  // Carregar tema ativo do localStorage
  useEffect(() => {
    const temasSalvo = localStorage.getItem('historico-tema-ativo')
    if (temasSalvo && TEMAS_INDICADORES.find(t => t.id === temasSalvo)) {
      setTemaAtivo(temasSalvo)
    }
  }, [])

  // Salvar tema ativo no localStorage
  useEffect(() => {
    localStorage.setItem('historico-tema-ativo', temaAtivo)
  }, [temaAtivo])

  // Mudar tema ativo
  const handleTemaChange = (temaId: string) => {
    setTemaAtivo(temaId)
  }

  // Aplicar filtros
  const handleFiltrosChange = (novosFiltros: FiltrosState) => {
    setFiltros(novosFiltros)
  }

  // Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      equipeId: '',
      mesAno: ''
    })
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-orange-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Histórico de Indicadores
          </h1>
        </div>
      </div>

      {/* Navbar de Temas */}
      <NavbarTemas
        temas={TEMAS_INDICADORES}
        temaAtivo={temaAtivo}
        onTemaChange={handleTemaChange}
        contadores={contadores}
      />

      {/* Filtros (Sempre Visíveis) */}
      <FiltrosHistorico
        filtros={filtros}
        onFiltrosChange={handleFiltrosChange}
        onLimparFiltros={limparFiltros}
      />

      {/* Conteúdo Principal */}
      <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex">
              <div className="ml-2 sm:ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Erro ao carregar dados
                </h3>
                <div className="mt-1 sm:mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visualização do Tema Ativo */}
        <VisualizacaoTema
          tema={temaAtivoObj}
          dados={dados}
          loading={loading}
          filtros={filtros}
          totalRegistros={totalRegistros}
          paginaAtual={paginaAtual}
          registrosPorPagina={registrosPorPagina}
          onPaginaChange={handlePaginaChange}
          onRefresh={refetch}
          onExcluir={excluirRegistro}
          onEditar={editarRegistro}
        />
      </div>
    </div>
  )
}