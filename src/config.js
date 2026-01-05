// Configuration de l'application - Définitive
export const CONFIG = {
    // Ces constantes sont injectées par vite.config.js lors du build
    SUPABASE_URL: typeof __VITE_SUPABASE_URL__ !== 'undefined' ? __VITE_SUPABASE_URL__ : '',
    SUPABASE_ANON_KEY: typeof __VITE_SUPABASE_ANON_KEY__ !== 'undefined' ? __VITE_SUPABASE_ANON_KEY__ : '',
    ADMIN_CODE: typeof __VITE_ADMIN_CODE__ !== 'undefined' ? __VITE_ADMIN_CODE__ : ''
};

// Log de sécurité pour le débogage (les clés restent masquées)
if (!CONFIG.SUPABASE_URL) {
    console.error("ERREUR CRITIQUE : La configuration Supabase n'a pas été injectée lors du build.");
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
