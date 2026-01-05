// Configuration de l'application
// Ces valeurs sont chargées depuis les variables d'environnement (.env)
export const CONFIG = {
    SUPABASE_URL: (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined')
        ? import.meta.env.VITE_SUPABASE_URL || 'VITE_SUPABASE_URL_PLACEHOLDER'
        : 'VITE_SUPABASE_URL_PLACEHOLDER',
    SUPABASE_ANON_KEY: (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined')
        ? import.meta.env.VITE_SUPABASE_ANON_KEY || 'VITE_SUPABASE_ANON_KEY_PLACEHOLDER'
        : 'VITE_SUPABASE_ANON_KEY_PLACEHOLDER',
    ADMIN_CODE: (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined')
        ? import.meta.env.VITE_ADMIN_CODE || 'VITE_ADMIN_CODE_PLACEHOLDER'
        : 'VITE_ADMIN_CODE_PLACEHOLDER'
};

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
