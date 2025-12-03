'use client'

import { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function SecaoLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredProfile="gerente_secao">
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  )
}

