'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Salva o elemento que tinha foco antes do modal abrir
      previousFocusRef.current = document.activeElement as HTMLElement
      
      // Desabilita scroll do body
      document.body.style.overflow = 'hidden'
      
      // Foca no modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 100)
    } else {
      // Restaura scroll do body
      document.body.style.overflow = 'unset'
      
      // Retorna foco para o elemento anterior
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleTabKey)
    }

    return () => {
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay com gradiente e backdrop-blur aprimorado */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br from-[#7a5b3e]/80 via-black/70 to-[#cdbdae]/60 
          backdrop-blur-lg transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Container - Redesenhado com paleta do sistema */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`
          relative w-full max-w-6xl max-h-[95vh] 
          bg-white
          shadow-2xl rounded-2xl overflow-hidden border border-[#cdbdae]/20
          transform transition-all duration-300 ease-out
          ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          flex flex-col backdrop-blur-sm
        `}
        style={{
          minHeight: '300px',
          boxShadow: '0 25px 50px -12px rgba(122, 91, 62, 0.25), 0 10px 25px -5px rgba(250, 75, 0, 0.1), 0 0 0 1px rgba(205, 189, 174, 0.1)'
        }}
      >
        {/* Header - Com gradiente sutil da paleta do sistema */}
        <div className="flex items-center justify-between p-6 border-b border-[#cdbdae]/30 bg-gradient-to-r from-[#cdbdae]/10 to-transparent flex-shrink-0">
          <div className="flex-1">
            <h2 
              id="modal-title"
              className="text-2xl font-semibold text-[#7a5b3e] leading-tight tracking-tight"
            >
              {title}
            </h2>
            {title === 'Ocorrências Aeronáuticas' && (
              <div className="mt-2">
                <p className="text-sm font-medium text-amber-600 leading-relaxed">
                  ⚠️ Realizar o preenchimento sempre que houver ocorrência.
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className={`
              p-3 hover:bg-primary/10 rounded-xl border border-transparent
              hover:border-primary/20 transition-all duration-200 ease-out
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
              hover:scale-105 active:scale-95 group
            `}
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-[#7a5b3e] group-hover:text-primary transition-colors duration-200" />
          </button>
        </div>

        {/* Content Area - Com scroll personalizado e espaçamento otimizado */}
        <div 
          className={`
            flex-1 overflow-y-auto overflow-x-hidden
            scrollbar-thin scrollbar-thumb-[#cdbdae] scrollbar-track-[#cdbdae]/20
            hover:scrollbar-thumb-[#7a5b3e]
          `}
          style={{
            padding: '24px',
            minHeight: '200px'
          }}
        >
          <div className="w-full h-full">
            {children || (
              <div className="flex items-center justify-center h-full min-h-[300px]">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#cdbdae]/20 to-[#7a5b3e]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-[#cdbdae]/30">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-[#7a5b3e]/20 rounded-xl"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-[#7a5b3e] mb-3 tracking-tight">
                    Conteúdo em desenvolvimento
                  </h3>
                  <p className="text-[#7a5b3e]/70 text-base leading-relaxed">
                    O formulário para este tema será implementado em breve.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS personalizado para scrollbar e animações aprimoradas */}
      <style jsx global>{`
        /* Scrollbar personalizada com paleta do sistema */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-thumb-\\[\\#cdbdae\\]::-webkit-scrollbar-thumb {
          background-color: #cdbdae;
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        
        .scrollbar-track-\\[\\#cdbdae\\]\\/20::-webkit-scrollbar-track {
          background-color: rgba(205, 189, 174, 0.2);
          border-radius: 8px;
        }
        
        .hover\\:scrollbar-thumb-\\[\\#7a5b3e\\]:hover::-webkit-scrollbar-thumb {
          background-color: #7a5b3e;
        }
        
        ::-webkit-scrollbar {
          width: 10px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(205, 189, 174, 0.2);
          border-radius: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cdbdae;
          border-radius: 8px;
          border: 2px solid transparent;
          background-clip: padding-box;
          transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #7a5b3e;
          transform: scale(1.1);
        }

        /* Animações aprimoradas para o modal */
        @keyframes modalFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px) rotateX(10deg);
            filter: blur(4px);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95) translateY(10px) rotateX(5deg);
            filter: blur(2px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0deg);
            filter: blur(0px);
          }
        }

        @keyframes modalFadeOut {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0deg);
            filter: blur(0px);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95) translateY(-10px) rotateX(-5deg);
            filter: blur(2px);
          }
          100% {
            opacity: 0;
            transform: scale(0.9) translateY(-20px) rotateX(-10deg);
            filter: blur(4px);
          }
        }

        /* Animação de entrada suave para overlay */
        @keyframes overlayFadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(12px);
          }
        }

        /* Garantir contraste adequado com paleta do sistema */
        .modal-content * {
          color: #7a5b3e !important;
        }

        .modal-content h1, .modal-content h2, .modal-content h3 {
          color: #7a5b3e !important;
          font-weight: 600;
        }

        /* Melhorar contraste para elementos interativos */
        .modal-content input,
        .modal-content select,
        .modal-content textarea {
          color: #000000 !important;
          border-color: #d1d5db;
        }

        .modal-content input:focus,
        .modal-content select:focus,
        .modal-content textarea:focus {
          border-color: #f97316;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        /* Responsividade aprimorada */
        @media (max-width: 768px) {
          .modal-container {
            margin: 8px;
            max-height: calc(100vh - 16px);
          }
        }

        @media (max-width: 640px) {
          .modal-container {
            margin: 4px;
            max-height: calc(100vh - 8px);
          }
        }
      `}</style>
    </div>
  )
}