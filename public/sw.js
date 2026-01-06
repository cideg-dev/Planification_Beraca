// Service Worker pour la PWA AD BERACA
const CACHE_NAME = 'ad-beraca-v2';

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installation...');
    self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation...');
});

// Gestion des notifications Push en tâche de fond
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : { title: 'Nouveau message', body: 'Vous avez une nouvelle notification.' };
    
    const options = {
        body: data.body,
        icon: '/Planification_Beraca/ad.jpeg',
        badge: '/Planification_Beraca/ad.jpeg',
        data: data.url || '/',
        vibrate: [100, 50, 100],
        actions: [
            { action: 'open', title: 'Ouvrir' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Clic sur une notification
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data)
    );
});
