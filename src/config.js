// Configuration de l'application et constantes

// Sécurisation de l'accès aux variables d'environnement
const getEnv = (key) => {
    // 1. Priorité : Vite (import.meta.env)
    if (import.meta && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    // 2. Fallback : process.env (injecté via vite.config.js define)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }
    
    // Fallback pour éviter le crash (mais l'app ne fonctionnera pas sans connexion DB)
    console.warn(`Attention: La variable d'environnement ${key} n'est pas définie.`);
    return '';
};

export const CONFIG = {
    SUPABASE_URL: getEnv('VITE_SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnv('VITE_SUPABASE_ANON_KEY'),
    ADMIN_CODE: getEnv('VITE_ADMIN_CODE')
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
