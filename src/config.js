// Configuration de l'application et constantes

// Safely get Vite environment variables
const env = (import.meta && import.meta.env) ? import.meta.env : {};

export const CONFIG = {
    // Priority: 1. Build-time variables, 2. Manual LocalStorage fallback
    SUPABASE_URL: env.VITE_SUPABASE_URL || localStorage.getItem('supabase_url') || '',
    SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('supabase_anon_key') || '',
    ADMIN_CODE: env.VITE_ADMIN_CODE || localStorage.getItem('admin_code') || ''
};

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    console.warn("Attention: Configuration Supabase non détectée dans le build. Utilisation du stockage local.");
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
