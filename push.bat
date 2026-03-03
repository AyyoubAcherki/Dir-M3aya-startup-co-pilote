@echo off
title Dir-M3aya - Git Push Script
echo ==========================================
echo    DIR-M3AYA : SAUVEGARDE SUR GITHUB
echo ==========================================
echo.

:: Ensure we are in the project repo
if not exist ".git\" (
    echo [!] Erreur: Ce dossier n'est pas un depot Git valide.
    echo [!] Initialisation en cours...
    git init
    git remote add origin https://github.com/AyyoubAcherki/Dir-M3aya-startup-co-pilote.git
)

:: Stage all changes in current directory
echo [1/3] Preparation des fichiers (uniquement ce projet)...
git add .

:: Ask for commit message
set "msg=Mise a jour automatique Dir-M3aya"
set /p "user_msg=Entrez un message de commit (ou laissez vide pour defaut) : "
if not "%user_msg%"=="" set "msg=%user_msg%"

:: Commit
echo [2/3] Enregistrement des modifications...
git commit -m "%msg%"

:: Push with upstream setup if needed
echo [3/3] Envoi vers GitHub...
git push -u origin master 2>nul
if %errorlevel% neq 0 (
    echo [!] Echec de l'envoi vers 'master', tentative vers 'main'...
    git push -u origin main
)

echo.
echo ==========================================
echo    Sauvegarde terminee avec succes !
echo ==========================================
pause
