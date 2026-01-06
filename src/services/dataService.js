import { getSupabaseClient } from './supabaseClient.js';

export const DataService = {
    async getIntervenants() {
        const client = await getSupabaseClient();
        if (!client) return [];
        try {
            const { data, error } = await client.from('intervenants').select('*').order('last_name');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getIntervenants:", e);
            return [];
        }
    },

    async getInterventions() {
        const client = await getSupabaseClient();
        if (!client) return [];
        try {
            // Jointure pour récupérer les infos de l'intervenant lié
            const { data, error } = await client
                .from('interventions')
                .select('*, intervenants(*)')
                .order('date', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getInterventions:", e);
            return [];
        }
    },

    async addIntervention(payload) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { data, error } = await client.from('interventions').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    async updateIntervention(id, payload) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { data, error } = await client.from('interventions').update(payload).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteIntervention(id) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { error } = await client.from('interventions').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async addIntervenant(payload) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { data, error } = await client.from('intervenants').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    async getConfig() {
        const client = await getSupabaseClient();
        if (!client) return null;
        try {
            const { data, error } = await client.from('app_config').select('*').limit(1);
            if (error) throw error;
            return data[0] || null;
        } catch (e) {
            console.error("Erreur getConfig:", e);
            return null;
        }
    },

    async updateConfig(payload) {
        const client = await getSupabaseClient();
        if (!client) return null;
        try {
            const current = await this.getConfig();
            let result;
            if (current) {
                result = await client.from('app_config').update({ value: payload }).eq('key', current.key).select();
            } else {
                result = await client.from('app_config').insert([{ key: 'main_config', value: payload }]).select();
            }
            return result.data ? result.data[0] : null;
        } catch (e) {
            console.error("Erreur updateConfig:", e);
            return null;
        }
    },

    // Alias pour compatibilité
    async saveConfig(key, payload) {
        return this.updateConfig(payload);
    },

    // --- COMMENTAIRES ---
    async getCommentsByIntervention(interventionId) {
        const client = await getSupabaseClient();
        if (!client) return [];
        try {
            const { data, error } = await client
                .from('comments')
                .select('*')
                .eq('intervention_id', interventionId)
                .order('created_at', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getComments:", e);
            return [];
        }
    },

    async addComment(payload) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { data, error } = await client.from('comments').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    // --- FEEDBACKS ---
    async getFeedbacksByIntervention(interventionId) {
        const client = await getSupabaseClient();
        if (!client) return [];
        try {
            const { data, error } = await client
                .from('feedbacks')
                .select('*')
                .eq('intervention_id', interventionId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getFeedbacks:", e);
            return [];
        }
    },

    async addFeedback(payload) {
        const client = await getSupabaseClient();
        if (!client) throw new Error("Client non initialisé");
        const { data, error } = await client.from('feedbacks').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    async getAverageRatingByIntervention(interventionId) {
        const client = await getSupabaseClient();
        if (!client) return 0;
        try {
            const { data, error } = await client
                .from('feedbacks')
                .select('rating')
                .eq('intervention_id', interventionId);
            if (error) throw error;

            if (!data || data.length === 0) {
                return 0; // Aucun feedback
            }

            // Calculer la moyenne des évaluations
            const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
            return sum / data.length;
        } catch (e) {
            console.error("Erreur getAverageRating:", e);
            return 0;
        }
    }
};