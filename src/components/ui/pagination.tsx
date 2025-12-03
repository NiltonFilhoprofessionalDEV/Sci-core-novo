'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage?: number
  totalItems?: number
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 10,
  totalItems
}: PaginationProps) {
  const startItem = totalItems ? (currentPage - 1) * itemsPerPage + 1 : 0
  const endItem = totalItems
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : 0

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Sempre mostrar primeira página
      pages.push(1)

      if (currentPage > 3) {
        pages.push('...')
      }

      // Mostrar páginas ao redor da atual
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...')
      }

      // Sempre mostrar última página
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t border-orange-100 bg-white px-6 py-4">
      <div className="flex items-center gap-2 text-sm text-[#1f1f1f]/60">
        {totalItems && (
          <span>
            Mostrando {startItem} a {endItem} de {totalItems} registros
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0 border-orange-200 text-[#1f1f1f] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1 text-sm text-[#1f1f1f]/40"
                >
                  ...
                </span>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={`h-9 min-w-9 px-3 text-sm border-orange-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#fb923c] to-[#f97316] text-white border-[#fb923c] hover:from-[#f97316] hover:to-[#ea580c]'
                    : 'text-[#1f1f1f] hover:bg-orange-50'
                }`}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0 border-orange-200 text-[#1f1f1f] hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}






