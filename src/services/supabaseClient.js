import { CONFIG } from '../config.js';

// Vérification de la disponibilité de la librairie Supabase
if (typeof supabase === 'undefined') {
    console.error("La librairie Supabase n'est pas chargée. Assurez-vous d'inclure le script CDN dans votre HTML.");
}

// Initialisation du client (Singleton)
export const supabaseClient = typeof supabase !== 'undefined' 
    ? supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
    : null;

/**
 * Vérifie la connexion à Supabase
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('app_config').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        console.error("Erreur de connexion Supabase:", e);
        return false;
    }
}
