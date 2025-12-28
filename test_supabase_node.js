
const { createClient } = require('@supabase/supabase-js');

// Clés extraites de supabase-config.js
const SUPABASE_URL = 'https://supywgkoghcphlynktmr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_S5gpJnrrWvc6QtTgbuD6gg_dtOFU8y4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
    console.log("Test de connexion Supabase...");
    try {
        // Tentative de lecture simple
        const { data, error } = await supabase.from('planning_data').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error("ERREUR:", error.message);
            if (error.code) console.error("Code erreur:", error.code);
            return;
        }
        
        console.log("CONNEXION RÉUSSIE !");
        console.log("Accès à la table 'planning_data' validé.");
        
    } catch (err) {
        console.error("EXCEPTION:", err.message);
    }
}

testConnection();
