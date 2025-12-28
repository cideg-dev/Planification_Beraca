// Configuration Supabase
// Remplacez ces valeurs avec vos propres informations Supabase
const SUPABASE_URL = 'https://supywgkoghcphlynktmr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_S5gpJnrrWvc6QtTgbuD6gg_dtOFU8y4';

// Initialiser Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour sauvegarder les données dans Supabase
async function saveToSupabase() {
    try {
        const data = {
            interventions: JSON.stringify(interventions),
            intervenantsdb: JSON.stringify(intervenantsDB),  // Colonne en minuscules pour correspondre à la table
            general_info: JSON.stringify({
                churchName: document.getElementById('church-name')?.value || 'EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU DU BENIN',
                region: document.getElementById('region')?.value || 'ATACORA',
                section: document.getElementById('section')?.value || 'NATITINGOU',
                temple: document.getElementById('temple')?.value || 'BERACA',
                year: document.getElementById('year')?.value || '2025',
                quarter: document.getElementById('quarter')?.value || '4'
            }),
            configurations: JSON.stringify({
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify')?.value || '',
                otherPlace: document.getElementById('place-other-specify')?.value || ''
            }),
            theme: document.body.className.replace('theme-', ''),
            saved_at: new Date().toISOString()
        };

        // Vérifier si l'enregistrement existe déjà
        const { data: existingRecord, error: selectError } = await supabaseClient
            .from('planning_data')
            .select('*')
            .eq('id', 'current')
            .single();

        let result;
        if (existingRecord && !selectError) {
            // Mettre à jour l'enregistrement existant
            const updateResult = await supabaseClient
                .from('planning_data')
                .update(data)
                .eq('id', 'current');
            result = updateResult.data;
            if (updateResult.error) {
                throw updateResult.error;
            }
        } else {
            // Insérer un nouvel enregistrement
            const insertResult = await supabaseClient
                .from('planning_data')
                .insert([{
                    id: 'current',
                    ...data
                }]);
            result = insertResult.data;
            if (insertResult.error) {
                throw insertResult.error;
            }
        }

        console.log('Données sauvegardées dans Supabase avec succès');
        showAlert('Données publiées en ligne avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans Supabase:', error);
        showAlert('Erreur lors de la sauvegarde en ligne: ' + error.message, 'danger');
    }
}

// Fonction pour charger les données depuis Supabase
async function loadFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('planning_data')  // Remplacez par le nom de votre table
            .select('*')
            .eq('id', 'current');  // Utiliser l'ID fixe

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            const record = data[0];

            // Charger les données dans l'application
            interventions = JSON.parse(record.interventions);
            intervenantsDB = JSON.parse(record.intervenantsdb);  // Colonne en minuscules

            // Mettre à jour les interfaces
            if(typeof updateInterventionsList === 'function') {
                updateInterventionsList();
            } else {
                // Si on est sur la page de rapport, rafraîchir l'affichage
                if(typeof updateFilterOptions === 'function' && typeof displayInterventions === 'function') {
                    updateFilterOptions();
                    displayInterventions(interventions);
                }
            }

            console.log('Données chargées depuis Supabase avec succès');
            return true;
        } else {
            console.log('Aucune donnée trouvée dans Supabase');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis Supabase:', error);
        showAlert('Erreur lors du chargement des données en ligne: ' + error.message, 'danger');
        return false;
    }
}

// Fonction pour charger les données depuis Supabase (spécifique à la page de rapport)
async function loadFromSupabaseForReport() {
    try {
        const { data, error } = await supabaseClient
            .from('planning_data')  // Remplacez par le nom de votre table
            .select('*')
            .eq('id', 'current');  // Utiliser l'ID fixe

        if (error) {
            throw error;
        }

        if (data && data.length > 0) {
            const record = data[0];

            // Charger les données dans l'application
            interventions = JSON.parse(record.interventions);
            intervenantsDB = JSON.parse(record.intervenantsdb);  // Colonne en minuscules

            // Charger le thème
            if (record.theme) {
                changeTheme(record.theme);
            }

            // Mettre à jour les interfaces
            updateFilterOptions();
            displayInterventions(interventions);

            console.log('Données chargées depuis Supabase avec succès');
            showAlert(`${interventions.length} intervention(s) chargée(s) depuis le serveur.`, 'success');
            return true;
        } else {
            console.log('Aucune donnée trouvée dans Supabase');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis Supabase:', error);
        showAlert('Erreur lors du chargement des données en ligne: ' + error.message, 'danger');
        return false;
    }
}

// Fonction pour activer la synchronisation en temps réel
async function enableRealTimeSync() {
    try {
        // S'abonner aux changements dans la table planning_data
        const subscription = supabaseClient
            .from('planning_data')
            .on('UPDATE', (payload) => {
                console.log('Changements détectés dans la base de données:', payload);
                // Mettre à jour les données localement
                const record = payload.new;
                interventions = JSON.parse(record.interventions);
                intervenantsDB = JSON.parse(record.intervenantsdb);

                // Mettre à jour l'interface
                updateFilterOptions();
                displayInterventions(interventions);

                showAlert('Données mises à jour depuis le serveur.', 'info');
            })
            .subscribe();

        console.log('Synchronisation en temps réel activée');
        return subscription;
    } catch (error) {
        console.error('Erreur lors de l\'activation de la synchronisation en temps réel:', error);
        return null;
    }
}

// Fonction pour charger et activer la synchronisation automatique
async function initializeAutoSync() {
    // Charger les données initiales
    await loadFromSupabaseForReport();

    // Activer la synchronisation en temps réel
    await enableRealTimeSync();

    // Mettre en place une vérification périodique en fallback
    setInterval(async () => {
        await loadFromSupabaseForReport();
    }, 30000); // Vérifier toutes les 30 secondes
}