'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Secao } from '@/types/auth'
import { ChevronDown, Filter, X } from 'lucide-react'

interface SecaoFilterProps {
  selectedSecoes: string[]
  onSecaoChange: (secoes: string[]) => void
  showAllOption?: boolean
}

export default function SecaoFilter({ 
  selectedSecoes, 
  onSecaoChange, 
  showAllOption = true 
}: SecaoFilterProps) {
  const [secoes, setSecoes] = useState<Secao[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSecoes()
  }, [])

  const fetchSecoes = async () => {
    try {
      const { data, error } = await supabase
        .from('secoes')
        .select('*')
        .order('nome')

      if (error) throw error
      setSecoes(data || [])
    } catch (error) {
      console.error('Erro ao buscar seções:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSecaoToggle = (secaoId: string) => {
    if (selectedSecoes.includes(secaoId)) {
      onSecaoChange(selectedSecoes.filter(id => id !== secaoId))
    } else {
      onSecaoChange([...selectedSecoes, secaoId])
    }
  }

  const handleSelectAll = () => {
    if (selectedSecoes.length === secoes.length) {
      onSecaoChange([])
    } else {
      onSecaoChange(secoes.map(s => s.id))
    }
  }

  const clearFilters = () => {
    onSecaoChange([])
  }

  const getDisplayText = () => {
    if (selectedSecoes.length === 0) return 'Todas as Seções'
    if (selectedSecoes.length === 1) {
      const secao = secoes.find(s => s.id === selectedSecoes[0])
      return secao?.nome || 'Seção Selecionada'
    }
    return `${selectedSecoes.length} seções selecionadas`
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-500">Carregando seções...</span>
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
              <h3 className="text-sm font-semibold text-gray-900">Filtrar por Seção</h3>
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
                  {selectedSecoes.length === secoes.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </button>
              )}
              
              {selectedSecoes.length > 0 && (
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
            {secoes.map((secao) => (
              <label
                key={secao.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedSecoes.includes(secao.id)}
                  onChange={() => handleSecaoToggle(secao.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{secao.nome}</div>
                  {secao.localizacao && (
                    <div className="text-xs text-gray-500">{secao.localizacao}</div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {secoes.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              Nenhuma seção encontrada
            </div>
          )}
        </div>
      )}
    </div>
  )
}