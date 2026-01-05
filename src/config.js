// Configuration de l'application et constantes

export const CONFIG = {
    // Ces variables globales sont injectées par Vite (voir vite.config.js)
    SUPABASE_URL: typeof __SUPABASE_URL__ !== 'undefined' ? __SUPABASE_URL__ : '',
    SUPABASE_ANON_KEY: typeof __SUPABASE_ANON_KEY__ !== 'undefined' ? __SUPABASE_ANON_KEY__ : '',
    ADMIN_CODE: typeof __ADMIN_CODE__ !== 'undefined' ? __ADMIN_CODE__ : ''
};

// Fallback pour le développement local si les globals ne sont pas remplacés (rare avec Vite)
if (!CONFIG.SUPABASE_URL && import.meta && import.meta.env) {
    CONFIG.SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    CONFIG.SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    CONFIG.ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE;
}

// Vérification de sécurité au chargement
if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn("Attention: Les variables d'environnement Supabase ne sont pas définies/détectées.");
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
