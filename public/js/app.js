// ========================================
// INITIALISATION APPLICATION (ESM)
// ========================================

import { PWAManager } from './pwa-manager.js';
import { UIManager } from './ui-manager.js';
import NotificationManager from './notification-manager.js';

// Variable globale pour accéder au gestionnaire de notifications
window.notificationManager = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation Cendres Incandescentes ZPlace (ESM)...');
    
    // Initialisation des gestionnaires
    try {
        new PWAManager();
        new UIManager();
        
        // Initialisation du gestionnaire de notifications
        window.notificationManager = new NotificationManager();
        
        console.log('✅ Application initialisée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        
        // Affichage d'une erreur utilisateur friendly
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-state';
        errorDiv.innerHTML = `
            <h3>🚨 Erreur d'initialisation</h3>
            <p>Une erreur est survenue lors du chargement de l'application.</p>
            <button onclick="location.reload()">🔄 Recharger</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Fonctions utilitaires pour les notifications (accessibles globalement)
window.sendNotification = (title, options = {}) => {
    if (window.notificationManager) {
        return window.notificationManager.sendNotification(title, options);
    }
    return false;
};

// Exemple d'utilisation des notifications (pour démonstration)
window.addEventListener('load', () => {
    // Démonstration après 10 secondes si les notifications sont activées
    setTimeout(() => {
        if (window.notificationManager && window.notificationManager.preferences.enabled) {
            window.sendNotification('🎉 Application chargée !', {
                body: 'Bienvenue dans Cendres Incandescentes ! L\'application est prête.',
                type: 'update',
                priority: 'low'
            });
        }
    }, 10_000);
});

// Gestion d'erreurs globales
window.addEventListener('error', (event) => {
    console.error('❌ Erreur JavaScript:', event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', event.reason);
    event.preventDefault();
});
