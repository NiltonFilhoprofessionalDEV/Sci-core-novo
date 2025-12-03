'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Secao } from '@/types/auth'
import { ChevronDown, Filter, X } from 'lucide-react'

interface BaseFilterProps {
  selectedBase: string | null
  onBaseChange: (baseId: string | null) => void
}

export default function BaseFilter({ 
  selectedBase, 
  onBaseChange
}: BaseFilterProps) {
  const [bases, setBases] = useState<Secao[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBases()
  }, [])

  const fetchBases = async () => {
    try {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .order('nome')

      if (error) throw error
      setBases(data || [])
    } catch (error) {
      console.error('Erro ao buscar bases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBaseSelect = (baseId: string) => {
    if (selectedBase === baseId) {
      onBaseChange(null)
    } else {
      onBaseChange(baseId)
    }
    setIsOpen(false)
  }

  const clearFilter = () => {
    onBaseChange(null)
    setIsOpen(false)
  }

  const getDisplayText = () => {
    if (!selectedBase) return 'Selecionar Base'
    const base = bases.find(b => b.id === selectedBase)
    return base?.nome || 'Base Selecionada'
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Carregando bases...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {getDisplayText()}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Filtrar por Base</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            {selectedBase && (
              <button
                onClick={clearFilter}
                className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Limpar Filtro
              </button>
            )}
          </div>

          <div className="p-2">
            {bases.map((base) => (
              <button
                key={base.id}
                onClick={() => handleBaseSelect(base.id)}
                className={`w-full text-left flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer ${
                  selectedBase === base.id ? 'bg-blue-50 border border-blue-200' : ''
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedBase === base.id 
                    ? 'border-blue-600 bg-blue-600' 
                    : 'border-gray-300'
                }`}>
                  {selectedBase === base.id && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{base.nome}</div>
                  {base.localizacao && (
                    <div className="text-xs text-gray-500">{base.localizacao}</div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {bases.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhuma base encontrada
            </div>
          )}
        </div>
      )}
    </div>
  )
}


