'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'

interface VirtualListProps<T> {
  data: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  height?: string
  itemHeight?: number
  overscan?: number
  emptyMessage?: string
  className?: string
}

/**
 * Componente de lista virtualizada
 * Renderiza apenas os itens visíveis, melhorando performance para grandes listas
 * 
 * @example
 * <VirtualList
 *   data={items}
 *   renderItem={(item) => <div>{item.name}</div>}
 *   height="400px"
 *   itemHeight={60}
 * />
 */
export function VirtualList<T>({
  data,
  renderItem,
  height = '600px',
  itemHeight = 60,
  overscan = 5,
  emptyMessage = 'Nenhum item encontrado',
  className = '',
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
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
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {items.map((virtualRow) => {
          const item = data[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              className="absolute top-0 left-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

