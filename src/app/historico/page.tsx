'use client'

import React from 'react'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { HistoricoIndicadores } from '@/components/historico/HistoricoIndicadores'

function HistoricoContent() {
  return <HistoricoIndicadores />
}

export default function HistoricoPage() {
  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <HistoricoContent />
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}