# Documento de Requisitos do Produto (PRD)
## Sistema de Indicadores Bombeiro MedMais

---

## 1. Visão Geral do Produto

### 1.1 Finalidade
O Sistema de Indicadores Bombeiro MedMais é uma plataforma web desenvolvida para gerenciar, monitorar e analisar indicadores operacionais de seções de Bombeiro de Aeródromo administradas pelo Grupo MedMais. O sistema visa otimizar o processo de coleta, armazenamento e visualização de dados operacionais, proporcionando visibilidade adequada para cada nível hierárquico e facilitando a tomada de decisões baseada em métricas precisas e atualizadas.

### 1.2 Público-Alvo
- **Gestores POP**: Administradores que precisam de visão consolidada de todas as seções
- **Gerentes de Seção**: Responsáveis por uma base específica que precisam monitorar sua operação
- **BA-CE (Bombeiro de Aeródromo - Chefe de Equipe)**: Operadores que preenchem indicadores e visualizam dados da sua base

### 1.3 Objetivos Principais
- Centralizar o registro de indicadores operacionais
- Fornecer dashboards analíticos com visualizações gráficas
- Garantir isolamento de dados por seção/base (Row Level Security)
- Facilitar a análise histórica de indicadores
- Otimizar o processo de coleta de dados operacionais

---

## 2. Recursos e Funcionalidades

### 2.1 Sistema de Autenticação e Autorização

#### 2.1.1 Perfis de Usuário

| Perfil | Permissões | Acesso |
|--------|-----------|--------|
| **Gestor POP** | Visualização completa de todas as seções, relatórios gerenciais, configurações do sistema | Todas as bases |
| **Gerente de Seção** | Visualização e gestão da sua seção/base, aprovação de dados, relatórios da seção | Apenas sua base |
| **BA-CE** | Preenchimento de indicadores da sua equipe, visualização de indicadores da seção completa | Apenas sua base/equipe |

#### 2.1.2 Segurança
- Autenticação via Supabase Auth (email e senha)
- Row Level Security (RLS) no banco de dados
- Isolamento automático de dados por `secao_id` e `equipe_id`
- Sessão com timeout configurável
- Opção "Lembrar-me" para persistência de sessão

### 2.2 Módulos Principais

#### 2.2.1 Dashboard de Indicadores Operacionais
**Finalidade**: Visualização consolidada de todos os indicadores com gráficos e métricas.

**Recursos**:
- Navegação por abas para diferentes tipos de indicadores
- Cards informativos com métricas principais (cor laranja)
- Gráficos interativos (LineChart, BarChart, AreaChart, PieChart, Treemap, Heatmap)
- Filtros por equipe, tipo, período e localização
- Tabelas detalhadas com paginação
- Sistema de cache para performance otimizada

**Indicadores Disponíveis**:
1. Ocorrências Aeronáuticas
2. Ocorrências Não Aeronáuticas
3. Atividades Acessórias
4. TAF (Teste de Aptidão Física)
5. PTR-BA - Prova Teórica
6. PTR-BA - Horas de Treinamento
7. Inspeções de Viaturas
8. Tempo EPR (Equipamento de Proteção Respiratória)
9. Tempo de Resposta
10. Controle de Agentes Extintores
11. Controle de Trocas
12. Verificação de TPS
13. Higienização de TPS
14. Controle de Uniformes Recebidos

#### 2.2.2 Módulo de Preenchimento de Indicadores
**Finalidade**: Interface para registro de novos indicadores operacionais.

**Recursos**:
- Modais específicos para cada tipo de indicador
- Validação de dados em tempo real
- Seleção dinâmica de base, equipe e data
- Tabelas editáveis para múltiplos registros
- Cálculos automáticos de status e métricas
- Feedback visual de sucesso/erro

**Fluxo de Preenchimento**:
1. Usuário acessa "Preencher Indicadores"
2. Seleciona o tipo de indicador desejado
3. Preenche formulário com dados obrigatórios
4. Sistema valida e salva no Supabase
5. Dashboard é atualizado automaticamente

