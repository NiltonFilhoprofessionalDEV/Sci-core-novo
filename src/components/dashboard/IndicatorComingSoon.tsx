interface IndicatorComingSoonProps {
  title: string
  description?: string
}

export function IndicatorComingSoon({ title, description }: IndicatorComingSoonProps) {
  return (
    <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-primary">
        <span className="text-2xl font-semibold">⏳</span>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-primary">{title}</h2>
      <p className="mt-2 text-sm text-[#7a5b3e]/80">
        {description ?? 'O dashboard deste indicador ainda está em desenvolvimento. Em breve traremos informações detalhadas aqui.'}
      </p>
    </div>
  )
}









