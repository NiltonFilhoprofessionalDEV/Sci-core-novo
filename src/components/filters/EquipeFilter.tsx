'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Equipe } from '@/types/auth'
import { ChevronDown, Users, X } from 'lucide-react'

interface EquipeFilterProps {
  selectedEquipes: string[]
  onEquipeChange: (equipes: string[]) => void
  secaoId?: string
  showAllOption?: boolean
}

export default function EquipeFilter({ 
  selectedEquipes, 
  onEquipeChange, 
  secaoId,
  showAllOption = true 
}: EquipeFilterProps) {
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEquipes()
  }, [secaoId])

  const fetchEquipes = async () => {
    try {
      let query = supabase
        .from('equipes')
        .select(`
          *,
          secoes (
            id,
            nome
          )
        `)
        .order('nome')

      if (secaoId) {
        query = query.eq('secao_id', secaoId)
      }

      const { data, error } = await query

      if (error) throw error
      setEquipes(data || [])
    } catch (error) {
      console.error('Erro ao buscar equipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEquipeToggle = (equipeId: string) => {
    if (selectedEquipes.includes(equipeId)) {
      onEquipeChange(selectedEquipes.filter(id => id !== equipeId))
    } else {
      onEquipeChange([...selectedEquipes, equipeId])
    }
  }

  const handleSelectAll = () => {
    if (selectedEquipes.length === equipes.length) {
      onEquipeChange([])
    } else {
      onEquipeChange(equipes.map(e => e.id))
    }
  }

  const clearFilters = () => {
    onEquipeChange([])
  }

  const getDisplayText = () => {
    if (selectedEquipes.length === 0) return 'Todas as Equipes'
    if (selectedEquipes.length === 1) {
      const equipe = equipes.find(e => e.id === selectedEquipes[0])
      return equipe?.nome || 'Equipe Selecionada'
    }
    return `${selectedEquipes.length} equipes selecionadas`
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Carregando equipes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent transition-colors min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Filtrar por Equipe</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex gap-2">
              {showAllOption && (
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                >
                  {selectedEquipes.length === equipes.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </button>
              )}
              
              {selectedEquipes.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          <div className="p-2">
            {equipes.map((equipe) => (
              <label
                key={equipe.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedEquipes.includes(equipe.id)}
                  onChange={() => handleEquipeToggle(equipe.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{equipe.nome}</div>
                  {equipe.secoes && (
                    <div className="text-xs text-gray-500">Seção: {equipe.secoes.nome}</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {equipes.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              {secaoId ? 'Nenhuma equipe encontrada nesta seção' : 'Nenhuma equipe encontrada'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}