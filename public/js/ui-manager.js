// ========================================
// GESTION DE L'INTERFACE (ESM)
// ========================================

export class UIManager {
    constructor() {
        this.logoContainer = document.getElementById('logoContainer');
        this.init();
    }
    
    init() {
        this.setupLogoClick();
        this.updateTimestamp();
        this.preloadAssets();
        this.fetchServerInfo(); // Récupérer les infos serveur
    }
    
    setupLogoClick() {
        this.logoContainer.addEventListener('click', (e) => {
            e.preventDefault();
            window.open('/zplace/ZPlace_Logo_C.I-Final.png', '_blank');
        });
    }
    
    updateTimestamp() {
        const timestamp = document.getElementById('timestamp');
        if (timestamp) {
            // Date de fallback en cas d'échec de récupération serveur
            const fallbackDate = new Date('2025-09-08T12:00:00');
            timestamp.textContent = `Dernière mise à jour : ${fallbackDate.toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            })}`;
        }
    }

    async fetchServerInfo() {
      try {
        const response = await fetch('/api/server-info');
        if (response.ok) {
          const serverInfo = await response.json();
          console.log(`📊 Informations serveur récupérées:`, serverInfo);
          
          if (serverInfo.lastUpdate) {
            UIManager.setLastUpdateDate(serverInfo.lastUpdate);
            console.log(`✅ Date de mise à jour: ${serverInfo.lastUpdate}`);
          }
          else if (serverInfo.startTime) {
            // Utiliser l'heure de démarrage du serveur si pas d'info de build
            UIManager.setLastUpdateDate(serverInfo.startTime);
            console.log(`⏰ Utilisation heure démarrage serveur: ${serverInfo.startTime}`);
          }
        }
        else {
          console.warn(`⚠️ Réponse serveur non OK: ${response.status}`);
        }
      }
      catch (error) {
        console.log(`ℹ️ Infos serveur non disponibles, utilisation date fallback: ${error.message}`);
        // On garde la date de fallback déjà affichée
      }
    }

    // Méthode utilitaire pour mettre à jour facilement la date
    static setLastUpdateDate(dateString) {
        const timestamp = document.getElementById('timestamp');
        if (timestamp) {
            const lastUpdate = new Date(dateString);
            const formattedDate = lastUpdate.toLocaleString('fr-FR', {
                year: 'numeric',
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            timestamp.textContent = `Dernière mise à jour : ${formattedDate}`;
            
            // Ajouter un attribut data pour faciliter les tests
            timestamp.setAttribute('data-last-update', dateString);
            console.log(`🕒 Date mise à jour affichée: ${formattedDate}`);
        }
    }
    
    preloadAssets() {
        // DNS prefetch pour les liens externes seulement
        const domains = ['//github.com', '//discord.gg'];
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
}