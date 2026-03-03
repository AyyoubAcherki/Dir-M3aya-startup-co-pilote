@echo off
title Dir-M3aya - Startup Control
echo ==========================================
echo    DIR-M3AYA : EXPERT ENTREPRENEUR MAROC
echo ==========================================
echo.

:: Check for node_modules
if not exist "node_modules\" (
    echo [1/3] Installation des dependances...
    call npm install
) else (
    echo [1/3] Dependances deja installees.
)

echo [2/3] Verification d'Ollama...
ollama list >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] ATTENTION: Ollama ne semble pas etre lance.
    echo [!] Assurez-vous d'avoir installe Ollama (https://ollama.ai)
    echo [!] Et d'avoir telecharge les modeles:
    echo     ollama pull llama3.1
    echo     ollama pull llama3.2-vision
    echo.
    pause
) else (
    echo [2/3] Ollama est pret.
)

echo [3/3] Lancement de l'application...
echo.
echo ==========================================
echo    L'application sera accessible sur:
echo    http://localhost:3000
echo ==========================================
echo.

npm run dev
pause
