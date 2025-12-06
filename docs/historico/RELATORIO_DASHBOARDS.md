# Relatório Técnico: Sistema de Dashboards - SCI Core

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Estrutura de Componentes](#estrutura-de-componentes)
4. [Dashboards Implementadas](#dashboards-implementadas)
5. [Sistema de Filtros](#sistema-de-filtros)
6. [Sistema de Cache](#sistema-de-cache)
7. [Segurança e Permissões](#segurança-e-permissões)
8. [Visualizações e Gráficos](#visualizações-e-gráficos)
9. [Detalhamento por Dashboard](#detalhamento-por-dashboard)

---

## 1. Visão Geral

O sistema de dashboards do SCI Core foi desenvolvido para fornecer visualizações interativas e análises detalhadas dos indicadores operacionais das Seções de Bombeiro de Aeródromo. O sistema é construído com **Next.js 15.5.6**, **React 19**, **TypeScript**, **Tailwind CSS** e **Recharts** para visualizações.

### Tecnologias Principais
- **Framework**: Next.js 15.5.6 (App Router)
- **UI**: React 19.1.0 com TypeScript
- **Estilização**: Tailwind CSS 4
- **Gráficos**: Recharts 2.11.1
- **Backend**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth com RLS (Row Level Security)

---

## 2. Arquitetura do Sistema

### 2.1 Estrutura de Diretórios

```
src/
├── app/
│   └── dashboard/
│       ├── layout.tsx                    # Layout compartilhado
│       ├── page.tsx                      # Redirecionamento padrão
│       ├── ocorrencias-aeronauticas/     # Dashboard de ocorrências aeronáuticas
│       ├── ocorrencia-nao-aeronautica/   # Dashboard de ocorrências não aeronáuticas
│       ├── taf/                          # Dashboard TAF
│       ├── tempo-epr/                    # Dashboard Tempo EPR
│       ├── tempo-resposta/               # Dashboard Tempo de Resposta
│       ├── atividades-acessorias/        # Dashboard Atividades Acessórias
│       ├── ptr-ba-prova-teorica/         # Dashboard PTR-BA Prova Teórica
│       ├── ptr-ba-horas-treinamento/     # Dashboard PTR-BA Horas Treinamento
│       ├── inspecoes-viaturas/           # Dashboard Inspeções de Viaturas
│       ├── controle-agentes-extintores/   # Dashboard Controle Agentes Extintores
│       ├── controle-trocas/              # Dashboard Controle de Trocas
│       ├── controle-uniformes-recebidos/ # Dashboard Controle Uniformes
│       ├── verificacao-tps/              # Dashboard Verificação TPS
│       └── higienizacao-tps/             # Dashboard Higienização TPS
├── components/
│   ├── dashboard/                        # Componentes específicos de dashboard
│   ├── filters/                         # Componentes de filtros
│   ├── layout/                          # Componentes de layout
│   └── ui/                              # Componentes UI reutilizáveis
├── hooks/
│   ├── useDashboardData.ts              # Hook principal de carregamento
│   ├── useDashboardCache.ts             # Hook de cache
│   └── useAuth.ts                       # Hook de autenticação
└── utils/
    ├── dashboardDataLoader.ts            # Utilitário de carregamento
    └── dashboardQueryBuilder.ts         # Utilitário de construção de queries
```

### 2.2 Padrão de Arquitetura

O sistema segue uma arquitetura em camadas:

1. **Camada de Apresentação**: Componentes React (pages, components)
2. **Camada de Lógica**: Hooks customizados (useDashboardData, useDashboardCache)
3. **Camada de Dados**: Supabase client e utilitários de query
4. **Camada de Cache**: Sistema de cache em memória

---

## 3. Estrutura de Componentes

### 3.1 Layout Principal (`DashboardLayout`)

**Localização**: `src/components/layout/DashboardLayout.tsx`

**Responsabilidades**:
- Sidebar fixa com navegação baseada em perfil
- Header com informações do sistema
- Área de conteúdo principal
- Integração com sistema de autenticação

**Características**:
- Navegação dinâmica baseada no perfil do usuário:
  - **Gestor POP**: Acesso completo (Dashboard, Seções, Usuários, Indicadores, Relatórios, Configurações)
  - **Gerente de Seção**: Acesso limitado (Dashboard, Minha Seção, Equipes, Relatórios, Cronograma)
  - **BA-CE**: Acesso operacional (Dashboard, Preencher Indicadores, Histórico)
- Sidebar fixa com 264px de largura
- Informações do usuário exibidas no topo da sidebar
- Botão de logout na parte inferior

### 3.2 Navegação de Indicadores (`IndicatorsNavbar`)

**Localização**: `src/components/dashboard/IndicatorsNavbar.tsx`

**Funcionalidades**:
- Barra de navegação horizontal com 14 indicadores
- Componente `NavBar` customizado com efeito "tubelight"
- Detecção automática da aba ativa baseada no pathname
- Ícones específicos para cada indicador (lucide-react)

**Indicadores Disponíveis**:
1. Ocorrências Aeronáuticas (Plane)
2. Ocorrência Não Aeronáutica (AlertTriangle)
3. Atividades Acessórias (Wrench)
4. TAF (Cloud)
5. PTR-BA - Prova Teórica (GraduationCap)
6. PTR-BA - Horas de Treinamento (Clock)
7. Inspeções de Viaturas (Truck)
8. Tempo EPR (Timer)
9. Tempo Resposta (Zap)
10. Controle de Agentes Extintores (Droplets)
11. Controle de Trocas (RefreshCw)
12. Verificação de TPS (CheckCircle)
13. Higienização de TPS (Sparkles)
14. Controle de Uniformes Recebidos (Package)

---

## 4. Dashboards Implementadas

### 4.1 Lista Completa de Dashboards

| # | Dashboard | Rota | Tabela Principal | Status |
|---|-----------|------|------------------|--------|
| 1 | Ocorrências Aeronáuticas | `/dashboard/ocorrencias-aeronauticas` | `ocorrencias_aeronauticas` | ✅ Completo |
| 2 | Ocorrências Não Aeronáuticas | `/dashboard/ocorrencia-nao-aeronautica` | `ocorrencias_nao_aeronauticas` | ✅ Completo |
| 3 | TAF | `/dashboard/taf` | `taf_resultados` | ✅ Completo |
| 4 | Tempo EPR | `/dashboard/tempo-epr` | `tempo_epr` | ✅ Completo |
| 5 | Tempo Resposta | `/dashboard/tempo-resposta` | `tempo_resposta` | ✅ Completo |
| 6 | Atividades Acessórias | `/dashboard/atividades-acessorias` | `atividades_acessorias` | ✅ Completo |
| 7 | PTR-BA Prova Teórica | `/dashboard/ptr-ba-prova-teorica` | `ptr_ba_prova_teorica` | ✅ Completo |
| 8 | PTR-BA Horas Treinamento | `/dashboard/ptr-ba-horas-treinamento` | `ptr_ba_horas_treinamento` | ✅ Completo |
| 9 | Inspeções de Viaturas | `/dashboard/inspecoes-viaturas` | `inspecoes_viaturas` | ⚠️ Placeholder |
| 10 | Controle Agentes Extintores | `/dashboard/controle-agentes-extintores` | `controle_agentes_extintores` | ✅ Completo |
| 11 | Controle de Trocas | `/dashboard/controle-trocas` | `controle_trocas` | ✅ Completo |
| 12 | Controle Uniformes Recebidos | `/dashboard/controle-uniformes-recebidos` | `controle_uniformes_recebidos` | ✅ Completo |
| 13 | Verificação de TPS | `/dashboard/verificacao-tps` | `verificacao_tps` | ✅ Completo |
| 14 | Higienização de TPS | `/dashboard/higienizacao-tps` | `higienizacao_tps` | ✅ Completo |

---

## 5. Sistema de Filtros

### 5.1 Componentes de Filtro

#### 5.1.1 `EquipeFilter`
**Localização**: `src/components/filters/EquipeFilter.tsx`

**Funcionalidades**:
- Dropdown com checkboxes para seleção múltipla
- Filtro automático por seção do usuário (segurança)
- Opção "Selecionar Todas" / "Desmarcar Todas"
- Botão "Limpar Filtros"
- Exibição do nome da equipe e seção
- Estado de loading durante carregamento

**Segurança Implementada**:
- Filtra automaticamente equipes pela `secao_id` do usuário
- Usa `user?.profile?.secao_id` ou `user?.profile?.secao?.id`
- Não permite visualizar equipes de outras bases

#### 5.1.2 `DateRangeFilter`
**Localização**: `src/components/filters/DateRangeFilter.tsx`

**Funcionalidades**:
- Seleção de data inicial e final
- Períodos rápidos pré-definidos:
  - Últimos 7 dias
  - Últimos 30 dias
  - Mês atual
  - Mês passado
  - Ano atual
- Botão para limpar datas
- Formatação de exibição em português (pt-BR)

#### 5.1.3 `SecaoFilter`
**Localização**: `src/components/filters/SecaoFilter.tsx`

**Funcionalidades**:
- Filtro por seção (geralmente usado apenas por gestores)
- Dropdown com todas as seções ativas
- Filtro automático baseado em permissões

### 5.2 Implementação de Filtros nas Dashboards

**Exemplo - Ocorrências Não Aeronáuticas**:
```typescript
const [selectedEquipes, setSelectedEquipes] = useState<string[]>([])
const [selectedTipoOcorrencia, setSelectedTipoOcorrencia] = useState('')
const [dateRange, setDateRange] = useState({ start: '', end: '' })

const registrosFiltrados = useMemo(() => {
  return registros.filter((registro) => {
    // Filtro por equipe
    if (selectedEquipes.length > 0) {
      if (!registro.equipe_id || !selectedEquipes.includes(registro.equipe_id)) {
        return false
      }
    }
    
    // Filtro por tipo
    if (selectedTipoOcorrencia) {
      const tipo = registro.tipo_ocorrencia?.trim() || 'Não informado'
      if (tipo !== selectedTipoOcorrencia) return false
    }
    
    // Filtro por data
    if (dateRange.start || dateRange.end) {
      if (!registro.data_ocorrencia) return false
      const registroDate = new Date(`${registro.data_ocorrencia}T00:00:00`)
      if (dateRange.start && registroDate < new Date(`${dateRange.start}T00:00:00`)) return false
      if (dateRange.end && registroDate > new Date(`${dateRange.end}T23:59:59`)) return false
    }
    
    return true
  })
}, [registros, selectedEquipes, selectedTipoOcorrencia, dateRange])
```

---

## 6. Sistema de Cache

### 6.1 Hook `useDashboardCache`

**Localização**: `src/hooks/useDashboardCache.ts`

**Características**:
- Cache em memória (Map global)
- Duração de cache: 5 minutos (fresco)
- Stale time: 10 minutos (dados antigos mas ainda usáveis)
- Chave única por tabela e base do usuário
- Limpeza automática de dados expirados

**Funcionamento**:
```typescript
const CACHE_DURATION = 5 * 60 * 1000  // 5 minutos
const STALE_TIME = 10 * 60 * 1000     // 10 minutos

// Dados frescos (< 5 min): retornados imediatamente
// Dados stale (5-10 min): retornados mas atualizados em background
// Dados expirados (> 10 min): removidos do cache
```

### 6.2 Integração com `useDashboardData`

O hook `useDashboardData` utiliza o cache da seguinte forma:

1. **Inicialização**: Carrega dados do cache se disponível
2. **Carregamento**: Se não houver cache, busca do servidor
3. **Atualização em Background**: Se houver cache stale, mostra cache e atualiza em background
4. **Persistência**: Salva novos dados no cache automaticamente

---

## 7. Segurança e Permissões

### 7.1 Row Level Security (RLS)

Todas as queries são automaticamente filtradas por RLS do Supabase:

- **Perfil BA-CE**: Apenas dados da sua `secao_id`
- **Perfil Gerente de Seção**: Apenas dados da sua seção
- **Perfil Gestor POP**: Todos os dados (sem filtro)

### 7.2 Filtro Automático no Hook

**Localização**: `src/hooks/useDashboardData.ts`

```typescript
// Aplicação automática de filtros por perfil
if (user.profile.perfil === 'ba_ce' && user.profile.secao_id) {
  query = query.eq('secao_id', user.profile.secao_id)
} else if (user.profile.perfil === 'ba_op' && user.profile.equipe_id) {
  query = query.eq('equipe_id', user.profile.equipe_id)
}
```

### 7.3 Proteção de Rotas

**Localização**: `src/components/auth/ProtectedRoute.tsx`

- Wrapper `AuthenticatedRoute` protege todas as rotas de dashboard
- Redireciona para `/login` se não autenticado
- Verifica permissões baseadas em perfil

---

## 8. Visualizações e Gráficos

### 8.1 Biblioteca de Gráficos

**Recharts 2.11.1** - Componentes utilizados:
- `BarChart` - Gráficos de barras (horizontal e vertical)
- `AreaChart` - Gráficos de área
- `LineChart` - Gráficos de linha
- `PieChart` - Gráficos de pizza
- `ResponsiveContainer` - Container responsivo

### 8.2 Paleta de Cores Padrão

**Tema Laranja** (consistente em todo o sistema):
```typescript
const colors = {
  primary: '#fb923c',      // Laranja principal
  secondary: '#f97316',   // Laranja médio
  dark: '#ea580c',         // Laranja escuro
  darker: '#c2410c',       // Laranja muito escuro
  light: '#fed7aa',        // Laranja claro
  lighter: '#ffedd5'      // Laranja muito claro
}
```

### 8.3 Tipos de Visualizações

#### 8.3.1 KPIs (Key Performance Indicators)
- Cards com gradiente laranja
- Formato: Título (uppercase) + Valor grande + Subtítulo
- Responsivos (grid adaptativo)

#### 8.3.2 Gráficos Temporais
- **AreaChart**: Evolução ao longo do tempo (meses)
- **LineChart**: Séries temporais com múltiplas linhas
- **BarChart**: Comparação por período

#### 8.3.3 Gráficos de Distribuição
- **BarChart Horizontal**: Top N itens
- **PieChart/DonutChart**: Distribuição percentual
- **Heatmap/Treemap**: Distribuição por localidade

#### 8.3.4 Tabelas de Detalhamento
- Paginação (10 itens por página)
- Ordenação por data (mais recente primeiro)
- Hover effects
- Cabeçalho com gradiente laranja

---

## 9. Detalhamento por Dashboard

### 9.1 Ocorrências Aeronáuticas

**Rota**: `/dashboard/ocorrencias-aeronauticas`

**Tabela**: `ocorrencias_aeronauticas`

**Campos Principais**:
- `data_ocorrencia`
- `posicionamento_intervencao`
- `local_ocorrencia`
- `tempo_chegada_primeiro_cci`
- `tempo_chegada_ultimo_cci`
- `tempo_total_ocorrencia`

**KPIs Implementados**:
1. **Total de Ocorrências**: Contagem simples
2. **Média de Resposta (1ª Viatura)**: Média de `tempo_chegada_primeiro_cci`
3. **Média de Resposta (Último CCI)**: Média de `tempo_chegada_ultimo_cci`
4. **Tempo Médio Total**: Média de `tempo_total_ocorrencia`

**Gráficos**:
1. **Evolução por Mês**: AreaChart com ocorrências mensais
2. **Desempenho da Resposta ao Longo do Tempo**: LineChart duplo
   - Série 1: Média de chegada 1ª viatura
   - Série 2: Média de chegada último CCI
   - Linha de referência: Meta regulatória (7 minutos)
3. **Distribuição por Localidade**: Heatmap/Treemap
   - Grid responsivo com scroll
   - Legenda organizada em colunas
   - Cores baseadas em intensidade

**Filtros**:
- Por equipe (filtrado automaticamente por base)
- Por período (data inicial e final)

**Tabela de Detalhamento**:
- Colunas: Base, Data, Equipe, Local, Chegada 1ª viatura, Chegada último CCI, Tempo total, Posicionamento
- Paginação: 10 registros por página

---

### 9.2 Ocorrências Não Aeronáuticas

**Rota**: `/dashboard/ocorrencia-nao-aeronautica`

**Tabela**: `ocorrencias_nao_aeronauticas`

**Campos Principais**:
- `data_ocorrencia`
- `tipo_ocorrencia`
- `local_ocorrencia`
- `hora_acionamento`
- `hora_chegada`
- `hora_termino`

**KPIs Implementados**:
1. **Total de Ocorrências**: Contagem simples
2. **Tempo Médio de Resposta (TMR)**: Média entre acionamento e chegada
3. **Tempo Médio de Ocorrência (TMO)**: Média entre acionamento e término
4. **Ocorrências Críticas (Total)**: Contagem de ocorrências com "artigos perigosos"
5. **% Ocorrências Críticas**: Percentual de críticas sobre o total

**Gráficos**:
1. **Evolução por Mês**: AreaChart
2. **Top 5 Maiores Ocorrências**: BarChart horizontal por tipo
3. **Tempo Total das Ocorrências por Mês**: BarChart vertical (horas)
4. **Distribuição por Localidade**: Heatmap/Treemap
   - Grid responsivo com scroll vertical
   - Legenda em duas colunas com scroll
   - Normalização de nomes de localidades (agrupa variações)

**Filtros**:
- Por equipe (filtrado automaticamente por base)
- Por tipo de ocorrência (dropdown)
- Por período (data inicial e final)

**Cálculos Especiais**:
- Normalização de localidades: agrupa variações como "G-11", "g-11", "G 11"
- Detecção de ocorrências críticas: busca por "artigo perigoso" no tipo
- Formatação de tempo: `MM:SS` para médias, `HH:MM:SS` para totais

---

### 9.3 TAF (Teste de Aptidão Física)

**Rota**: `/dashboard/taf`

**Tabela**: `taf_resultados` (com join em `taf_registros`)

**Campos Principais**:
- `idade`
- `tempo_total`
- `desempenho`
- `data_taf`
- `nome_completo`
- `nome_equipe`

**KPIs**:
- Total de registros
- Média de idade
- Distribuição por desempenho

**Gráficos**:
1. Distribuição por desempenho (DonutChart)
2. Distribuição por faixa etária
3. Evolução temporal

**Filtros**:
- Por nome (dropdown)
- Filtro automático por base (via join)

---

### 9.4 Tempo EPR

**Rota**: `/dashboard/tempo-epr`

**Tabela**: `tempo_epr`

**Campos Principais**:
- `data_exercicio_epr`
- `tempo_epr`
- `status`
- `nome_completo`
- `equipe`

**KPIs**:
- Total de exercícios
- Média de tempo EPR
- Distribuição por status

**Gráficos**:
1. Distribuição por status (DonutChart)
2. Evolução por mês
3. Distribuição por equipe

**Filtros**:
- Por mês
- Por equipe
- Por nome

**Cálculos Especiais**:
- Classificação de desempenho baseada em tempo:
  - Excelente: < 3 minutos
  - Bom: 3-4 minutos
  - Regular: 4-5 minutos
  - Tolerável: 5-6 minutos
  - Reprovado: > 6 minutos

---

### 9.5 Tempo Resposta

**Rota**: `/dashboard/tempo-resposta`

**Tabela**: `tempo_resposta`

**Funcionalidades**:
- Análise de tempos de resposta
- Comparação entre equipes
- Evolução temporal

---

### 9.6 Atividades Acessórias

**Rota**: `/dashboard/atividades-acessorias`

**Tabela**: `atividades_acessorias`

**Funcionalidades**:
- Registro de atividades não operacionais
- Análise de tempo gasto
- Distribuição por tipo de atividade

---

### 9.7 PTR-BA Prova Teórica

**Rota**: `/dashboard/ptr-ba-prova-teorica`

**Tabela**: `ptr_ba_prova_teorica`

**Funcionalidades**:
- Registro de provas teóricas
- Taxa de aprovação
- Distribuição por equipe

---

### 9.8 PTR-BA Horas de Treinamento

**Rota**: `/dashboard/ptr-ba-horas-treinamento`

**Tabela**: `ptr_ba_horas_treinamento`

**Funcionalidades**:
- Controle de horas de treinamento
- Cumprimento de metas
- Distribuição por tipo de treinamento

---

### 9.9 Controle de Agentes Extintores

**Rota**: `/dashboard/controle-agentes-extintores`

**Tabela**: `controle_agentes_extintores`

**Funcionalidades**:
- Controle de validade
- Status de inspeção
- Distribuição por tipo

---

### 9.10 Controle de Trocas

**Rota**: `/dashboard/controle-trocas`

**Tabela**: `controle_trocas`

**Funcionalidades**:
- Registro de trocas realizadas
- Análise de frequência
- Distribuição por tipo

---

### 9.11 Controle de Uniformes Recebidos

**Rota**: `/dashboard/controle-uniformes-recebidos`

**Tabela**: `controle_uniformes_recebidos`

**Funcionalidades**:
- Controle de EPI entregue vs previsto
- Controle de uniformes entregues vs previstos
- Percentuais de cumprimento

**Gráficos**:
- Distribuição por equipe
- Evolução mensal
- Comparação entregue vs previsto

---

### 9.12 Verificação de TPS

**Rota**: `/dashboard/verificacao-tps`

**Tabela**: `verificacao_tps`

**Funcionalidades**:
- Controle de TPS verificados
- Taxa de conformidade
- Distribuição por equipe

**KPIs**:
- Total de registros
- Total de TPS
- Total conformes
- Total verificados
- Percentual de conformidade

---

### 9.13 Higienização de TPS

**Rota**: `/dashboard/higienizacao-tps`

**Tabela**: `higienizacao_tps`

**Funcionalidades**:
- Controle de TPS higienizados
- Taxa de higienização
- Distribuição por equipe

**KPIs**:
- Total de registros
- Total de TPS
- Total higienizados
- Percentual de higienização

---

## 10. Hook Principal: `useDashboardData`

### 10.1 Funcionalidades

**Localização**: `src/hooks/useDashboardData.ts`

**Características Principais**:
1. **Filtro Automático por Base**: Aplica filtro por `secao_id` automaticamente para perfil BA-CE
2. **Cache Inteligente**: Integra com `useDashboardCache` para performance
3. **Retry Automático**: Tenta novamente em caso de timeout ou erro de rede (máximo 2 tentativas)
4. **Cancelamento de Requisições**: Usa AbortController para cancelar requisições antigas
5. **Timeout**: 15 segundos por requisição
6. **Debounce**: Evita requisições muito frequentes (300ms)

### 10.2 Interface

```typescript
interface UseDashboardDataOptions<T> {
  tableName: string                    // Nome da tabela no Supabase
  selectFields: string                  // Campos a selecionar
  orderBy?: { column: string; ascending?: boolean }
  limit?: number                        // Limite de registros (padrão: 1000)
  cacheKey?: string                     // Chave de cache customizada
  enabled?: boolean                     // Habilitar/desabilitar carregamento
  additionalFilters?: (query: any) => any  // Filtros adicionais customizados
}

interface UseDashboardDataReturn<T> {
  data: T[]                             // Dados carregados
  loading: boolean                      // Estado de carregamento
  error: string | null                  // Mensagem de erro (se houver)
  refetch: () => Promise<void>          // Função para recarregar dados
  isReady: boolean                      // Indica se usuário está pronto
}
```

### 10.3 Fluxo de Carregamento

```
1. Verificar se usuário está autenticado e pronto
   ↓
2. Verificar cache (se disponível e válido)
   ↓
3. Se cache disponível:
   - Retornar dados do cache imediatamente
   - Atualizar em background (sem bloquear UI)
   ↓
4. Se cache não disponível:
   - Mostrar loading
   - Buscar dados do servidor
   - Aplicar filtros automáticos (secao_id)
   - Salvar no cache
   - Retornar dados
   ↓
5. Em caso de erro:
   - Tentar novamente (máximo 2 vezes)
   - Mostrar mensagem de erro
```

---

## 11. Componentes UI Reutilizáveis

### 11.1 Pagination

**Localização**: `src/components/ui/pagination.tsx`

**Funcionalidades**:
- Navegação entre páginas
- Exibição de total de itens
- Botões anterior/próximo
- Indicador de página atual

### 11.2 Modal

**Localização**: `src/components/ui/Modal.tsx`

**Funcionalidades**:
- Modal genérico reutilizável
- Overlay com backdrop
- Botão de fechar
- Suporte a conteúdo customizado

---

## 12. Utilitários

### 12.1 Formatação de Tempo

**Funções auxiliares** (presentes em várias dashboards):

```typescript
// Converter tempo HH:MM:SS para segundos
function timeToSeconds(time?: string | null): number

// Converter segundos para HH:MM:SS
function secondsToTime(totalSeconds: number): string

// Converter segundos para MM:SS (para médias)
function formatDurationLabel(seconds: number): string

// Calcular diferença entre dois tempos
function diffSeconds(inicio?: string | null, fim?: string | null): number
```

### 12.2 Formatação de Datas

```typescript
const monthFormatter = new Intl.DateTimeFormat('pt-BR', { month: 'long' })
const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})
```

---

## 13. Melhorias Recentes Implementadas

### 13.1 Filtros Avançados (Ocorrências Não Aeronáuticas)

**Implementado em**: `src/app/dashboard/ocorrencia-nao-aeronautica/page.tsx`

**Melhorias**:
1. Filtro por equipe (com segurança por base)
2. Filtro por tipo de ocorrência (dropdown)
3. Filtro por período (data inicial e final)
4. Layout profissional com cards de filtro
5. Todos os gráficos e KPIs respeitam os filtros aplicados

### 13.2 KPIs Detalhados

**Ocorrências Não Aeronáuticas**:
- Total de Ocorrências
- Tempo Médio de Resposta (TMR)
- Tempo Médio de Ocorrência (TMO)
- Ocorrências Críticas (Total)
- % Ocorrências Críticas

**Ocorrências Aeronáuticas**:
- Total de Ocorrências
- Média de Resposta (1ª Viatura)
- Média de Resposta (Último CCI)
- Tempo Médio Total

### 13.3 Gráfico de Desempenho Temporal

**Implementado em**: Ocorrências Aeronáuticas

- LineChart duplo com duas séries
- Linha de referência para meta regulatória (7 minutos)
- Formatação correta de tempo (MM:SS min)
- Tooltip customizado

### 13.4 Melhorias no Heatmap de Localidades

**Implementado em**: Ambas as dashboards de ocorrências

- Grid responsivo com scroll vertical
- Legenda organizada em colunas
- Altura limitada para evitar sobreposição
- Normalização de nomes de localidades

---

## 14. Performance e Otimizações

### 14.1 Cache em Memória

- Reduz requisições ao servidor
- Carregamento instantâneo de dados cacheados
- Atualização em background para dados stale

### 14.2 Debounce e Throttle

- Debounce de 300ms para evitar requisições muito frequentes
- Timeout de 15 segundos por requisição
- Cancelamento automático de requisições antigas

### 14.3 Lazy Loading

- Componentes carregados sob demanda
- Gráficos renderizados apenas quando visíveis
- Paginação para tabelas grandes

### 14.4 Memoização

- Uso extensivo de `useMemo` para cálculos pesados
- `useCallback` para funções passadas como props
- Evita re-renderizações desnecessárias

---

## 15. Segurança Implementada

### 15.1 Row Level Security (RLS)

- Todas as queries respeitam RLS do Supabase
- Filtros automáticos por perfil
- Impossível acessar dados de outras bases

### 15.2 Validação de Perfil

- Verificação de perfil antes de carregar dados
- Mensagens de erro apropriadas
- Redirecionamento para login se não autenticado

### 15.3 Filtro de Equipes

- Componente `EquipeFilter` filtra automaticamente por base
- Não permite visualizar equipes de outras seções
- Validação no frontend e backend

---

## 16. Responsividade

### 16.1 Layout Adaptativo

- Sidebar fixa em desktop (264px)
- Grid responsivo para cards (1 coluna mobile, múltiplas desktop)
- Tabelas com scroll horizontal em telas pequenas

### 16.2 Gráficos Responsivos

- `ResponsiveContainer` do Recharts
- Ajuste automático de tamanho
- Tooltips adaptativos

---

## 17. Acessibilidade

### 17.1 Implementações

- Labels descritivos em inputs
- Contraste adequado de cores
- Navegação por teclado
- Estados de loading claros

---

## 18. Manutenção e Extensibilidade

### 18.1 Padrões de Código

- TypeScript para type safety
- Componentes funcionais com hooks
- Separação de responsabilidades
- Código reutilizável

### 18.2 Estrutura Modular

- Hooks customizados para lógica compartilhada
- Componentes de filtro reutilizáveis
- Utilitários centralizados
- Fácil adicionar novas dashboards

### 18.3 Como Adicionar Nova Dashboard

1. Criar pasta em `src/app/dashboard/[nome-dashboard]/`
2. Criar `page.tsx` com estrutura padrão
3. Usar `useDashboardData` para carregar dados
4. Implementar KPIs, gráficos e tabela
5. Adicionar entrada em `IndicatorsNavbar`

---

## 19. Conclusão

O sistema de dashboards do SCI Core é uma solução completa e robusta para visualização de indicadores operacionais. Com 14 dashboards implementadas, sistema de cache inteligente, filtros avançados, segurança por RLS e interface moderna, o sistema atende às necessidades de análise e monitoramento das Seções de Bombeiro de Aeródromo.

**Principais Destaques**:
- ✅ 14 dashboards funcionais
- ✅ Sistema de cache para performance
- ✅ Filtros avançados com segurança
- ✅ Visualizações interativas e profissionais
- ✅ Segurança robusta com RLS
- ✅ Código modular e extensível
- ✅ Responsivo e acessível

---

**Data de Criação**: 2024
**Versão do Sistema**: 1.0
**Última Atualização**: Dezembro 2024

