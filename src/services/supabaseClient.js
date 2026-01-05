import { CONFIG } from '../config.js';

// Get createClient from the global object injected by the CDN (index.html)
const createClient = window.supabase ? window.supabase.createClient : null;

if (!createClient) {
    console.error("Critical Error: Supabase library not loaded. Check CDN script in index.html.");
}

// Initialisation du client (Singleton) avec sécurité anti-crash
let client = null;

const isValidUrl = (url) => {
    try {
        return url && url.startsWith('http');
    } catch (e) {
        return false;
    }
};

if (createClient && isValidUrl(CONFIG.SUPABASE_URL) && CONFIG.SUPABASE_ANON_KEY && !CONFIG.SUPABASE_ANON_KEY.startsWith('___')) {
    try {
        client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Supabase initialization error:", e);
    }
} else {
    console.warn("Supabase non initialisé : URL invalide ou Clé manquante.");
}

export const supabaseClient = client;

/**
 * Checks the connection to Supabase
 * @returns {Promise<boolean>}
 */
export async function checkConnection() {
    if (!supabaseClient) return false;
    try {
        // Simple test: fetch one record
        const { data, error } = await supabaseClient.from('interventions').select('id').limit(1);
        if (error) {
            console.error("Supabase connection error:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Supabase connection error:", e);
        return false;
    }
}

/**
 * Tests the connection to Supabase by fetching project info
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
    if (!supabaseClient) {
        console.error("Supabase client not initialized");
        return false;
    }

    try {
        const { data, error } = await supabaseClient
            .from('interventions')
            .select('*')
            .limit(1);

        if (error) {
            console.error("Connection test error:", error);
            return false;
        }

        console.log("Supabase connection successful:", data);
        return true;
    } catch (e) {
        console.error("Connection test error:", e);
        return false;
    }
}