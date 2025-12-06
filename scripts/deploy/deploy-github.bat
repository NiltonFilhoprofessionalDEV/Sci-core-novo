@echo off
chcp 65001 >nul
title Deploy Automático para GitHub

echo.
echo 🚀 DEPLOY AUTOMÁTICO PARA GITHUB
echo =====================================
echo.

REM Verificar se Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERRO: Node.js não está instalado.
    echo Por favor, instale o Node.js primeiro: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o script existe
if not exist "deploy-github.js" (
    echo ❌ ERRO: Arquivo deploy-github.js não encontrado.
    echo Certifique-se de que o script está na mesma pasta.
    pause
    exit /b 1
)

echo ✅ Executando script de deploy...
echo.

REM Executar o script Node.js
node deploy-github.js

echo.
echo Pressione qualquer tecla para fechar...
pause >nul