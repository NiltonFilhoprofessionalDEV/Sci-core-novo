"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  activeTab?: string
}

export function NavBar({ items, className, activeTab: externalActiveTab }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(externalActiveTab || items[0].name)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftButton, setShowLeftButton] = useState(false)
  const [showRightButton, setShowRightButton] = useState(true)

  // Sincroniza o activeTab com o pathname ou com o prop externo
  useEffect(() => {
    if (externalActiveTab) {
      setActiveTab(externalActiveTab)
    } else {
      // Tenta encontrar o item ativo baseado no pathname
      const currentItem = items.find(item => {
        if (pathname === item.url) return true
        if (pathname.startsWith(item.url) && item.url !== '/dashboard') return true
        return false
      })
      if (currentItem) {
        setActiveTab(currentItem.name)
      }
    }
  }, [pathname, externalActiveTab, items])

  // Verifica a posição do scroll para mostrar/ocultar botões
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftButton(scrollLeft > 0)
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 1)
  }

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
  }, [])

  // Verifica novamente quando os itens mudam
  useEffect(() => {
    setTimeout(checkScrollPosition, 100)
  }, [items])

  return (
    <div
      className={cn(
        "w-full flex items-center justify-center mb-6 relative",
        className,
      )}
    >
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
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors whitespace-nowrap flex-shrink-0",
                "text-orange-700 hover:text-primary",
                isActive && "bg-primary text-white",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
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
            </Link>
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

