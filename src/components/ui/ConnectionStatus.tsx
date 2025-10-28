'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { checkConnection } from '@/lib/supabase'

interface ConnectionStatusProps {
  className?: string
}

export function ConnectionStatus({ className = '' }: ConnectionStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnectionStatus = async () => {
    setIsChecking(true)
    try {
      const connected = await checkConnection()
      setIsConnected(connected)
    } catch (error) {
      console.error('Erro ao verificar conexão:', error)
      setIsConnected(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnectionStatus()
    
    // Verificar conexão a cada 30 segundos
    const interval = setInterval(checkConnectionStatus, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (isConnected === null) {
    return null // Não mostrar nada enquanto carrega
  }

  if (isConnected) {
    return null // Não mostrar quando conectado
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ${className}`}>
      {isChecking ? (
        <AlertTriangle className="w-4 h-4 animate-pulse" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span>
        {isChecking ? 'Verificando conexão...' : 'Sem conexão com o servidor'}
      </span>
      <button
        onClick={checkConnectionStatus}
        disabled={isChecking}
        className="ml-2 px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors disabled:opacity-50"
      >
        {isChecking ? 'Verificando...' : 'Tentar novamente'}
      </button>
    </div>
  )
}