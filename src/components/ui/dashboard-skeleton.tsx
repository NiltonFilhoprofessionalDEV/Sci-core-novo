'use client'

import { Flame } from 'lucide-react'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header skeleton com animação de pulso */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-64 animate-shimmer bg-[length:200%_100%]" />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-96 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>

      {/* Cards de métricas - 4 colunas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-24 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.05}s` }} />
              <div className="h-8 bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 rounded-lg w-20 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.05 + 0.1}s` }} />
              <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-32 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.05 + 0.2}s` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos - 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            className="rounded-2xl border border-orange-200 bg-white p-6 shadow-sm"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="space-y-4">
              {/* Título do gráfico */}
              <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-48 animate-shimmer bg-[length:200%_100%]" />
              
              {/* Área do gráfico */}
              <div className="h-64 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50 rounded-lg relative overflow-hidden">
                {/* Barras animadas simulando gráfico */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 p-4">
                  {[...Array(6)].map((_, j) => (
                    <div 
                      key={j}
                      className="flex-1 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t opacity-20 animate-pulse"
                      style={{ 
                        height: `${Math.random() * 60 + 40}%`,
                        animationDelay: `${j * 0.1}s` 
                      }}
                    />
                  ))}
                </div>
                
                {/* Efeito de shimmer sobre o gráfico */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer bg-[length:200%_100%]" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="rounded-2xl border border-orange-200 bg-white shadow-sm overflow-hidden">
        {/* Header da tabela */}
        <div className="border-b border-orange-200 px-6 py-4 bg-orange-50/30">
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded w-56 animate-shimmer bg-[length:200%_100%]" />
        </div>
        
        {/* Linhas da tabela */}
        <div className="divide-y divide-orange-100">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="px-6 py-4 flex items-center gap-4"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.03}s` }} />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.03 + 0.05}s` }} />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.03 + 0.1}s` }} />
              <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded flex-1 animate-shimmer bg-[length:200%_100%]" style={{ animationDelay: `${i * 0.03 + 0.15}s` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Texto de carregamento */}
      <div className="flex items-center justify-center gap-3 py-4">
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        <span className="text-sm text-gray-600 ml-2">Carregando dados...</span>
      </div>

      {/* CSS para animação shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

// Skeleton mais simples para loadings rápidos
export function SimpleLoadingSkeleton({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-orange-200 bg-gradient-to-br from-white to-orange-50/30 p-12">
      <div className="text-center space-y-4">
        {/* Spinner laranja animado */}
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-orange-200" />
          <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 border-r-orange-500 border-b-transparent border-l-transparent animate-spin" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-100 to-transparent animate-pulse" />
        </div>
        
        {/* Mensagem */}
        <p className="text-orange-700 font-medium animate-pulse">{message}</p>
        
        {/* Pontos animados */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

