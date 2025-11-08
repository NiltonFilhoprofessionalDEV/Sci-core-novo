'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, RotateCcw } from 'lucide-react'
import { FiltrosState } from './HistoricoIndicadores'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface FiltrosHistoricoProps {
  filtros: FiltrosState
  onFiltrosChange: (filtros: FiltrosState) => void
  onLimparFiltros: () => void
}

interface Equipe {
  id: string
  nome: string
  nome_cidade: string
}

export function FiltrosHistorico({
  filtros,
  onFiltrosChange,
  onLimparFiltros
}: FiltrosHistoricoProps) {
  const { user } = useAuth()
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loadingEquipes, setLoadingEquipes] = useState(true)

  // Carregar equipes
  useEffect(() => {
    async function carregarEquipes() {
      if (!user?.profile?.secao_id) {
        setEquipes([])
        setLoadingEquipes(false)
        return
      }

      try {
        setLoadingEquipes(true)
        
        const { data, error } = await supabase
          .from('equipes')
          .select('id, nome, nome_cidade')
          .eq('secao_id', user.profile.secao_id)
          .order('nome_cidade', { ascending: true })
          .order('nome', { ascending: true })

        if (error) {
          console.error('Erro ao carregar equipes:', error)
          return
        }

        setEquipes(data || [])
      } catch (error) {
        console.error('Erro ao carregar equipes:', error)
      } finally {
        setLoadingEquipes(false)
      }
    }

    carregarEquipes()
  }, [user])

  // Gerar opções de mês/ano para os últimos 24 meses
  const gerarOpcoesMessAno = () => {
    const opcoes = []
    const hoje = new Date()
    
    for (let i = 0; i < 24; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
      const ano = data.getFullYear()
      const mes = data.getMonth() + 1
      const mesFormatado = mes.toString().padStart(2, '0')
      
      opcoes.push({
        valor: `${ano}-${mesFormatado}`,
        label: data.toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        }).replace(/^\w/, c => c.toUpperCase())
      })
    }
    
    return opcoes
  }

  const opcoesMessAno = gerarOpcoesMessAno()

  // Atualizar filtros
  const handleFiltroChange = (campo: keyof FiltrosState, valor: string) => {
    const novosFiltros = { ...filtros, [campo]: valor }
    onFiltrosChange(novosFiltros)
  }

  // Verificar se há filtros ativos
  const temFiltrosAtivos = Object.values(filtros).some(valor => valor !== '')

  const formatarDataFiltro = (valor: string) => {
    if (!valor) return ''
    const data = new Date(`${valor}T00:00:00`)
    return data.toLocaleDateString('pt-BR')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center space-x-1.5 sm:space-x-2">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
            <span className="hidden sm:inline">Filtros de Busca</span>
            <span className="sm:hidden">Filtros</span>
          </h3>
          
          {temFiltrosAtivos && (
            <button
              onClick={onLimparFiltros}
              className="flex items-center space-x-1 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Grid de Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Filtro Data Início */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Data Início
            </label>
            <input
              type="date"
              value={filtros.dataInicio}
              onChange={(e) => handleFiltroChange('dataInicio', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Filtro Data Fim */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Data Fim
            </label>
            <input
              type="date"
              value={filtros.dataFim}
              onChange={(e) => handleFiltroChange('dataFim', e.target.value)}
              min={filtros.dataInicio || undefined}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Filtro Equipe */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2 flex items-center space-x-1">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Equipe</span>
            </label>
            <select
              value={filtros.equipeId}
              onChange={(e) => handleFiltroChange('equipeId', e.target.value)}
              disabled={loadingEquipes}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">Todas as equipes</option>
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id}>
                  {equipe.nome_cidade} - {equipe.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Mês/Ano */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
              Período
            </label>
            <select
              value={filtros.mesAno}
              onChange={(e) => handleFiltroChange('mesAno', e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Todos os períodos</option>
              {opcoesMessAno.map((opcao) => (
                <option key={opcao.valor} value={opcao.valor}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo dos Filtros Ativos */}
        {temFiltrosAtivos && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Filtros Ativos:</h4>
            <div className="flex flex-wrap gap-2">
              {filtros.dataInicio && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Início: {formatarDataFiltro(filtros.dataInicio)}
                </span>
              )}
              {filtros.dataFim && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Fim: {formatarDataFiltro(filtros.dataFim)}
                </span>
              )}
              {filtros.equipeId && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Equipe: {equipes.find(e => e.id === filtros.equipeId)?.nome || 'Selecionada'}
                </span>
              )}
              {filtros.mesAno && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Período: {opcoesMessAno.find(o => o.valor === filtros.mesAno)?.label || filtros.mesAno}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}