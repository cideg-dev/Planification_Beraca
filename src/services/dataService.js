import { supabaseClient } from './supabaseClient.js';

/**
 * Service pour gérer les interactions avec la base de données normalisée
 */
export const DataService = {
    
    // --- GESTION DES INTERVENANTS ---

    async getIntervenants() {
        if (!supabaseClient) {
            console.error("Supabase client non initialisé dans DataService");
            return [];
        }
        const { data, error } = await supabaseClient.from('intervenants').select('*').order('lastname');
            
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

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('INSERT', 'intervenants', data.id, null, data);

        return data;
    },

    async updateIntervenant(id, intervenantData) {
        // Récupérer l'ancien enregistrement pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('intervenants')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Mise à jour d'un intervenant existant
        const { data, error } = await supabaseClient
            .from('intervenants')
            .update(intervenantData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('UPDATE', 'intervenants', id, oldData, data);

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
            // On retourne l'objet intervenant complet pour accès aux détails si besoin
            intervenant: item.intervenants, 
            // Et on fournit la string formatée que l'UI attend
            intervenantStr: item.intervenants
                ? `${item.intervenants.title ? `${item.intervenants.title} ` : ''}${item.intervenants.last_name.toUpperCase()} ${item.intervenants.first_name}`.trim()
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
            intervenant_name_snapshot: interventionData.intervenantStr, // Au cas où l'ID est null
            recurrence_pattern: interventionData.recurrence || 'none',
            recurrence_end_date: interventionData.recurrence_end_date || null
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

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('INSERT', 'interventions', data[0].id, null, data[0]);

        return data[0];
    },

    async updateIntervention(id, interventionData) {
        // Récupérer l'ancien enregistrement pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('interventions')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        // Mise à jour de l'intervention existante
        const dbPayload = {
            date: interventionData.date,
            day_of_week: interventionData.day,
            cult_type: interventionData.type,
            place: interventionData.place,
            description: interventionData.description || '',
            intervenant_name_snapshot: interventionData.intervenantStr, // Au cas où l'ID est null
            recurrence_pattern: interventionData.recurrence || 'none',
            recurrence_end_date: interventionData.recurrence_end_date || null
        };

        // Si on a un ID d'intervenant valide
        if (interventionData.intervenantId) {
            dbPayload.intervenant_id = interventionData.intervenantId;
        }

        const { data, error } = await supabaseClient
            .from('interventions')
            .update(dbPayload)
            .eq('id', id)
            .select();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('UPDATE', 'interventions', id, oldData, data[0]);

        return data[0];
    },

    async getInterventionsByIntervenant(intervenantId, startDate, endDate) {
        let query = supabaseClient
            .from('interventions')
            .select(`
                *,
                intervenants (
                    id, title, first_name, last_name, category
                )
            `)
            .eq('intervenant_id', intervenantId)
            .order('date', { ascending: false }); // Du plus récent au plus ancien

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
            // On retourne l'objet intervenant complet pour accès aux détails si besoin
            intervenant: item.intervenants,
            // Et on fournit la string formatée que l'UI attend
            intervenantStr: item.intervenants
                ? `${item.intervenants.title ? `${item.intervenants.title} ` : ''}${item.intervenants.last_name.toUpperCase()} ${item.intervenants.first_name}`.trim()
                : item.intervenant_name_snapshot
        }));
    },

    async deleteIntervention(id) {
        // Récupérer l'ancien enregistrement pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('interventions')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const { error } = await supabaseClient
            .from('interventions')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('DELETE', 'interventions', id, oldData, null);

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

    // --- GESTION DES COMMENTAIRES ---

    async addComment(interventionId, content, author = 'Anonyme') {
        const comment = {
            intervention_id: interventionId,
            content,
            author,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('comments')
            .insert([comment])
            .select()
            .single();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('INSERT', 'comments', data.id, null, data);

        return data;
    },

    async getCommentsByIntervention(interventionId) {
        const { data, error } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('intervention_id', interventionId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async updateComment(id, content) {
        // Récupérer l'ancien commentaire pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const { data, error } = await supabaseClient
            .from('comments')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('UPDATE', 'comments', id, oldData, data);

        return data;
    },

    async deleteComment(id) {
        // Récupérer l'ancien commentaire pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('comments')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const { error } = await supabaseClient
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('DELETE', 'comments', id, oldData, null);

        return true;
    },

    // --- GESTION DES FEEDBACKS ---

    async addFeedback(interventionId, rating, comment = '', author = 'Anonyme') {
        const feedback = {
            intervention_id: interventionId,
            rating,
            comment,
            author,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabaseClient
            .from('feedbacks')
            .insert([feedback])
            .select()
            .single();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('INSERT', 'feedbacks', data.id, null, data);

        return data;
    },

    async getFeedbacksByIntervention(interventionId) {
        const { data, error } = await supabaseClient
            .from('feedbacks')
            .select('*')
            .eq('intervention_id', interventionId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async getAverageRatingByIntervention(interventionId) {
        const { data, error } = await supabaseClient
            .from('feedbacks')
            .select('rating')
            .eq('intervention_id', interventionId);

        if (error) throw error;

        if (data.length === 0) return 0;

        const sum = data.reduce((acc, fb) => acc + fb.rating, 0);
        return sum / data.length;
    },

    async updateFeedback(id, rating, comment) {
        // Récupérer l'ancien feedback pour le journal d'audit
        const { data: oldData, error: fetchError } = await supabaseClient
            .from('feedbacks')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw fetchError;
        }

        const { data, error } = await supabaseClient
            .from('feedbacks')
            .update({ rating, comment, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Ajouter une entrée dans le journal d'audit
        await this.addAuditLog('UPDATE', 'feedbacks', id, oldData, data);

        return data;
    },

    // --- GESTION DE LA CONFIGURATION ---

    async getConfig(key) {
        const { data, error } = await supabaseClient
            .from('app_config')
            .select('value')
            .eq('key', key)
            .maybeSingle(); // Utiliser maybeSingle pour éviter l'erreur si la ligne n'existe pas

        if (error) {
            console.warn("Erreur lecture config:", error);
            return null;
        }
        return data ? data.value : null;
    },

    async saveConfig(key, value) {
        const { data, error } = await supabaseClient
            .from('app_config')
            .upsert({ key, value })
            .select();

        if (error) throw error;
        return data;
    },

    // --- JOURNAL D'AUDIT ---

    async addAuditLog(action, table, recordId, oldValues = null, newValues = null) {
        const auditEntry = {
            action,
            table,
            record_id: recordId,
            old_values: oldValues ? JSON.stringify(oldValues) : null,
            new_values: newValues ? JSON.stringify(newValues) : null,
            timestamp: new Date().toISOString(),
            user_id: 'system' // Pourrait être remplacé par l'ID de l'utilisateur connecté
        };

        const { error } = await supabaseClient
            .from('audit_log')
            .insert([auditEntry]);

        if (error) {
            console.error('Erreur lors de l\'ajout au journal d\'audit:', error);
        }
    },

    async getAuditLogs(limit = 50, offset = 0) {
        const { data, error } = await supabaseClient
            .from('audit_log')
            .select('*')
            .order('timestamp', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Erreur lors de la récupération du journal d\'audit:', error);
            return [];
        }

        return data;
    }
};
