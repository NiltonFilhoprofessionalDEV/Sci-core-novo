'use client'

import { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  User, 
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  Save,
  X,
  Plane,
  AlertTriangle,
  Cloud,
  Truck,
  Timer,
  Zap,
  Shield,
  RefreshCw,
  Droplets,
  Package,
  Clipboard
} from 'lucide-react'
import { FiltrosState, TemaInfo } from './HistoricoIndicadores'

// Mapeamento de ícones Lucide React
const lucideIcons = {
  Plane,
  AlertTriangle,
  Cloud,
  FileText,
  Clock,
  Truck,
  Timer,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle,
  Droplets,
  Package,
  Clipboard
}

interface VisualizacaoTemaProps {
  tema: TemaInfo
  filtros: FiltrosState
  dados: any[]
  loading: boolean
  error?: string | null
  totalRegistros?: number
  paginaAtual?: number
  onPaginaChange?: (pagina: number) => void
  onRefresh?: () => void
  onExcluir: (id: string) => Promise<boolean>
  onEditar: (id: string, dados: any) => Promise<boolean>
  registrosPorPagina?: number
}

export function VisualizacaoTema({
  tema,
  filtros,
  dados,
  loading,
  error = null,
  totalRegistros = 0,
  paginaAtual = 1,
  onPaginaChange,
  onRefresh,
  onExcluir,
  onEditar,
  registrosPorPagina = 10
}: VisualizacaoTemaProps) {
  const [registroSelecionado, setRegistroSelecionado] = useState<any>(null)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalEdicao, setModalEdicao] = useState(false)
  const [registroEditando, setRegistroEditando] = useState<any>(null)
  const [dadosEdicao, setDadosEdicao] = useState<any>({})
  const [menuAberto, setMenuAberto] = useState<string | null>(null)
  const [modalExportacao, setModalExportacao] = useState(false)
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState<string | null>(null)

  const totalPaginas = Math.ceil(totalRegistros / registrosPorPagina)

  // Resetar seleção quando mudar de tema
  useEffect(() => {
    setRegistroSelecionado(null)
    setModalAberto(false)
    setModalEdicao(false)
    setRegistroEditando(null)
    setDadosEdicao({})
    setMenuAberto(null)
    setModalExportacao(false)
    setConfirmacaoExclusao(null)
  }, [tema.id])

  // Função para formatar data
  const formatarData = (data?: string | null) => {
    if (!data) return '—'

    const parsed = new Date(data)
    if (Number.isNaN(parsed.getTime())) {
      return data
    }

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Função para formatar data e hora
  const formatarDataHora = (data?: string | null) => {
    if (!data) return '—'

    const parsed = new Date(data)
    if (Number.isNaN(parsed.getTime())) {
      return data
    }

    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Função para obter status visual
  const obterStatusVisual = (registro: any) => {
    const temaChave = tema.tabela || tema.id

    // Lógica específica por tema para determinar status
    if (temaChave === 'ocorrencias_aeronauticas' || temaChave === 'ocorrencias_nao_aeronauticas') {
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Ocorrência'
      }
    }
    
    if (temaChave === 'taf_resultados') {
      const desempenho = registro.desempenho

      if (desempenho === null || desempenho === undefined) {
        return {
          icon: Cloud,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Sem Avaliação'
        }
      }

      if (desempenho >= 7) {
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Aprovado'
        }
      }

      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-100',
        label: 'Reprovado'
      }
    }

    if (temaChave === 'ptr_ba_provas_teoricas') {
      const status = (registro.status || '').toLowerCase()

      if (!status) {
        return {
          icon: FileText,
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          label: 'Sem Avaliação'
        }
      }

      if (status === 'aprovado') {
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Aprovado'
        }
      }

      if (status === 'reprovado') {
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Reprovado'
        }
      }

      return {
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-100',
        label: status.charAt(0).toUpperCase() + status.slice(1)
      }
    }

    if (temaChave === 'controle_trocas' || temaChave === 'verificacao_tps') {
      const status = registro.status || 'pendente'
      switch (status) {
        case 'concluido':
          return {
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-100',
            label: 'Concluído'
          }
        case 'cancelado':
          return {
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-100',
            label: 'Cancelado'
          }
        default:
          return {
            icon: Clock,
            color: 'text-yellow-600',
            bg: 'bg-yellow-100',
            label: 'Pendente'
          }
      }
    }

    if (temaChave === 'tempo_epr') {
      const status = (registro.status || '').toLowerCase()

      if (status === 'ideal') {
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-100',
          label: 'Ideal'
        }
      }

      if (status === 'tolerável' || status === 'toleravel') {
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          label: 'Tolerável'
        }
      }

      if (status === 'reprovado') {
        return {
          icon: AlertCircle,
          color: 'text-red-600',
          bg: 'bg-red-100',
          label: 'Reprovado'
        }
      }

      return {
        icon: FileText,
        color: 'text-gray-600',
        bg: 'bg-gray-100',
        label: registro.status || 'Registro'
      }
    }

    return {
      icon: FileText,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      label: 'Registro'
    }
  }

  // Função para obter campos principais do registro
  const obterCamposPrincipais = (registro: any) => {
    const campos = []
    const temaChave = tema.tabela || tema.id

    // Data principal do registro
    const dataPrincipal =
      registro.data_referencia ||
      registro.data_tempo_resposta ||
      registro.data_exercicio_epr ||
      registro.data_ocorrencia ||
      registro.data_prova ||
      registro.data_taf ||
      registro.taf_registros?.data_teste ||
      registro.data_teste ||
      registro.data ||
      registro.validade_inicio ||
      registro.created_at

    if (dataPrincipal) {
      let labelData = 'Data'

      if (registro.data_referencia) {
        labelData = 'Data'
      } else if (registro.data_tempo_resposta) {
        labelData = 'Data'
      } else if (registro.data_exercicio_epr) {
        labelData = 'Data do Exercício'
      } else if (registro.data_ocorrencia) {
        labelData = 'Data da Ocorrência'
      } else if (registro.data_prova) {
        labelData = 'Data da Prova'
      } else if (registro.data_taf || registro.taf_registros?.data_teste || registro.data_teste) {
        labelData = 'Data do TAF'
      } else if (registro.data) {
        labelData = 'Data'
      } else if (registro.validade_inicio) {
        labelData = 'Início'
      }

      campos.push({
        label: labelData,
        valor: formatarData(dataPrincipal),
        icon: Calendar
      })
    }

    // Usuário (comum a todos)
    if (registro.usuario_nome) {
      campos.push({
        label: 'Usuário',
        valor: registro.usuario_nome,
        icon: User
      })
    }

    // Campos específicos por tema
    switch (temaChave) {
      case 'ocorrencias_aeronauticas':
      case 'ocorrencias_nao_aeronauticas': {
        if (registro.tipo_ocorrencia) {
          campos.push({
            label: 'Tipo de Ocorrência',
            valor: registro.tipo_ocorrencia
          })
        }

        const cidade = registro.cidade_aeroporto || registro.nome_cidade || registro.base
        if (cidade) {
          campos.push({
            label: 'Cidade/Base',
            valor: cidade
          })
        }

        if (registro.local_ocorrencia) {
          campos.push({
            label: 'Local da Ocorrência',
            valor: registro.local_ocorrencia
          })
        }

        if (registro.hora_acionamento) {
          campos.push({
            label: 'Hora de Acionamento',
            valor: registro.hora_acionamento,
            icon: Clock
          })
        }

        if (registro.equipe) {
          campos.push({
            label: 'Equipe',
            valor: registro.equipe
          })
        }

        if (registro.aeronave) {
          campos.push({
            label: 'Aeronave',
            valor: registro.aeronave
          })
        }

        break
      }

      case 'controle_trocas': {
        if (registro.nome_cidade) {
          campos.push({
            label: 'Cidade',
            valor: registro.nome_cidade
          })
        }
        if (registro.equipe) {
          campos.push({
            label: 'Equipe',
            valor: registro.equipe
          })
        }
        if (registro.nome_usuario) {
          campos.push({
            label: 'Responsável',
            valor: registro.nome_usuario
          })
        }
        if (registro.quantidade_troca !== null && registro.quantidade_troca !== undefined) {
          campos.push({
            label: 'Quantidade de Trocas',
            valor: registro.quantidade_troca
          })
        }
        if (registro.observacoes) {
          campos.push({
            label: 'Observações',
            valor: registro.observacoes.length > 50
              ? `${registro.observacoes.substring(0, 50)}...`
              : registro.observacoes
          })
        }
        break
      }

      case 'tempo_resposta': {
        if (registro.nome_cidade) {
          campos.push({ label: 'Cidade', valor: registro.nome_cidade })
        }
        if (registro.equipe) {
          campos.push({ label: 'Equipe', valor: registro.equipe })
        }
        if (registro.nome_completo) {
          campos.push({ label: 'Nome Completo', valor: registro.nome_completo, icon: User })
        }
        if (registro.tempo_exercicio) {
          campos.push({ label: 'Tempo de Resposta', valor: registro.tempo_exercicio, icon: Clock })
        }
        if (registro.local_posicionamento) {
          campos.push({ label: 'Local', valor: registro.local_posicionamento })
        }
        if (registro.cci_utilizado) {
          campos.push({ label: 'CCI Utilizado', valor: registro.cci_utilizado })
        }
        break
      }

      case 'controle_agentes_extintores': {
        if (registro.nome_cidade) {
          campos.push({ label: 'Cidade', valor: registro.nome_cidade })
        }
        if (registro.equipe) {
          campos.push({ label: 'Equipe', valor: registro.equipe })
        }
        if (registro.nome_completo) {
          campos.push({ label: 'Responsável', valor: registro.nome_completo, icon: User })
        }
        if (registro.quantidade_estoque_po_quimico !== undefined) {
          campos.push({ label: 'Pó Químico (Estoque)', valor: registro.quantidade_estoque_po_quimico })
        }
        if (registro.quantidade_estoque_lge !== undefined) {
          campos.push({ label: 'LGE (Estoque)', valor: registro.quantidade_estoque_lge })
        }
        if (registro.quantidade_estoque_nitrogenio !== undefined) {
          campos.push({ label: 'Nitrogênio (Estoque)', valor: registro.quantidade_estoque_nitrogenio })
        }
        if (registro.observacoes) {
          campos.push({ label: 'Observações', valor: registro.observacoes.length > 50 ? `${registro.observacoes.substring(0, 50)}...` : registro.observacoes })
        }
        break
      }

      case 'tempo_epr':
        if (registro.nome_cidade) {
          campos.push({
            label: 'Cidade',
            valor: registro.nome_cidade
          })
        }
        if (registro.nome_completo) {
          campos.push({
            label: 'Nome Completo',
            valor: registro.nome_completo,
            icon: User
          })
        }
        if (registro.tempo_epr) {
          campos.push({
            label: 'Tempo',
            valor: registro.tempo_epr,
            icon: Clock
          })
        }
        if (registro.status) {
          campos.push({
            label: 'Status',
            valor: registro.status
          })
        }
        if (registro.equipe) {
          campos.push({
            label: 'Equipe',
            valor: registro.equipe
          })
        }
        break

      case 'taf_resultados':
        if (registro.nome_completo) {
          campos.push({
            label: 'Funcionário',
            valor: registro.nome_completo,
            icon: User
          })
        }
        if (registro.nome_equipe) {
          campos.push({
            label: 'Equipe',
            valor: registro.nome_equipe
          })
        }
        if (registro.nome_cidade) {
          campos.push({
            label: 'Base',
            valor: registro.nome_cidade
          })
        }
        if (registro.desempenho !== null && registro.desempenho !== undefined) {
          campos.push({
            label: 'Desempenho',
            valor: registro.desempenho
          })
        }
        if (registro.tempo_total) {
          campos.push({
            label: 'Tempo',
            valor: registro.tempo_total,
            icon: Clock
          })
        }
        if (registro.observacoes) {
          campos.push({
            label: 'Observações',
            valor: registro.observacoes.length > 50
              ? `${registro.observacoes.substring(0, 50)}...`
              : registro.observacoes
          })
        }
        break

      case 'verificacao_tps': {
        if (registro.nome_cidade) {
          campos.push({ label: 'Cidade', valor: registro.nome_cidade })
        }
        if (registro.equipe) {
          campos.push({ label: 'Equipe', valor: registro.equipe })
        }
        if (registro.nome_usuario) {
          campos.push({ label: 'Responsável', valor: registro.nome_usuario, icon: User })
        }
        if (registro.tp_conforme !== undefined) {
          campos.push({ label: 'TPs Conformes', valor: registro.tp_conforme })
        }
        if (registro.tp_verificado !== undefined) {
          campos.push({ label: 'TPs Verificados', valor: registro.tp_verificado })
        }
        if (registro.tp_total !== undefined) {
          campos.push({ label: 'TPs Totais', valor: registro.tp_total })
        }
        break
      }

      case 'higienizacao_tps': {
        if (registro.nome_cidade) {
          campos.push({ label: 'Cidade', valor: registro.nome_cidade })
        }
        if (registro.equipe) {
          campos.push({ label: 'Equipe', valor: registro.equipe })
        }
        if (registro.nome_usuario) {
          campos.push({ label: 'Responsável', valor: registro.nome_usuario, icon: User })
        }
        if (registro.tp_higienizado !== undefined) {
          campos.push({ label: 'TPs Higienizados', valor: registro.tp_higienizado })
        }
        if (registro.tp_total !== undefined) {
          campos.push({ label: 'TPs Totais', valor: registro.tp_total })
        }
        break
      }

      case 'controle_uniformes_recebidos': {
        if (registro.nome_cidade) {
          campos.push({ label: 'Cidade', valor: registro.nome_cidade })
        }
        if (registro.equipe) {
          campos.push({ label: 'Equipe', valor: registro.equipe })
        }
        if (registro.nome_completo) {
          campos.push({ label: 'Funcionário', valor: registro.nome_completo, icon: User })
        } else if (registro.nome_usuario) {
          campos.push({ label: 'Responsável', valor: registro.nome_usuario, icon: User })
        }
        if (registro.epi_entregue !== undefined && registro.epi_previsto !== undefined) {
          campos.push({ label: 'EPIs (entregue / previsto)', valor: `${registro.epi_entregue} / ${registro.epi_previsto}` })
        }
        if (registro.uniforme_entregue !== undefined && registro.uniforme_previsto !== undefined) {
          campos.push({ label: 'Uniformes (entregue / previsto)', valor: `${registro.uniforme_entregue} / ${registro.uniforme_previsto}` })
        }
        if (registro.porcentagem_epi !== undefined) {
          campos.push({ label: 'Entrega de EPIs (%)', valor: `${registro.porcentagem_epi}%` })
        }
        if (registro.porcentagem_uniforme !== undefined) {
          campos.push({ label: 'Entrega de Uniformes (%)', valor: `${registro.porcentagem_uniforme}%` })
        }
        if (registro.observacoes) {
          campos.push({ label: 'Observações', valor: registro.observacoes.length > 50 ? `${registro.observacoes.substring(0, 50)}...` : registro.observacoes })
        }
        break
      }

      case 'ptr_ba_provas_teoricas':
        if (registro.nome_completo) {
          campos.push({
            label: 'Participante',
            valor: registro.nome_completo,
            icon: User
          })
        }
        if (registro.nome_cidade) {
          campos.push({
            label: 'Base',
            valor: registro.nome_cidade
          })
        }
        if (registro.status) {
          campos.push({
            label: 'Status',
            valor: registro.status
          })
        }
        if (registro.nota_prova !== null && registro.nota_prova !== undefined) {
          campos.push({
            label: 'Nota',
            valor: registro.nota_prova
          })
        }
        if (registro.observacoes) {
          campos.push({
            label: 'Observações',
            valor: registro.observacoes.length > 50
              ? `${registro.observacoes.substring(0, 50)}...`
              : registro.observacoes
          })
        }
        break

      case 'atividades_acessorias': {
        if (registro.cidade_aeroporto) {
          campos.push({ label: 'Cidade', valor: registro.cidade_aeroporto })
        }
        if (registro.equipe_nome) {
          campos.push({ label: 'Equipe', valor: registro.equipe_nome })
        }
        if (registro.tipo_atividade) {
          campos.push({ label: 'Tipo de Atividade', valor: registro.tipo_atividade })
        }
        if (registro.qtd_equipamentos !== undefined) {
          campos.push({ label: 'Equipamentos', valor: registro.qtd_equipamentos })
        }
        if (registro.qtd_bombeiros !== undefined) {
          campos.push({ label: 'Bombeiros', valor: registro.qtd_bombeiros })
        }
        if (registro.tempo_gasto) {
          campos.push({ label: 'Tempo Gasto', valor: registro.tempo_gasto, icon: Clock })
        }
        break
      }

      default:
        // Tentar encontrar campos comuns
        if (registro.descricao) {
          campos.push({
            label: 'Descrição',
            valor: registro.descricao.length > 50 
              ? `${registro.descricao.substring(0, 50)}...` 
              : registro.descricao
          })
        }
        if (registro.observacoes) {
          campos.push({
            label: 'Observações',
            valor: registro.observacoes.length > 50 
              ? `${registro.observacoes.substring(0, 50)}...` 
              : registro.observacoes
          })
        }
    }

    return campos
  }

  // Funções de exportação
  const exportarCSV = () => {
    const csvContent = [
      // Cabeçalho
      Object.keys(dados[0] || {}).join(','),
      // Dados
      ...dados.map(registro => 
        Object.values(registro).map(valor => 
          typeof valor === 'string' && valor.includes(',') 
            ? `"${valor}"` 
            : valor
        ).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_${tema.id}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setModalExportacao(false)
  }

  const exportarJSON = () => {
    const jsonContent = JSON.stringify(dados, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_${tema.id}_${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setModalExportacao(false)
  }

  const exportarExcel = () => {
    // Criar conteúdo HTML para Excel
    const htmlContent = `
      <table>
        <thead>
          <tr>
            ${Object.keys(dados[0] || {}).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${dados.map(registro => 
            `<tr>${Object.values(registro).map(valor => `<td>${valor}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
    `

    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `historico_${tema.id}_${new Date().toISOString().split('T')[0]}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setModalExportacao(false)
  }

  // Funções de edição e exclusão
  const iniciarEdicao = (registro: any) => {
    setRegistroEditando(registro)
    setDadosEdicao({ ...registro })
    setModalEdicao(true)
    setMenuAberto(null)
  }

  const salvarEdicao = async () => {
    if (!registroEditando) return

    const sucesso = await onEditar(registroEditando.id, dadosEdicao)
    if (sucesso) {
      setModalEdicao(false)
      setRegistroEditando(null)
      setDadosEdicao({})
    }
  }

  const confirmarExclusao = async (id: string) => {
    const sucesso = await onExcluir(id)
    if (sucesso) {
      setConfirmacaoExclusao(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-gray-600">Carregando dados...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Erro ao carregar dados</h3>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (dados.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
        <p className="text-gray-600">
          Não há dados para o tema &quot;{tema.nome}&quot; com os filtros aplicados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com informações do tema */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
              {(() => {
                const IconComponent = lucideIcons[tema.icone as keyof typeof lucideIcons] || FileText
                return <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              })()}
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{tema.nome}</h2>
              <p className="text-sm sm:text-base text-gray-600 hidden sm:block">{tema.descricao}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Total de registros</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{totalRegistros}</p>
            </div>
            
            {dados.length > 0 && (
              <button
                onClick={() => setModalExportacao(true)}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {dados.map((registro, index) => {
            const status = obterStatusVisual(registro)
            const campos = obterCamposPrincipais(registro)
            const StatusIcon = status.icon

            return (
              <div
                key={registro.id || index}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => {
                  setRegistroSelecionado(registro)
                  setModalAberto(true)
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-3 sm:space-y-0">
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    {/* Status Icon */}
                    <div className={`p-2 rounded-lg ${status.bg} flex-shrink-0`}>
                      <StatusIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${status.color}`} />
                    </div>

                    {/* Conteúdo principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color} w-fit`}>
                          {status.label}
                        </span>
                        {registro.created_at && (
                          <span className="text-xs text-gray-500">
                            Criado em {formatarDataHora(registro.created_at)}
                          </span>
                        )}
                      </div>

                      {/* Campos principais */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                        {campos.map((campo, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            {campo.icon && <campo.icon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
                            <div className="min-w-0">
                              <span className="text-xs text-gray-500">{campo.label}:</span>
                              <span className="ml-1 text-xs sm:text-sm text-gray-900 break-words">{campo.valor}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Menu de ações */}
                  <div className="relative flex-shrink-0 self-start">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuAberto(menuAberto === registro.id ? null : registro.id)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {menuAberto === registro.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setRegistroSelecionado(registro)
                            setModalAberto(true)
                            setMenuAberto(null)
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver detalhes</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            iniciarEdicao(registro)
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmacaoExclusao(registro.id)
                            setMenuAberto(null)
                          }}
                          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="bg-white border border-gray-200 rounded-lg px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
              Mostrando {((paginaAtual - 1) * registrosPorPagina) + 1} a{' '}
              {Math.min(paginaAtual * registrosPorPagina, totalRegistros)} de{' '}
              {totalRegistros} registros
            </div>

            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <button
                onClick={() => onPaginaChange?.(paginaAtual - 1)}
                disabled={paginaAtual === 1 || !onPaginaChange}
                className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: paginaAtual === 1 ? '#f1f5f9' : '#e5e7eb',
                  color: '#374151',
                  borderColor: '#cbd5f5'
                }}
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              {/* Números das páginas */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(window.innerWidth < 640 ? 3 : 5, totalPaginas) }, (_, i) => {
                  let pagina
                  const maxPages = window.innerWidth < 640 ? 3 : 5
                  if (totalPaginas <= maxPages) {
                    pagina = i + 1
                  } else if (paginaAtual <= Math.floor(maxPages/2) + 1) {
                    pagina = i + 1
                  } else if (paginaAtual >= totalPaginas - Math.floor(maxPages/2)) {
                    pagina = totalPaginas - maxPages + 1 + i
                  } else {
                    pagina = paginaAtual - Math.floor(maxPages/2) + i
                  }

                  const isAtual = pagina === paginaAtual
                  return (
                    <button
                      key={pagina}
                      onClick={() => onPaginaChange?.(pagina)}
                      disabled={!onPaginaChange}
                      className="px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg border font-semibold transition-colors shadow-sm"
                      style={{
                        backgroundColor: isAtual ? '#f97316' : '#e5e7eb',
                        color: isAtual ? '#ffffff' : '#374151',
                        borderColor: isAtual ? '#f97316' : '#cbd5f5',
                        boxShadow: isAtual ? '0 4px 10px rgba(249, 115, 22, 0.3)' : 'none'
                      }}
                    >
                      {pagina}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => onPaginaChange?.(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas || !onPaginaChange}
                className="flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium border rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: paginaAtual === totalPaginas ? '#f1f5f9' : '#e5e7eb',
                  color: '#374151',
                  borderColor: '#cbd5f5'
                }}
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {modalAberto && registroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                  Detalhes do Registro - {tema.nome}
                </h3>
                <button
                  onClick={() => setModalAberto(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {Object.entries(registroSelecionado).map(([chave, valor]) => {
                  if (chave === 'id' || chave.endsWith('_id') || valor === null || valor === undefined) return null

                  if (chave === 'taf_registros' && valor && typeof valor === 'object' && !Array.isArray(valor)) {
                    const taf = valor as { data_teste?: string | null }
                    return (
                      <div key={chave} className="space-y-1">
                        <label className="text-xs sm:text-sm font-medium text-gray-700">
                          Informações do Registro TAF
                        </label>
                        <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg space-y-1">
                          {taf.data_teste && (
                            <div><strong>Data do Teste:</strong> {formatarData(taf.data_teste)}</div>
                          )}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={chave} className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                        {chave.replace(/_/g, ' ')}
                      </label>
                      <div className="text-xs sm:text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg break-words">
                        {typeof valor === 'string' && valor.includes('T') && valor.includes('Z')
                          ? formatarDataHora(valor)
                          : String(valor)
                        }
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exportação */}
      {modalExportacao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Exportar Dados</h3>
                <button
                  onClick={() => setModalExportacao(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-gray-600">Escolha o formato para exportar os dados:</p>
              
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={exportarCSV}
                  className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900">CSV</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Arquivo separado por vírgulas</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>

                <button
                  onClick={exportarJSON}
                  className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900">JSON</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Formato de dados estruturados</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>

                <button
                  onClick={exportarExcel}
                  className="w-full flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900">Excel</h4>
                      <p className="text-xs sm:text-sm text-gray-500">Planilha do Microsoft Excel</p>
                    </div>
                  </div>
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {modalEdicao && registroEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 pr-4">
                  Editar Registro - {tema.nome}
                </h3>
                <button
                  onClick={() => setModalEdicao(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {Object.entries(dadosEdicao).map(([chave, valor]) => {
                  if (chave === 'id' || chave === 'created_at' || chave === 'updated_at') return null

                  return (
                    <div key={chave} className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 capitalize">
                        {chave.replace(/_/g, ' ')}
                      </label>
                      {chave.includes('data') || chave.includes('date') ? (
                        <input
                          type="date"
                          value={typeof valor === 'string' ? valor.split('T')[0] : ''}
                          onChange={(e) => setDadosEdicao({ ...dadosEdicao, [chave]: e.target.value })}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      ) : chave.includes('observacoes') || chave.includes('descricao') ? (
                        <textarea
                          value={String(valor || '')}
                          onChange={(e) => setDadosEdicao({ ...dadosEdicao, [chave]: e.target.value })}
                          rows={3}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={String(valor || '')}
                          onChange={(e) => setDadosEdicao({ ...dadosEdicao, [chave]: e.target.value })}
                          className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <button
                  onClick={() => setModalEdicao(false)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicao}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                >
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {confirmacaoExclusao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                  <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm sm:text-base text-gray-600">Esta ação não pode ser desfeita.</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                Tem certeza que deseja excluir este registro? Todos os dados serão perdidos permanentemente.
              </p>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => setConfirmacaoExclusao(null)}
                  className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => confirmarExclusao(confirmacaoExclusao)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}