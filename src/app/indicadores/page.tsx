'use client'

import { useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Calendar, Clock, Zap, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function IndicadoresPage() {
  const { canFillIndicators, canManageIndicators } = usePermissions()

  const frequencyTypes = [
    {
      id: 'evento',
      title: 'Indicadores por Evento',
      description: 'Preenchidos sempre que ocorre um evento específico',
      icon: Zap,
      color: 'bg-red-100 text-red-600',
      borderColor: 'border-red-200',
      examples: ['Ocorrências Aeronáuticas', 'Ocorrências Não Aeronáuticas', 'Emergências Médicas'],
      href: '/indicadores/evento'
    },
    {
      id: 'diario',
      title: 'Indicadores Diários',
      description: 'Preenchidos diariamente durante o plantão',
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
      borderColor: 'border-blue-200',
      examples: ['Horas de Treinamento PTR-BA', 'Atividades de Plantão', 'Checklist Diário'],
      href: '/indicadores/diario'
    },
    {
      id: 'mensal',
      title: 'Indicadores Mensais',
      description: 'Preenchidos mensalmente com dados consolidados',
      icon: Calendar,
      color: 'bg-green-100 text-green-600',
      borderColor: 'border-green-200',
      examples: ['Relatório Mensal de Atividades', 'Estatísticas de Atendimento', 'Metas Mensais'],
      href: '/indicadores/mensal'
    }
  ]

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Indicadores</h1>
                <p className="text-gray-600">Gerencie e preencha indicadores por frequência</p>
              </div>
              
              {canManageIndicators() && (
                <Link
                  href="/indicadores/gerenciar"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  Gerenciar Indicadores
                </Link>
              )}
            </div>
          </div>

          {/* Cards de Frequência */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frequencyTypes.map((type) => {
              const IconComponent = type.icon
              
              return (
                <Link
                  key={type.id}
                  href={type.href}
                  className={`block bg-white rounded-lg border-2 ${type.borderColor} hover:shadow-lg transition-all duration-200 hover:scale-105`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-full ${type.color}`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{type.title}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Exemplos:</h4>
                      <ul className="space-y-1">
                        {type.examples.map((example, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {example}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Clique para acessar</span>
                        <span className="text-blue-600 font-medium">Ver indicadores →</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-full">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Como funciona o sistema de indicadores?</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><strong>Por Evento:</strong> Sempre que ocorre uma situação específica (emergência, ocorrência), o indicador deve ser preenchido imediatamente.</p>
                  <p><strong>Diários:</strong> Preenchidos durante o plantão com informações do dia, como horas de treinamento e atividades realizadas.</p>
                  <p><strong>Mensais:</strong> Consolidação de dados do mês, relatórios e estatísticas gerais da seção ou equipe.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          {canFillIndicators() && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pendentes Hoje</p>
                    <p className="text-2xl font-bold text-red-600">3</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Indicadores que precisam ser preenchidos</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Preenchidos Este Mês</p>
                    <p className="text-2xl font-bold text-green-600">27</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Total de indicadores preenchidos</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold text-blue-600">89%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Percentual de indicadores em dia</p>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AuthenticatedRoute>
  )
}