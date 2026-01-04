// --- CONFIGURATION ---
const CONFIG = {
    SUPABASE_URL: 'https://supywgkoghcphlynktmr.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_S5gpJnrrWvc6QtTgbuD6gg_dtOFU8y4',
    ADMIN_CODE: 'BeraComi26'
};

const CONSTANTS = {
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

// --- CLIENT SUPABASE ---
// On suppose que la librairie supabase-js est chargée via CDN dans le HTML
const supabaseClient = typeof supabase !== 'undefined' 
    ? supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
    : null;

if (!supabaseClient) {
    console.error("ERREUR CRITIQUE : Supabase non chargé");
}

// --- UI HELPERS ---
const UI = {
    showAlert(message, type = 'info') {
        const alertPlaceholder = document.getElementById('alert-placeholder');
        if (!alertPlaceholder) return;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.append(wrapper);
        setTimeout(() => {
            const alert = bootstrap.Alert.getOrCreateInstance(wrapper.querySelector('.alert'));
            if (alert) alert.close();
        }, 5000);
    },

    toggleLoading(show) {
        let loader = document.getElementById('global-loader');
        if (!loader && show) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
                z-index: 9999;
            `;
            loader.innerHTML = '<div class="spinner-border text-light" role="status"><span class="visually-hidden">Chargement...</span></div>';
            document.body.appendChild(loader);
        }
        if (loader) loader.style.display = show ? 'flex' : 'none';
    },

    updateSyncStatus(status) {
        const iconMap = {
            'loading': 'fas fa-sync-alt fa-spin',
            'synced': 'fas fa-check-circle text-success',
            'error': 'fas fa-exclamation-triangle text-danger',
            'saved': 'fas fa-save text-primary'
        };
        const labelMap = { 'loading': 'Chargement...', 'synced': 'Synchronisé', 'error': 'Erreur', 'saved': 'Sauvegardé' };
        
        const container = document.getElementById('sync-indicator');
        if (!container) return;
        container.innerHTML = `<i class="${iconMap[status] || ''}"></i> <span class="d-none d-md-inline">${labelMap[status] || ''}</span>`;
    }
};

// --- DATA SERVICE ---
const DataService = {
    async getIntervenants() {
        const { data, error } = await supabaseClient
            .from('intervenants')
            .select('*')
            .eq('is_active', true)
            .order('last_name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getInterventions() {
        // Version simplifiée pour test
        const { data, error } = await supabaseClient
            .from('interventions')
            .select(`*, intervenants (title, first_name, last_name)`)
            .order('date', { ascending: true });

        if (error) throw error;
        
        return data.map(item => ({
            id: item.id,
            date: item.date,
            day: item.day_of_week,
            type: item.cult_type,
            place: item.place,
            description: item.description,
            intervenant: item.intervenants 
                ? `${item.intervenants.title || ''} ${item.intervenants.first_name} ${item.intervenants.last_name}`.trim()
                : item.intervenant_name_snapshot
        }));
    },

    async addIntervention(data) {
        const dbPayload = {
            date: data.date,
            day_of_week: data.day,
            cult_type: data.type,
            place: data.place,
            description: data.description || '',
            intervenant_name_snapshot: data.intervenantStr
        };
        if (data.intervenantId) dbPayload.intervenant_id = data.intervenantId;

        const { error } = await supabaseClient.from('interventions').insert([dbPayload]);
        if (error) throw error;
    },

    async deleteIntervention(id) {
        const { error } = await supabaseClient.from('interventions').delete().eq('id', id);
        if (error) throw error;
    }
};

// --- MAIN LOGIC ---
const state = { interventions: [], intervenants: [] };

async function loadData() {
    UI.toggleLoading(true);
    UI.updateSyncStatus('loading');
    
    try {
        const [intervenants, interventions] = await Promise.all([
            DataService.getIntervenants(),
            DataService.getInterventions()
        ]);

        state.intervenants = intervenants;
        state.interventions = interventions;
        
        populateIntervenantsSelect();
        renderPlanning();
        UI.updateSyncStatus('synced');
    } catch (error) {
        console.error('Erreur:', error);
        UI.showAlert('Impossible de charger les données: ' + error.message, 'danger');
        UI.updateSyncStatus('error');
    } finally {
        UI.toggleLoading(false);
    }
}

function populateIntervenantsSelect() {
    const select = document.getElementById('new-intervenant');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Sélectionner --</option>';
    state.intervenants.forEach(person => {
        const option = document.createElement('option');
        option.value = person.id;
        option.textContent = `${person.title || ''} ${person.first_name} ${person.last_name}`;
        select.appendChild(option);
    });
}

function renderPlanning() {
    const container = document.getElementById('planning-container');
    if (!container) return;

    if (state.interventions.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-muted"><p>Aucune intervention trouvée.</p></div>`;
        return;
    }

    container.innerHTML = state.interventions.map(item => `
        <div class="card mb-2 border-start border-4 border-primary shadow-sm">
            <div class="card-body py-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0 fw-bold text-primary">
                            <i class="fas fa-calendar-day me-2"></i>${formatDate(item.date)} (${item.day})
                        </h6>
                        <div class="small text-muted mt-1">
                            <span class="badge bg-light text-dark border me-1">${item.type}</span>
                            <span class="badge bg-light text-dark border"><i class="fas fa-map-marker-alt me-1"></i>${item.place}</span>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold">${item.intervenant || 'Non assigné'}</div>
                        <button class="btn btn-sm btn-outline-danger mt-1" onclick="deleteIntervention('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleAddIntervention(e) {
    e.preventDefault();
    UI.toggleLoading(true);
    
    try {
        const dateStr = document.getElementById('new-date').value;
        const dateObj = new Date(dateStr);
        const dayName = CONSTANTS.DAYS_OF_WEEK[dateObj.getDay()];
        
        const intervenantSelect = document.getElementById('new-intervenant');
        
        await DataService.addIntervention({
            date: dateStr,
            day: dayName,
            type: document.getElementById('new-type').value,
            place: document.getElementById('new-place').value,
            intervenantId: intervenantSelect.value || null,
            intervenantStr: intervenantSelect.value ? '' : 'Invité'
        });
        
        UI.showAlert('Ajouté avec succès', 'success');
        e.target.reset();
        await loadData();
        
    } catch (error) {
        UI.showAlert('Erreur ajout: ' + error.message, 'danger');
    } finally {
        UI.toggleLoading(false);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Fonction globale pour le onclick HTML
window.deleteIntervention = async (id) => {
    if(!confirm('Supprimer ?')) return;
    UI.toggleLoading(true);
    try {
        await DataService.deleteIntervention(id);
        await loadData();
    } catch (e) {
        UI.showAlert('Erreur: ' + e.message, 'danger');
        UI.toggleLoading(false);
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refresh-btn')?.addEventListener('click', loadData);
    document.getElementById('quick-add-form')?.addEventListener('submit', handleAddIntervention);
    loadData();
});
