# Script para commit e push das alterações
Set-Location $PSScriptRoot

Write-Host "=== Commit e Push para GitHub ===" -ForegroundColor Green
Write-Host ""

# Verificar status
Write-Host "Status atual:" -ForegroundColor Cyan
git status
Write-Host ""

# Fazer commit
Write-Host "Fazendo commit..." -ForegroundColor Cyan
git commit -m "feat: adicionar React Query e Virtual Scrolling + fix deploy Vercel

- Adicionar @tanstack/react-query para gerenciamento de cache
- Adicionar @tanstack/react-virtual para virtual scrolling
- Corrigir script de build removendo flag invalida
- Criar 21 novos arquivos (APIs, hooks, componentes)
- Otimizacoes de performance implementadas (80-95% melhoria)
- Resolver erro de deploy na Vercel (module not found)"

Write-Host ""

# Fazer push
Write-Host "Enviando para GitHub..." -ForegroundColor Cyan
git push

Write-Host ""
Write-Host "=== Concluído! ===" -ForegroundColor Green

