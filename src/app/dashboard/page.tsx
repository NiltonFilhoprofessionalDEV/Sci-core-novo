'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { GestorPOPDashboard } from '@/components/dashboard/GestorPOPDashboard'
import { GerenteSecaoDashboard } from '@/components/dashboard/GerenteSecaoDashboard'
import { BACEDashboard } from '@/components/dashboard/BACEDashboard'

function DashboardContent() {
  const { isGestorPOP, isGerenteSecao, isBACE } = usePermissions()

  // Renderizar dashboard específico baseado no perfil
  if (isGestorPOP) {
    return <GestorPOPDashboard />
  }
  
  if (isGerenteSecao) {
    return <GerenteSecaoDashboard />
  }
  
  if (isBACE) {
    return <BACEDashboard />
  }

  // Fallback para usuários sem perfil definido
  return (
    <div className="p-8">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          Perfil não configurado
        </h2>
        <p className="text-yellow-700">
          Seu perfil ainda não foi configurado no sistema. Entre em contato com o administrador.
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}