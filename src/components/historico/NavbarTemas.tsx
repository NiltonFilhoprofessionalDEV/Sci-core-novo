'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Plane, 
  AlertTriangle, 
  Cloud, 
  FileText, 
  Clock, 
  Truck, 
  Timer, 
  Zap, 
  Shield, 
  RefreshCw, 
  CheckCircle, 
  Droplets, 
  Package, 
  Clipboard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface TemaInfo {
  id: string
  nome: string
  tabela: string
  icone: string
  descricao: string
}

interface NavbarTemasProps {
  temas: TemaInfo[]
  temaAtivo: string
  onTemaChange: (temaId: string) => void
  contadores: Record<string, number>
}

// Mapeamento de ícones Lucide React
const lucideIcons = {
  Plane,
  AlertTriangle,
  Cloud,
  FileText,
  Clock,
  Truck,
  Timer,
  Zap,
  Shield,
  RefreshCw,
  CheckCircle,
  Droplets,
  Package,
  Clipboard
}

export function NavbarTemas({ temas, temaAtivo, onTemaChange, contadores }: NavbarTemasProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Verificar se pode fazer scroll
  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }, [])

  useEffect(() => {
    checkScroll()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll)
      return () => scrollElement.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll])

  // Scroll para esquerda/direita
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 640 ? 200 : 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="bg-[#f3f4f6] border-b border-[#e5e7eb] shadow-sm sticky top-14 sm:top-16 z-30">
      {/* Container principal com botões de navegação externos */}
      <div className="relative">
        {/* Botão Scroll Esquerda - Posicionado fora da área principal */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 sm:p-2.5 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-[#e5e7eb]"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-[#1f1f1f]/80" />
          </button>
        )}

        {/* Botão Scroll Direita - Posicionado fora da área principal */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 sm:p-2.5 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-[#e5e7eb]"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-[#1f1f1f]/80" />
          </button>
        )}

        {/* Área principal do navbar com padding para os botões */}
        <div className="max-w-7xl mx-auto px-12 sm:px-16 lg:px-20">
          {/* Container dos Temas */}
          <div
            ref={scrollRef}
            className="flex overflow-x-auto scrollbar-hide py-4 sm:py-6 space-x-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {temas.map((tema) => {
              const IconComponent = lucideIcons[tema.icone as keyof typeof lucideIcons] || FileText
              const isActive = tema.id === temaAtivo
              const contador = contadores[tema.id] || 0

              // Definir classes de forma mais explícita com especificidade maior
              const baseClasses = 'flex items-center space-x-3 px-4 py-3 rounded-lg whitespace-nowrap min-w-fit transition-colors border-l-2'
              const activeClasses = '!text-white !bg-[#ff6600] !border-[#ff6600]'
              const inactiveClasses = '!text-black !bg-gray-200 hover:!text-black hover:!bg-gray-300 !border-transparent'
              
              const buttonClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`

              return (
                <button
                  key={tema.id}
                  onClick={() => onTemaChange(tema.id)}
                  className={buttonClasses}
                >
                  <IconComponent 
                    className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-black'
                    }`}
                  />
                  <span 
                    className={`text-sm font-medium transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-black'
                    }`}
                  >
                    {tema.nome}
                  </span>
                  {contador > 0 && (
                    <span 
                      className={`
                        px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300
                        ${isActive 
                          ? 'bg-white/20 text-white border border-white/30' 
                          : 'bg-white text-black border border-gray-400'
                        }
                      `}
                    >
                      {contador}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}