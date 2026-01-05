import { CONFIG } from '../config.js';

// Récupération de createClient depuis l'objet global injecté par le CDN (index.html)
const createClient = window.supabase ? window.supabase.createClient : null;

if (!createClient) {
    console.error("Erreur critique : La bibliothèque Supabase n'est pas chargée via CDN.");
}

// Initialisation du client (Singleton)
let client = null;

// Vérification pour permettre l'initialisation
if (createClient &&
    CONFIG.SUPABASE_URL &&
    CONFIG.SUPABASE_URL !== 'VITE_SUPABASE_URL_PLACEHOLDER' &&
    CONFIG.SUPABASE_URL.startsWith('http')) {
    try {
        client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        if (CONFIG.SUPABASE_ANON_KEY === 'VITE_SUPABASE_ANON_KEY_PLACEHOLDER') {
            console.warn("⚠️  Attention: La clé Supabase est encore un placeholder. La connexion pourrait échouer.");
        }
    } catch (e) {
        console.error("Erreur d'initialisation Supabase:", e);
    }
} else {
    console.error("Supabase non initialisé : URL manquante ou invalide.", {
        url: CONFIG.SUPABASE_URL,
        isPlaceholder: CONFIG.SUPABASE_URL === 'VITE_SUPABASE_URL_PLACEHOLDER'
    });
}

export const supabaseClient = client;

/**
 * Vérifie la connexion à Supabase
 */
export async function checkConnection() {
    if (!supabaseClient) return false;
    try {
        const { error } = await supabaseClient.from('interventions').select('id').limit(1);
        return !error;
    } catch (e) {
        return false;
    }
}

/**
 * Teste la connexion
 */
export async function testConnection() {
    if (!supabaseClient) return false;
    try {
        const { data, error } = await supabaseClient.from('interventions').select('*').limit(1);
        if (error) throw error;
        console.log("Connexion réussie");
        return true;
    } catch (e) {
        console.error("Test connexion échoué:", e);
        return false;
    }
}