#### 2.2.3 Módulo de Histórico
**Finalidade**: Consulta e análise histórica de todos os indicadores preenchidos.

**Recursos**:
- Navegação horizontal por temas (14 indicadores)
- Filtros avançados (data início/fim, equipe, período)
- Contadores de registros por tema (atualizados mensalmente)
- Visualização tabular com paginação
- Sistema de cache inteligente (5 min frescos, 10 min stale)
- Exportação de dados (futuro)

**Funcionalidades Especiais**:
- Cache persistente entre navegações
- Atualização em background de dados antigos
- Timeout de 25 segundos para evitar travamentos
- Isolamento automático por base do usuário

### 2.3 Recursos Técnicos

#### 2.3.1 Performance e Otimização
- **Cache em Memória**: Sistema de cache com duração de 5 minutos (frescos) e 10 minutos (stale)
- **Debouncing**: Atraso de 300ms em filtros para reduzir requisições
- **AbortController**: Cancelamento de requisições antigas ao navegar
- **Lazy Loading**: Carregamento sob demanda de componentes
- **Query Limits**: Limite de 1000 registros por consulta

#### 2.3.2 Visualizações Gráficas
- **Biblioteca**: Recharts
- **Tipos de Gráficos**:
  - LineChart: Evolução temporal
  - BarChart: Comparação de categorias
  - AreaChart: Tendências acumuladas
  - PieChart: Distribuição percentual
  - Treemap: Distribuição hierárquica
  - Heatmap: Intensidade por localização
