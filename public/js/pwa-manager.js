// ========================================
// GESTION PWA ET SERVICE WORKER (ESM)
// ========================================

export class PWAManager {
    constructor() {
        this.connectionStatus = document.getElementById('connectionStatus');
        this.isOnline = navigator.onLine;
        this.init();
    }
    
    async init() {
        await this.registerServiceWorker();
        this.setupConnectionMonitoring();
        this.setupPWAInstall();
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker enregistré');
                
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateBanner();
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Échec Service Worker:', error);
            }
        }
    }
    
    setupConnectionMonitoring() {
        const updateStatus = () => {
            this.isOnline = navigator.onLine;
            
            if (this.isOnline) {
                this.connectionStatus.textContent = '📡 En ligne';
                this.connectionStatus.className = 'offline-indicator online-indicator show';
                setTimeout(() => this.connectionStatus.classList.remove('show'), 3000);
            } else {
                this.connectionStatus.textContent = '📴 Mode hors ligne';
                this.connectionStatus.className = 'offline-indicator show';
            }
        };
        
        window.addEventListener('online', updateStatus);
        window.addEventListener('offline', updateStatus);
        
        if (!this.isOnline) updateStatus();
    }
    
    setupPWAInstall() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton(deferredPrompt);
        });
    }
    
    showInstallButton(prompt) {
        const button = document.createElement('button');
        button.textContent = '📱 Installer l\'app';
        button.style.cssText = `
            position: fixed; bottom: 20px; left: 20px;
            background: var(--primary-color); color: white;
            border: none; padding: 12px 20px; border-radius: 25px;
            font-weight: 600; cursor: pointer; z-index: 1000;
            box-shadow: var(--shadow-medium); transition: var(--transition);
        `;
        
        button.onclick = async () => {
            prompt.prompt();
            await prompt.userChoice;
            button.remove();
        };
        
        document.body.appendChild(button);
    }
    
    showUpdateBanner() {
        const banner = document.createElement('div');
        banner.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; background: var(--accent-color);
                        color: var(--text-primary); padding: 1rem; text-align: center;
                        font-weight: 600; z-index: 1001; box-shadow: var(--shadow-medium);">
                🔄 Nouvelle version disponible ! 
                <button id="updateButton" style="background: var(--primary-color);
                        color: white; border: none; padding: 8px 16px; border-radius: 20px;
                        margin-left: 10px; cursor: pointer;">Actualiser</button>
                <button id="dismissButton" style="background: transparent;
                        color: var(--text-primary); border: 1px solid; padding: 8px 16px; 
                        border-radius: 20px; margin-left: 10px; cursor: pointer;">Plus tard</button>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Gestionnaire pour le bouton actualiser
        document.getElementById('updateButton').addEventListener('click', () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
            } else {
                window.location.reload();
            }
        });
        
        // Gestionnaire pour le bouton dismisser
        document.getElementById('dismissButton').addEventListener('click', () => {
            banner.remove();
        });
    }
}

// Exporter pour utilisation
window.PWAManager = PWAManager;
