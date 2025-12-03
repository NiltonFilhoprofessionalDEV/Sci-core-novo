'use client'

import { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'

export default function ConfiguracoesLayout({ children }: { children: ReactNode }) {
  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        {children}
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}

