# 🚀 Configuração do Deploy na Vercel

Este guia explica como configurar corretamente o projeto na Vercel para evitar problemas de carregamento infinito.

## 📋 Pré-requisitos

- Conta na [Vercel](https://vercel.com)
- Projeto conectado ao GitHub
- Acesso ao painel do Supabase

## 🔧 Configuração das Variáveis de Ambiente

### 1. Acessar as Configurações do Projeto na Vercel

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** → **Environment Variables**

### 2. Adicionar as Variáveis Obrigatórias

Adicione as seguintes variáveis de ambiente:

```bash
# URL do seu projeto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key) do Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_aqui
```

### 3. Como Obter as Credenciais do Supabase

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Problemas Comuns e Soluções

### Problema: Tela "Carregando..." Infinita

**Possíveis Causas:**
- Variáveis de ambiente não configuradas
- URL do Supabase incorreta
- Problemas de conectividade

**Soluções:**
1. Verifique se todas as variáveis estão configuradas corretamente
2. Confirme se a URL do Supabase está acessível
3. Verifique os logs do console do navegador (F12)

### Problema: Erro de Conexão

**Soluções:**
1. Verifique se o projeto Supabase está ativo
2. Confirme se as chaves de API estão corretas
3. Verifique se não há restrições de CORS no Supabase

## 🔍 Debug e Monitoramento

### Verificar Logs na Vercel

1. Acesse **Functions** → **View Function Logs**
2. Procure por erros relacionados ao Supabase
3. Verifique se as variáveis de ambiente estão sendo carregadas

### Verificar Console do Navegador

1. Abra o site deployado
2. Pressione F12 para abrir o DevTools
3. Vá para a aba **Console**
4. Procure por mensagens de erro ou debug que começam com:
   - `🔄 useAuth - Inicializando autenticação...`
   - `❌ useAuth - Erro ao obter sessão:`
   - `⏰ useAuth - Timeout na inicialização`

## 🚀 Processo de Deploy

### Deploy Automático

Após configurar as variáveis de ambiente:

1. Faça um commit das alterações no GitHub
2. A Vercel fará o deploy automaticamente
3. Aguarde a conclusão do build
4. Teste o site deployado

### Deploy Manual

Se necessário, você pode forçar um novo deploy:

1. Vá para **Deployments**
2. Clique nos três pontos do último deploy
3. Selecione **Redeploy**

## ✅ Checklist de Verificação

- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] URL do Supabase acessível
- [ ] Chaves de API válidas
- [ ] Build concluído sem erros
- [ ] Site carregando corretamente
- [ ] Login funcionando
- [ ] Redirecionamentos funcionando

## 🆘 Suporte

Se o problema persistir:

1. Verifique os logs da Vercel
2. Verifique o console do navegador
3. Confirme se o Supabase está funcionando
4. Teste localmente com `npm run dev`

## 📝 Notas Importantes

- As variáveis `NEXT_PUBLIC_*` são expostas no cliente
- Nunca coloque chaves privadas em variáveis `NEXT_PUBLIC_*`
- Sempre use a chave `anon` (pública) do Supabase
- O deploy pode levar alguns minutos para propagar