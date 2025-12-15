'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
  showProgress?: boolean
}

export function LoadingScreen({ 
  message = 'Carregando seus dados...', 
  showProgress = false 
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!showProgress) return

    // Simular progresso suave
    const interval = setInterval(() => {
      setProgress(prev => {
        // Acelera no início, desacelera no final
        if (prev < 60) return prev + 2
        if (prev < 90) return prev + 0.5
        return prev + 0.1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [showProgress])

  return (
    <div className="fixed inset-0 bg-linear-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center z-50">
      {/* Efeito de fundo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-orange-100/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-orange-100/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Conteúdo central */}
      <div className="relative z-10 text-center px-4">
        {/* Logo/Ícone animado */}
        <div className="mb-8 relative">
          {/* Círculos de fundo animados */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-orange-200/30 rounded-full animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-orange-300/40 rounded-full animate-pulse" />
          </div>
          
          {/* Ícone principal */}
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-xl shadow-orange-500/30 animate-bounce">
              <Flame className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Texto */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            SCI Core
          </h2>
          <p className="text-gray-600 animate-pulse">
            {message}
          </p>
        </div>

        {/* Barra de progresso */}
        {showProgress && (
          <div className="w-80 max-w-full mx-auto">
            {/* Container da barra */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              {/* Barra de progresso animada */}
              <div 
                className="absolute inset-y-0 left-0 bg-linear-to-r from-orange-500 via-orange-600 to-orange-500 rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${Math.min(progress, 95)}%`,
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}
              >
                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
              
              {/* Efeito de pulsação na ponta */}
              <div 
                className="absolute inset-y-0 w-8 bg-linear-to-r from-transparent to-orange-400/50 blur-sm transition-all duration-300"
                style={{ left: `${Math.min(progress, 95)}%` }}
              />
            </div>

            {/* Porcentagem (opcional) */}
            <div className="mt-2 text-sm text-gray-500 font-medium">
              {Math.round(Math.min(progress, 95))}%
            </div>
          </div>
        )}

        {/* Pontos animados (fallback se não mostrar progresso) */}
        {!showProgress && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>

      {/* CSS inline para animação de shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}

// Componente mais simples para loadings dentro de páginas (não fullscreen)
export function InlineLoading({ message = 'Carregando...', size = 'md' }: { message?: string, size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className="flex items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} border-2 border-orange-500 border-t-transparent rounded-full animate-spin`} />
      <span className="text-gray-600">{message}</span>
    </div>
  )
}

