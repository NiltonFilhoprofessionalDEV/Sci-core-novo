# 🚀 Guia de Configuração do GitHub

Este guia explica como configurar suas credenciais do GitHub para usar o script de deploy automático.

## 📋 Pré-requisitos

- Git instalado no seu sistema
- Conta no GitHub
- Repositório criado no GitHub (pode estar vazio)

## 🔐 Métodos de Autenticação

### Método 1: Token de Acesso Pessoal (Recomendado)

#### 1. Criar Token no GitHub

1. Acesse [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Clique em "Generate new token" > "Generate new token (classic)"
3. Configure o token:
   - **Note**: Digite um nome descritivo (ex: "Deploy Script")
   - **Expiration**: Escolha a validade (recomendado: 90 days)
   - **Scopes**: Selecione as permissões necessárias:
     - ✅ `repo` (acesso completo aos repositórios privados)
     - ✅ `workflow` (se usar GitHub Actions)
     - ✅ `write:packages` (se usar GitHub Packages)

4. Clique em "Generate token"
5. **IMPORTANTE**: Copie o token imediatamente (você não conseguirá vê-lo novamente)

#### 2. Configurar Token Localmente

**Opção A: Usar Git Credential Manager (Recomendado)**
```bash
# O Git Credential Manager irá solicitar suas credenciais automaticamente
# Use seu username do GitHub e o token como senha
```

**Opção B: Configurar URL com Token**
```bash
git remote set-url origin https://SEU_USERNAME:SEU_TOKEN@github.com/usuario/repositorio.git
```

**Opção C: Usar Git Credential Store**
```bash
git config --global credential.helper store
# Na primeira vez que fizer push, digite username e token
# As credenciais serão salvas automaticamente
```

### Método 2: Chave SSH

#### 1. Gerar Chave SSH

```bash
# Gerar nova chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Ou, se seu sistema não suporta Ed25519:
ssh-keygen -t rsa -b 4096 -C "seu-email@exemplo.com"
```

#### 2. Adicionar Chave ao SSH Agent

```bash
# Iniciar ssh-agent
eval "$(ssh-agent -s)"

# Adicionar chave privada ao ssh-agent
ssh-add ~/.ssh/id_ed25519
```

#### 3. Adicionar Chave Pública ao GitHub

1. Copie a chave pública:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

2. Acesse [GitHub Settings > SSH and GPG keys](https://github.com/settings/keys)
3. Clique em "New SSH key"
4. Cole a chave pública e dê um título descritivo
5. Clique em "Add SSH key"

#### 4. Configurar Repositório para SSH

```bash
git remote set-url origin git@github.com:usuario/repositorio.git
```

## 🛠️ Configuração do Git

### Configurar Identidade

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

### Verificar Configuração

```bash
git config --list
```

## 🚀 Usando o Script de Deploy

### 1. Executar o Script

```bash
node deploy-github.js
```

### 2. Seguir as Instruções

O script irá:
- ✅ Verificar se Git está instalado
- ✅ Verificar se é um repositório Git (inicializar se necessário)
- ✅ Configurar usuário Git (se não configurado)
- ✅ Solicitar URL do repositório (se não configurado)
- ✅ Adicionar arquivos ao staging
- ✅ Fazer commit com mensagem personalizada
- ✅ Configurar remote origin
- ✅ Fazer push para GitHub
- ✅ Verificar se o deploy foi bem-sucedido

## ❌ Resolução de Problemas Comuns

### Erro de Autenticação

**Problema**: `Authentication failed` ou `Permission denied`

**Soluções**:
1. Verifique se o token está correto e não expirou
2. Verifique se o token tem as permissões necessárias (`repo`)
3. Para SSH, verifique se a chave está adicionada ao ssh-agent
4. Teste a conexão: `ssh -T git@github.com`

### Erro de Push Rejeitado

**Problema**: `rejected` ou `non-fast-forward`

**Soluções**:
1. Sincronizar com o repositório remoto:
   ```bash
   git pull origin main --rebase
   ```
2. Resolver conflitos se houver
3. Tentar push novamente

### Repositório Não Encontrado

**Problema**: `repository not found`

**Soluções**:
1. Verifique se a URL do repositório está correta
2. Verifique se você tem acesso ao repositório
3. Verifique se o repositório existe no GitHub

### Branch Não Existe

**Problema**: `branch 'main' not found`

**Soluções**:
1. O script tentará automaticamente usar 'master'
2. Ou crie a branch main:
   ```bash
   git checkout -b main
   ```

## 🔒 Segurança

### Boas Práticas

- ✅ Use tokens com escopo mínimo necessário
- ✅ Configure expiração para tokens
- ✅ Nunca compartilhe tokens ou chaves privadas
- ✅ Use diferentes tokens para diferentes projetos
- ✅ Revogue tokens não utilizados
- ✅ Use Git Credential Manager quando possível

### Revogar Token

1. Acesse [GitHub Settings > Personal access tokens](https://github.com/settings/tokens)
2. Encontre o token que deseja revogar
3. Clique em "Delete"

## 📞 Suporte

Se você encontrar problemas:

1. Verifique os logs de erro do script
2. Consulte a [documentação oficial do Git](https://git-scm.com/docs)
3. Consulte a [documentação do GitHub](https://docs.github.com/)
4. Verifique se todas as dependências estão instaladas

## 📝 Comandos Úteis

```bash
# Verificar status do repositório
git status

# Ver histórico de commits
git log --oneline

# Ver repositórios remotos configurados
git remote -v

# Testar conexão SSH com GitHub
ssh -T git@github.com

# Ver configuração do Git
git config --list

# Limpar credenciais salvas
git config --global --unset credential.helper
```

---

**Nota**: Este guia foi criado para funcionar com o script `deploy-github.js`. Certifique-se de que o script está na raiz do seu projeto antes de executá-lo.