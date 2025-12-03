'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
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
  ChevronRight,
  LucideIcon,
  Activity,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
const lucideIcons: Record<string, LucideIcon> = {
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
  Activity,
  Wrench
}

export function NavbarTemas({ temas, temaAtivo, onTemaChange, contadores }: NavbarTemasProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // Verifica a posição do scroll para mostrar/ocultar botões
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  // Scroll para a esquerda
  const scrollLeft = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  // Scroll para a direita
  const scrollRight = () => {
    const container = scrollContainerRef.current
    if (container) {
      container.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Verifica posição do scroll ao montar e ao redimensionar
  useEffect(() => {
    checkScrollPosition()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)
      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [checkScrollPosition])

  // Verifica novamente quando os temas mudam
  useEffect(() => {
    setTimeout(checkScrollPosition, 100)
  }, [temas, checkScrollPosition])

  return (
    <div className="w-full flex items-center justify-center mb-6 relative">
      {/* Botão esquerdo */}
      {showLeftButton && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 z-10 p-2 rounded-full bg-white border border-orange-200 backdrop-blur-lg shadow-lg hover:bg-orange-50 transition-colors"
          aria-label="Rolar para a esquerda"
        >
          <ChevronLeft className="w-5 h-5 text-orange-700" />
        </button>
      )}

      {/* Container de scroll */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-3 bg-white border border-orange-200 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg overflow-x-hidden max-w-full"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {temas.map((tema) => {
          const IconComponent = lucideIcons[tema.icone] || FileText
          const isActive = tema.id === temaAtivo
          const contador = contadores[tema.id] || 0

          return (
            <button
              key={tema.id}
              onClick={() => onTemaChange(tema.id)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2",
                "text-orange-700 hover:text-primary",
                isActive && "bg-primary text-white",
              )}
            >
              <IconComponent size={18} strokeWidth={2.5} />
              <span className="hidden md:inline">{tema.nome}</span>
              {contador > 0 && (
                <span 
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    isActive 
                      ? 'bg-white/20 text-white border border-white/30' 
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  )}
                >
                  {contador}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="lamp-historico"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </button>
          )
        })}
      </div>

      {/* Botão direito */}
      {showRightButton && (
        <button
          onClick={scrollRight}
          className="absolute right-0 z-10 p-2 rounded-full bg-white border border-orange-200 backdrop-blur-lg shadow-lg hover:bg-orange-50 transition-colors"
          aria-label="Rolar para a direita"
        >
          <ChevronRight className="w-5 h-5 text-orange-700" />
        </button>
      )}
    </div>
  )
}