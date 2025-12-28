import { supabaseClient } from './supabaseClient.js';

/**
 * Service pour gérer les interactions avec la base de données normalisée
 */
export const DataService = {
    
    // --- GESTION DES INTERVENANTS ---

    async getIntervenants() {
        const { data, error } = await supabaseClient
            .from('intervenants')
            .select('*')
            .eq('is_active', true)
            .order('last_name', { ascending: true });
            
        if (error) throw error;
        return data;
    },

    async addIntervenant(intervenant) {
        // intervenant doit contenir { title, first_name, last_name, category }
        const { data, error } = await supabaseClient
            .from('intervenants')
            .insert([intervenant])
            .select()
            .single();
            
        if (error) throw error;
        return data;
    },

    // --- GESTION DES INTERVENTIONS ---

    async getInterventions(startDate, endDate) {
        let query = supabaseClient
            .from('interventions')
            .select(`
                *,
                intervenants (
                    id, title, first_name, last_name, category
                )
            `)
            .order('date', { ascending: true });

        if (startDate) query = query.gte('date', startDate);
        if (endDate) query = query.lte('date', endDate);

        const { data, error } = await query;
        if (error) throw error;
        
        // Formatter les données pour correspondre à ce que l'UI attend
        return data.map(item => ({
            id: item.id,
            date: item.date,
            day: item.day_of_week,
            type: item.cult_type,
            place: item.place,
            description: item.description,
            // Si on a une relation, on reconstruit le nom, sinon on prend le snapshot
            intervenant: item.intervenants 
                ? `${item.intervenants.title} ${item.intervenants.first_name} ${item.intervenants.last_name}`.trim()
                : item.intervenant_name_snapshot
        }));
    },

    async addIntervention(interventionData) {
        // interventionData doit être mappé vers les colonnes de la DB
        const dbPayload = {
            date: interventionData.date,
            day_of_week: interventionData.day,
            cult_type: interventionData.type,
            place: interventionData.place,
            description: interventionData.description || '',
            intervenant_name_snapshot: interventionData.intervenantStr // Au cas où l'ID est null
        };

        // Si on a un ID d'intervenant valide
        if (interventionData.intervenantId) {
            dbPayload.intervenant_id = interventionData.intervenantId;
        }

        const { data, error } = await supabaseClient
            .from('interventions')
            .insert([dbPayload])
            .select();

        if (error) throw error;
        return data[0];
    },

    async deleteIntervention(id) {
        const { error } = await supabaseClient
            .from('interventions')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
        return true;
    },
    
    async clearAllInterventions() {
        // Attention : supprime tout ! A utiliser avec précaution
        const { error } = await supabaseClient
            .from('interventions')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Hack pour "tout supprimer"
            
        if (error) throw error;
        return true;
    },

    // --- GESTION DE LA CONFIGURATION ---

    async getConfig(key) {
        const { data, error } = await supabaseClient
            .from('app_config')
            .select('value')
            .eq('key', key)
            .single();
            
        if (error && error.code !== 'PGRST116') throw error; // Ignorer erreur "non trouvé"
        return data ? data.value : null;
    },

    async saveConfig(key, value) {
        const { data, error } = await supabaseClient
            .from('app_config')
            .upsert({ key, value })
            .select();
            
        if (error) throw error;
        return data;
    }
};
