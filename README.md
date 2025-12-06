# Sistema de Indicadores - Corpo de Bombeiros

Sistema web para gerenciamento e visualização de indicadores operacionais do Corpo de Bombeiros, desenvolvido com Next.js e Supabase.

## 🚀 Tecnologias

- **Framework:** Next.js 15 (App Router)
- **React:** 19.1.0
- **Backend/Database:** Supabase (PostgreSQL + Auth + Storage)
- **Estilização:** TailwindCSS 4
- **Formulários:** React Hook Form + Zod
- **Gráficos:** Recharts
- **Animações:** Framer Motion
- **Ícones:** Lucide React
- **Notificações:** Sonner
- **Linguagem:** TypeScript 5

## 📋 Pré-requisitos

- Node.js 20+ 
- npm ou yarn
- Conta no Supabase (para configurar o banco de dados)

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone [url-do-repositorio]
cd Sci-core-novo
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute as migrações do banco de dados:
- Acesse o dashboard do Supabase
- Execute os scripts SQL em `supabase/migrations/` na ordem cronológica

## 🏃 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
Sci-core-novo/
├── src/
│   ├── app/                    # Páginas e rotas (App Router)
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Dashboard e visualizações
│   │   ├── indicadores/       # Gestão de indicadores
│   │   ├── historico/         # Histórico de dados
│   │   ├── configuracoes/     # Configurações do sistema
│   │   └── login/             # Autenticação
│   ├── components/            # Componentes React
│   │   ├── auth/             # Componentes de autenticação
│   │   ├── dashboard/        # Componentes do dashboard
│   │   ├── filters/          # Filtros e pesquisa
│   │   ├── forms/            # Formulários
│   │   ├── modals/           # Modais
│   │   └── ui/               # Componentes UI reutilizáveis
│   ├── contexts/              # Context API (Auth, Theme, etc)
│   ├── hooks/                 # Custom React Hooks
│   ├── lib/                   # Utilitários e configurações
│   ├── types/                 # TypeScript types
│   └── utils/                 # Funções utilitárias
├── public/                    # Arquivos estáticos
├── supabase/
│   ├── migrations/           # Migrações do banco de dados
│   └── config.toml           # Configuração do Supabase
├── docs/                      # Documentação
│   ├── historico/            # Histórico de correções
│   └── sql-historico/        # Scripts SQL históricos
├── scripts/                   # Scripts utilitários
│   ├── archived/             # Scripts arquivados
│   └── deploy/               # Scripts de deploy
└── data/                      # Dados temporários/arquivados

```

## 🔐 Autenticação

O sistema utiliza Supabase Auth com:
- Login por email e senha
- Recuperação de senha
- Perfis de usuário com níveis de acesso (Row Level Security)
- Sessões persistentes

## 🎯 Funcionalidades Principais

### Dashboard
- 14 tipos de gráficos interativos
- Visualização de KPIs e métricas operacionais
- Filtros avançados por data, seção, equipe e cidade
- Navegação por abas
- Sistema de cache para otimização de performance

### Indicadores
- Cadastro e gerenciamento de indicadores
- Validação de formulários
- Cálculos automáticos
- Histórico de modificações

### Histórico
- Consulta histórica de dados
- Filtros avançados com paginação
- Sistema de cache com stale time
- Debounce para otimização

### Configurações
- Gestão de perfil de usuário
- Configurações do sistema
- Gerenciamento de permissões

## 🔒 Segurança

- Row Level Security (RLS) implementado no Supabase
- Isolamento de dados por perfil e localização
- Políticas de acesso granulares
- Logs de segurança
- Validação de dados no client e server

## 📊 Performance

- Sistema de cache com React Query
- Debounce em pesquisas e filtros
- Lazy loading de componentes
- Otimização de queries
- Timeouts configurados para operações críticas

## 🚀 Deploy

### Vercel (Recomendado)
Consulte [`docs/VERCEL_SETUP.md`](docs/VERCEL_SETUP.md) para instruções detalhadas.

### GitHub
Consulte [`docs/GITHUB_SETUP.md`](docs/GITHUB_SETUP.md) para configuração do repositório.

### Scripts de Deploy Customizados
Scripts disponíveis em `scripts/deploy/`

## 🧪 Testes

O projeto possui validação de:
- Autenticação e gerenciamento de sessão
- Isolamento de dados via RLS
- Validação de formulários
- Sistema de cache
- Tratamento de erros
- Interface responsiva

## 🐛 Troubleshooting

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão configuradas corretamente
- Confirme que as credenciais do Supabase estão válidas

### Problemas de performance
- Limpe o cache do navegador
- Verifique a conexão com a internet
- Consulte os logs no console do navegador

### Erros de build
- Execute `npm install` novamente
- Verifique se a versão do Node.js é compatível (20+)
- Limpe o cache: `rm -rf .next node_modules && npm install`

## 📝 Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar build de produção
npm start

# Verificar segurança
npm audit

# Atualizar dependências
npm update
```

## 📄 Licença

Este projeto é privado e de uso exclusivo do Corpo de Bombeiros.

## 🤝 Contribuindo

Para contribuir com o projeto:
1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Add: nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas sobre o sistema, entre em contato com a equipe de desenvolvimento.

---

**Última atualização:** Dezembro 2025
