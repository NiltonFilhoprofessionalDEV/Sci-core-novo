'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  width?: string
}

interface VirtualTableProps<T> {
  data: T[]
  columns: Column<T>[]
  height?: string
  rowHeight?: number
  overscan?: number
  emptyMessage?: string
  className?: string
}

/**
 * Componente de tabela virtualizada
 * Renderiza apenas as linhas visíveis, melhorando performance para grandes datasets
 * 
 * @example
 * <VirtualTable
 *   data={registros}
 *   columns={[
 *     { key: 'id', header: 'ID', render: (item) => item.id },
 *     { key: 'nome', header: 'Nome', render: (item) => item.nome },
 *   ]}
 *   height="600px"
 * />
 */
export function VirtualTable<T>({
  data,
  columns,
  height = '600px',
  rowHeight = 50,
  overscan = 5,
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}: VirtualTableProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  })

  const items = virtualizer.getVirtualItems()

  if (data.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div ref={parentRef} className={`overflow-auto ${className}`} style={{ height }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex min-w-full">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              style={{ width: column.width || `${100 / columns.length}%` }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Body */}
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {items.map((virtualRow) => {
          const item = data[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="flex items-center h-full">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100"
                    style={{ width: column.width || `${100 / columns.length}%` }}
                  >
                    {column.render(item)}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

