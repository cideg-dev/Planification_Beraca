import { DataService } from './services/dataService.js';
import { UI } from './ui/uiHelpers.js';
import { CONSTANTS } from './config.js';

// État local
const state = {
    interventions: [],
    intervenants: []
};

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('V2 Initialisation...');
    
    // Initialiser les écouteurs
    document.getElementById('refresh-btn')?.addEventListener('click', loadData);
    document.getElementById('quick-add-form')?.addEventListener('submit', handleAddIntervention);
    
    // Charger les données
    await loadData();
});

async function loadData() {
    UI.toggleLoading(true);
    UI.updateSyncStatus('loading');
    
    try {
        // Chargement parallèle
        const [intervenants, interventions] = await Promise.all([
            DataService.getIntervenants(),
            DataService.getInterventions()
        ]);

        state.intervenants = intervenants;
        state.interventions = interventions;
        
        // Mise à jour UI
        populateIntervenantsSelect();
        renderPlanning();
        
        UI.updateSyncStatus('synced');
    } catch (error) {
        console.error('Erreur chargement:', error);
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
        container.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="fas fa-calendar-times fa-3x mb-3"></i>
                <p>Aucune intervention trouvée dans la base de données relationnelle.</p>
            </div>`;
        return;
    }

    const html = state.interventions.map(item => `
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
                        <button class="btn btn-sm btn-outline-danger mt-1" onclick="window.deleteIntervention('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

async function handleAddIntervention(e) {
    e.preventDefault();
    UI.toggleLoading(true);
    
    try {
        const dateStr = document.getElementById('new-date').value;
        const dateObj = new Date(dateStr);
        const dayName = CONSTANTS.DAYS_OF_WEEK[dateObj.getDay()]; // Utiliser CONSTANTS
        
        const intervenantSelect = document.getElementById('new-intervenant');
        const intervenantId = intervenantSelect.value;
        const intervenantText = intervenantSelect.options[intervenantSelect.selectedIndex].text;
        
        const newIntervention = {
            date: dateStr,
            day: dayName,
            type: document.getElementById('new-type').value,
            place: document.getElementById('new-place').value,
            intervenantId: intervenantId || null,
            intervenantStr: intervenantId ? '' : 'Invité' // Fallback
        };

        await DataService.addIntervention(newIntervention);
        
        UI.showAlert('Intervention ajoutée avec succès !', 'success');
        e.target.reset();
        await loadData(); // Recharger la liste
        
    } catch (error) {
        console.error('Erreur ajout:', error);
        UI.showAlert('Erreur lors de l\'ajout: ' + error.message, 'danger');
    } finally {
        UI.toggleLoading(false);
    }
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Exposer la fonction de suppression au scope global (pour le onclick dans le HTML)
// C'est un compromis temporaire
window.deleteIntervention = async (id) => {
    if(!confirm('Voulez-vous vraiment supprimer cette intervention ?')) return;
    
    UI.toggleLoading(true);
    try {
        await DataService.deleteIntervention(id);
        UI.showAlert('Suppression réussie', 'success');
        await loadData();
    } catch (e) {
        UI.showAlert('Erreur suppression: ' + e.message, 'danger');
        UI.toggleLoading(false);
    }
};