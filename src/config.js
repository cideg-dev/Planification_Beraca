// Configuration de l'application et constantes

// Fonction utilitaire pour récupérer la config (Ordre : Globals > LocalStorage > Meta Env)
const getConf = (globalKey, localKey, metaKey) => {
    // 1. Constante Globale (Injectée par Vite au build)
    if (typeof window[globalKey] !== 'undefined' && window[globalKey]) return window[globalKey];
    // Note: Vite remplace __VAR__ directement, donc on vérifie la valeur "littérale" si possible, 
    // mais ici on suppose que le define a fonctionné ou renvoyé une chaine vide.
    
    // 2. LocalStorage (Configuration manuelle au runtime)
    const local = localStorage.getItem(localKey);
    if (local) return local;

    // 3. Import Meta (Dev local)
    if (import.meta && import.meta.env && import.meta.env[metaKey]) return import.meta.env[metaKey];

    return '';
};

// Récupération des valeurs brutes injectées par Vite (si définies)
const RAW_URL = typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '';
const RAW_KEY = typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '';
const RAW_ADMIN = typeof __ADMIN_CODE__ !== 'undefined' ? __ADMIN_CODE__ : '';

export const CONFIG = {
    SUPABASE_URL: RAW_URL || localStorage.getItem('supabase_url') || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
    SUPABASE_ANON_KEY: RAW_KEY || localStorage.getItem('supabase_anon_key') || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : ''),
    ADMIN_CODE: RAW_ADMIN || localStorage.getItem('admin_code') || (import.meta.env ? import.meta.env.VITE_ADMIN_CODE : '')
};

// Vérification de sécurité au chargement
if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn("Attention: Config Supabase manquante. L'application demandera une configuration manuelle.");
}

export const CONSTANTS = {
    DAYS_OF_WEEK: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
    CULT_TYPES_BY_DAY: {
        'Dimanche': ['Principal', 'Enseignement', 'Culte des enfants', 'Culte des Adolescents'],
        'Lundi': ['Réunion'],
        'Mardi': ['Prière hebdomadaire', 'Enseignement'],
        'Mercredi': ['Enseignement', 'Réunion', 'Culte des Adolescents'],
        'Jeudi': ['Témoignage/Action de grâce/Prière', 'Réunion'],
        'Vendredi': ['Enseignement', 'Veillée de prière', 'Réunion'],
        'Samedi': ['Jeune et Prière', 'Veillée de prière', 'Culte des Adolescents']
    }
};
