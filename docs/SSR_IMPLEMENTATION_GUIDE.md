# Guia de Implementação SSR (Server-Side Rendering)

## Visão Geral

Este guia explica como converter páginas existentes para usar Server Components do Next.js 15, melhorando a performance e experiência do usuário.

## Benefícios do SSR

- ✅ **Primeira renderização instantânea**: HTML já vem renderizado do servidor
- ✅ **Melhor SEO**: Conteúdo disponível para crawlers
- ✅ **Menos loading spinners**: Usuário vê conteúdo imediatamente
- ✅ **Melhor Core Web Vitals**: FCP, LCP melhorados

## Padrão de Implementação

### 1. Estrutura de Arquivos

```
src/app/dashboard/[indicador]/
├── page.tsx              # Server Component (busca dados)
└── DashboardContent.tsx  # Client Component (interatividade)
```

### 2. Server Component (page.tsx)

```typescript
import { serverFetchJSON } from '@/utils/serverFetch'
import { DashboardContent } from './DashboardContent'

interface PageProps {
  searchParams: Promise<{
    secaoId?: string
    equipeId?: string
  }>
}

export default async function OcorrenciasAeronauticasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const secaoId = params.secaoId
  const equipeId = params.equipeId

  // Buscar dados no servidor durante SSR
  let initialData = null
  try {
    initialData = await serverFetchJSON('/api/indicators/ocorrencias-aeronauticas', {
      method: 'GET',
    })
  } catch (error) {
    console.error('Erro ao buscar dados iniciais:', error)
  }

  // Renderizar componente client-side com dados iniciais
  return (
    <div className="container mx-auto p-6">
      <DashboardContent 
        initialData={initialData} 
        secaoId={secaoId}
        equipeId={equipeId}
      />
    </div>
  )
}
```

### 3. Client Component (DashboardContent.tsx)

```typescript
'use client'

import { useIndicatorQuery } from '@/hooks/queries/useIndicatorQuery'

interface DashboardContentProps {
  initialData?: any
  secaoId?: string
  equipeId?: string
}

export function DashboardContent({ initialData, secaoId, equipeId }: DashboardContentProps) {
  // React Query usa initialData e depois revalida
  const { data, isLoading, error } = useIndicatorQuery('ocorrencias-aeronauticas', {
    secaoId,
    equipeId,
  })

  // Usar dados do React Query ou fallback para initialData
  const displayData = data || initialData

  return (
    <div>
      {/* Renderizar dados */}
    </div>
  )
}
```

## Páginas a Converter

### Prioridade Alta (usuários acessam frequentemente)

1. ✅ `/dashboard/ocorrencias-aeronauticas` - Exemplo implementado
2. ⏳ `/dashboard/taf`
3. ⏳ `/dashboard/tempo-epr`
4. ⏳ `/dashboard/tempo-resposta`

### Prioridade Média

5. ⏳ `/dashboard/ptr-ba-horas-treinamento`
6. ⏳ `/dashboard/ptr-ba-prova-teorica`
7. ⏳ `/dashboard/controle-agentes-extintores`
8. ⏳ `/dashboard/atividades-acessorias`

### Prioridade Baixa

9. ⏳ `/historico`
10. ⏳ `/indicadores`

## Utilities Disponíveis

### serverFetch

Faz requisições HTTP em Server Components com autenticação automática.

```typescript
import { serverFetch } from '@/utils/serverFetch'

const response = await serverFetch('/api/indicators/taf')
```

### serverFetchJSON

Versão com parse JSON automático e tratamento de erros.

```typescript
import { serverFetchJSON } from '@/utils/serverFetch'

const data = await serverFetchJSON<MyType>('/api/indicators/taf')
```

## Considerações

### Autenticação

- O `serverFetch` automaticamente inclui o token de autenticação dos cookies
- Se não houver token, a requisição ainda é feita (RLS do Supabase protege)

### Cache

- Em desenvolvimento: `cache: 'no-store'` (sempre busca dados frescos)
- Em produção: usa cache padrão do Next.js
- Para revalidar: use `revalidatePath()` após mutations

### Erros

- Sempre usar try/catch ao buscar dados no servidor
- Passar `null` como initialData se houver erro
- Client Component mostra estado de loading/error apropriado

## Exemplo Completo

Ver arquivo criado: `src/app/dashboard/ocorrencias-aeronauticas/DashboardContent.tsx`

## Próximos Passos

1. Implementar SSR em outras páginas de indicadores
2. Adicionar loading.tsx para estados de carregamento
3. Adicionar error.tsx para tratamento de erros
4. Implementar Suspense boundaries onde apropriado

## Métricas de Sucesso

Após implementação completa, espera-se:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s
- **Redução de loading states**: ~70%

