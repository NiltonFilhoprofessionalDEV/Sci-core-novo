'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Pagination } from '@/components/ui/pagination'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface OcorrenciaNaoAeronauticaRegistro {
  id: string
  secao_id: string | null
  equipe_id: string | null
  equipe: string | null
  cidade_aeroporto: string | null
  data_ocorrencia: string | null
  tipo_ocorrencia: string | null
  local_ocorrencia: string | null
  hora_acionamento: string | null
  hora_chegada: string | null
  hora_termino: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

function timeToSeconds(time?: string | null): number {
  if (!time) return 0
  const parts = time.split(':').map(Number)
  if (parts.length < 2 || parts.some((n) => Number.isNaN(n))) return 0
  const [hours = 0, minutes = 0, seconds = 0] = parts
  return hours * 3600 + minutes * 60 + seconds
}

function diffSeconds(inicio?: string | null, fim?: string | null): number {
  const start = timeToSeconds(inicio)
  const end = timeToSeconds(fim)
  if (start === 0 && end === 0) return 0
  if (end >= start) return end - start
  return end + 24 * 3600 - start
}

function secondsToExtendedTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '00:00:00'
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':')
}

function secondsToHours(totalSeconds: number): number {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return 0
  return Number((totalSeconds / 3600).toFixed(2))
}

