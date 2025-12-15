'use client'

import { useIndicatorQuery } from '@/hooks/queries/useIndicatorQuery'
import { VirtualTable } from '@/components/ui/VirtualTable'
import { useState } from 'react'

interface DashboardContentProps {
  initialData?: any
  secaoId?: string
  equipeId?: string
}

/**
 * Componente client-side que usa React Query
 * Recebe dados iniciais do Server Component para renderização instantânea
 */
export function DashboardContent({ initialData, secaoId, equipeId }: DashboardContentProps) {
  const [page, setPage] = useState(1)
  
  const { data, isLoading, error } = useIndicatorQuery('ocorrencias-aeronauticas', {
    secaoId,
    equipeId,
    page,
    limit: 50,
  })

  // Usar dados iniciais se disponíveis e não houver dados do React Query ainda
  const displayData = data?.data || initialData?.data || []

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        Erro ao carregar dados: {error.message}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ocorrências Aeronáuticas</h2>
        {isLoading && <span className="text-sm text-gray-500">Carregando...</span>}
      </div>

      <VirtualTable
        data={displayData}
        columns={[
          {
            key: 'data_ocorrencia',
            header: 'Data',
            render: (item) => new Date(item.data_ocorrencia).toLocaleDateString('pt-BR'),
          },
          {
            key: 'tipo',
            header: 'Tipo',
            render: (item) => item.tipo || '-',
          },
          {
            key: 'descricao',
            header: 'Descrição',
            render: (item) => item.descricao || '-',
          },
        ]}
        height="600px"
        rowHeight={60}
      />

      {data?.pagination && (
        <div className="flex justify-between items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

