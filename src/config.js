// Configuration de l'application
// Les valeurs sont injectées par Vite au moment du build via define
export const CONFIG = {
    SUPABASE_URL: '__VITE_SUPABASE_URL_PLACEHOLDER__',
    SUPABASE_ANON_KEY: '__VITE_SUPABASE_ANON_KEY_PLACEHOLDER__',
    ADMIN_CODE: '__VITE_ADMIN_CODE_PLACEHOLDER__'
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