export default function OcorrenciasNaoAeronauticasDashboard() {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filtros
  const [selectedBase, setSelectedBase] = useState<string | null>(null)
  const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
  const [selectedMes, setSelectedMes] = useState<string | null>(null)
  
  const isGestorPOP = user?.profile?.perfil === 'gestor_pop'
  const isBace = user?.profile?.perfil === 'ba_ce'
  const isGerenteSecao = user?.profile?.perfil === 'gerente_secao'
  
  // Determinar secaoId para filtro de equipes
  const secaoIdParaEquipes = isGestorPOP 
    ? selectedBase 
    : (isBace || isGerenteSecao) 
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id)
      : undefined
  
  // Memoizar a função de filtros
  const additionalFilters = useMemo(() => {
    return (query: any) => {
      // Filtro por base (Gestor POP)
      if (isGestorPOP && selectedBase) {
        query = query.eq('secao_id', selectedBase)
      }
      
      // Filtro por seção (BA-CE e Gerente de Seção)
      if ((isBace || isGerenteSecao) && user?.profile?.secao_id) {
        query = query.eq('secao_id', user.profile.secao_id)
      }
      
      // Filtro por equipes
      if (selectedEquipes.length > 0) {
        query = query.in('equipe_id', selectedEquipes)
      }
      
      // Filtro por mês de referência
      if (selectedMes) {
        const [ano, mes] = selectedMes.split('-')
        const anoNum = parseInt(ano, 10)
        const mesNum = parseInt(mes, 10)
        const startDate = new Date(anoNum, mesNum - 1, 1).toISOString().split('T')[0]
        const endDate = new Date(anoNum, mesNum, 0).toISOString().split('T')[0]
        query = query.gte('data_ocorrencia', startDate)
        query = query.lte('data_ocorrencia', endDate)
      }
      
      return query
    }
  }, [isGestorPOP, isBace, isGerenteSecao, selectedBase, selectedEquipes, selectedMes, user?.profile?.secao_id])

  // Usar hook unificado para carregamento de dados
  const { 
    data: registros, 
    loading, 
    error, 
    refetch,
    isReady 
  } = useDashboardData<OcorrenciaNaoAeronauticaRegistro>({
    tableName: 'ocorrencias_nao_aeronauticas',
    selectFields: `id, secao_id, equipe_id, equipe, cidade_aeroporto, data_ocorrencia, tipo_ocorrencia, local_ocorrencia, hora_acionamento, hora_chegada, hora_termino`,
    orderBy: { column: 'data_ocorrencia', ascending: false },
    limit: 1000,
    cacheKey: `ocorrencias-nao-aeronauticas-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMes || 'all'}`,
    additionalFilters
  })
  
  // Quando os filtros mudarem, recarregar os dados
  useEffect(() => {
    if (isReady && (isGestorPOP || isBace || isGerenteSecao)) {
      refetch()
    }
  }, [selectedBase, selectedEquipes, selectedMes, isReady, isGestorPOP, isBace, isGerenteSecao, refetch])
  
  // Limpar filtro de equipes quando a base mudar
  const previousBaseRef = useRef<string | null>(null)
  useEffect(() => {
    if (previousBaseRef.current !== selectedBase) {
      setSelectedEquipes([])
      previousBaseRef.current = selectedBase
    }
  }, [selectedBase])

  const nomeBase = user?.profile?.secao?.nome ?? 'Base não identificada'

  const totalOcorrencias = registros.length

  const ocorrenciasPorMes = useMemo(() => {
    const map = new Map<string, { label: string; count: number }>()

    registros.forEach((registro) => {
      if (!registro.data_ocorrencia) return
      const date = new Date(`${registro.data_ocorrencia}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { label: monthFormatter.format(date), count: 0 })
      }
      map.get(key)!.count += 1
    })

    return Array.from(map.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => ({ mes: value.label, total: value.count }))
  }, [registros])

  const topTiposOcorrencia = useMemo(() => {
    const map = new Map<string, number>()
    registros.forEach((registro) => {
      const tipo = registro.tipo_ocorrencia?.trim() || 'Não informado'
      map.set(tipo, (map.get(tipo) ?? 0) + 1)
    })

    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
  }, [registros])

  // Função para normalizar nomes de localidades (agrupar variações)
  // Agrupa localidades que são essencialmente a mesma, independente de:
  // - Maiúsculas/minúsculas (G-11 = g-11 = g11)
  // - Espaços extras (G-11 = G - 11 = G 11)
  // - Hífens (G-11 = g11 = G 11)
  // - Acentos (São Paulo = Sao Paulo)
  // - Caracteres especiais desnecessários
  const normalizarLocalidade = (nome: string): string => {
    if (!nome) return 'sem-registro'
    
    let normalizado = nome
      .trim()
      .toLowerCase() // Converte tudo para minúsculas (G-11 vira g-11, P-12 vira p-12)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos (São Paulo vira Sao Paulo)
      .replace(/[^a-z0-9\s\-]/g, '') // Remove caracteres especiais, mantém letras, números, espaços e hífens
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos para um único espaço
      .trim()
    
    // Normaliza hífens e espaços para consistência
    // Remove TODOS os hífens e espaços para agrupar variações como "G-11" e "g11"
    normalizado = normalizado
      .replace(/\s*-\s*/g, '') // Remove hífens e espaços ao redor (G - 11 vira g11)
      .replace(/\s+/g, '') // Remove TODOS os espaços (G 11 vira g11)
      .replace(/-+/g, '') // Remove TODOS os hífens (g-11 vira g11)
    
    // Garante que está tudo minúsculo e não vazio
    return normalizado.toLowerCase() || 'sem-registro'
  }

  // Função para encontrar o nome canônico (primeira ocorrência encontrada)
  const encontrarNomeCanonico = (nomeNormalizado: string, nomesOriginais: Map<string, string>): string => {
    return nomesOriginais.get(nomeNormalizado) || nomeNormalizado
  }

  const ocorrenciasPorLocalidade = useMemo(() => {
    const mapValores = new Map<string, number>()
    const mapNomesOriginais = new Map<string, string>() // Mapeia nome normalizado -> nome original (primeira ocorrência)

    registros.forEach((registro) => {
      const nomeOriginal = (registro.local_ocorrencia?.trim() || 'Sem registro')
      const nomeNormalizado = normalizarLocalidade(nomeOriginal)
      
      // Debug: verificar normalização
      // console.log(`Original: "${nomeOriginal}" -> Normalizado: "${nomeNormalizado}"`)
      
      // Se é a primeira vez que vemos este nome normalizado, guarda o nome original
      if (!mapNomesOriginais.has(nomeNormalizado)) {
        mapNomesOriginais.set(nomeNormalizado, nomeOriginal)
      }
      
      // Soma os valores agrupando por nome normalizado
      // Isso garante que "G-11" e "g-11" sejam somados juntos
      mapValores.set(nomeNormalizado, (mapValores.get(nomeNormalizado) ?? 0) + 1)
    })

    return Array.from(mapValores.entries())
      .map(([nomeNormalizado, value]) => ({
        name: encontrarNomeCanonico(nomeNormalizado, mapNomesOriginais),
        value,
        nomeNormalizado
      }))
      .sort((a, b) => b.value - a.value)
  }, [registros])

  const tempoTotalSegundos = useMemo(() => {
    return registros.reduce((acc, registro) => {
      return acc + diffSeconds(registro.hora_acionamento, registro.hora_termino)
    }, 0)
  }, [registros])

  const tempoTotalPorMes = useMemo(() => {
    const map = new Map<string, { label: string; segundos: number }>()

    registros.forEach((registro) => {
      if (!registro.data_ocorrencia) return
      const date = new Date(`${registro.data_ocorrencia}T00:00:00`)
      if (Number.isNaN(date.getTime())) return
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { label: monthFormatter.format(date), segundos: 0 })
      }
      map.get(key)!.segundos += diffSeconds(registro.hora_acionamento, registro.hora_termino)
    })

    return Array.from(map.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([, value]) => ({ mes: value.label, horas: secondsToHours(value.segundos) }))
  }, [registros])

  // Paleta de cores laranja exclusiva para Treemap
  const treemapColors = [
    '#fb923c', // Laranja principal
    '#f97316', // Laranja médio
    '#ea580c', // Laranja escuro
    '#f59e0b', // Âmbar laranja
    '#d97706', // Laranja queimado
    '#fed7aa', // Pêssego claro
    '#fdba74', // Pêssego médio
    '#ff8c42', // Laranja vibrante
    '#ff6b35', // Laranja coral
    '#ff9500'  // Laranja puro
  ]

  // Mapeamento de cores por localidade para garantir consistência entre gráfico e legenda
  // Usa o nome da localidade como chave para garantir que a mesma cor seja sempre usada
  const coresPorLocalidade = useMemo(() => {
    const mapa = new Map<string, string>()
    // Ordenar por nome para garantir ordem consistente na atribuição de cores
    const localidadesOrdenadas = [...ocorrenciasPorLocalidade].sort((a, b) => 
      a.name.localeCompare(b.name)
    )
    localidadesOrdenadas.forEach((item, index) => {
      mapa.set(item.name, treemapColors[index % treemapColors.length])
    })
    return mapa
  }, [ocorrenciasPorLocalidade])

  // Preparar dados para o heatmap
  const dadosHeatmap = useMemo(() => {
    const maxValue = Math.max(...ocorrenciasPorLocalidade.map(item => item.value), 1)
    const minValue = Math.min(...ocorrenciasPorLocalidade.map(item => item.value), 1)
    const cols = Math.ceil(Math.sqrt(ocorrenciasPorLocalidade.length))
    
    return ocorrenciasPorLocalidade.map((item, index) => {
      const row = Math.floor(index / cols)
      const col = index % cols
      
      // Calcular intensidade (0 a 1) baseada no valor
      const intensidade = maxValue > minValue 
        ? (item.value - minValue) / (maxValue - minValue)
        : 1
      
      // Calcular tamanho do quadrado (30% a 100% do tamanho base)
      const tamanhoBase = 100 // Tamanho base em porcentagem
      const tamanhoMinimo = 30 // Tamanho mínimo em porcentagem
      const tamanho = tamanhoMinimo + (intensidade * (tamanhoBase - tamanhoMinimo))
      
      // Escala de cores laranja baseada na intensidade
      // De laranja muito claro (baixa intensidade) a laranja muito escuro (alta intensidade)
      const getCorPorIntensidade = (int: number) => {
        if (int <= 0.1) return '#fff7ed' // Laranja muito claro
        if (int <= 0.2) return '#ffedd5' // Laranja claro
        if (int <= 0.3) return '#fed7aa' // Laranja médio-claro
        if (int <= 0.4) return '#fdba74' // Laranja médio
        if (int <= 0.5) return '#fb923c' // Laranja
        if (int <= 0.6) return '#f97316' // Laranja médio-escuro
        if (int <= 0.7) return '#ea580c' // Laranja escuro
        if (int <= 0.8) return '#dc2626' // Laranja muito escuro
        return '#991b1b' // Laranja mais escuro (máxima intensidade)
      }
      
      return {
        name: item.name,
        value: item.value,
        row,
        col,
        intensidade,
        tamanho,
        cor: getCorPorIntensidade(intensidade),
        corLegenda: coresPorLocalidade.get(item.name) || treemapColors[index % treemapColors.length]
      }
    })
  }, [ocorrenciasPorLocalidade, coresPorLocalidade])

  const tabelaRegistros = useMemo(() => {
    return registros.map((registro) => {
      const duracaoSegundos = diffSeconds(registro.hora_acionamento, registro.hora_termino)
      return {
        ...registro,
        dataFormatada: registro.data_ocorrencia
          ? dateFormatter.format(new Date(`${registro.data_ocorrencia}T00:00:00`))
          : '—',
        tempo_total: secondsToExtendedTime(duracaoSegundos)
      }
    })
  }, [registros])

  // Paginação
  const totalPages = Math.ceil(tabelaRegistros.length / itemsPerPage)
  const paginatedRegistros = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return tabelaRegistros.slice(startIndex, endIndex)
  }, [tabelaRegistros, currentPage, itemsPerPage])

  // Resetar página quando os dados mudarem
  useEffect(() => {
    setCurrentPage(1)
  }, [registros.length])

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Ocorrências Não Aeronáuticas</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          {isBace ? `Visualizando os registros da base ${nomeBase}.` : 'Visão consolidada das ocorrências não aeronáuticas registradas.'}
        </p>
      </div>

      {/* Filtros */}
      {(isGestorPOP || isBace || isGerenteSecao) && (
        <div className="bg-white rounded-lg border border-orange-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            {isGestorPOP && (
              <BaseFilter
                selectedBase={selectedBase}
                onBaseChange={setSelectedBase}
              />
            )}
            {((isGestorPOP && selectedBase) || ((isBace || isGerenteSecao) && user?.profile?.secao_id)) && (
              <EquipeFilter
                selectedEquipes={selectedEquipes}
                onEquipeChange={setSelectedEquipes}
                secaoId={secaoIdParaEquipes}
              />
            )}
            <MesReferenciaFilter
              selectedMes={selectedMes}
              onMesChange={setSelectedMes}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-white p-12 text-primary">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Carregando dados das ocorrências...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : (
        <>
          {totalOcorrencias === 0 ? (
            <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
              <p className="text-lg font-semibold text-primary">Nenhuma ocorrência cadastrada.</p>
              <p className="mt-2 text-sm">
                Assim que novas ocorrências não aeronáuticas forem registradas para sua base, os gráficos e a tabela serão exibidos aqui.
              </p>
            </div>
          ) : (
            <>
              {/* Cards no topo - Laranja */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de ocorrências</p>
                  <p className="mt-2 text-4xl font-black">{totalOcorrencias}</p>
                  <p className="mt-1 text-xs text-white/80">Registros não aeronáuticos</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
                  <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de horas em ocorrências</p>
                  <p className="mt-2 text-4xl font-black">{secondsToExtendedTime(tempoTotalSegundos)}</p>
                  <p className="mt-1 text-xs text-white/80">Somatório do tempo entre acionamento e término</p>
                </div>
              </div>

              {/* Gráfico principal - AreaChart */}
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Evolução de ocorrências por mês</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">
                    Últimos registros
                  </span>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={ocorrenciasPorMes}>
                      <defs>
                        <linearGradient id="colorOcorrenciasNaoAero" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fb923c" stopOpacity={0.7} />
                          <stop offset="30%" stopColor="#f97316" stopOpacity={0.5} />
                          <stop offset="60%" stopColor="#ea580c" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#c2410c" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#1f1f1f" 
                        tick={{ fontSize: 12, fill: '#1f1f1f' }} 
                        interval={0}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        stroke="#1f1f1f" 
                        tick={{ fontSize: 12, fill: '#1f1f1f' }} 
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          borderRadius: 12,
                          border: '1px solid #fb923c',
                          boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                          color: '#1f1f1f'
                        }}
                        labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="total" 
                        stroke="#fb923c" 
                        strokeWidth={3}
                        fill="url(#colorOcorrenciasNaoAero)"
                        dot={{ r: 5, fill: '#fb923c', strokeWidth: 2, stroke: 'white' }}
                        activeDot={{ r: 7, fill: '#f97316', strokeWidth: 2, stroke: 'white' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Top 5 maiores ocorrências</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">Por tipo</span>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer>
                      <BarChart
                        data={topTiposOcorrencia}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" strokeOpacity={0.3} />
                        <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                        <YAxis dataKey="name" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f', width: 180 }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: 12,
                            border: '1px solid #fb923c',
                            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                            color: '#1f1f1f'
                          }}
                          labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                        />
                        <Bar dataKey="value" fill="#fb923c" radius={[0, 4, 4, 0]} barSize={28} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Tempo total das ocorrências por mês</h3>
                    <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">Horas</span>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart data={tempoTotalPorMes}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                        <XAxis 
                          dataKey="mes" 
                          stroke="#1f1f1f" 
                          tick={{ fontSize: 12, fill: '#1f1f1f' }} 
                          interval={0}
                        />
                        <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                        <Tooltip
                          cursor={{ fill: 'rgba(251, 146, 60, 0.08)' }}
                          contentStyle={{
                            backgroundColor: 'white',
                            borderRadius: 12,
                            border: '1px solid #fb923c',
                            boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                            color: '#1f1f1f'
                          }}
                          labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                          formatter={(value) => [`${value} h`, 'Tempo']}
                        />
                        <Bar dataKey="horas" fill="#fb923c" radius={[8, 8, 0, 0]} barSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 text-right text-xs text-[#1f1f1f]/60">
                    Total: {secondsToExtendedTime(tempoTotalSegundos)}
                  </div>
                </div>
              </div>

              {/* Gráfico de distribuição - Treemap */}
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Distribuição por localidade</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-[#1f1f1f]/60">
                    Distribuição
                  </span>
                </div>
                <div className="h-80">
                  <div className="w-full h-full flex items-center justify-center p-2">
                    <div className="grid gap-0.5 items-stretch justify-stretch w-full h-full" style={{ 
                      gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(ocorrenciasPorLocalidade.length))}, 1fr)`,
                      gridAutoRows: '1fr'
                    }}>
                      {dadosHeatmap.map((item, index) => {
                        // Calcular tamanho baseado na intensidade (proporção do espaço disponível)
                        const tamanhoMinimo = 0.4 // 40% do espaço da célula
                        const tamanhoMaximo = 1.0 // 100% do espaço da célula
                        const proporcaoTamanho = tamanhoMinimo + (item.intensidade * (tamanhoMaximo - tamanhoMinimo))
                        
                        return (
                          <div
                            key={`heatmap-${item.name}-${index}`}
                            className="relative rounded border border-white/50 shadow-sm transition-all hover:scale-105 hover:shadow-md hover:z-10 cursor-pointer group flex items-center justify-center"
                            style={{
                              backgroundColor: item.cor,
                              width: `${proporcaoTamanho * 100}%`,
                              height: `${proporcaoTamanho * 100}%`,
                              minWidth: '60px',
                              minHeight: '60px',
                              aspectRatio: '1',
                              margin: 'auto'
                            }}
                            title={`${item.name}: ${item.value} ocorrência${item.value !== 1 ? 's' : ''}`}
                          >
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                              <span className="text-[10px] font-semibold text-[#1f1f1f] drop-shadow-sm text-center leading-tight px-1">
                                {item.name}
                              </span>
                              <span className="text-[10px] font-bold text-[#1f1f1f] bg-white/90 px-1 py-0.5 rounded mt-0.5">
                                {item.value}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="mb-2 text-xs font-semibold text-[#1f1f1f]/60 uppercase tracking-wide">
                    Legenda (intensidade e tamanho da cor indicam quantidade)
                  </div>
                  {ocorrenciasPorLocalidade.map((item, index) => {
                    const heatmapItem = dadosHeatmap.find(d => d.name === item.name)
                    const cor = heatmapItem?.cor || '#fb923c'
                    return (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex h-3 w-3 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: cor }}
                          />
                          <span className="text-[#1f1f1f]">{item.name}</span>
                        </div>
                        <span className="font-medium text-[#1f1f1f]/80">{item.value}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tabela de detalhamento */}
              <div className="rounded-2xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-6 py-4 bg-muted/30">
                  <h3 className="text-lg font-semibold text-foreground">Detalhamento das ocorrências</h3>
                  <p className="text-xs text-muted-foreground">Registros ordenados do mais recente para o mais antigo</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Data</th>
                        <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                        <th className="px-4 py-3 text-left font-semibold">Tipo de ocorrência</th>
                        <th className="px-4 py-3 text-left font-semibold">Local da ocorrência</th>
                        <th className="px-4 py-3 text-left font-semibold">Hora acionamento</th>
                        <th className="px-4 py-3 text-left font-semibold">Hora chegada</th>
                        <th className="px-4 py-3 text-left font-semibold">Hora término</th>
                        <th className="px-4 py-3 text-left font-semibold">Tempo total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {paginatedRegistros.map((registro) => (
                        <tr key={registro.id} className="hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3 text-foreground">{registro.dataFormatada}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.equipe ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.tipo_ocorrencia ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.local_ocorrencia ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.hora_acionamento ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.hora_chegada ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80">{registro.hora_termino ?? '—'}</td>
                          <td className="px-4 py-3 text-foreground/80 font-medium">{registro.tempo_total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={tabelaRegistros.length}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
