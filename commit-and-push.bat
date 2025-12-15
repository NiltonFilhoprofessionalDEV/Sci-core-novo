@echo off
cd /d "%~dp0"
echo Adicionando arquivos ao staging...
git add .
echo.
echo Status do Git:
git status
echo.
echo Fazendo commit...
git commit -m "feat: adicionar React Query e Virtual Scrolling + otimizacoes de performance"
echo.
echo Fazendo push para GitHub...
git push
echo.
echo Concluido!
pause

