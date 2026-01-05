// Configuration de l'application sécurisée contre les erreurs de type 'undefined'

// On récupère l'objet env de manière ultra-sécurisée
const getEnvObj = () => {
    try {
        // @ts-ignore
        return (import.meta && import.meta.env) ? import.meta.env : {};
    } catch (e) {
        return {};
    }
};

const env = getEnvObj();

export const CONFIG = {
    // Accès sécurisé : si env est undefined, on renvoie une chaîne vide au lieu de crasher
    SUPABASE_URL: env.VITE_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || '',
    ADMIN_CODE: env.VITE_ADMIN_CODE || ''
};

// Vérification silencieuse pour le développeur
if (!CONFIG.SUPABASE_URL) {
    console.warn("Note: Configuration Supabase non détectée.");
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