#!/bin/bash

# Script de démarrage rapide pour Phoenix ZPlace Website
echo "🚀 Démarrage de Phoenix ZPlace Website..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker pour continuer."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose pour continuer."
    exit 1
fi

echo "✅ Docker et Docker Compose détectés"

# Construire et lancer les conteneurs
echo "🔨 Construction de l'image Docker..."
docker-compose build

echo "🚀 Lancement du serveur..."
docker-compose up -d

# Attendre que le serveur soit prêt
echo "⏳ Attente du démarrage du serveur..."
sleep 10

# Vérifier la santé du serveur
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Serveur démarré avec succès !"
    echo "🌐 Accédez à votre site : http://localhost:3000"
    echo "🏥 Endpoint de santé : http://localhost:3000/health"
    echo "📊 Logs : docker-compose logs -f"
    echo "🛑 Arrêter : docker-compose down"
else
    echo "❌ Échec du démarrage du serveur"
    echo "📊 Vérifiez les logs : docker-compose logs"
    exit 1
fi
