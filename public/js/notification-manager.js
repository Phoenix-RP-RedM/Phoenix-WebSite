/**
 * Gestionnaire des notifications PWA - Version simplifiée
 * Logique corrigée selon les spécifications
 */

class NotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.subscription = null;
        this.isPWAInstalled = false;
        this.init();
    }

    async init() {
        if (!this.isSupported) {
            console.warn('Les notifications ne sont pas supportées par ce navigateur');
            return;
        }

        // Charger les préférences utilisateur
        this.loadPreferences();
        
        // Détecter si PWA est installée
        await this.checkPWAInstallation();
        
        // Créer l'interface de gestion des notifications
        this.createNotificationUI();
        
        // Vérifier si l'utilisateur est déjà abonné
        await this.checkExistingSubscription();
    }

    loadPreferences() {
        this.preferences = {
            enabled: localStorage.getItem('notifications-enabled') === 'true',
            updates: localStorage.getItem('notifications-updates') !== 'false',
            events: localStorage.getItem('notifications-events') !== 'false',
            frequency: localStorage.getItem('notifications-frequency') || 'normal',
            everActivated: localStorage.getItem('notifications-ever-activated') === 'true'
        };
    }

    savePreferences() {
        localStorage.setItem('notifications-enabled', this.preferences.enabled);
        localStorage.setItem('notifications-updates', this.preferences.updates);
        localStorage.setItem('notifications-events', this.preferences.events);
        localStorage.setItem('notifications-frequency', this.preferences.frequency);
        localStorage.setItem('notifications-ever-activated', this.preferences.everActivated);
    }

    async checkPWAInstallation() {
        this.isPWAInstalled = 
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://') ||
            window.location.search.includes('homescreen=1');
        
        console.log('PWA installée:', this.isPWAInstalled);
        
        // Écouter les changements de mode d'affichage
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            console.log('Changement mode PWA détecté:', e.matches);
            this.isPWAInstalled = e.matches;
            this.updateUIBasedOnPWAStatus();
        });
    }

    createNotificationUI() {
        // Logique simplifiée selon les spécifications :
        // Header : Bouton UNIQUEMENT si PWA installée ET notifications jamais activées
        // Footer : Tout le reste (paramètres et aide)
        
        const shouldShowInHeader = this.isPWAInstalled && !this.preferences.everActivated && this.permission !== 'denied';
        const shouldShowInFooter = this.isPWAInstalled && (this.preferences.everActivated || this.permission === 'denied');
        
        if (shouldShowInHeader) {
            this.createHeaderButton();
        } else if (shouldShowInFooter) {
            this.createFooterInterface();
        }

        // Panneau de configuration toujours disponible si autorisé
        if (this.permission !== 'denied') {
            this.createSettingsPanel();
        }
    }

    createHeaderButton() {
        const header = document.querySelector('.header');
        if (!header) return;

        const notificationButton = document.createElement('button');
        notificationButton.id = 'notification-toggle';
        notificationButton.className = 'notification-btn';
        notificationButton.innerHTML = '🔕 <span>Activer les notifications</span>';
        notificationButton.addEventListener('click', () => this.requestPermissionAndSubscribe());
        
        header.appendChild(notificationButton);
    }

    createFooterInterface() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        const notificationInfo = document.createElement('div');
        notificationInfo.className = 'notification-info';
        
        if (this.permission === 'denied') {
            // Cas : notifications refusées - aide pour réactiver
            notificationInfo.innerHTML = `
                <div class="notification-info-content">
                    <span class="notification-icon">🔕</span>
                    <div class="notification-text">
                        <p><strong>Notifications bloquées</strong></p>
                        <p>Vous pouvez les réactiver dans les paramètres de votre navigateur</p>
                    </div>
                    <button class="notification-learn-more" data-action="toggle-help">
                        Comment faire ?
                    </button>
                </div>
                <div class="notification-details hidden">
                    <p>Pour réactiver les notifications :</p>
                    <ul>
                        <li>🔧 Ouvrez les paramètres de votre navigateur</li>
                        <li>🔔 Allez dans "Notifications" ou "Autorisations"</li>
                        <li>✅ Autorisez les notifications pour ce site</li>
                        <li>🔄 Rechargez la page</li>
                    </ul>
                    <p><small>Les notifications vous permettront de recevoir les mises à jour importantes.</small></p>
                </div>
            `;
        } else if (this.preferences.everActivated) {
            // Cas : notifications déjà activées une fois - gestion des paramètres
            const isEnabled = this.preferences.enabled;
            notificationInfo.innerHTML = `
                <div class="notification-info-content">
                    <span class="notification-icon">${isEnabled ? '🔔' : '🔕'}</span>
                    <div class="notification-text">
                        <p><strong>Notifications ${isEnabled ? 'activées' : 'désactivées'}</strong></p>
                        <p>Gérez vos préférences de notification</p>
                    </div>
                    <button class="notification-learn-more" data-action="open-settings">
                        ⚙️ Paramètres
                    </button>
                </div>
            `;
        }
        
        this.bindFooterEvents(notificationInfo);
        footer.insertBefore(notificationInfo, footer.firstChild);
    }

    bindFooterEvents(container) {
        // Gestionnaire pour l'aide
        const helpButton = container.querySelector('[data-action="toggle-help"]');
        if (helpButton) {
            const detailsDiv = container.querySelector('.notification-details');
            helpButton.addEventListener('click', () => {
                detailsDiv.classList.toggle('hidden');
                helpButton.textContent = detailsDiv.classList.contains('hidden') ? 'Comment faire ?' : 'Masquer';
            });
        }

        // Gestionnaire pour les paramètres
        const settingsButton = container.querySelector('[data-action="open-settings"]');
        if (settingsButton) {
            settingsButton.addEventListener('click', () => this.openSettings());
        }
    }

    openSettings() {
        const settingsPanel = document.querySelector('#notification-settings');
        if (settingsPanel) {
            settingsPanel.classList.remove('hidden');
        }
    }

    createSettingsPanel() {
        const panel = document.createElement('div');
        panel.id = 'notification-settings';
        panel.className = 'notification-settings hidden';
        panel.innerHTML = `
            <div class="notification-settings-content">
                <h3>🔔 Paramètres de notifications</h3>
                <div class="setting-group">
                    <label class="setting-item">
                        <input type="checkbox" id="notify-updates" ${this.preferences.updates ? 'checked' : ''}>
                        <span>Mises à jour de l'application</span>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="notify-events" ${this.preferences.events ? 'checked' : ''}>
                        <span>Événements ZEvent</span>
                    </label>
                </div>
                <div class="setting-group">
                    <label>Fréquence des notifications :</label>
                    <select id="notify-frequency">
                        <option value="minimal" ${this.preferences.frequency === 'minimal' ? 'selected' : ''}>Minimales</option>
                        <option value="normal" ${this.preferences.frequency === 'normal' ? 'selected' : ''}>Normales</option>
                        <option value="frequent" ${this.preferences.frequency === 'frequent' ? 'selected' : ''}>Fréquentes</option>
                    </select>
                </div>
                <div class="settings-actions">
                    <button id="save-settings" class="btn-primary">💾 Sauvegarder</button>
                    <button id="test-notification" class="btn-secondary">🧪 Tester</button>
                    <button id="unsubscribe-notifications" class="btn-danger">🚫 Se désabonner</button>
                </div>
                <button id="close-settings" class="close-btn">✕</button>
            </div>
        `;

        document.body.appendChild(panel);
        this.bindSettingsEvents(panel);
    }

    bindSettingsEvents(panel) {
        // Sauvegarder
        panel.querySelector('#save-settings').addEventListener('click', () => {
            this.preferences.updates = panel.querySelector('#notify-updates').checked;
            this.preferences.events = panel.querySelector('#notify-events').checked;
            this.preferences.frequency = panel.querySelector('#notify-frequency').value;
            this.savePreferences();
            this.showMessage('Paramètres sauvegardés !', 'success');
        });

        // Tester
        panel.querySelector('#test-notification').addEventListener('click', () => {
            this.sendTestNotification();
        });

        // Se désabonner
        panel.querySelector('#unsubscribe-notifications').addEventListener('click', () => {
            this.unsubscribe();
        });

        // Fermer
        panel.querySelector('#close-settings').addEventListener('click', () => {
            panel.classList.add('hidden');
        });

        // Fermer en cliquant à côté
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.classList.add('hidden');
            }
        });
    }

    updateUIBasedOnPWAStatus() {
        // Supprimer les éléments existants
        const existingButton = document.querySelector('#notification-toggle');
        const existingInfo = document.querySelector('.notification-info');
        
        if (existingButton) existingButton.remove();
        if (existingInfo) existingInfo.remove();
        
        // Re-créer l'interface appropriée
        this.checkPWAInstallation().then(() => {
            const shouldShowInHeader = this.isPWAInstalled && !this.preferences.everActivated && this.permission !== 'denied';
            const shouldShowInFooter = this.isPWAInstalled && (this.preferences.everActivated || this.permission === 'denied');
            
            if (shouldShowInHeader) {
                this.createHeaderButton();
            } else if (shouldShowInFooter) {
                this.createFooterInterface();
            }
        });
    }

    async requestPermissionAndSubscribe() {
        try {
            this.permission = await Notification.requestPermission();
            
            if (this.permission === 'granted') {
                await this.subscribe();
                this.preferences.enabled = true;
                this.preferences.everActivated = true; // Marquer comme déjà activé
                this.savePreferences();
                this.updateUIBasedOnPWAStatus();
                this.showMessage('Notifications activées ! 🎉', 'success');
                
                setTimeout(() => this.sendWelcomeNotification(), 1000);
            } else {
                this.showMessage('Permission refusée pour les notifications', 'warning');
                this.updateUIBasedOnPWAStatus();
            }
        } catch (error) {
            console.error('Erreur lors de l\'activation des notifications:', error);
            this.showMessage('Erreur lors de l\'activation des notifications', 'error');
        }
    }

    async subscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI9stpf_kznoHRBSTtfn2H-YsGnVeRWqf_w8D8tVbp_r1pSUjT0HDkQZC0';
            
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });

            console.log('Abonnement réussi:', this.subscription);
        } catch (error) {
            console.error('Erreur lors de l\'abonnement:', error);
            throw error;
        }
    }

    async unsubscribe() {
        try {
            if (this.subscription) {
                await this.subscription.unsubscribe();
                this.subscription = null;
            }
            
            this.preferences.enabled = false;
            this.savePreferences();
            this.updateUIBasedOnPWAStatus();
            
            document.querySelector('#notification-settings').classList.add('hidden');
            this.showMessage('Vous êtes désabonné des notifications', 'info');
        } catch (error) {
            console.error('Erreur lors du désabonnement:', error);
            this.showMessage('Erreur lors du désabonnement', 'error');
        }
    }

    async checkExistingSubscription() {
        try {
            const registration = await navigator.serviceWorker.ready;
            this.subscription = await registration.pushManager.getSubscription();
            
            if (this.subscription && this.preferences.enabled) {
                console.log('Abonnement existant trouvé');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'abonnement:', error);
        }
    }

    sendWelcomeNotification() {
        if (this.permission === 'granted') {
            new Notification('🔥 Cendres Incandescentes', {
                body: 'Notifications activées ! Vous recevrez les mises à jour importantes.',
                icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
                tag: 'welcome'
            });
        }
    }

    sendTestNotification() {
        if (this.permission === 'granted') {
            new Notification('🧪 Test de notification', {
                body: 'Vos notifications fonctionnent parfaitement !',
                icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
                tag: 'test'
            });
        } else {
            this.showMessage('Les notifications ne sont pas autorisées', 'warning');
        }
    }

    async sendNotification(title, options = {}) {
        if (!this.preferences.enabled || this.permission !== 'granted') {
            return false;
        }

        if (options.type === 'update' && !this.preferences.updates) return false;
        if (options.type === 'event' && !this.preferences.events) return false;

        if (this.preferences.frequency === 'minimal' && options.priority !== 'high') {
            return false;
        }

        const defaultOptions = {
            icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
            badge: '/Logo-Cendres_Incandescentes-Fond_transparent.png'
        };

        new Notification(title, { ...defaultOptions, ...options });
        return true;
    }

    showMessage(message, type = 'info') {
        let messageEl = document.querySelector('#notification-message');
        if (!messageEl) {
            messageEl = document.createElement('div');
            messageEl.id = 'notification-message';
            messageEl.className = 'notification-message';
            document.body.appendChild(messageEl);
        }

        messageEl.textContent = message;
        messageEl.className = `notification-message ${type} show`;

        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

export default NotificationManager;
