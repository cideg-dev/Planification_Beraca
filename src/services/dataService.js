import { supabaseClient } from './supabaseClient.js';

export const DataService = {
    async getIntervenants() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('intervenants').select('*').order('last_name');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getIntervenants:", e);
            return [];
        }
    },

    async getInterventions() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('interventions').select('*').order('date', { ascending: true });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error("Erreur getInterventions:", e);
            return [];
        }
    },

    async addIntervention(payload) {
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { data, error } = await supabaseClient.from('interventions').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    async updateIntervention(id, payload) {
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { data, error } = await supabaseClient.from('interventions').update(payload).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteIntervention(id) {
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { error } = await supabaseClient.from('interventions').delete().eq('id', id);
        if (error) throw error;
        return true;
    },

    async addIntervenant(payload) {
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { data, error } = await supabaseClient.from('intervenants').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    async getConfig() {
        if (!supabaseClient) return null;
        try {
            const { data, error } = await supabaseClient.from('app_config').select('*').limit(1);
            if (error) throw error;
            return data[0] || null;
        } catch (e) {
            console.error("Erreur getConfig:", e);
            return null;
        }
    },

    async updateConfig(payload) {
        if (!supabaseClient) return null;
        try {
            const current = await this.getConfig();
            let result;
            if (current) {
                result = await supabaseClient.from('app_config').update({ value: payload }).eq('key', current.key).select();
            } else {
                result = await supabaseClient.from('app_config').insert([{ key: 'main_config', value: payload }]).select();
            }
            return result.data ? result.data[0] : null;
        } catch (e) {
            console.error("Erreur updateConfig:", e);
            return null;
        }
    },

    // --- COMMENTAIRES ---
    async getCommentsByIntervention(interventionId) {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient
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
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { data, error } = await supabaseClient.from('comments').insert([payload]).select();
        if (error) throw error;
        return data[0];
    },

    // --- FEEDBACKS ---
    async getFeedbacksByIntervention(interventionId) {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient
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
        if (!supabaseClient) throw new Error("Client non initialisé");
        const { data, error } = await supabaseClient.from('feedbacks').insert([payload]).select();
        if (error) throw error;
        return data[0];
    }
};