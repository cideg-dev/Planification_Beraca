// Configuration de l'application et constantes

export const CONFIG = {
    SUPABASE_URL: 'https://supywgkoghcphlynktmr.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_S5gpJnrrWvc6QtTgbuD6gg_dtOFU8y4', // Note: Ceci devrait idéalement être dans des variables d'env
    ADMIN_CODE: 'BeraComi26'
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
