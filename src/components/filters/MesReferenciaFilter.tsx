'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, Calendar, X } from 'lucide-react'

interface MesReferenciaFilterProps {
  selectedMes: string | null
  onMesChange: (mes: string | null) => void
}

export default function MesReferenciaFilter({
  selectedMes,
  onMesChange
}: MesReferenciaFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Gerar os 12 meses do ano atual
  const mesesDisponiveis = useMemo(() => {
    const hoje = new Date()
    const anoAtual = hoje.getFullYear()
    const meses = []
    
    // Adicionar "Todos os meses" como primeira opção
    meses.push({
      valor: null,
      label: 'Todos os meses'
    })
    
    // Adicionar os 12 meses do ano atual (Janeiro a Dezembro)
    for (let mes = 1; mes <= 12; mes++) {
      const data = new Date(anoAtual, mes - 1, 1)
      const label = data.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).replace(/^\w/, c => c.toUpperCase())
      
      meses.push({
        valor: `${anoAtual}-${String(mes).padStart(2, '0')}`,
        label
      })
    }
    
    return meses
  }, [])

  const mesSelecionado = mesesDisponiveis.find(m => m.valor === selectedMes)

  const handleSelect = (valor: string | null) => {
    onMesChange(valor)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMesChange(null)
    setIsOpen(false)
  }

  return (
    <div className="relative flex-1 min-w-[220px]">
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        MÊS DE REFERÊNCIA
      </label>
      <div className="relative">
        <div className="w-full flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 bg-white border border-orange-200 rounded-lg shadow-sm hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-500 transition-all text-sm text-gray-900"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Calendar className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <span className="truncate">
                {mesSelecionado?.label || 'Todos os meses'}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {selectedMes && (
            <button
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg transition-colors border border-orange-200"
              aria-label="Limpar seleção"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-0 mt-1 w-full bg-white border border-orange-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              {mesesDisponiveis.map((mes) => (
                <button
                  key={mes.valor || 'todos'}
                  type="button"
                  onClick={() => handleSelect(mes.valor)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selectedMes === mes.valor
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mes.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

