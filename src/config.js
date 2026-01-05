// Configuration de l'application
// Utilisation d'un accès ultra-sécurisé pour éviter le crash 'undefined'
const getViteEnv = (key) => {
    try {
        return import.meta.env[key];
    } catch (e) {
        return null;
    }
};

export const CONFIG = {
    SUPABASE_URL: getViteEnv('VITE_SUPABASE_URL') || '',
    SUPABASE_ANON_KEY: getViteEnv('VITE_SUPABASE_ANON_KEY') || '',
    ADMIN_CODE: getViteEnv('VITE_ADMIN_CODE') || ''
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