- **Tema de Cores**: Laranja (#fb923c, #f97316), Branco, Preto (#1f1f1f)

#### 2.3.3 Tratamento de Erros
- Mensagens de erro amigáveis
- Retry automático com backoff exponencial
- Timeout de 25 segundos para requisições
- Logs detalhados para debugging
- Estados de loading e erro visuais

---

## 3. Como o Produto Funciona

### 3.1 Fluxo de Autenticação

1. **Login**:
   - Usuário acessa `/login`
   - Informa email e senha
   - Opcionalmente marca "Lembrar-me"
   - Sistema valida credenciais via Supabase Auth
   - Busca perfil do usuário (secao_id, equipe_id, perfil)
   - Redireciona para dashboard apropriado

2. **Sessão**:
   - Sessão mantida via cookies do Supabase
   - Timeout configurável (padrão: 15 segundos para inicialização)
   - Refresh automático de perfil quando necessário

3. **Logout**:
   - Limpa sessão local
   - Redireciona para página de login

### 3.2 Fluxo de Preenchimento de Indicadores

1. **Acesso ao Módulo**:
   - Usuário BA-CE acessa "Preencher Indicadores"
   - Visualiza cards de todos os indicadores disponíveis

2. **Seleção e Preenchimento**:
   - Clica no card do indicador desejado
   - Modal abre com formulário específico
   - Seleciona base (pré-preenchida para BA-CE), data e equipe
   - Preenche dados específicos do indicador
   - Sistema valida dados (campos obrigatórios, formatos, regras de negócio)

3. **Salvamento**:
   - Dados são salvos no Supabase com `secao_id` e `equipe_id` automáticos
   - RLS garante que apenas dados da base do usuário sejam salvos
   - Cache é invalidado para forçar atualização
   - Modal fecha e feedback de sucesso é exibido

### 3.3 Fluxo de Visualização de Dashboards

1. **Navegação**:
   - Usuário acessa dashboard principal
   - Navega entre abas de indicadores via navbar horizontal
   - Sistema verifica cache antes de buscar dados

2. **Carregamento de Dados**:
   - Se cache válido: retorna dados imediatamente
   - Se cache antigo: retorna dados e atualiza em background
   - Se sem cache: busca do Supabase com filtros RLS aplicados
   - Aplica filtros do usuário (equipe, tipo, período)
   - Calcula métricas e gera visualizações

3. **Exibição**:
   - Cards com métricas principais (cor laranja)
   - Gráficos interativos com tooltips
   - Tabelas detalhadas com paginação
   - Filtros aplicados visualmente

### 3.4 Fluxo de Consulta de Histórico

1. **Acesso**:
   - Usuário acessa "Histórico"
   - Sistema carrega dados do cache se disponível
   - Exibe navbar de temas com contadores

2. **Navegação e Filtros**:
   - Usuário seleciona tema na navbar
   - Aplica filtros (data, equipe, período)
   - Sistema busca dados com filtros aplicados
   - Exibe resultados em tabela paginada

3. **Performance**:
   - Cache persiste entre mudanças de tema
   - Dados antigos são retornados imediatamente
   - Atualização ocorre em background se necessário
   - Timeout previne travamentos

### 3.5 Isolamento de Dados (RLS)

**Como Funciona**:
- Cada usuário tem `secao_id` e `equipe_id` no perfil
- Todas as queries aplicam filtros automáticos:
  - BA-CE: `WHERE secao_id = user.secao_id AND equipe_id = user.equipe_id`
  - Gerente: `WHERE secao_id = user.secao_id`
  - Gestor POP: Sem filtros (acessa todas as seções)
- RLS no banco garante isolamento mesmo se filtros forem bypassados
- Cache é separado por `secao_id` para evitar vazamento de dados

---

## 4. Requisitos Técnicos

### 4.1 Stack Tecnológico
- **Frontend**: Next.js 15.5.6, React 19.1.0
- **Estilização**: Tailwind CSS 4
- **Gráficos**: Recharts 2.11.1
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Animações**: Framer Motion 12.23.24
- **Ícones**: Lucide React 0.546.0
- **Validação**: Zod 4.1.12, React Hook Form 7.65.0

### 4.2 Requisitos de Performance
- Carregamento inicial: < 3 segundos
- Navegação entre abas: < 500ms (com cache)
- Timeout de requisições: 25 segundos
- Cache duration: 5 minutos (frescos), 10 minutos (stale)
- Debounce em filtros: 300ms

### 4.3 Requisitos de Segurança
- Autenticação obrigatória para todas as rotas
- RLS habilitado em todas as tabelas
- Validação de dados no frontend e backend
- Sanitização de inputs
- Timeout de sessão configurável

---

## 5. Casos de Uso Principais

### 5.1 BA-CE Preenche Indicador
1. Login no sistema
2. Acessa "Preencher Indicadores"
3. Seleciona "Tempo de Resposta"
4. Preenche formulário com dados do exercício
5. Salva e recebe confirmação
6. Visualiza dados atualizados no dashboard

### 5.2 Gerente Visualiza Dashboard
1. Login no sistema
2. Acessa dashboard principal
3. Navega para "Ocorrências Aeronáuticas"
4. Aplica filtros (equipe, período)
5. Analisa gráficos e métricas
6. Exporta relatório (futuro)

### 5.3 Gestor POP Analisa Todas as Bases
1. Login no sistema
2. Acessa dashboard principal
3. Visualiza dados consolidados de todas as seções
4. Compara performance entre bases
5. Gera relatórios gerenciais

### 5.4 Consulta Histórica
1. Login no sistema
2. Acessa "Histórico"
3. Seleciona tema "TAF"
4. Aplica filtro de período (últimos 6 meses)
5. Visualiza todos os registros
6. Navega para outro tema mantendo filtros

---

## 6. Melhorias Futuras

- Exportação de dados (CSV, PDF)
- Notificações push para eventos importantes
- Relatórios agendados por email
- Dashboard personalizável por usuário
- Integração com sistemas externos
- App mobile (React Native)
- Análise preditiva com IA

---

**Versão do Documento**: 1.0  
**Data de Criação**: 2025-01-25  
**Última Atualização**: 2025-01-25

