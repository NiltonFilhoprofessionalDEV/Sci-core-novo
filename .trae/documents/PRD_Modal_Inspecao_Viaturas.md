# PRD - Modal Inspeção de Viaturas

## 1. Product Overview
Modal para registro e controle de inspeções de viaturas realizadas por equipe, integrado à página "Preencher Indicadores" do sistema de gestão de indicadores.
- Permite o registro eficiente da quantidade de checklists de inspeção realizados por equipe em uma base específica, facilitando o controle e acompanhamento mensal.
- Destinado a gestores e operadores que precisam registrar dados de inspeções de viaturas para análise de performance e relatórios gerenciais.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Usuário Autenticado | Login no sistema | Pode registrar dados de inspeção de viaturas para sua base/equipe |

### 2.2 Feature Module
Nosso modal de Inspeção de Viaturas consiste das seguintes funcionalidades principais:
1. **Formulário de Registro**: seleção de base, data, equipe e quantidade de inspeções.
2. **Validação de Dados**: verificação de campos obrigatórios e formato de dados.
3. **Persistência**: salvamento dos dados no Supabase com feedback visual.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Modal Inspeção de Viaturas | Seleção de Base | Dropdown com todas as bases disponíveis no sistema |
| Modal Inspeção de Viaturas | Campo de Data | Date picker formatado DD/MM/AAAA para seleção da data de referência |
| Modal Inspeção de Viaturas | Seleção de Equipe | Dropdown dinâmico que carrega equipes baseado na base selecionada |
| Modal Inspeção de Viaturas | Quantidade de Inspeções | Campo numérico para inserir quantidade de checklists realizados no mês |
| Modal Inspeção de Viaturas | Observações | Campo de texto opcional para comentários adicionais |
| Modal Inspeção de Viaturas | Botões de Ação | Salvar dados com validação e Cancelar para fechar modal |

## 3. Core Process
O usuário acessa a página "Preencher Indicadores", localiza o card "Inspeção de Viaturas" e clica no botão "Preencher". O modal é aberto permitindo:
1. Seleção da base (obrigatório)
2. Seleção da data de referência (obrigatório)
3. Seleção da equipe baseada na base escolhida (obrigatório)
4. Preenchimento da quantidade de checklists realizados no mês (obrigatório)
5. Preenchimento opcional de observações
6. Salvamento dos dados com validação e feedback visual

```mermaid
graph TD
  A[Página Preencher Indicadores] --> B[Card Inspeção de Viaturas]
  B --> C[Botão Preencher]
  C --> D[Modal Inspeção de Viaturas]
  D --> E[Selecionar Base]
  E --> F[Selecionar Data]
  F --> G[Selecionar Equipe]
  G --> H[Inserir Quantidade de Inspeções]
  H --> I[Observações Opcionais]
  I --> J[Salvar Dados]
  J --> K[Feedback de Sucesso]
  K --> L[Fechar Modal]
```

## 4. User Interface Design
### 4.1 Design Style
- **Cores primárias**: #7a5b3e (marrom principal), #fa4b00 (laranja de destaque)
- **Cores secundárias**: #cdbdae (bege claro), branco para fundos
- **Estilo de botões**: Arredondados com hover effects e transições suaves
- **Fonte**: Sistema padrão com tamanhos 14px (corpo), 16px (labels), 24px (título)
- **Layout**: Modal centralizado com formulário em coluna única, campos bem espaçados
- **Ícones**: Lucide React com estilo minimalista, ícone de carro/veículo para o título

### 4.2 Page Design Overview
| Page Name | Module Name | UI Elements |
|-----------|-------------|-------------|
| Modal Inspeção de Viaturas | Cabeçalho | Título "Inspeção de Viaturas" com ícone, botão X para fechar, fundo branco com borda inferior |
| Modal Inspeção de Viaturas | Formulário Principal | Campos organizados verticalmente com labels em cinza escuro, inputs com borda cinza clara e focus laranja |
| Modal Inspeção de Viaturas | Dropdown Base | Select estilizado com ícone de seta, opções com hover em cinza claro |
| Modal Inspeção de Viaturas | Campo Data | Input tipo date com formatação DD/MM/AAAA, ícone de calendário |
| Modal Inspeção de Viaturas | Dropdown Equipe | Select dinâmico habilitado após seleção de base, loading state quando carregando |
| Modal Inspeção de Viaturas | Campo Quantidade | Input numérico com validação, placeholder indicativo |
| Modal Inspeção de Viaturas | Campo Observações | Textarea redimensionável com placeholder, altura mínima 80px |
| Modal Inspeção de Viaturas | Botões de Ação | Botão Salvar (laranja) e Cancelar (cinza), alinhados à direita, com estados de loading |

### 4.3 Responsiveness
Modal responsivo desktop-first com adaptação para mobile. Em telas menores, o modal ocupa 95% da largura com padding reduzido. Campos mantêm largura total em todas as resoluções. Touch-friendly com botões de tamanho adequado para interação móvel.