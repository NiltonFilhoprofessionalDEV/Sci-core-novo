'use client'

import { useState } from 'react'
import { Calendar, X } from 'lucide-react'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onDateChange: (startDate: string, endDate: string) => void
  label?: string
}

export default function DateRangeFilter({ 
  startDate, 
  endDate, 
  onDateChange,
  label = "Período" 
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateChange = (date: string) => {
    onDateChange(date, endDate)
  }

  const handleEndDateChange = (date: string) => {
    onDateChange(startDate, date)
  }

  const clearDates = () => {
    onDateChange('', '')
  }

  // Função helper para formatar data sem problemas de timezone
  const formatDateLocal = (dateString: string): string => {
    if (!dateString) return ''
    // Parse a string YYYY-MM-DD e cria a data no fuso horário local
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month é 0-indexed
    return date.toLocaleDateString('pt-BR')
  }

  const getDisplayText = () => {
    if (!startDate && !endDate) return 'Selecionar período'
    if (startDate && endDate) {
      const start = formatDateLocal(startDate)
      const end = formatDateLocal(endDate)
      return `${start} - ${end}`
    }
    if (startDate) {
      return `A partir de ${formatDateLocal(startDate)}`
    }
    if (endDate) {
      return `Até ${formatDateLocal(endDate)}`
    }
    return 'Selecionar período'
  }

  const getPresetRanges = () => {
    const today = new Date()
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    const currentYear = new Date(today.getFullYear(), 0, 1)
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    return [
      {
        label: 'Últimos 7 dias',
        start: last7Days.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Últimos 30 dias',
        start: last30Days.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Mês atual',
        start: currentMonth.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      {
        label: 'Mês passado',
        start: lastMonth.toISOString().split('T')[0],
        end: lastMonthEnd.toISOString().split('T')[0]
      },
      {
        label: 'Ano atual',
        start: currentYear.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    ]
  }

  const applyPreset = (start: string, end: string) => {
    onDateChange(start, end)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 border border-input rounded-lg bg-background hover:bg-accent transition-colors min-w-[200px]"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {getDisplayText()}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded text-sm focus:ring-2 focus:ring-ring focus:border-ring"
                />
              </div>

              {(startDate || endDate) && (
                <button
                  onClick={clearDates}
                  className="w-full px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Limpar Datas
                </button>
              )}
            </div>
          </div>

          <div className="p-3">
            <h4 className="text-xs font-medium text-gray-700 mb-2">Períodos Rápidos</h4>
            <div className="space-y-1">
              {getPresetRanges().map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset.start, preset.end)}
                  className="w-full text-left px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}