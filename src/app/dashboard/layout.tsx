'use client'

import { ReactNode } from 'react'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { IndicatorsNavbar } from '@/components/dashboard/IndicatorsNavbar'

export default function DashboardSectionLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">Indicadores Operacionais</h1>
            <p className="text-sm text-[#7a5b3e]/80">
              Utilize a barra de navegação para acessar os dashboards individuais de cada indicador.
            </p>
          </div>
          <IndicatorsNavbar />
          {children}
        </div>
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}









