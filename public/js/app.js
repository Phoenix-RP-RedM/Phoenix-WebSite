// ========================================
// INITIALISATION APPLICATION (ESM)
// ========================================

import { PWAManager } from './pwa-manager.js';
import { UIManager } from './ui-manager.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initialisation Cendres Incandescentes ZPlace (ESM)...');
    
    // Initialisation des gestionnaires
    try {
        new PWAManager();
        new UIManager();
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

// Gestion d'erreurs globales
window.addEventListener('error', (event) => {
    console.error('❌ Erreur JavaScript:', event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Promise rejetée:', event.reason);
    event.preventDefault();
});
