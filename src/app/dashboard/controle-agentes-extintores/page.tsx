'use client'

import { useEffect, useMemo, useState, useRef } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

import { useAuth } from '@/hooks/useAuth'
import { useDashboardData } from '@/hooks/useDashboardData'
import { Pagination } from '@/components/ui/pagination'
import BaseFilter from '@/components/filters/BaseFilter'
import EquipeFilter from '@/components/filters/EquipeFilter'
import MesReferenciaFilter from '@/components/filters/MesReferenciaFilter'

interface AgenteExtintorRegistro {
  id: string
  nome_cidade: string | null
  equipe: string | null
  data_referencia: string | null
  nome_completo: string | null
  quantidade_estoque_po_quimico: number | null
  quantidade_estoque_lge: number | null
  quantidade_estoque_nitrogenio: number | null
  quantidade_exigida_po_quimico: number | null
  quantidade_exigida_lge: number | null
  quantidade_exigida_nitrogenio: number | null
  observacoes: string | null
}

const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const donutColors = ['#fb923c', '#f97316', '#ea580c', '#c2410c']

export default function ControleAgentesExtintoresDashboard() {
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
  const secaoIdParaEquipes: string | undefined = isGestorPOP
    ? (selectedBase ?? undefined)
    : (isBace || isGerenteSecao)
      ? (user?.profile?.secao_id ?? user?.profile?.secao?.id ?? undefined)
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
        query = query.gte('data_referencia', startDate)
        query = query.lte('data_referencia', endDate)
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
  } = useDashboardData<AgenteExtintorRegistro>({
    tableName: 'controle_agentes_extintores',
    selectFields: '*',
    orderBy: { column: 'data_referencia', ascending: false },
    limit: 1000,
    cacheKey: `controle-agentes-extintores-${selectedBase || 'all'}-${selectedEquipes.join(',')}-${selectedMes || 'all'}`,
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

  const totalRegistros = registros.length

  // Estoque vs Exigido por tipo
  const estoqueVsExigido = useMemo(() => {
    const poQuimico = registros.reduce(
      (acc, r) => ({
        estoque: acc.estoque + (r.quantidade_estoque_po_quimico ?? 0),
        exigido: acc.exigido + (r.quantidade_exigida_po_quimico ?? 0)
      }),
      { estoque: 0, exigido: 0 }
    )
    const lge = registros.reduce(
      (acc, r) => ({
        estoque: acc.estoque + (r.quantidade_estoque_lge ?? 0),
        exigido: acc.exigido + (r.quantidade_exigida_lge ?? 0)
      }),
      { estoque: 0, exigido: 0 }
    )
    const nitrogenio = registros.reduce(
      (acc, r) => ({
        estoque: acc.estoque + (r.quantidade_estoque_nitrogenio ?? 0),
        exigido: acc.exigido + (r.quantidade_exigida_nitrogenio ?? 0)
      }),
      { estoque: 0, exigido: 0 }
    )

    return [
      { tipo: 'Pó Químico', estoque: poQuimico.estoque, exigido: poQuimico.exigido, percentual: poQuimico.exigido > 0 ? (poQuimico.estoque / poQuimico.exigido) * 100 : 0 },
      { tipo: 'LGE', estoque: lge.estoque, exigido: lge.exigido, percentual: lge.exigido > 0 ? (lge.estoque / lge.exigido) * 100 : 0 },
      { tipo: 'Nitrogênio', estoque: nitrogenio.estoque, exigido: nitrogenio.exigido, percentual: nitrogenio.exigido > 0 ? (nitrogenio.estoque / nitrogenio.exigido) * 100 : 0 }
    ]
  }, [registros])

  // Por equipe
  const porEquipe = useMemo(() => {
    const map = new Map<string, { estoque: number; exigido: number; count: number }>()
    registros.forEach((r) => {
      const equipe = r.equipe || 'Sem equipe'
      if (!map.has(equipe)) {
        map.set(equipe, { estoque: 0, exigido: 0, count: 0 })
      }
      const entry = map.get(equipe)!
      entry.estoque += (r.quantidade_estoque_po_quimico ?? 0) + (r.quantidade_estoque_lge ?? 0) + (r.quantidade_estoque_nitrogenio ?? 0)
      entry.exigido += (r.quantidade_exigida_po_quimico ?? 0) + (r.quantidade_exigida_lge ?? 0) + (r.quantidade_exigida_nitrogenio ?? 0)
      entry.count += 1
    })
    return Array.from(map.entries())
      .map(([equipe, { estoque, exigido }]) => ({
        equipe,
        estoque: Number(estoque.toFixed(2)),
        exigido: Number(exigido.toFixed(2)),
        percentual: exigido > 0 ? Number(((estoque / exigido) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.estoque - a.estoque)
  }, [registros])

  // Por mês
  const porMes = useMemo(() => {
    const map = new Map<string, { estoque: number; exigido: number; count: number }>()
    registros.forEach((r) => {
      if (!r.data_referencia) return
      const date = new Date(`${r.data_referencia}T00:00:00`)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) {
        map.set(key, { estoque: 0, exigido: 0, count: 0 })
      }
      const entry = map.get(key)!
      entry.estoque += (r.quantidade_estoque_po_quimico ?? 0) + (r.quantidade_estoque_lge ?? 0) + (r.quantidade_estoque_nitrogenio ?? 0)
      entry.exigido += (r.quantidade_exigida_po_quimico ?? 0) + (r.quantidade_exigida_lge ?? 0) + (r.quantidade_exigida_nitrogenio ?? 0)
      entry.count += 1
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { estoque, exigido }]) => {
        const date = new Date(`${key.split('-')[0]}-${key.split('-')[1]}-01T00:00:00`)
        return {
          mes: monthFormatter.format(date),
          estoque: Number(estoque.toFixed(2)),
          exigido: Number(exigido.toFixed(2))
        }
      })
  }, [registros])

  // Status de conformidade
  const statusConformidade = useMemo(() => {
    let conforme = 0
    let abaixo = 0
    registros.forEach((r) => {
      const poOk = (r.quantidade_estoque_po_quimico ?? 0) >= (r.quantidade_exigida_po_quimico ?? 0)
      const lgeOk = (r.quantidade_estoque_lge ?? 0) >= (r.quantidade_exigida_lge ?? 0)
      const nitOk = (r.quantidade_estoque_nitrogenio ?? 0) >= (r.quantidade_exigida_nitrogenio ?? 0)
      if (poOk && lgeOk && nitOk) {
        conforme += 1
      } else {
        abaixo += 1
      }
    })
    return [
      { name: 'Conforme', value: conforme },
      { name: 'Abaixo do exigido', value: abaixo }
    ]
  }, [registros])

  const tabelaRegistros = useMemo(() => {
    return registros.map((registro) => ({
      ...registro,
      dataFormatada: registro.data_referencia
        ? dateFormatter.format(new Date(`${registro.data_referencia}T00:00:00`))
        : '—'
    }))
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
        <h2 className="text-2xl font-bold text-[#1f1f1f]">Controle de Agentes Extintores</h2>
        <p className="text-sm text-[#1f1f1f]/70 mt-1">
          Monitoramento de estoque e conformidade dos agentes extintores por equipe.
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
          Carregando dados...
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      ) : totalRegistros === 0 ? (
        <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center text-[#7a5b3e]">
          <p className="text-lg font-semibold text-primary">Ainda não há registros de controle de agentes extintores.</p>
          <p className="mt-2 text-sm">Assim que novos registros forem adicionados, os gráficos e indicadores serão exibidos aqui.</p>
        </div>
      ) : (
        <>
          {/* Cards no topo - Laranja */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Total de registros</p>
              <p className="mt-2 text-4xl font-black">{totalRegistros}</p>
              <p className="mt-1 text-xs text-white/80">Controles registrados</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Pó Químico</p>
              <p className="mt-2 text-4xl font-black">{estoqueVsExigido[0]?.estoque.toFixed(1) ?? 0} kg</p>
              <p className="mt-1 text-xs text-white/80">Estoque atual</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">LGE</p>
              <p className="mt-2 text-4xl font-black">{estoqueVsExigido[1]?.estoque.toFixed(1) ?? 0} L</p>
              <p className="mt-1 text-xs text-white/80">Estoque atual</p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-[#fb923c] to-[#f97316] p-6 text-white shadow-lg">
              <p className="text-sm font-medium uppercase tracking-wide text-white/90">Nitrogênio</p>
              <p className="mt-2 text-4xl font-black">{estoqueVsExigido[2]?.estoque.toFixed(0) ?? 0}</p>
              <p className="mt-1 text-xs text-white/80">Unidades em estoque</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2 rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Estoque vs Exigido por Tipo</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Comparação entre estoque atual e quantidade exigida</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={estoqueVsExigido}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="tipo" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
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
                    />
                    <Legend wrapperStyle={{ color: '#1f1f1f' }} />
                    <Bar dataKey="estoque" fill="#fb923c" radius={[8, 8, 0, 0]} name="Estoque" />
                    <Bar dataKey="exigido" fill="#f97316" radius={[8, 8, 0, 0]} name="Exigido" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-[#1f1f1f]/60 mb-4">Status de Conformidade</h3>
                <div className="h-48">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={statusConformidade} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {statusConformidade.map((entry, index) => (
                          <Cell key={entry.name} fill={donutColors[index % donutColors.length]} />
                        ))}
                      </Pie>
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
                      <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 12, color: '#1f1f1f' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Estoque por Equipe</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Total de estoque por equipe</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <BarChart data={porEquipe} layout="vertical" margin={{ top: 10, right: 30, left: 80, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis type="number" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis dataKey="equipe" type="category" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} width={100} />
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
                    <Bar dataKey="estoque" fill="#fb923c" barSize={18} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#1f1f1f]">Evolução Mensal</h3>
                  <p className="text-xs text-[#1f1f1f]/60">Histórico de estoque e exigido</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer>
                  <AreaChart data={porMes}>
                    <defs>
                      <linearGradient id="estoqueEvolucao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fb923c" stopOpacity={0.7} />
                        <stop offset="30%" stopColor="#f97316" stopOpacity={0.5} />
                        <stop offset="60%" stopColor="#ea580c" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#c2410c" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" strokeOpacity={0.3} />
                    <XAxis dataKey="mes" stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <YAxis stroke="#1f1f1f" tick={{ fontSize: 12, fill: '#1f1f1f' }} />
                    <Tooltip 
                      cursor={{ stroke: '#fb923c', strokeWidth: 2 }}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: 12,
                        border: '1px solid #fb923c',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                        color: '#1f1f1f'
                      }}
                      labelStyle={{ color: '#1f1f1f', fontWeight: 600 }}
                    />
                    <Legend wrapperStyle={{ color: '#1f1f1f' }} />
                    <Area type="monotone" dataKey="estoque" stroke="#fb923c" strokeWidth={3} fill="url(#estoqueEvolucao)" name="Estoque" />
                    <Area type="monotone" dataKey="exigido" stroke="#f97316" strokeWidth={3} fill="url(#estoqueEvolucao)" name="Exigido" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tabela de detalhamento */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-6 py-4 bg-muted/30">
              <h3 className="text-lg font-semibold text-foreground">Detalhamento dos Controles</h3>
              <p className="text-xs text-muted-foreground">Registros ordenados do mais recente para o mais antigo</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted text-xs uppercase tracking-wide text-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Data</th>
                    <th className="px-4 py-3 text-left font-semibold">Equipe</th>
                    <th className="px-4 py-3 text-left font-semibold">Base</th>
                    <th className="px-4 py-3 text-left font-semibold">Pó Químico</th>
                    <th className="px-4 py-3 text-left font-semibold">LGE</th>
                    <th className="px-4 py-3 text-left font-semibold">Nitrogênio</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {paginatedRegistros.map((registro, index) => {
                    const poOk = (registro.quantidade_estoque_po_quimico ?? 0) >= (registro.quantidade_exigida_po_quimico ?? 0)
                    const lgeOk = (registro.quantidade_estoque_lge ?? 0) >= (registro.quantidade_exigida_lge ?? 0)
                    const nitOk = (registro.quantidade_estoque_nitrogenio ?? 0) >= (registro.quantidade_exigida_nitrogenio ?? 0)
                    const conforme = poOk && lgeOk && nitOk
                    
                    return (
                      <tr key={`${registro.id}-${index}`} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 text-foreground font-medium">{registro.dataFormatada}</td>
                        <td className="px-4 py-3 text-foreground/80">{registro.equipe ?? '—'}</td>
                        <td className="px-4 py-3 text-foreground/80">{registro.nome_cidade ?? '—'}</td>
                        <td className="px-4 py-3 text-foreground/80">
                          {registro.quantidade_estoque_po_quimico?.toFixed(1) ?? '—'} / {registro.quantidade_exigida_po_quimico?.toFixed(1) ?? '—'} kg
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {registro.quantidade_estoque_lge?.toFixed(1) ?? '—'} / {registro.quantidade_exigida_lge?.toFixed(1) ?? '—'} L
                        </td>
                        <td className="px-4 py-3 text-foreground/80">
                          {registro.quantidade_estoque_nitrogenio ?? '—'} / {registro.quantidade_exigida_nitrogenio ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                              conforme
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {conforme ? 'Conforme' : 'Abaixo'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
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
    </div>
  )
}
