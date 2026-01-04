import { CONFIG } from '../config.js';

// Initialisation du client (Singleton)
// Utilisation de la version globale chargée via CDN
export const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

/**
 * Vérifie la connexion à Supabase
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
    if (!supabaseClient) return false;
    try {
        // Test simple : récupérer la date du serveur ou une table légère
        const { data, error } = await supabaseClient.from('interventions').select('id').limit(1);
        if (error) {
            console.error("Erreur de connexion Supabase:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Erreur de connexion Supabase:", e);
        return false;
    }
}

/**
 * Teste la connexion à Supabase en récupérant des informations sur le projet
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
    if (!supabaseClient) {
        console.error("Client Supabase non initialisé");
        return false;
    }

    try {
        // Test de la connexion en exécutant une requête simple
        const { data, error } = await supabaseClient
            .from('interventions')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Erreur lors du test de connexion:", error);
            return false;
        }

        console.log("Connexion Supabase réussie, données récupérées:", data);
        return true;
    } catch (e) {
        console.error("Erreur lors du test de connexion:", e);
        return false;
    }
}
