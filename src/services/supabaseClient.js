import { CONFIG } from '../config.js';

// Récupération de createClient depuis l'objet global injecté par le CDN (index.html)
const createClient = window.supabase ? window.supabase.createClient : null;

if (!createClient) {
    console.error("Erreur critique : La bibliothèque Supabase n'est pas chargée via CDN.");
}

// Initialisation du client (Singleton)
let client = null;
let initialized = false;

// Tentative de chargement du runtime config (généré lors du build/déploiement)
async function loadRuntimeConfig() {
    const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) ? import.meta.env.BASE_URL : '/Planification_Beraca/';
    const url = `${base}runtime-config.json`;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        return json;
    } catch (e) {
        // silent - runtime config may not exist
        return null;
    }
}

// Initialise le client en utilisant d'abord la config compilée, puis le runtime config s'il existe
async function initClient() {
    if (initialized) return;

    // Essayer de charger la config runtime
    const runtime = await loadRuntimeConfig();
    if (runtime && runtime.SUPABASE_URL) {
        // Mutate the CONFIG object to include runtime values
        CONFIG.SUPABASE_URL = runtime.SUPABASE_URL || CONFIG.SUPABASE_URL;
        CONFIG.SUPABASE_ANON_KEY = runtime.SUPABASE_ANON_KEY || CONFIG.SUPABASE_ANON_KEY;
        CONFIG.ADMIN_CODE = runtime.ADMIN_CODE || CONFIG.ADMIN_CODE;
        console.info('✅ Runtime config chargée depuis runtime-config.json');
    }

    if (!createClient) {
        console.error('Erreur critique : La bibliothèque Supabase n\'est pas chargée via CDN.');
        initialized = true;
        return;
    }

    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_URL.startsWith('http')) {
        try {
            client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            if (CONFIG.SUPABASE_ANON_KEY === 'VITE_SUPABASE_ANON_KEY_PLACEHOLDER') {
                console.warn("⚠️  Attention: La clé Supabase est encore un placeholder. La connexion pourrait échouer.");
            }
        } catch (e) {
            console.error('Erreur d\'initialisation Supabase:', e);
        }
    } else {
        const isProduction = window.location.hostname !== 'localhost';
        const setupGuide = isProduction 
            ? '❌ En production : Ajoutez les GitHub Secrets (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADMIN_CODE) dans Settings → Secrets and variables → Actions'
            : '❌ En développement : Créez un fichier .env avec VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ADMIN_CODE';
        console.error(
            `%cSupabase non initialisé : URL manquante ou invalide.\n${setupGuide}`,
            'color: red; font-weight: bold;',
            { url: CONFIG.SUPABASE_URL }
        );
    }

    initialized = true;
}

export const supabaseClient = client;

/**
 * Vérifie la connexion à Supabase
 */
export async function checkConnection() {
    await initClient();
    if (!client) return false;
    try {
        const { error } = await client.from('interventions').select('id').limit(1);
        return !error;
    } catch (e) {
        return false;
    }
}

/**
 * Teste la connexion
 */
export async function testConnection() {
    await initClient();
    if (!client) return false;
    try {
        const { data, error } = await client.from('interventions').select('*').limit(1);
        if (error) throw error;
        console.log('Connexion réussie');
        return true;
    } catch (e) {
        console.error('Test connexion échoué:', e);
        return false;
    }
}
