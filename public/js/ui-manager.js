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
            timestamp.textContent = 'Dernière mise à jour : ' + new Date().toLocaleString('fr-FR');
        }
    }
    
    preloadAssets() {
        // Préchargement de l'image principale
        const preloadImage = new Image();
        preloadImage.src = '/zplace/ZPlace_Logo_C.I-Final.png';

        // DNS prefetch pour les liens externes
        const domains = ['//github.com', '//discord.gg'];
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
}