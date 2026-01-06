import { getSupabaseClient } from './supabaseClient.js';

export const notificationService = {
    /**
     * Demande la permission pour les notifications Web Push
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log("Ce navigateur ne supporte pas les notifications bureau");
            return false;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log("Permission accordée pour les notifications");
            // Ici on enregistrerait le token de souscription (Push Subscription) dans Supabase
            return true;
        }
        return false;
    },

    /**
     * Récupère les notifications depuis Supabase
     */
    async getNotifications(userId) {
        const client = await getSupabaseClient();
        if (!client || !userId) return [];

        const { data, error } = await client
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Erreur récup notifications:", error);
            return [];
        }
        return data;
    },

    /**
     * Marque une notification comme lue
     */
    async markAsRead(notificationId) {
        const client = await getSupabaseClient();
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId);

        return !error;
    },

    /**
     * Marque toutes les notifications comme lues
     */
    async markAllAsRead(userId) {
        const client = await getSupabaseClient();
        const { error } = await client
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        return !error;
    }
};
