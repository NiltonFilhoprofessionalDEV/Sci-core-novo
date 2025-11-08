'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const indicatorTabs = [
  { label: 'Ocorrências Aeronáuticas', href: '/dashboard/ocorrencias-aeronauticas' },
  { label: 'Ocorrência Não Aeronáutica', href: '/dashboard/ocorrencia-nao-aeronautica' },
  { label: 'Atividades Acessórias', href: '/dashboard/atividades-acessorias' },
  { label: 'TAF', href: '/dashboard/taf' },
  { label: 'PTR-BA - Prova Teórica', href: '/dashboard/ptr-ba-prova-teorica' },
  { label: 'PTR-BA - Horas de Treinamento', href: '/dashboard/ptr-ba-horas-treinamento' },
  { label: 'Inspeções de Viaturas', href: '/dashboard/inspecoes-viaturas' },
  { label: 'Tempo EPR', href: '/dashboard/tempo-epr' },
  { label: 'Tempo Resposta', href: '/dashboard/tempo-resposta' },
  { label: 'Controle de Agentes Extintores', href: '/dashboard/controle-agentes-extintores' },
  { label: 'Controle de Trocas', href: '/dashboard/controle-trocas' },
  { label: 'Verificação de TPS', href: '/dashboard/verificacao-tps' },
  { label: 'Higienização de TPS', href: '/dashboard/higienizacao-tps' },
  { label: 'Controle de Uniformes Recebidos', href: '/dashboard/controle-uniformes-recebidos' }
]

const basePath = '/dashboard'

export function IndicatorsNavbar() {
  const pathname = usePathname()

  return (
    <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4 shadow-sm">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 text-sm font-medium text-orange-700">
        {indicatorTabs.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname === basePath && item.href === '/dashboard/ocorrencias-aeronauticas') ||
            (pathname.startsWith(item.href) && item.href !== '/dashboard/ocorrencias-aeronauticas')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 transition-colors ${
                isActive
                  ? 'border-[#ff6600] bg-[#ff6600] text-white shadow-md'
                  : 'border-transparent bg-white/80 text-[#ff6600] hover:border-orange-300 hover:bg-orange-100'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}



