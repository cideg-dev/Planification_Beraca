import { supabaseClient } from './supabaseClient.js';

export const DataService = {
    async getIntervenants() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient.from('intervenants').select('*').order('lastname');
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error(e);
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
            console.error(e);
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
            const { data, error } = await supabaseClient.from('configurations').select('*').limit(1);
            if (error) throw error;
            return data[0] || null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },

    async updateConfig(payload) {
        if (!supabaseClient) return null;
        try {
            // On récupère d'abord l'ID s'il existe
            const current = await this.getConfig();
            let result;
            if (current) {
                result = await supabaseClient.from('configurations').update(payload).eq('id', current.id).select();
            } else {
                result = await supabaseClient.from('configurations').insert([payload]).select();
            }
            return result.data[0];
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};