// Configuration de l'application et constantes

export const CONFIG = {
    // Accès statique obligatoire pour que Vite puisse effectuer le remplacement lors du build
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_URL : ''),
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env.VITE_SUPABASE_ANON_KEY : ''),
    ADMIN_CODE: import.meta.env.VITE_ADMIN_CODE || (typeof process !== 'undefined' ? process.env.VITE_ADMIN_CODE : '')
};

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
