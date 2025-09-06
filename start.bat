@echo off
REM Script de démarrage rapide pour Phoenix ZPlace Website (Windows)

echo 🚀 Démarrage de Phoenix ZPlace Website...

REM Vérifier si Docker est installé
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker n'est pas installé. Veuillez installer Docker pour continuer.
    pause
    exit /b 1
)

REM Vérifier si Docker Compose est installé
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose pour continuer.
    pause
    exit /b 1
)

echo ✅ Docker et Docker Compose détectés

REM Construire et lancer les conteneurs
echo 🔨 Construction de l'image Docker...
docker-compose build

echo 🚀 Lancement du serveur...
docker-compose up -d

REM Attendre que le serveur soit prêt
echo ⏳ Attente du démarrage du serveur...
timeout /t 10 /nobreak >nul

REM Vérifier la santé du serveur
curl -f http://localhost:3000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Serveur démarré avec succès !
    echo 🌐 Accédez à votre site : http://localhost:3000
    echo 🏥 Endpoint de santé : http://localhost:3000/health
    echo 📊 Logs : docker-compose logs -f
    echo 🛑 Arrêter : docker-compose down
) else (
    echo ❌ Échec du démarrage du serveur
    echo 📊 Vérifiez les logs : docker-compose logs
)

pause
