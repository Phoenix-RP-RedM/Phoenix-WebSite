/**
 * Gestionnaire des notifications PWA
 * Gère l'autorisation, l'abonnement et la configuration des notifications
 */

class NotificationManager {
    constructor() {
        this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
        this.permission = this.isSupported ? Notification.permission : 'denied';
        this.subscription = null;
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

    async checkPWAInstallation() {
        // Méthodes de détection PWA
        this.isPWAInstalled = 
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone ||
            document.referrer.includes('android-app://') ||
            window.location.search.includes('homescreen=1');
        
        console.log('PWA installée:', this.isPWAInstalled);
        
        // Écouter les changements de mode d'affichage (installation/désinstallation PWA)
        window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
            console.log('Changement mode PWA détecté:', e.matches);
            this.isPWAInstalled = e.matches;
            this.updateUIBasedOnPWAStatus();
        });
    }

    loadPreferences() {
        this.preferences = {
            enabled: localStorage.getItem('notifications-enabled') === 'true',
            updates: localStorage.getItem('notifications-updates') !== 'false', // true par défaut
            events: localStorage.getItem('notifications-events') !== 'false', // true par défaut
            frequency: localStorage.getItem('notifications-frequency') || 'normal'
        };
    }

    savePreferences() {
        localStorage.setItem('notifications-enabled', this.preferences.enabled);
        localStorage.setItem('notifications-updates', this.preferences.updates);
        localStorage.setItem('notifications-events', this.preferences.events);
        localStorage.setItem('notifications-frequency', this.preferences.frequency);
    }

    createNotificationUI() {
        // Déterminer où placer le bouton selon la logique
        const shouldShowInHeader = this.isPWAInstalled && !this.preferences.enabled && this.permission !== 'denied';
        const shouldShowInFooter = this.isPWAInstalled && this.permission === 'denied';
        
        if (shouldShowInHeader) {
            this.createHeaderButton();
        } else if (shouldShowInFooter) {
            this.createFooterNotification();
        }

        // Créer le panneau de configuration (toujours disponible si autorisé)
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
        notificationButton.innerHTML = this.getButtonHTML();
        notificationButton.addEventListener('click', () => this.toggleNotifications());
        
        header.appendChild(notificationButton);
    }

    createFooterNotification() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        const notificationInfo = document.createElement('div');
        notificationInfo.className = 'notification-info';
        notificationInfo.innerHTML = `
            <div class="notification-info-content">
                <span class="notification-icon">�</span>
                <div class="notification-text">
                    <p><strong>Notifications bloquées</strong></p>
                    <p>Vous pouvez les réactiver dans les paramètres de votre navigateur</p>
                </div>
                <button class="notification-learn-more" onclick="this.parentElement.parentElement.querySelector('.notification-details').classList.toggle('hidden')">
                    Comment faire ?
                </button>
            </div>
            <div class="notification-details hidden">
                <p>Pour réactiver les notifications :</p>
                <ul>
                    <li>� Ouvrez les paramètres de votre navigateur</li>
                    <li>🔔 Allez dans "Notifications" ou "Autorisations"</li>
                    <li>✅ Autorisez les notifications pour ce site</li>
                    <li>🔄 Rechargez la page</li>
                </ul>
                <p><small>Les notifications vous permettront de recevoir les mises à jour importantes de l'application.</small></p>
            </div>
        `;
        
        // Insérer avant le contenu existant du footer
        footer.insertBefore(notificationInfo, footer.firstChild);
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
        // Sauvegarder les paramètres
        panel.querySelector('#save-settings').addEventListener('click', () => {
            this.preferences.updates = panel.querySelector('#notify-updates').checked;
            this.preferences.events = panel.querySelector('#notify-events').checked;
            this.preferences.frequency = panel.querySelector('#notify-frequency').value;
            this.savePreferences();
            this.showMessage('Paramètres sauvegardés !', 'success');
        });

        // Tester une notification
        panel.querySelector('#test-notification').addEventListener('click', () => {
            this.sendTestNotification();
        });

        // Se désabonner
        panel.querySelector('#unsubscribe-notifications').addEventListener('click', () => {
            this.unsubscribe();
        });

        // Fermer le panneau
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

    getButtonHTML() {
        if (this.permission === 'denied') {
            return '🔕 <span>Notifications bloquées</span>';
        } else if (this.preferences.enabled && this.subscription) {
            return '🔔 <span>Notifications activées</span>';
        } else {
            return '🔕 <span>Activer les notifications</span>';
        }
    }

    updateButton() {
        const button = document.querySelector('#notification-toggle');
        if (button) {
            button.innerHTML = this.getButtonHTML();
            button.disabled = this.permission === 'denied';
        }
        
        // Re-créer l'interface si nécessaire après un changement d'état PWA
        this.updateUIBasedOnPWAStatus();
    }

    updateUIBasedOnPWAStatus() {
        // Supprimer les éléments existants
        const existingButton = document.querySelector('#notification-toggle');
        const existingInfo = document.querySelector('.notification-info');
        
        if (existingButton) existingButton.remove();
        if (existingInfo) existingInfo.remove();
        
        // Re-détecter le statut PWA
        this.checkPWAInstallation().then(() => {
            // Re-créer l'interface appropriée
            const shouldShowInHeader = this.isPWAInstalled && !this.preferences.enabled && this.permission !== 'denied';
            const shouldShowInFooter = this.isPWAInstalled && this.permission === 'denied';
            
            if (shouldShowInHeader) {
                this.createHeaderButton();
            } else if (shouldShowInFooter) {
                this.createFooterNotification();
            }
        });
    }

    async toggleNotifications() {
        if (this.permission === 'denied') {
            this.showMessage('Les notifications sont bloquées. Veuillez les autoriser dans les paramètres de votre navigateur.', 'error');
            return;
        }

        if (this.preferences.enabled) {
            // Ouvrir le panneau de paramètres
            document.querySelector('#notification-settings').classList.remove('hidden');
        } else {
            // Demander l'autorisation et s'abonner
            await this.requestPermissionAndSubscribe();
        }
    }

    async requestPermissionAndSubscribe() {
        try {
            // Demander l'autorisation
            this.permission = await Notification.requestPermission();
            
            if (this.permission === 'granted') {
                // S'abonner aux notifications push
                await this.subscribe();
                this.preferences.enabled = true;
                this.savePreferences();
                this.updateUIBasedOnPWAStatus(); // Mise à jour de l'interface
                this.showMessage('Notifications activées ! 🎉', 'success');
                
                // Envoyer une notification de bienvenue
                setTimeout(() => {
                    this.sendWelcomeNotification();
                }, 1000);
            } else {
                this.showMessage('Permission refusée pour les notifications', 'warning');
                this.updateUIBasedOnPWAStatus(); // Mise à jour même si refusé
            }
        } catch (error) {
            console.error('Erreur lors de l\'activation des notifications:', error);
            this.showMessage('Erreur lors de l\'activation des notifications', 'error');
        }
    }

    async subscribe() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Clé publique VAPID (à remplacer par votre vraie clé)
            const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI9stpf_kznoHRBSTtfn2H-YsGnVeRWqf_w8D8tVbp_r1pSUjT0HDkQZC0';
            
            this.subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
            });

            console.log('Abonnement réussi:', this.subscription);
            
            // Envoyer l'abonnement au serveur (optionnel)
            // await this.sendSubscriptionToServer(this.subscription);
            
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
            this.updateButton();
            
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
                this.updateButton();
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
                badge: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
                tag: 'welcome',
                requireInteraction: false,
                silent: false
            });
        }
    }

    sendTestNotification() {
        if (this.permission === 'granted') {
            new Notification('🧪 Test de notification', {
                body: 'Ceci est un test ! Vos notifications fonctionnent parfaitement.',
                icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
                badge: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
                tag: 'test',
                requireInteraction: false,
                silent: false
            });
        } else {
            this.showMessage('Les notifications ne sont pas autorisées', 'warning');
        }
    }

    // Méthode pour envoyer des notifications depuis d'autres parties de l'app
    async sendNotification(title, options = {}) {
        if (!this.preferences.enabled || this.permission !== 'granted') {
            return false;
        }

        // Vérifier les préférences de type de notification
        if (options.type === 'update' && !this.preferences.updates) return false;
        if (options.type === 'event' && !this.preferences.events) return false;

        // Appliquer la fréquence
        if (this.preferences.frequency === 'minimal' && options.priority !== 'high') {
            return false;
        }

        const defaultOptions = {
            icon: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
            badge: '/Logo-Cendres_Incandescentes-Fond_transparent.png',
            requireInteraction: false,
            silent: false
        };

        new Notification(title, { ...defaultOptions, ...options });
        return true;
    }

    showMessage(message, type = 'info') {
        // Créer ou réutiliser un élément de message
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

    // Utilitaire pour convertir la clé VAPID
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

// Export pour utilisation dans d'autres modules
export default NotificationManager;
