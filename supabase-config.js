// Configuration Supabase
// Remplacez ces valeurs avec vos propres informations Supabase
const SUPABASE_URL = 'VOTRE_URL_SUPABASE';
const SUPABASE_ANON_KEY = 'VOTRE_CLE_SUPABASE';

// Initialiser Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fonction pour sauvegarder les données dans Supabase
async function saveToSupabase() {
    try {
        const data = {
            interventions: JSON.stringify(interventions),
            intervenantsDB: JSON.stringify(intervenantsDB),
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

        // Sauvegarder ou mettre à jour la ligne dans la table
        const { data: result, error } = await supabase
            .from('planning_data')  // Remplacez par le nom de votre table
            .upsert([{
                id: 'current',  // Utiliser un ID fixe pour la ligne actuelle
                ...data
            }], { onConflict: 'id' });

        if (error) {
            throw error;
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
        const { data, error } = await supabase
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
            intervenantsDB = JSON.parse(record.intervenantsDB);
            
            // Mettre à jour les interfaces
            updateInterventionsList();
            
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
        const { data, error } = await supabase
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
            intervenantsDB = JSON.parse(record.intervenantsDB);
            
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