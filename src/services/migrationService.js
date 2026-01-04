import { supabaseClient } from './supabaseClient.js';

export const MigrationService = {
    /**
     * Migre les données de l'ancien format JSON vers les tables relationnelles
     */
    async migrateData() {
        console.log("Démarrage de la migration...");
        
        // 1. Récupérer les données brutes Legacy (JSON Blob)
        const { data: legacyData, error: legacyError } = await supabaseClient
            .from('planning_data')
            .select('*')
            .eq('id', 'current')
            .single();

        if (legacyError || !legacyData) {
            throw new Error("Aucune donnée 'Legacy' trouvée à migrer.");
        }

        const interventionsV1 = JSON.parse(legacyData.interventions || '[]');
        console.log(`${interventionsV1.length} interventions trouvées dans l'ancien format.`);

        // 2. Récupérer les intervenants V2 actuels pour faire le mapping
        const { data: intervenantsV2, error: ivError } = await supabaseClient
            .from('intervenants')
            .select('*');

        if (ivError) throw ivError;

        // 3. Préparer les insertions
        let successCount = 0;
        let errorCount = 0;

        for (const item of interventionsV1) {
            try {
                // Tentative de mapping de l'intervenant par nom
                // Format V1 typique: "Pasteur Christophe SATCHI" ou "Christophe SATCHI"
                let intervenantId = null;
                let snapshotName = item.intervenant || 'Non assigné';

                // Recherche naïve : on cherche si le nom V1 contient le nom de famille V2
                // C'est imparfait mais ça couvre 80% des cas
                const match = intervenantsV2.find(iv => 
                    snapshotName.toLowerCase().includes(iv.last_name.toLowerCase()) &&
                    snapshotName.toLowerCase().includes(iv.first_name.toLowerCase())
                );

                if (match) {
                    intervenantId = match.id;
                }

                // Construction de la description (fusion Thème + Obs)
                let description = item.theme || '';
                if (item.observations) {
                    description += (description ? ' - ' : '') + item.observations;
                }

                // Insertion V2
                const { error: insertError } = await supabaseClient
                    .from('interventions')
                    .insert([{
                        date: item.date,
                        day_of_week: item.day || getDayName(item.date),
                        cult_type: item.type || 'Autre',
                        place: item.place || 'BERACA',
                        description: description,
                        intervenant_id: intervenantId,
                        intervenant_name_snapshot: snapshotName
                    }]);

                if (insertError) {
                    console.error("Erreur insertion:", insertError);
                    errorCount++;
                } else {
                    successCount++;
                }

            } catch (err) {
                console.error("Erreur traitement item:", err);
                errorCount++;
            }
        }

        return { success: successCount, errors: errorCount };
    }
};

function getDayName(dateStr) {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const d = new Date(dateStr);
    return days[d.getDay()];
}
