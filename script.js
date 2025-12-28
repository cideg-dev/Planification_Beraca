// Données globales
let interventions = [];
let currentStep = 1;
let excelFileBlob = null;
let generatedFileName = "";
let intervenantsDB = [
    { id: 1, title: "Pasteur", firstName: "Christophe", lastName: "SATCHI AKOUETE", category: "clergy" },
    { id: 2, title: "Diacre", firstName: "Dieudonné", lastName: "N'DIMONTE", category: "clergy" },
    { id: 3, title: "Mr", firstName: "Joël", lastName: "SENOUWA", category: "members" },
    { id: 4, title: "Mr", firstName: "Michel", lastName: "MOUDA", category: "members" },
    { id: 5, title: "Mr", firstName: "Jonas", lastName: "KPANATCHE", category: "members" },
    { id: 6, title: "Mr", firstName: "Ekué", lastName: "DAVI", category: "members" },
    { id: 7, title: "Mme", firstName: "ODETTE", lastName: "N'TCHA", category: "members" },
    { id: 8, title: "Mme", firstName: "SYLVIE", lastName: "DOKO", category: "members" },
    { id: 9, title: "Diacre", firstName: "Robert", lastName: "NOUGBONAGNI", category: "clergy" },
    { id: 10, title: "Mme", firstName: "Rébecca", lastName: "N'DAH", category: "members" },
    { id: 11, title: "Mme", firstName: "Pierrette", lastName: "ALOYA", category: "members" },
    { id: 12, title: "Mr", firstName: "GuY", lastName: "LOKOSSOU", category: "members" },
    { id: 13, title: "Mme", firstName: "Grace", lastName: "PASTEUR", category: "members" },
    { id: 14, title: "Mr", firstName: "Ezéchiel", lastName: "AKOMEDI", category: "members" },
    { id: 15, title: "Diacre", firstName: "Jonas", lastName: "MEMEGNON", category: "clergy" },
    { id: 16, title: "Mme", firstName: "Reine", lastName: "N'DIMONTE", category: "members" },
    { id: 17, title: "Mme", firstName: "Rebecca", lastName: "SENOUWA", category: "members" },
    { id: 18, title: "Mme", firstName: "KOMBETO", lastName: "", category: "members" },
    { id: 19, title: "Mme", firstName: "N'DAH", lastName: "REBECCA", category: "members" },
    { id: 20, title: "Mlle", firstName: "Sandra", lastName: "DJIHENTO", category: "members" }
];

// Jours de la semaine en français
const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// Configuration des types de cultes par jour
const cultTypesByDay = {
    'Dimanche': ['Principal', 'Enseignement', 'Culte des enfants', 'Culte des Adolescents'],
    'Lundi': ['Réunion'],
    'Mardi': ['Prière hebdomadaire', 'Enseignement'],
    'Mercredi': ['Enseignement', 'Réunion', 'Culte des Adolescents'],
    'Jeudi': ['Témoignage/Action de grâce/Prière', 'Réunion'],
    'Vendredi': ['Enseignement', 'Veillée de prière', 'Réunion'],
    'Samedi': ['Jeune et Prière', 'Veillée de prière', 'Culte des Adolescents']
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    populateIntervenantsSelect();
    
    // Configurer Select2 pour les listes déroulantes
    $('.intervenant-select').select2({
        placeholder: "Sélectionnez...",
        allowClear: true,
        width: '100%'
    });
    
    // Afficher la date d'aujourd'hui par défaut
    const today = new Date();
    document.getElementById('intervention-date').valueAsDate = today;
    updateDayOfWeek();
});

function initializeApp() {
    // Vérifier l'authentification sur la page de planification
    if (!isPlanificationAccessible()) {
        return; // Arrêter l'initialisation si non authentifié
    }

    // Mettre à jour les listes déroulantes
    updatePlaceSelect();
    updateCultTypeSelect();

    // Initialiser la langue
    initializeLanguage();

    // Charger les données publiées si présentes dans l'URL
    loadPublishedData();

    // Nettoyer les données expirées
    cleanupExpiredData();
}

// Fonction pour vérifier l'accessibilité de la page de planification
function isPlanificationAccessible() {
    const isAuthenticated = localStorage.getItem('adminAccess') === 'true';

    if (!isAuthenticated) {
        alert('Accès refusé. Veuillez vous authentifier sur la page d\'accueil.');
        window.location.href = 'accueil.html';
        return false;
    }
    return true;
}

function setupEventListeners() {
    const addSafeListener = (id, event, callback) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(event, callback);
    };

    // Navigation entre les étapes
    addSafeListener('next-step-1', 'click', () => goToStep(2));
    addSafeListener('next-step-2', 'click', () => goToStep(3));
    addSafeListener('prev-step-2', 'click', () => goToStep(1));
    addSafeListener('prev-step-3', 'click', () => goToStep(2));
    
    // Date change
    addSafeListener('intervention-date', 'change', updateDayOfWeek);
    
    // Type autre
    addSafeListener('type-other', 'change', function() {
        const otherSpecify = document.getElementById('type-other-specify');
        if (otherSpecify) {
            otherSpecify.disabled = !this.checked;
            if (this.checked) otherSpecify.focus();
        }
    });
    
    // Lieu autre
    addSafeListener('place-other', 'change', function() {
        const otherSpecify = document.getElementById('place-other-specify');
        if (otherSpecify) {
            otherSpecify.disabled = !this.checked;
            if (this.checked) otherSpecify.focus();
        }
    });
    
    // Modification type/lieu autre
    addSafeListener('type-other-specify', 'input', updateCultTypeSelect);
    addSafeListener('place-other-specify', 'input', updatePlaceSelect);
    
    // Ajout d'intervention
    addSafeListener('add-intervention-btn', 'click', addIntervention);
    addSafeListener('add-multiple-btn', 'click', addMultipleInterventions);
    
    // Ajout d'intervenant
    addSafeListener('add-new-intervenant', 'click', addNewIntervenant);
    
    // Boutons d'action
    addSafeListener('clear-all-btn', 'click', clearAllInterventions);
    addSafeListener('generate-excel-btn', 'click', generateExcel);
    addSafeListener('preview-excel-btn', 'click', previewExcel);
    addSafeListener('new-planning-btn', 'click', newPlanning);
    
    // Téléchargement
    addSafeListener('download-excel-btn', 'click', downloadExcel);

    // Initialiser le partage WhatsApp
    setupWhatsAppSharing();

    // Importation Excel
    addSafeListener('import-excel-btn', 'click', showImportModal);

    // Exportations et Personnalisation
    addSafeListener('customize-pdf-btn', 'click', showPdfCustomizationModal);
    addSafeListener('generate-pdf-btn', 'click', generatePDF);
    addSafeListener('generate-csv-btn', 'click', generateCSV);
    addSafeListener('show-reports-btn', 'click', showReports);
    addSafeListener('email-share-btn', 'click', shareViaEmail);
    addSafeListener('notifications-btn', 'click', toggleNotifications);
    addSafeListener('archive-planning-btn', 'click', archiveCurrentPlanning);
    addSafeListener('show-archives-btn', 'click', showArchivedPlannings);
    addSafeListener('help-btn', 'click', () => {
        const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
        helpModal.show();
    });

    // Gestion des intervenants
    addSafeListener('manage-intervenants-btn', 'click', showManageIntervenantsModal);

    // Planification automatique
    addSafeListener('auto-plan-btn', 'click', showAutoPlanModal);

    // Gestion des profils
    addSafeListener('manage-profiles-btn', 'click', showManageProfilesModal);

    // Gestion des données
    addSafeListener('export-data-btn', 'click', exportData);
    addSafeListener('import-data-btn', 'click', importData);
    addSafeListener('sync-data-btn', 'click', syncData);
    addSafeListener('publish-btn', 'click', publishData);
    addSafeListener('show-published-list-btn', 'click', showPublishedList);

    // Déverrouillage des informations générales
    addSafeListener('unlock-general-info', 'click', unlockGeneralInfo);

    // Recherche et filtres
    addSafeListener('search-input', 'input', applyFilters);
    addSafeListener('filter-day', 'change', applyFilters);
    addSafeListener('filter-type', 'change', applyFilters);
    addSafeListener('filter-place', 'change', applyFilters);
    addSafeListener('filter-intervenant', 'change', applyFilters);
    addSafeListener('filter-start-date', 'change', applyFilters);
    addSafeListener('filter-end-date', 'change', applyFilters);
    addSafeListener('toggle-advanced-filters', 'click', typeof toggleAdvancedFilters === 'function' ? toggleAdvancedFilters : () => {
        const adv = document.getElementById('advanced-filters');
        if (adv) adv.style.display = adv.style.display === 'none' ? 'block' : 'none';
    });
    addSafeListener('clear-filters-btn', 'click', clearFilters);

    // Changement des configurations
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateDynamicSelects);
    });

    // Sauvegarde automatique
    window.addEventListener('beforeunload', saveToLocalStorageSecure);

    // Charger les données sauvegardées
    setTimeout(loadFromLocalStorage, 100);
}

function changeTheme(theme) {
    // Valider que le thème est autorisé pour éviter les injections CSS
    const allowedThemes = ['light', 'dark', 'neon', 'galaxy', 'rainbow', 'high-contrast', 'pastel', 'custom'];
    if (!allowedThemes.includes(theme)) {
        console.warn(`Thème non autorisé : ${theme}`);
        return;
    }

    document.body.className = 'theme-' + theme;
    saveToLocalStorage();
}

// Fonction pour personnaliser le thème
function customizeTheme() {
    // Récupérer les valeurs de personnalisation
    const primaryColor = document.getElementById('primary-color-picker')?.value || getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const secondaryColor = document.getElementById('secondary-color-picker')?.value || getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    const accentColor = document.getElementById('accent-color-picker')?.value || getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const backgroundColor = document.getElementById('bg-color-picker')?.value || getComputedStyle(document.documentElement).getPropertyValue('--light-bg').trim();
    const textColor = document.getElementById('text-color-picker')?.value || '#000000';
    const borderRadius = document.getElementById('border-radius-slider')?.value || '12';
    const shadowIntensity = document.getElementById('shadow-slider')?.value || '0.15';

    // Mettre à jour les variables CSS
    document.documentElement.style.setProperty('--custom-primary', primaryColor);
    document.documentElement.style.setProperty('--custom-secondary', secondaryColor);
    document.documentElement.style.setProperty('--custom-accent', accentColor);
    document.documentElement.style.setProperty('--custom-bg', backgroundColor);
    document.documentElement.style.setProperty('--custom-text', textColor);
    document.documentElement.style.setProperty('--custom-border-radius', borderRadius + 'px');
    document.documentElement.style.setProperty('--custom-shadow', `0 10px 30px rgba(0, 0, 0, ${shadowIntensity})`);

    // Changer le thème vers 'custom' si ce n'est pas déjà le cas
    if (!document.body.classList.contains('theme-custom')) {
        document.body.className = 'theme-custom';
    }

    saveToLocalStorage();
}

// Fonction pour afficher la modale de personnalisation du thème
function showThemeCustomizationModal() {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('themeCustomizationModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'themeCustomizationModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Personnalisation du Thème</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="primary-color-picker" class="form-label">Couleur Primaire</label>
                                <input type="color" class="form-control form-control-color" id="primary-color-picker" value="#0d1b2a">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="secondary-color-picker" class="form-label">Couleur Secondaire</label>
                                <input type="color" class="form-control form-control-color" id="secondary-color-picker" value="#1b263b">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="accent-color-picker" class="form-label">Couleur d'Accent</label>
                                <input type="color" class="form-control form-control-color" id="accent-color-picker" value="#415a77">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="bg-color-picker" class="form-label">Couleur de Fond</label>
                                <input type="color" class="form-control form-control-color" id="bg-color-picker" value="#e0e1dd">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="text-color-picker" class="form-label">Couleur du Texte</label>
                                <input type="color" class="form-control form-control-color" id="text-color-picker" value="#000000">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="border-radius-slider" class="form-label">Arrondi des Bordures: <span id="border-radius-value">12</span>px</label>
                                <input type="range" class="form-range" id="border-radius-slider" min="0" max="30" value="12">
                            </div>
                            <div class="col-12 mb-3">
                                <label for="shadow-slider" class="form-label">Intensité de l'Ombre: <span id="shadow-value">0.15</span></label>
                                <input type="range" class="form-range" id="shadow-slider" min="0" max="1" step="0.01" value="0.15">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="apply-theme-btn">Appliquer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Ajouter les événements pour les contrôles de personnalisation
        document.getElementById('border-radius-slider').addEventListener('input', function() {
            document.getElementById('border-radius-value').textContent = this.value;
        });

        document.getElementById('shadow-slider').addEventListener('input', function() {
            document.getElementById('shadow-value').textContent = this.value;
        });

        document.getElementById('apply-theme-btn').addEventListener('click', function() {
            customizeTheme();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });
    }

    // Mettre à jour les valeurs actuelles dans les contrôles
    const currentPrimary = getComputedStyle(document.documentElement).getPropertyValue('--custom-primary').trim() ||
                          getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const currentSecondary = getComputedStyle(document.documentElement).getPropertyValue('--custom-secondary').trim() ||
                            getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim();
    const currentAccent = getComputedStyle(document.documentElement).getPropertyValue('--custom-accent').trim() ||
                         getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    const currentBg = getComputedStyle(document.documentElement).getPropertyValue('--custom-bg').trim() ||
                     getComputedStyle(document.documentElement).getPropertyValue('--light-bg').trim();

    document.getElementById('primary-color-picker').value = currentPrimary;
    document.getElementById('secondary-color-picker').value = currentSecondary;
    document.getElementById('accent-color-picker').value = currentAccent;
    document.getElementById('bg-color-picker').value = currentBg;

    // Mettre à jour les valeurs de slider
    const borderRadius = getComputedStyle(document.documentElement).getPropertyValue('--custom-border-radius');
    const shadow = getComputedStyle(document.documentElement).getPropertyValue('--custom-shadow');
    // Extraire la valeur numérique du border-radius
    const borderRadiusValue = borderRadius.replace('px', '');
    document.getElementById('border-radius-slider').value = borderRadiusValue;
    document.getElementById('border-radius-value').textContent = borderRadiusValue;

    // Extraire la valeur numérique de l'opacité de l'ombre
    const shadowMatch = shadow.match(/rgba\(0, 0, 0, ([0-9.]+)\)/);
    if (shadowMatch) {
        document.getElementById('shadow-slider').value = shadowMatch[1];
        document.getElementById('shadow-value').textContent = shadowMatch[1];
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour mettre à jour l'indicateur de synchronisation
function updateSyncIndicator(status) {
    // Créer ou mettre à jour l'indicateur de synchronisation
    let syncIndicator = document.getElementById('sync-indicator');

    if (!syncIndicator) {
        // Créer l'indicateur s'il n'existe pas
        syncIndicator = document.createElement('div');
        syncIndicator.id = 'sync-indicator';
        syncIndicator.className = 'sync-indicator';
        syncIndicator.innerHTML = `
            <i class="fas fa-sync-alt sync-icon"></i>
            <span class="sync-text">Synchronisation</span>
        `;

        // Ajouter à la barre de navigation
        const navContainer = document.querySelector('.navbar .container-fluid');
        if (navContainer) {
            navContainer.appendChild(syncIndicator);
        }
    }

    // Mettre à jour l'apparence selon l'état
    syncIndicator.className = 'sync-indicator';
    syncIndicator.classList.add(`sync-${status}`);

    // Mettre à jour le texte et l'icône
    const icon = syncIndicator.querySelector('.sync-icon');
    const text = syncIndicator.querySelector('.sync-text');

    switch(status) {
        case 'loading':
            icon.className = 'fas fa-sync-alt sync-icon spin';
            text.textContent = 'Synchronisation...';
            break;
        case 'synced':
            icon.className = 'fas fa-check-circle sync-icon synced';
            text.textContent = 'Synchronisé';
            break;
        case 'error':
            icon.className = 'fas fa-exclamation-triangle sync-icon error';
            text.textContent = 'Erreur de synchro';
            break;
        case 'no-data':
            icon.className = 'fas fa-info-circle sync-icon no-data';
            text.textContent = 'Aucune donnée';
            break;
        default:
            icon.className = 'fas fa-sync-alt sync-icon';
            text.textContent = 'Synchronisation';
    }
}

function goToStep(step) {
    // Mettre à jour l'indicateur d'étapes
    document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.step-content').forEach(c => c.classList.remove('active'));
    
    currentStep = step;
    document.getElementById(`step${step}`).classList.add('active');
    document.getElementById(`step${step}-content`).classList.add('active');
    
    // Actions spécifiques à chaque étape
    if (step === 2) {
        updateCultTypeSelect();
        updatePlaceSelect();
    } else if (step === 3) {
        updateSummary();
        generateExcelPreview();
    }
}

function updateDayOfWeek() {
    const dateInput = document.getElementById('intervention-date');
    const dayDisplay = document.getElementById('day-of-week-display');
    const dayInput = document.getElementById('day-of-week');
    
    if (dateInput.value) {
        const date = new Date(dateInput.value);
        const dayIndex = date.getDay();
        const dayName = daysOfWeek[dayIndex];
        
        dayDisplay.textContent = dayName;
        dayInput.value = dayName;
        
        // Mettre à jour les types de culte disponibles pour ce jour
        updateCultTypeSelect();
    } else {
        dayDisplay.textContent = '---';
        dayInput.value = '';
    }
}

function updatePlaceSelect() {
    const placeSelect = document.getElementById('intervention-place');
    const currentValue = placeSelect.value;
    placeSelect.innerHTML = '<option value="">Sélectionnez un lieu...</option>';
    
    // Ajouter les lieux cochés
    document.querySelectorAll('input[id^="place-"]:checked').forEach(checkbox => {
        if (checkbox.id === 'place-other' && checkbox.checked) {
            const otherValue = document.getElementById('place-other-specify').value;
            if (otherValue) {
                placeSelect.innerHTML += `<option value="${otherValue}">${otherValue}</option>`;
            }
        } else if (checkbox.id !== 'place-other') {
            const placeValue = checkbox.value;
            placeSelect.innerHTML += `<option value="${placeValue}">${placeValue}</option>`;
        }
    });
    
    // Restaurer la valeur précédente si elle existe toujours
    if (currentValue && Array.from(placeSelect.options).some(opt => opt.value === currentValue)) {
        placeSelect.value = currentValue;
    }
}

function updateCultTypeSelect() {
    const cultTypeSelect = document.getElementById('cult-type-select');
    const currentValue = cultTypeSelect.value;
    
    cultTypeSelect.innerHTML = '<option value="">Sélectionnez un type...</option>';
    
    // Récupérer tous les types cochés
    const checkedTypes = [];
    document.querySelectorAll('input[id^="type-"]:checked').forEach(checkbox => {
        if (checkbox.id === 'type-other' && checkbox.checked) {
            const otherValue = document.getElementById('type-other-specify').value;
            if (otherValue) {
                checkedTypes.push(otherValue);
            }
        } else if (checkbox.id !== 'type-other') {
            checkedTypes.push(checkbox.value);
        }
    });
    
    // Ajouter tous les types cochés à la liste
    checkedTypes.forEach(type => {
        cultTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });
    
    // Restaurer la valeur précédente si elle existe toujours
    if (currentValue && Array.from(cultTypeSelect.options).some(opt => opt.value === currentValue)) {
        cultTypeSelect.value = currentValue;
    }
}

function updateDynamicSelects() {
    updatePlaceSelect();
    updateCultTypeSelect();
}

function populateIntervenantsSelect() {
    const firstnameSelect = document.getElementById('intervenant-firstname');
    const lastnameSelect = document.getElementById('intervenant-lastname');
    
    // Remplir les prénoms (uniques)
    const uniqueFirstnames = [...new Set(intervenantsDB
        .map(i => i.firstName)
        .filter(name => name && name.trim() !== ''))];
    
    firstnameSelect.innerHTML = '<option value="">Sélectionnez...</option>';
    uniqueFirstnames.sort().forEach(firstname => {
        firstnameSelect.innerHTML += `<option value="${firstname}">${firstname}</option>`;
    });
    
    // Remplir les noms (uniques)
    const uniqueLastnames = [...new Set(intervenantsDB
        .map(i => i.lastName)
        .filter(name => name && name.trim() !== ''))];
    
    lastnameSelect.innerHTML = '<option value="">Sélectionnez...</option>';
    uniqueLastnames.sort().forEach(lastname => {
        lastnameSelect.innerHTML += `<option value="${lastname}">${lastname}</option>`;
    });
    
    // Mettre à jour Select2
    $('#intervenant-firstname').trigger('change.select2');
    $('#intervenant-lastname').trigger('change.select2');
}

function addNewIntervenant() {
    const title = document.getElementById('new-title').value;
    const firstName = document.getElementById('new-firstname').value.trim();
    const lastName = document.getElementById('new-lastname').value.trim();
    const category = document.getElementById('new-category') ? document.getElementById('new-category').value : 'members'; // Valeur par défaut

    if (!firstName || !lastName) {
        showAlert('Veuillez entrer au moins un prénom et un nom.', 'danger');
        return;
    }

    // Vérifier si l'intervenant existe déjà
    const exists = intervenantsDB.some(i =>
        i.firstName === firstName && i.lastName === lastName
    );

    if (exists) {
        showAlert('Cet intervenant existe déjà dans la base.', 'warning');
        return;
    }

    // Ajouter à la base de données
    const newIntervenant = {
        id: Date.now(),
        title: title,
        firstName: firstName,
        lastName: lastName,
        category: category
    };

    intervenantsDB.push(newIntervenant);

    // Mettre à jour les listes déroulantes
    populateIntervenantsSelect();

    // Réinitialiser le formulaire
    document.getElementById('new-title').value = '';
    document.getElementById('new-firstname').value = '';
    document.getElementById('new-lastname').value = '';
    if (document.getElementById('new-category')) {
        document.getElementById('new-category').value = 'members';
    }

    showAlert(`Intervenant ${firstName} ${lastName} ajouté avec succès!`, 'success');
    saveToLocalStorage();
    autoSyncToReport(); // Synchroniser avec la page de rapport
}

function addIntervention() {
    if (!validateInterventionForm()) {
        return;
    }

    const intervention = getInterventionFromForm();

    // Sauvegarder l'état précédent pour l'historique
    const previousState = JSON.parse(JSON.stringify(interventions));

    interventions.push(intervention);

    updateInterventionsList();
    resetInterventionForm();
    saveToLocalStorage();

    // Enregistrer dans l'historique
    saveToHistory('add', intervention, previousState);

    showAlert('Intervention ajoutée avec succès!', 'success');
}

function addMultipleInterventions() {
    if (!validateInterventionForm()) {
        return;
    }
    
    const baseIntervention = getInterventionFromForm();
    let baseDate = new Date(document.getElementById('intervention-date').value);
    
    for (let i = 0; i < 4; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + (i * 7));
        
        const intervention = {...baseIntervention};
        intervention.id = Date.now() + i;
        intervention.date = date.toISOString().split('T')[0];
        intervention.formattedDate = intervention.date + ' 00:00:00';
        intervention.dayOfWeek = daysOfWeek[date.getDay()];
        
        interventions.push(intervention);
    }
    
    updateInterventionsList();
    resetInterventionForm();
    saveToLocalStorage();
    autoSyncToReport(); // Synchroniser avec la page de rapport

    showAlert('4 interventions hebdomadaires ajoutées!', 'success');
}

function getInterventionFromForm() {
    const date = document.getElementById('intervention-date').value;
    const dayOfWeek = document.getElementById('day-of-week').value;
    const place = document.getElementById('intervention-place').value;
    const cultType = document.getElementById('cult-type-select').value;
    const theme = document.getElementById('cult-theme').value;
    const title = document.getElementById('intervenant-title').value;
    const firstName = document.getElementById('intervenant-firstname').value;
    const lastName = document.getElementById('intervenant-lastname').value;
    const observations = document.getElementById('observations').value;
    
    // Trouver le titre correspondant dans la base de données
    const intervenant = intervenantsDB.find(i => 
        i.firstName === firstName && i.lastName === lastName
    );
    
    const actualTitle = intervenant ? intervenant.title : title;
    
    // Formater le nom complet
    let fullName = '';
    if (actualTitle) {
        fullName += actualTitle + ' ';
    }
    fullName += firstName + ' ' + lastName;
    
    // Déterminer le label de groupe
    let groupLabel = '';
    
    if (cultType === 'Principal' && place === 'BERACA') {
        groupLabel = 'Les intervenants culte Dimanche BERACA';
    } else if (cultType === 'Culte des enfants') {
        groupLabel = 'Les intervenants du culte des enfants';
    } else if (cultType === 'Culte des Adolescents') {
        groupLabel = 'Les intervenants du culte des Adolescents';
    } else if (place === 'KPOTEYEI') {
        if (dayOfWeek === 'Dimanche') {
            groupLabel = 'Les intervenants de Dimanche à KPOTEYEI';
        } else if (dayOfWeek === 'Mercredi') {
            groupLabel = 'Les intervenants de Mercredi à KPOTEYEI';
        } else if (dayOfWeek === 'Vendredi') {
            groupLabel = 'Les intervenants de Vendredi à KPOTEYEI';
        }
    } else if (place === 'GROS PORTEUR' && dayOfWeek === 'Mercredi') {
        groupLabel = 'Les intervenants de Mercredi à GROS PORTEUR';
    } else if (place === 'WINKE' && dayOfWeek === 'Mercredi') {
        groupLabel = 'Les intervenants de Mercredi à WINKE';
    } else if (cultType === 'Témoignage/Action de grâce/Prière' && dayOfWeek === 'Jeudi') {
        groupLabel = 'Intervenants de Jeudi';
    } else if (cultType === 'Prière hebdomadaire' && dayOfWeek === 'Mardi') {
        groupLabel = 'Intervenants de Mardi';
    } else if (cultType === 'Jeune et Prière') {
        groupLabel = 'Intervenants de Jeune et Prière';
    } else if (cultType === 'Veillée de prière') {
        groupLabel = 'Intervenants de Veillée de Prière';
    } else {
        groupLabel = `Intervenants de ${dayOfWeek}`;
    }
    
    return {
        id: Date.now(),
        date: date,
        formattedDate: date + ' 00:00:00',
        dayOfWeek: dayOfWeek,
        place: place,
        cultType: cultType,
        theme: theme,
        title: actualTitle,
        firstName: firstName,
        lastName: lastName,
        fullName: fullName,
        observations: observations,
        groupLabel: groupLabel
    };
}

function validateInterventionForm() {
    const requiredFields = [
        'intervention-date', 'intervention-place', 'cult-type-select',
        'intervenant-firstname', 'intervenant-lastname'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            const label = field.previousElementSibling ? field.previousElementSibling.textContent : fieldId;
            showAlert(`Le champ "${label}" est requis.`, 'danger');
            field.focus();
            return false;
        }
    }
    
    return true;
}

function resetInterventionForm() {
    // Incrémenter la date de 7 jours pour la prochaine intervention
    const currentDate = new Date(document.getElementById('intervention-date').value);
    currentDate.setDate(currentDate.getDate() + 7);
    document.getElementById('intervention-date').valueAsDate = currentDate;
    
    // Réinitialiser les autres champs
    document.getElementById('cult-theme').value = '';
    document.getElementById('intervenant-title').value = '';
    $('#intervenant-firstname').val(null).trigger('change');
    $('#intervenant-lastname').val(null).trigger('change');
    document.getElementById('observations').value = '';
    
    // Mettre à jour le jour de la semaine
    updateDayOfWeek();
}

function updateInterventionsList() {
    updateFilterOptions();
    displayInterventions(interventions);

    // Sauvegarder automatiquement les données pour synchronisation avec la page de rapport
    autoSyncToReport();
}

// Fonction pour synchroniser automatiquement les données avec la page de rapport
function autoSyncToReport() {
    try {
        const syncData = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            lastSync: new Date().toISOString()
        };

        localStorage.setItem('autoSyncData', JSON.stringify(syncData));
    } catch (error) {
        console.error('Erreur lors de la synchronisation automatique:', error);
    }
}

function deleteIntervention(id) {
    if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
        // Sauvegarder l'état précédent pour l'historique
        const previousState = JSON.parse(JSON.stringify(interventions));

        const deletedIntervention = interventions.find(intervention => intervention.id === id);
        interventions = interventions.filter(intervention => intervention.id !== id);
        updateInterventionsList();
        saveToLocalStorage();
        autoSyncToReport(); // Synchroniser avec la page de rapport

        // Enregistrer dans l'historique
        if (deletedIntervention) {
            saveToHistory('delete', deletedIntervention, previousState);
        }

        showAlert('Intervention supprimée.', 'warning');
    }
}

function clearAllInterventions() {
    if (interventions.length === 0) return;

    if (confirm(`Voulez-vous vraiment supprimer toutes les ${interventions.length} interventions ?`)) {
        // Sauvegarder l'état précédent pour l'historique
        const previousState = JSON.parse(JSON.stringify(interventions));

        interventions = [];
        updateInterventionsList();
        saveToLocalStorage();
        autoSyncToReport(); // Synchroniser avec la page de rapport

        // Enregistrer dans l'historique
        saveToHistory('clear', { count: previousState.length }, previousState);

        showAlert('Toutes les interventions ont été supprimées.', 'warning');
    }
}

function showPdfCustomizationModal() {
    if (interventions.length === 0) {
        showAlert('Aucune intervention à exporter.', 'warning');
        return;
    }

    // Pré-remplir le nom du fichier
    const year = document.getElementById('year').value;
    const quarter = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
    const defaultName = `Planning_BERACA_${quarter}_${year}`;
    document.getElementById('pdf-filename').value = defaultName;

    // Ouvrir la modale
    const modal = new bootstrap.Modal(document.getElementById('pdfCustomizationModal'));
    modal.show();

    // Configurer le bouton de confirmation
    const confirmBtn = document.getElementById('confirm-pdf-customization');
    // Cloner le bouton pour supprimer les anciens écouteurs d'événements
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);

    newBtn.addEventListener('click', function() {
        // Récupérer les paramètres de personnalisation
        const orientation = document.getElementById('pdf-orientation').value;
        const format = document.getElementById('pdf-format').value;
        const marginTop = parseInt(document.getElementById('pdf-margin-top').value) || 10;
        const marginRight = parseInt(document.getElementById('pdf-margin-right').value) || 10;
        const marginBottom = parseInt(document.getElementById('pdf-margin-bottom').value) || 10;
        const marginLeft = parseInt(document.getElementById('pdf-margin-left').value) || 10;
        const includeLogo = document.getElementById('pdf-include-logo').checked;
        const includeHeaders = document.getElementById('pdf-include-headers').checked;
        const fileName = document.getElementById('pdf-filename').value;

        // Fermer la modale
        modal.hide();

        // Générer le PDF avec les paramètres de personnalisation
        generatePDF(null, {
            orientation: orientation,
            format: format,
            margins: {
                top: marginTop,
                right: marginRight,
                bottom: marginBottom,
                left: marginLeft
            },
            includeLogo: includeLogo,
            includeHeaders: includeHeaders
        }, fileName);
    });
}

async function generatePDF(customFileName = null, options = {}, fileName = null) {
    // Si customFileName est un événement (click), on le remet à null
    if (typeof customFileName !== 'string') {
        customFileName = null;
    }

    if (interventions.length === 0) {
        showAlert('Aucune intervention à exporter.', 'warning');
        return null;
    }

    const btn = document.getElementById('generate-pdf-btn');
    if(btn) {
        var originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Génération...';
        btn.disabled = true;
    }

    try {
        // Initialisation robuste de jsPDF
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            throw new Error("La bibliothèque jsPDF n'est pas chargée correctement.");
        }

        // Utiliser les options de personnalisation ou les valeurs par défaut
        const orientation = options.orientation || 'portrait';
        const format = options.format || 'a4';
        const margins = options.margins || { top: 10, right: 10, bottom: 10, left: 10 };
        const includeLogo = options.hasOwnProperty('includeLogo') ? options.includeLogo : true;
        const includeHeaders = options.hasOwnProperty('includeHeaders') ? options.includeHeaders : true;

        const doc = new jsPDF(orientation, 'mm', format);

        // Ajouter la police Cambria (ou une police similaire) au document
        // Note: jsPDF ne charge pas directement les polices système comme Cambria
        // Nous utiliserons une police intégrée qui ressemble à Cambria (times)
        // Pour une police personnalisée comme Cambria, il faudrait l'ajouter via addFont

        const primaryColor = [13, 27, 42];

        // Calculer les dimensions de la page
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // En-tête
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Tenter de charger le logo avec un timeout de 2 secondes
        if (includeLogo) {
            try {
                const logoPromise = getBase64ImageFromUrl('AD.jpeg');
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout image")), 2000));

                const logoData = await Promise.race([logoPromise, timeoutPromise]);

                if (logoData) {
                    // Adapter la taille du logo selon l'orientation
                    const logoWidth = orientation === 'landscape' ? 38 : 38;
                    const logoHeight = orientation === 'landscape' ? 38 : 38;
                    doc.addImage(logoData, 'JPEG', margins.left, 2, logoWidth, logoHeight);
                }
            } catch (error) {
                console.warn("Le logo n'a pas pu être chargé (continu sans logo)", error);
            }
        }

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(18);
        // Utiliser la police Cambria si disponible, sinon une police similaire
        doc.setFont('times', 'bold'); // times est souvent proche de Cambria
        doc.text("EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU", pageWidth / 2, 15, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('times', 'normal');
        doc.text("Temple BERACA de Natitingou", pageWidth / 2, 25, { align: 'center' });

        const quarter = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
        const year = document.getElementById('year').value;
        doc.setFontSize(12);
        doc.setTextColor(200, 200, 200);
        doc.text(`Planning des Interventions - ${quarter} ${year}`, pageWidth / 2, 35, { align: 'center' });

        // Préparer les données pour le tableau
        const columns = includeHeaders ? ["Date", "Lieu", "Type", "Intervenant", "Observations"] : [];
        const rows = interventions.map(item => {
            const dateObj = new Date(item.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            return [`${formattedDate}
${item.dayOfWeek}`, item.place, item.cultType, item.fullName, item.observations || ""];
        });

        // Calculer la position de départ du tableau
        const startY = 45;

        // Configurer le tableau
        const tableConfig = {
            startY: startY,
            theme: 'grid',
            headStyles: {
                fillColor: primaryColor,
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'center',
                font: 'times' // Utiliser times qui est proche de Cambria
            },
            bodyStyles: {
                font: 'times' // Appliquer la police aux cellules du corps
            },
            columnStyles: {
                0: {
                    cellWidth: 25,
                    halign: 'center',
                    fontStyle: 'bold',
                    font: 'times' // Police pour la colonne Date
                },
                3: {
                    fontStyle: 'bold',
                    font: 'times' // Police pour la colonne Intervenant
                }
            },
            didDrawPage: function (data) {
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.setFont('times', 'normal'); // Appliquer la police pour le texte de pied de page
                doc.text(`Généré le ${new Date().toLocaleDateString()}`, margins.left, pageHeight - 10);
            }
        };

        // Ajouter les en-têtes seulement si demandé
        if (includeHeaders) {
            tableConfig.head = [columns];
        }

        tableConfig.body = rows;

        doc.autoTable(tableConfig);

        let finalFileName = fileName || customFileName || `Planning_BERACA_${year}_${Date.now()}.pdf`;
        if (!finalFileName.endsWith('.pdf')) {
            finalFileName += '.pdf';
        }

        doc.save(finalFileName);
        addToHistory("PDF", finalFileName);
        if (!customFileName) showAlert('Fichier PDF (Pro) généré avec succès !', 'success');
        return finalFileName;

    } catch (err) {
        console.error(err);
        showAlert('Erreur PDF: ' + err.message, 'danger');
        return null;
    } finally {
        if(btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }
}

// Nouvelle logique de partage WhatsApp avec sélecteur de fichiers
function setupWhatsAppSharing() {
    const waButton = document.getElementById('whatsapp-share-btn');
    const waFloat = document.getElementById('whatsapp-share-float');
    const waModalBtn = document.getElementById('whatsapp-modal-share');
    const filePicker = document.getElementById('whatsapp-file-picker');

    // Fonction pour déclencher le sélecteur
    const triggerPicker = (e) => {
        e.preventDefault();
        filePicker.click(); // Ouvre la fenêtre native de sélection
    };

    // Attacher les événements aux boutons
    if (waButton) waButton.addEventListener('click', triggerPicker);
    if (waFloat) waFloat.addEventListener('click', triggerPicker);
    if (waModalBtn) waModalBtn.addEventListener('click', triggerPicker);

    // Gérer la sélection du fichier
    filePicker.addEventListener('change', async function(e) {
        const file = this.files[0];
        
        if (!file) return; // Aucun fichier sélectionné

        // 4. Valider le type de fichier
        const validTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'application/vnd.ms-excel' // .xls
        ];

        // Vérification par extension (plus fiable sur certains navigateurs mobiles)
        const fileName = file.name.toLowerCase();
        const isValidExtension = fileName.endsWith('.pdf') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

        if (!isValidExtension && !validTypes.includes(file.type)) {
            showAlert('Format de fichier invalide. Veuillez sélectionner un PDF ou un Excel.', 'danger');
            this.value = ''; // Reset
            return;
        }

        // Préparer les données de partage
        const shareData = {
            files: [file],
            title: 'Planning AD BERACA',
            text: `Voici le fichier : ${file.name}`
        };

        // 3. Utiliser l'API Web Share pour l'intégration
        if (navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
                // 5. Message de confirmation post-partage
                addToHistory("Partage Fichier", file.name);
                showAlert('Fichier partagé avec succès !', 'success');
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Erreur de partage:', err);
                    showAlert('Erreur lors du partage : ' + err.message, 'danger');
                }
            }
        } else {
            // Fallback pour PC (Desktop) où le partage de fichiers n'est souvent pas supporté
            handleDesktopFallback(file);
        }

        // Reset pour permettre de resélectionner le même fichier si besoin
        this.value = '';
    });
}

function handleDesktopFallback(file) {
    // Sur PC, on ne peut pas injecter le fichier directement dans WhatsApp Web via JS
    // On ouvre WhatsApp Web et on guide l'utilisateur
    
    const confirmFallback = confirm(
        "Sur ordinateur, le navigateur ne peut pas envoyer le fichier directement à WhatsApp.\n\n" +
        "Voulez-vous ouvrir WhatsApp Web pour y glisser le fichier manuellement ?"
    );

    if (confirmFallback) {
        const text = `Voici le fichier "${file.name}" concernant le planning.`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        
        showAlert('WhatsApp Web ouvert. Veuillez maintenant glisser le fichier dans la discussion.', 'info');
        addToHistory("Ouverture WhatsApp Web", file.name);
    }
}

// Fonction obsolète remplacée par setupWhatsAppSharing
function shareViaWhatsApp() {
    // Cette fonction est laissée vide ou redirige vers le sélecteur pour compatibilité
    document.getElementById('whatsapp-file-picker').click();
}

function shareViaEmail() {
    if (interventions.length === 0) {
        showAlert('Veuillez d\'abord créer un planning.', 'warning');
        return;
    }

    // Générer le fichier PDF automatiquement
    generatePDF().then(generatedFileName => {
        if (!generatedFileName) {
            // Une erreur s'est produite pendant la génération du PDF
            return;
        }

        // Préparer le message email
        const quarterSelect = document.getElementById('quarter');
        const quarter = quarterSelect.options[quarterSelect.selectedIndex].text;
        const year = document.getElementById('year').value;

        const subject = encodeURIComponent(`Planning des interventions - Église AD BERACA ${quarter} ${year}`);
        const body = encodeURIComponent(
            `Bonjour,\n\n` +
            `Veuillez trouver ci-joint le planning des interventions de l'église AD BERACA pour le ${quarter} ${year}.\n\n` +
            `Shalom !`
        );

        // Créer le lien mailto
        const mailtoLink = `mailto:?subject=${subject}&body=${body}`;

        // Ouvrir l'application email par défaut
        window.open(mailtoLink, '_blank');
        addToHistory("Partage Email", `${generatedFileName} -> Email`);
    });
}

function getBase64ImageFromUrl(url) {
    return new Promise((resolve, reject) => {
        var img = new Image();
        // Supprimer l'attribut crossOrigin pour éviter les problèmes CORS avec les fichiers locaux
        // img.setAttribute('crossOrigin', 'anonymous');

        img.onload = function () {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(this, 0, 0);

            var dataURL = canvas.toDataURL("image/jpeg");
            resolve(dataURL);
        };

        img.onerror = function () {
            // En cas d'erreur, on continue sans l'image
            console.warn("Impossible de charger l'image " + url + ", poursuite sans logo");
            resolve(null); // Résoudre avec null au lieu de rejeter
        };

        img.src = url;
    });
}

function addToHistory(type, fileName) {
    const historyList = document.getElementById('share-history-list');
    const historyCard = document.getElementById('share-history-card');
    
    const date = new Date().toLocaleString();
    const item = document.createElement('li');
    item.className = 'list-group-item d-flex justify-content-between align-items-center';
    item.innerHTML = `
        <div>
            <strong>${type}</strong> : ${fileName}
            <br><small class="text-muted">${date}</small>
        </div>
        <i class="fas fa-check-circle text-success"></i>
    `;
    
    historyList.prepend(item);
    historyCard.style.display = 'block';
    
    // Sauvegarder dans localStorage si besoin (optionnel simple ici)
}

// --- Fonctions existantes ---
function generateExcelPreview() {
    const previewContainer = document.getElementById('excel-preview');
    
    if (interventions.length === 0) {
        previewContainer.innerHTML = '<p class="text-muted">Aucune intervention à afficher.</p>';
        return;
    }
    
    const data = prepareExcelData();
    let html = `
        <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            <div style="font-size: 16px; color: #1a237e;">ASSEMBLÉES DE DIEU</div>
            <div style="font-size: 20px; color: #283593; font-weight: bold;">AD</div>
        </div>
        <div style="text-align: center; margin-bottom: 10px;">
            ${data.churchName}
        </div>
        <div style="text-align: center; margin-bottom: 10px;">
            ${data.region} | ${data.section} | ${data.temple}
        </div>
        <div style="text-align: center; font-weight: bold; margin-bottom: 10px;">
            PLAN D'ACTION TRIMESTRIEL ${data.year}
        </div>
        <div style="text-align: center; margin-bottom: 20px;">
            ${data.quarter}
        </div>
    `;
    
    // Afficher quelques interventions en exemple
    const sampleInterventions = interventions.slice(0, 3);
    html += '<table style="width: 100%;"><tr><th>Date</th><th>Intervenant</th><th>Type</th></tr>';
    
    sampleInterventions.forEach(item => {
        const dateObj = new Date(item.date);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
        
        html += `<tr>
            <td>${formattedDate}</td>
            <td>${item.fullName}</td>
            <td>${item.cultType}</td>
        </tr>`;
    });
    
    if (interventions.length > 3) {
        html += `<tr><td colspan="3" style="text-align: center; font-style: italic;">... et ${interventions.length - 3} autres interventions</td></tr>`;
    }
    
    html += '</table>';
    previewContainer.innerHTML = html;
}

function previewExcel() {
    if (interventions.length === 0) {
        showAlert('Aucune intervention à prévisualiser.', 'warning');
        return;
    }

    const modalContent = document.getElementById('modal-excel-preview');
    const quarter = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
    const year = document.getElementById('year').value;

    let html = `
        <div class="text-center mb-4">
            <img src="AD.jpeg" alt="Logo AD" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 10px;">
            <h3 style="color: #0d1b2a; font-family: 'Times New Roman', serif; font-weight: bold; margin-bottom: 5px;">EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU</h3>
            <h4 style="color: #415a77; font-family: 'Times New Roman', serif; margin-bottom: 5px;">Temple BERACA de Natitingou</h4>
            <h5 style="color: #778da9;">Planning des Interventions - ${quarter} ${year}</h5>
        </div>
        <div class="table-responsive">
            <table class="table table-bordered table-striped table-hover" style="border-color: #dee2e6;">
                <thead style="background-color: #0d1b2a; color: white;">
                    <tr>
                        <th>Date</th>
                        <th>Jour</th>
                        <th>Lieu</th>
                        <th>Type de Culte</th>
                        <th>Intervenant</th>
                        <th>Observations</th>
                    </tr>
                </thead>
                <tbody>
    `;

    const sortedInterventions = [...interventions].sort((a, b) => new Date(a.date) - new Date(b.date));

    sortedInterventions.forEach(item => {
        const dateObj = new Date(item.date);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        
        html += `
            <tr>
                <td class="fw-bold">${formattedDate}</td>
                <td>${item.dayOfWeek}</td>
                <td>${item.place}</td>
                <td><span class="badge bg-light text-dark border">${item.cultType}</span></td>
                <td class="fw-bold text-primary">${item.fullName}</td>
                <td><small>${item.observations || '-'}</small></td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    modalContent.innerHTML = html;

    const modal = new bootstrap.Modal(document.getElementById('previewModal'));
    modal.show();
}

function generateExcel() {
    if (interventions.length === 0) {
        showAlert('Aucune intervention à exporter.', 'warning');
        return;
    }

    const quarter = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
    const year = document.getElementById('year').value;

    const ws_data = [
        ["EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU"],
        ["Temple BERACA de Natitingou"],
        [`Planning des Interventions - ${quarter} ${year}`],
        [""], 
        ["Date", "Jour", "Lieu", "Type de Culte", "Thème", "Intervenant", "Observations"]
    ];

    interventions.sort((a, b) => new Date(a.date) - new Date(b.date));
    interventions.forEach(item => {
        const dateObj = new Date(item.date);
        const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
        ws_data.push([
            formattedDate,
            item.dayOfWeek,
            item.place,
            item.cultType,
            item.theme || "",
            item.fullName,
            item.observations || ""
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Fusion
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 6 } });
    ws['!merges'].push({ s: { r: 2, c: 0 }, e: { r: 2, c: 6 } });

    // Largeurs
    ws['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 30 }, { wch: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planning");
    const fileName = `Planning_BERACA_${year}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    addToHistory("Excel", fileName);
    showAlert('Fichier Excel généré avec succès !', 'success');
}

function downloadExcel() {
    if (!excelFileBlob) {
        generateExcel();
        return;
    }
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(excelFileBlob);
    link.download = generatedFileName;
    link.click();
}

function prepareExcelData() {
    const churchName = document.getElementById('church-name').value;
    const region = document.getElementById('region').value;
    const section = document.getElementById('section').value;
    const temple = document.getElementById('temple').value;
    const year = document.getElementById('year').value;
    const quarter = document.getElementById('quarter').value;
    
    const quarterLabels = {
        '1': 'Premier trimestre',
        '2': 'Deuxième trimestre',
        '3': 'Troisième trimestre',
        '4': 'Quatrième trimestre'
    };
    
    // Trier les interventions
    interventions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Grouper par label
    const groupedData = {};
    interventions.forEach(intervention => {
        if (!groupedData[intervention.groupLabel]) {
            groupedData[intervention.groupLabel] = [];
        }
        groupedData[intervention.groupLabel].push(intervention);
    });
    
    return {
        churchName,
        region,
        section,
        temple,
        year,
        quarter: quarterLabels[quarter],
        groups: groupedData
    };
}

function updateSummary() {
    document.getElementById('summary-church').textContent = document.getElementById('church-name').value;
    document.getElementById('summary-quarter').textContent = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
    document.getElementById('summary-count').textContent = interventions.length;
    
    // Compter les lieux uniques
    const uniquePlaces = [...new Set(interventions.map(i => i.place))];
    document.getElementById('summary-places').textContent = uniquePlaces.join(', ') || 'Aucun';
    
    // Compter les intervenants uniques
    const uniqueIntervenants = [...new Set(interventions.map(i => i.fullName))];
    document.getElementById('summary-intervenants').textContent = uniqueIntervenants.length;
}

function newPlanning() {
    if (confirm('Voulez-vous commencer un nouveau planning ? Les données actuelles seront sauvegardées.')) {
        saveToLocalStorage();
        
        // Réinitialiser les interventions
        interventions = [];
        updateInterventionsList();
        
        // Retourner à l'étape 1
        goToStep(1);
        
        showAlert('Nouveau planning créé. Les données précédentes sont sauvegardées.', 'info');
    }
}

function resetConfiguration() {
    if (confirm('Voulez-vous réinitialiser la configuration ?')) {
        // Réinitialiser les cases à cocher
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.id === 'day-sunday' || cb.id === 'day-tuesday' || cb.id === 'day-wednesday' || 
                cb.id === 'day-thursday' || cb.id === 'day-friday' || cb.id === 'type-principal' ||
                cb.id === 'type-enseignement' || cb.id === 'type-temoignage' || 
                cb.id === 'type-priere-hebdo' || cb.id === 'type-reunion' || 
                cb.id === 'type-culte-enfants' || cb.id === 'place-beraca' || 
                cb.id === 'place-kpoteyei' || cb.id === 'place-gros-porteur' || 
                cb.id === 'place-winke') {
                cb.checked = true;
            } else {
                cb.checked = false;
            }
        });
        
        // Réinitialiser les champs autres
        document.getElementById('type-other-specify').value = '';
        document.getElementById('type-other-specify').disabled = true;
        document.getElementById('place-other-specify').value = '';
        document.getElementById('place-other-specify').disabled = true;
        
        // Mettre à jour les listes
        updateDynamicSelects();
        
        showAlert('Configuration réinitialisée.', 'info');
    }
}

function showAlert(message, type) {
    // Supprimer les alertes existantes
    document.querySelectorAll('.alert-custom').forEach(alert => alert.remove());
    
    // Définir les couleurs par type
    const colors = {
        'success': '#27ae60',
        'danger': '#e74c3c',
        'warning': '#f39c12',
        'info': '#3498db'
    };
    
    // Créer la nouvelle alerte
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-custom alert-dismissible fade show`;
    alertDiv.style.borderLeftColor = colors[type];
    alertDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Fonction de sauvegarde améliorée avec gestion des erreurs et historique
function saveToLocalStorage() {
    try {
        const data = {
            version: '1.1', // Ajout d'une version pour la gestion des migrations futures
            theme: document.body.className.replace('theme-', ''),
            generalInfo: {
                churchName: document.getElementById('church-name').value,
                region: document.getElementById('region').value,
                section: document.getElementById('section').value,
                temple: document.getElementById('temple').value,
                year: document.getElementById('year').value,
                quarter: document.getElementById('quarter').value
            },
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify').value,
                otherPlace: document.getElementById('place-other-specify').value
            },
            intervenants: intervenantsDB,
            interventions: interventions,
            lastSaved: new Date().toISOString(),
            lastSavedTimestamp: Date.now()
        };

        localStorage.setItem('churchPlanningData', JSON.stringify(data));

        // Sauvegarder aussi dans une clé spécifique pour la synchronisation avec la page de rapport
        // Sauvegarder les données pour la synchronisation avec la page de rapport
        const syncData = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            generalInfo: {
                churchName: document.getElementById('church-name').value,
                region: document.getElementById('region').value,
                section: document.getElementById('section').value,
                temple: document.getElementById('temple').value,
                year: document.getElementById('year').value,
                quarter: document.getElementById('quarter').value
            },
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify').value,
                otherPlace: document.getElementById('place-other-specify').value
            },
            theme: document.body.className.replace('theme-', ''),
            savedAt: new Date().toISOString()
        };

        localStorage.setItem('planningData', JSON.stringify(syncData));

        // Sauvegarder également dans une clé spécifique pour la synchronisation automatique
        localStorage.setItem('autoSyncData', JSON.stringify({
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            lastSync: new Date().toISOString()
        }));

        // Sauvegarder dans l'historique (conserver les 5 dernières sauvegardes)
        const history = JSON.parse(localStorage.getItem('churchPlanningHistory') || '[]');
        history.unshift({
            timestamp: Date.now(),
            data: JSON.stringify(data),
            description: `Sauvegarde du ${new Date().toLocaleString()}`
        });

        // Garder uniquement les 5 dernières sauvegardes
        if (history.length > 5) {
            history.splice(5);
        }

        localStorage.setItem('churchPlanningHistory', JSON.stringify(history));

        // Sauvegarder aussi sur Supabase si disponible
        if (typeof saveToSupabase === 'function') {
            saveToSupabase();
        }

    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        showAlert('Erreur lors de la sauvegarde des données: ' + error.message, 'danger');
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('churchPlanningData');
        if (saved) {
            const data = JSON.parse(saved);
            
            // Restaurer le thème
            if (data.theme) {
                changeTheme(data.theme);
            }
            
            // Restaurer les informations générales
            if (data.generalInfo) {
                document.getElementById('church-name').value = data.generalInfo.churchName || '';
                document.getElementById('region').value = data.generalInfo.region || '';
                document.getElementById('section').value = data.generalInfo.section || '';
                document.getElementById('temple').value = data.generalInfo.temple || '';
                document.getElementById('year').value = data.generalInfo.year || '2025';
                document.getElementById('quarter').value = data.generalInfo.quarter || '4';
            }
            
            // Restaurer les configurations
            if (data.configurations) {
                // Jours
                document.querySelectorAll('input[id^="day-"]').forEach(cb => {
                    cb.checked = data.configurations.days.includes(cb.value);
                });
                
                // Types
                document.querySelectorAll('input[id^="type-"]').forEach(cb => {
                    cb.checked = data.configurations.types.includes(cb.value);
                });
                
                // Lieux
                document.querySelectorAll('input[id^="place-"]').forEach(cb => {
                    cb.checked = data.configurations.places.includes(cb.value);
                });
                
                // Autres valeurs
                if (data.configurations.otherType) {
                    document.getElementById('type-other-specify').value = data.configurations.otherType;
                    document.getElementById('type-other').checked = true;
                    document.getElementById('type-other-specify').disabled = false;
                }
                if (data.configurations.otherPlace) {
                    document.getElementById('place-other-specify').value = data.configurations.otherPlace;
                    document.getElementById('place-other').checked = true;
                    document.getElementById('place-other-specify').disabled = false;
                }
            }
            
            // Restaurer les intervenants
            if (data.intervenants && Array.isArray(data.intervenants)) {
                intervenantsDB = data.intervenants;
                populateIntervenantsSelect();
            }
            
            // Restaurer les interventions
            if (data.interventions && Array.isArray(data.interventions)) {
                interventions = data.interventions;
                updateInterventionsList();
            }
            
            // Mettre à jour les listes déroulantes
            updateDynamicSelects();
            
            if (interventions.length > 0) {
                const lastSaved = new Date(data.lastSaved);
                showAlert(`${interventions.length} interventions restaurées (sauvegarde du ${lastSaved.toLocaleDateString()})`, 'info');
            }
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showAlert('Erreur lors du chargement des données: ' + error.message, 'danger');
    }
}

// Fonction pour exporter les données
function exportData() {
    try {
        const data = {
            version: '1.1',
            theme: document.body.className.replace('theme-', ''),
            generalInfo: {
                churchName: document.getElementById('church-name').value,
                region: document.getElementById('region').value,
                section: document.getElementById('section').value,
                temple: document.getElementById('temple').value,
                year: document.getElementById('year').value,
                quarter: document.getElementById('quarter').value
            },
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify').value,
                otherPlace: document.getElementById('place-other-specify').value
            },
            intervenants: intervenantsDB,
            interventions: interventions,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

        const exportFileDefaultName = `Planning_AD_${new Date().toISOString().slice(0, 10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();

        showAlert('Données exportées avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export:', error);
        showAlert('Erreur lors de l\'export des données: ' + error.message, 'danger');
    }
}

// Fonction pour importer les données
function importData() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';

    fileInput.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);

                // Confirmer l'importation
                if (confirm(`Êtes-vous sûr de vouloir importer ces données ? Cela remplacera toutes les données actuelles. ${data.interventions ? data.interventions.length + ' interventions' : 'Aucune intervention'}`)) {
                    // Restaurer les informations générales
                    document.getElementById('church-name').value = data.generalInfo.churchName || '';
                    document.getElementById('region').value = data.generalInfo.region || '';
                    document.getElementById('section').value = data.generalInfo.section || '';
                    document.getElementById('temple').value = data.generalInfo.temple || '';
                    document.getElementById('year').value = data.generalInfo.year || '2025';
                    document.getElementById('quarter').value = data.generalInfo.quarter || '4';

                    // Restaurer les configurations
                    if (data.configurations) {
                        // Désélectionner tout d'abord
                        document.querySelectorAll('input[id^="day-"]').forEach(cb => cb.checked = false);
                        document.querySelectorAll('input[id^="type-"]').forEach(cb => cb.checked = false);
                        document.querySelectorAll('input[id^="place-"]').forEach(cb => cb.checked = false);

                        // Jours
                        data.configurations.days.forEach(dayValue => {
                            const checkbox = document.querySelector(`input[id^="day-"][value="${dayValue}"]`);
                            if (checkbox) checkbox.checked = true;
                        });

                        // Types
                        data.configurations.types.forEach(typeValue => {
                            const checkbox = document.querySelector(`input[id^="type-"][value="${typeValue}"]`);
                            if (checkbox) checkbox.checked = true;
                        });

                        // Lieux
                        data.configurations.places.forEach(placeValue => {
                            const checkbox = document.querySelector(`input[id^="place-"][value="${placeValue}"]`);
                            if (checkbox) checkbox.checked = true;
                        });

                        // Autres valeurs
                        if (data.configurations.otherType) {
                            document.getElementById('type-other-specify').value = data.configurations.otherType;
                            document.getElementById('type-other').checked = true;
                            document.getElementById('type-other-specify').disabled = false;
                        } else {
                            document.getElementById('type-other-specify').value = '';
                            document.getElementById('type-other').checked = false;
                            document.getElementById('type-other-specify').disabled = true;
                        }
                        if (data.configurations.otherPlace) {
                            document.getElementById('place-other-specify').value = data.configurations.otherPlace;
                            document.getElementById('place-other').checked = true;
                            document.getElementById('place-other-specify').disabled = false;
                        } else {
                            document.getElementById('place-other-specify').value = '';
                            document.getElementById('place-other').checked = false;
                            document.getElementById('place-other-specify').disabled = true;
                        }
                    }

                    // Restaurer les intervenants
                    if (data.intervenants && Array.isArray(data.intervenants)) {
                        intervenantsDB = data.intervenants;
                        populateIntervenantsSelect();
                    }

                    // Restaurer les interventions
                    if (data.interventions && Array.isArray(data.interventions)) {
                        interventions = data.interventions;
                        updateInterventionsList();
                    }

                    // Mettre à jour les listes déroulantes
                    updateDynamicSelects();

                    // Restaurer le thème
                    if (data.theme) {
                        changeTheme(data.theme);
                    }

                    showAlert('Données importées avec succès !', 'success');
                    saveToLocalStorageSecure(); // Sauvegarder immédiatement après l'import
                }
            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                showAlert('Erreur lors de l\'import des données: ' + error.message, 'danger');
            }
        };

        reader.readAsText(file);
    };

    fileInput.click();
}

// Fonction utilitaire pour nettoyer les données d'entrée
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return input;
    }

    // Retirer les balises HTML et les caractères dangereux
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\</g, "") // Supprimer les caractères potentiellement dangereux
        .trim();
}

// Fonction pour valider les données avant sauvegarde
function validateData(data) {
    const errors = [];

    // Valider les informations générales
    if (data.generalInfo) {
        if (typeof data.generalInfo.churchName !== 'string' || data.generalInfo.churchName.length > 100) {
            errors.push('Nom de l\'église invalide');
        }

        if (typeof data.generalInfo.region !== 'string' || data.generalInfo.region.length > 50) {
            errors.push('Région invalide');
        }

        if (typeof data.generalInfo.section !== 'string' || data.generalInfo.section.length > 50) {
            errors.push('Section invalide');
        }

        if (typeof data.generalInfo.temple !== 'string' || data.generalInfo.temple.length > 50) {
            errors.push('Temple invalide');
        }

        const year = parseInt(data.generalInfo.year);
        if (isNaN(year) || year < 1900 || year > 2100) {
            errors.push('Année invalide');
        }

        const quarter = parseInt(data.generalInfo.quarter);
        if (isNaN(quarter) || quarter < 1 || quarter > 4) {
            errors.push('Trimestre invalide');
        }
    }

    // Valider les intervenants
    if (data.intervenants && Array.isArray(data.intervenants)) {
        for (let i = 0; i < data.intervenants.length; i++) {
            const intervenant = data.intervenants[i];
            if (typeof intervenant.firstName !== 'string' || intervenant.firstName.length > 50) {
                errors.push(`Prénom de l'intervenant ${i+1} invalide`);
            }
            if (typeof intervenant.lastName !== 'string' || intervenant.lastName.length > 50) {
                errors.push(`Nom de l'intervenant ${i+1} invalide`);
            }
        }
    }

    // Valider les interventions
    if (data.interventions && Array.isArray(data.interventions)) {
        for (let i = 0; i < data.interventions.length; i++) {
            const intervention = data.interventions[i];
            if (intervention.date && !/^\d{4}-\d{2}-\d{2}$/.test(intervention.date)) {
                errors.push(`Date de l'intervention ${i+1} invalide`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

// Fonction pour chiffrer/déchiffrer les données sensibles (simplifié)
function encryptData(data) {
    // Cette fonction implémente un chiffrement basique pour les données sensibles
    // Dans une application réelle, il faudrait utiliser une bibliothèque de cryptographie robuste
    try {
        const jsonString = JSON.stringify(data);
        // Encodage de base - dans une vraie application, utilisez Web Crypto API
        return btoa(encodeURIComponent(jsonString));
    } catch (error) {
        console.error('Erreur lors du chiffrement des données:', error);
        return null;
    }
}

function decryptData(encryptedData) {
    try {
        const jsonString = decodeURIComponent(atob(encryptedData));
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Erreur lors du déchiffrement des données:', error);
        return null;
    }
}

// Fonction de sauvegarde améliorée avec sécurité
function saveToLocalStorageSecure() {
    try {
        const data = {
            version: '1.1',
            theme: document.body.className.replace('theme-', ''),
            generalInfo: {
                churchName: sanitizeInput(document.getElementById('church-name').value),
                region: sanitizeInput(document.getElementById('region').value),
                section: sanitizeInput(document.getElementById('section').value),
                temple: sanitizeInput(document.getElementById('temple').value),
                year: document.getElementById('year').value,
                quarter: document.getElementById('quarter').value
            },
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: sanitizeInput(document.getElementById('type-other-specify').value),
                otherPlace: sanitizeInput(document.getElementById('place-other-specify').value)
            },
            intervenants: intervenantsDB.map(intervenant => ({
                ...intervenant,
                firstName: sanitizeInput(intervenant.firstName),
                lastName: sanitizeInput(intervenant.lastName)
            })),
            interventions: interventions,
            lastSaved: new Date().toISOString(),
            lastSavedTimestamp: Date.now()
        };

        // Valider les données avant sauvegarde
        const validation = validateData(data);
        if (!validation.isValid) {
            console.error('Erreurs de validation:', validation.errors);
            showAlert('Erreurs de validation des données: ' + validation.errors.join(', '), 'danger');
            return;
        }

        // Chiffrer les données sensibles avant de les stocker
        const encryptedData = encryptData(data);
        if (encryptedData) {
            localStorage.setItem('churchPlanningDataEncrypted', encryptedData);

            // Sauvegarder dans l'historique (conserver les 5 dernières sauvegardes)
            let history = JSON.parse(localStorage.getItem('churchPlanningHistory') || '[]');
            const encryptedHistoryItem = encryptData({
                timestamp: Date.now(),
                data: JSON.stringify(data),
                description: `Sauvegarde du ${new Date().toLocaleString()}`
            });

            if (encryptedHistoryItem) {
                history.unshift({
                    timestamp: Date.now(),
                    data: encryptedHistoryItem,
                    description: `Sauvegarde du ${new Date().toLocaleString()}`
                });

                // Garder uniquement les 5 dernières sauvegardes
                if (history.length > 5) {
                    history.splice(5);
                }

                localStorage.setItem('churchPlanningHistory', JSON.stringify(history));
            }
        }

    } catch (error) {
        console.error('Erreur lors de la sauvegarde sécurisée:', error);
        showAlert('Erreur lors de la sauvegarde sécurisée des données: ' + error.message, 'danger');
    }
}

// Fonction de chargement améliorée avec sécurité
function loadFromLocalStorageSecure() {
    try {
        const encryptedData = localStorage.getItem('churchPlanningDataEncrypted');
        if (!encryptedData) {
            // Si aucune donnée chiffrée n'est trouvée, essayer l'ancienne méthode
            loadFromLocalStorage();
            return;
        }

        const data = decryptData(encryptedData);
        if (!data) {
            console.error('Impossible de déchiffrer les données');
            showAlert('Erreur lors du chargement des données chiffrées', 'danger');
            return;
        }

        // Valider les données après déchiffrement
        const validation = validateData(data);
        if (!validation.isValid) {
            console.error('Erreurs de validation après déchiffrement:', validation.errors);
            showAlert('Erreurs de validation des données après déchiffrement: ' + validation.errors.join(', '), 'danger');
            return;
        }

        // Vérifier la version des données
        if (data.version && data.version !== '1.1') {
            console.warn(`Version des données: ${data.version}, version actuelle: 1.1`);
        }

        // Restaurer le thème
        if (data.theme) {
            changeTheme(data.theme);
        }

        // Restaurer les informations générales
        document.getElementById('church-name').value = data.generalInfo.churchName || '';
        document.getElementById('region').value = data.generalInfo.region || '';
        document.getElementById('section').value = data.generalInfo.section || '';
        document.getElementById('temple').value = data.generalInfo.temple || '';
        document.getElementById('year').value = data.generalInfo.year || '2025';
        document.getElementById('quarter').value = data.generalInfo.quarter || '4';

        // Restaurer les configurations
        if (data.configurations) {
            // Jours
            document.querySelectorAll('input[id^="day-"]').forEach(cb => {
                cb.checked = data.configurations.days.includes(cb.value);
            });

            // Types
            document.querySelectorAll('input[id^="type-"]').forEach(cb => {
                cb.checked = data.configurations.types.includes(cb.value);
            });

            // Lieux
            document.querySelectorAll('input[id^="place-"]').forEach(cb => {
                cb.checked = data.configurations.places.includes(cb.value);
            });

            // Autres valeurs
            if (data.configurations.otherType) {
                document.getElementById('type-other-specify').value = data.configurations.otherType;
                document.getElementById('type-other').checked = true;
                document.getElementById('type-other-specify').disabled = false;
            }
            if (data.configurations.otherPlace) {
                document.getElementById('place-other-specify').value = data.configurations.otherPlace;
                document.getElementById('place-other').checked = true;
                document.getElementById('place-other-specify').disabled = false;
            }
        }

        // Restaurer les intervenants
        if (data.intervenants && Array.isArray(data.intervenants)) {
            intervenantsDB = data.intervenants;
            populateIntervenantsSelect();
        }

        // Restaurer les interventions
        if (data.interventions && Array.isArray(data.interventions)) {
            interventions = data.interventions;
            updateInterventionsList();

            // Vérifier les interventions à venir pour les notifications
            checkUpcomingInterventions();
        }

        // Mettre à jour les listes déroulantes
        updateDynamicSelects();

        if (interventions.length > 0) {
            const lastSaved = new Date(data.lastSaved);
            showAlert(`${interventions.length} interventions restaurées (sauvegarde du ${lastSaved.toLocaleDateString()})`, 'info');
        }
    } catch (error) {
        console.error('Erreur de chargement sécurisé:', error);
        showAlert('Erreur lors du chargement sécurisé des données: ' + error.message, 'danger');
    }
}

// Fonction pour vérifier les interventions à venir et envoyer des notifications
function checkUpcomingInterventions() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    // Vérifier les interventions de demain
    const upcomingInterventions = interventions.filter(intervention => {
        const interventionDate = new Date(intervention.date);
        // Vérifier si l'intervention est demain
        return interventionDate.toDateString() === tomorrow.toDateString();
    });

    if (upcomingInterventions.length > 0) {
        // Créer un message de rappel
        const names = upcomingInterventions.map(intervention => intervention.fullName).join(', ');
        const places = [...new Set(upcomingInterventions.map(intervention => intervention.place))].join(', ');

        const message = `Rappel: ${upcomingInterventions.length} intervention(s) prévue(s) pour demain (${tomorrow.toLocaleDateString()}) - ${names} - Lieux: ${places}`;
        showAlert(message, 'warning');

        // Optionnellement, demander à l'utilisateur s'il veut activer les notifications push
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showBrowserNotification('Rappel d\'intervention', message);
                }
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            showBrowserNotification('Rappel d\'intervention', message);
        }
    }
}

// Fonction pour afficher une notification navigateur
function showBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: 'AD.jpeg',
            tag: 'intervention-reminder'
        });

        // Ouvrir l'application quand l'utilisateur clique sur la notification
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
    }
}

// Fonction pour activer/désactiver les notifications
function toggleNotifications() {
    if ('Notification' in window) {
        if (Notification.permission === 'granted') {
            showAlert('Les notifications sont activées', 'info');
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    showAlert('Les notifications sont activées', 'success');
                } else {
                    showAlert('Les notifications sont désactivées', 'info');
                }
            });
        } else {
            showAlert('Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur.', 'warning');
        }
    } else {
        showAlert('Votre navigateur ne supporte pas les notifications.', 'warning');
    }
}

// Système de traduction multilingue
const translations = {
    fr: {
        'app_title': 'Planificateur d\'Interventions - Assemblées de Dieu',
        'notification_enabled': 'Les notifications sont activées',
        'notification_disabled': 'Les notifications sont désactivées',
        'notification_blocked': 'Les notifications sont bloquées. Veuillez les activer dans les paramètres de votre navigateur.',
        'browser_no_support': 'Votre navigateur ne supporte pas les notifications.',
        'reminder_notification': 'Rappel d\'intervention',
        'upcoming_interventions': 'intervention(s) prévue(s) pour demain',
        'notifications_activated': 'Les notifications sont activées',
        'notifications_deactivated': 'Les notifications sont désactivées',
        'activate_notifications': 'Activer les Notifications',
        'share_via_email': 'Partager par Email',
        'view_reports': 'Voir les Rapports',
        'help_and_docs': 'Aide et Documentation',
        'export_data': 'Exporter les données',
        'import_data': 'Importer les données',
        'sync_data': 'Synchroniser',
        'generate_pdf': 'Exporter en PDF (Pro)',
        'generate_csv': 'Exporter en CSV',
        'whatsapp_share': 'Partager sur WhatsApp',
        'general_info': 'Informations Générales',
        'configuration': 'Configuration des Types de Cultes/Réunions',
        'interventions': 'Interventions Planifiées',
        'export_section': 'Export et Partage'
    },
    en: {
        'app_title': 'Intervention Planner - Assemblies of God',
        'notification_enabled': 'Notifications are enabled',
        'notification_disabled': 'Notifications are disabled',
        'notification_blocked': 'Notifications are blocked. Please enable them in your browser settings.',
        'browser_no_support': 'Your browser does not support notifications.',
        'reminder_notification': 'Intervention reminder',
        'upcoming_interventions': 'intervention(s) scheduled for tomorrow',
        'notifications_activated': 'Notifications are activated',
        'notifications_deactivated': 'Notifications are deactivated',
        'activate_notifications': 'Activate Notifications',
        'share_via_email': 'Share via Email',
        'view_reports': 'View Reports',
        'help_and_docs': 'Help and Documentation',
        'export_data': 'Export Data',
        'import_data': 'Import Data',
        'sync_data': 'Sync',
        'generate_pdf': 'Export to PDF (Pro)',
        'generate_csv': 'Export to CSV',
        'whatsapp_share': 'Share on WhatsApp',
        'general_info': 'General Information',
        'configuration': 'Configuration of Service/Meeting Types',
        'interventions': 'Scheduled Interventions',
        'export_section': 'Export and Share'
    }
};

// Fonction pour changer la langue
function changeLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Langue non supportée: ${lang}`);
        return;
    }

    // Stocker la langue sélectionnée
    localStorage.setItem('selectedLanguage', lang);

    // Mettre à jour les textes dans l'interface
    updateInterfaceTexts(lang);
}

// Fonction pour obtenir la traduction d'un texte
function translate(key, lang = null) {
    const selectedLang = lang || localStorage.getItem('selectedLanguage') || 'fr';
    const langTranslations = translations[selectedLang] || translations['fr'];

    return langTranslations[key] || key;
}

// Fonction pour mettre à jour les textes dans l'interface
function updateInterfaceTexts(lang) {
    // Mettre à jour les textes des boutons et éléments d'interface
    const elementsToUpdate = {
        'notifications-btn': 'activate_notifications',
        'email-share-btn': 'share_via_email',
        'show-reports-btn': 'view_reports',
        'help-btn': 'help_and_docs',
        'export-data-btn': 'export_data',
        'import-data-btn': 'import_data',
        'sync-data-btn': 'sync_data',
        'generate-pdf-btn': 'generate_pdf',
        'generate-csv-btn': 'generate_csv',
        'whatsapp-share-btn': 'whatsapp_share',
        'step1': 'general_info',
        'step2': 'configuration',
        'step3': 'export_section'
    };

    Object.keys(elementsToUpdate).forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            const translatedText = translate(elementsToUpdate[elementId], lang);
            // Pour les boutons, on ne veut pas remplacer tout le contenu
            if (elementId.includes('-btn')) {
                const icon = element.querySelector('i');
                if (icon) {
                    // Conserver l'icône et mettre à jour le texte qui suit
                    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                    if (textNodes.length > 0) {
                        textNodes[0].nodeValue = textNodes[0].nodeValue.replace(/[^<]*$/, ' ' + translatedText);
                    } else {
                        // Si aucun noeud texte n'est trouvé, ajouter le texte traduit
                        element.innerHTML = icon.outerHTML + ' ' + translatedText;
                    }
                } else {
                    element.textContent = translatedText;
                }
            } else {
                element.textContent = translatedText;
            }
        }
    });

    // Mettre à jour le titre de la page
    document.title = translate('app_title', lang);
}

// Fonction pour initialiser la langue
function initializeLanguage() {
    const savedLang = localStorage.getItem('selectedLanguage') || 'fr';
    updateInterfaceTexts(savedLang);
}

// Fonction pour archiver un planning
function archiveCurrentPlanning() {
    if (interventions.length === 0) {
        showAlert('Aucun planning à archiver.', 'warning');
        return;
    }

    // Créer un objet avec les données actuelles
    const archivedData = {
        archivedAt: new Date().toISOString(),
        churchInfo: {
            name: document.getElementById('church-name').value,
            region: document.getElementById('region').value,
            section: document.getElementById('section').value,
            temple: document.getElementById('temple').value,
            year: document.getElementById('year').value,
            quarter: document.getElementById('quarter').value
        },
        interventions: [...interventions], // Copie des interventions
        intervenants: [...intervenantsDB] // Copie des intervenants
    };

    // Obtenir les archives existantes ou initialiser un tableau vide
    let archivedPlannings = JSON.parse(localStorage.getItem('archivedPlannings') || '[]');

    // Ajouter le nouveau planning archivé
    archivedPlannings.push(archivedData);

    // Limiter à 10 archives pour ne pas surcharger le stockage
    if (archivedPlannings.length > 10) {
        archivedPlannings.shift(); // Supprimer le plus ancien
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem('archivedPlannings', JSON.stringify(archivedPlannings));

    showAlert(`Planning archivé avec succès ! Vous avez maintenant ${archivedPlannings.length} planning(s) archivé(s).`, 'success');
}

// Fonction pour afficher les plannings archivés
function showArchivedPlannings() {
    const archivedPlannings = JSON.parse(localStorage.getItem('archivedPlannings') || '[]');

    if (archivedPlannings.length === 0) {
        showAlert('Aucun planning archivé.', 'info');
        return;
    }

    // Créer une modale pour afficher les plannings archivés
    let archivedContent = '';
    archivedPlannings.forEach((archive, index) => {
        const archivedDate = new Date(archive.archivedAt).toLocaleString();
        const interventionCount = archive.interventions.length;

        archivedContent += `
            <div class="card mb-3">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="fas fa-archive me-2"></i>
                        Archivé le: ${archivedDate}
                    </h6>
                </div>
                <div class="card-body">
                    <p><strong>Église:</strong> ${archive.churchInfo.name}</p>
                    <p><strong>Trimestre:</strong> ${archive.churchInfo.quarter} ${archive.churchInfo.year}</p>
                    <p><strong>Interventions:</strong> ${interventionCount}</p>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="loadArchivedPlanning(${index})">
                            <i class="fas fa-download me-1"></i>Charger
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteArchivedPlanning(${index})">
                            <i class="fas fa-trash me-1"></i>Supprimer
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    const modalHTML = `
        <div class="modal fade" id="archivedPlanningsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-archive me-2"></i>Plannings Archivés</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Vous pouvez charger un planning archivé pour récupérer ses données, ou le supprimer de l'archive.
                        </div>
                        <div id="archived-plannings-list">
                            ${archivedContent}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-outline-danger" onclick="clearAllArchives()">
                            <i class="fas fa-trash-alt me-2"></i>Tout supprimer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById('archivedPlanningsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Ajouter la modale au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Afficher la modale
    const modal = new bootstrap.Modal(document.getElementById('archivedPlanningsModal'));
    modal.show();

    // Nettoyer la modale quand elle est fermée
    document.getElementById('archivedPlanningsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Fonction pour charger un planning archivé
function loadArchivedPlanning(index) {
    const archivedPlannings = JSON.parse(localStorage.getItem('archivedPlannings') || '[]');

    if (index < 0 || index >= archivedPlannings.length) {
        showAlert('Index de planning archivé invalide.', 'danger');
        return;
    }

    const archived = archivedPlannings[index];

    // Demander confirmation avant de charger
    if (!confirm('Êtes-vous sûr de vouloir charger ce planning archivé ? Cela remplacera les données actuelles.')) {
        return;
    }

    // Charger les informations de l'église
    document.getElementById('church-name').value = archived.churchInfo.name || '';
    document.getElementById('region').value = archived.churchInfo.region || '';
    document.getElementById('section').value = archived.churchInfo.section || '';
    document.getElementById('temple').value = archived.churchInfo.temple || '';
    document.getElementById('year').value = archived.churchInfo.year || '2025';
    document.getElementById('quarter').value = archived.churchInfo.quarter || '4';

    // Charger les interventions
    interventions = [...archived.interventions];
    updateInterventionsList();

    // Charger les intervenants
    intervenantsDB = [...archived.intervenants];
    populateIntervenantsSelect();

    // Mettre à jour les listes déroulantes
    updateDynamicSelects();

    showAlert(`Planning archivé chargé avec succès ! ${archived.interventions.length} interventions restaurées.`, 'success');

    // Fermer la modale
    const modal = bootstrap.Modal.getInstance(document.getElementById('archivedPlanningsModal'));
    if (modal) {
        modal.hide();
    }
}

// Fonction pour supprimer un planning archivé
function deleteArchivedPlanning(index) {
    const archivedPlannings = JSON.parse(localStorage.getItem('archivedPlannings') || '[]');

    if (index < 0 || index >= archivedPlannings.length) {
        showAlert('Index de planning archivé invalide.', 'danger');
        return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce planning archivé ?')) {
        archivedPlannings.splice(index, 1);
        localStorage.setItem('archivedPlannings', JSON.stringify(archivedPlannings));

        // Actualiser l'affichage
        const modal = bootstrap.Modal.getInstance(document.getElementById('archivedPlanningsModal'));
        if (modal) {
            modal.hide();
        }
        showArchivedPlannings();

        showAlert('Planning archivé supprimé avec succès.', 'success');
    }
}

// Fonction pour supprimer toutes les archives
function clearAllArchives() {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les archives ? Cette action est irréversible.')) {
        localStorage.removeItem('archivedPlannings');
        const modal = bootstrap.Modal.getInstance(document.getElementById('archivedPlanningsModal'));
        if (modal) {
            modal.hide();
        }
        showAlert('Toutes les archives ont été supprimées.', 'success');
    }
}

// Fonction pour synchroniser les données via un service externe (simulation)
function syncData() {
    // Cette fonction simule une synchronisation avec un service cloud
    // Dans une implémentation réelle, cela utiliserait une API
    showAlert('Synchronisation avec le cloud en cours...', 'info');

    // Simuler un processus de synchronisation
    setTimeout(() => {
        try {
            const data = {
                version: '1.1',
                theme: document.body.className.replace('theme-', ''),
                generalInfo: {
                    churchName: sanitizeInput(document.getElementById('church-name').value),
                    region: sanitizeInput(document.getElementById('region').value),
                    section: sanitizeInput(document.getElementById('section').value),
                    temple: sanitizeInput(document.getElementById('temple').value),
                    year: document.getElementById('year').value,
                    quarter: document.getElementById('quarter').value
                },
                configurations: {
                    days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                    types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                    places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                    otherType: sanitizeInput(document.getElementById('type-other-specify').value),
                    otherPlace: sanitizeInput(document.getElementById('place-other-specify').value)
                },
                intervenants: intervenantsDB,
                interventions: interventions,
                lastSync: new Date().toISOString()
            };

            // Valider les données avant envoi
            const validation = validateData(data);
            if (!validation.isValid) {
                console.error('Erreurs de validation avant synchronisation:', validation.errors);
                showAlert('Erreurs de validation: ' + validation.errors.join(', '), 'danger');
                return;
            }

            // Dans une vraie implémentation, on enverrait ces données à un serveur
            // Ici, on va juste simuler le succès
            showAlert('Données synchronisées avec succès !', 'success');

            // Enregistrer la date de synchronisation
            localStorage.setItem('lastSync', new Date().toISOString());
        } catch (error) {
            console.error('Erreur lors de la synchronisation:', error);
            showAlert('Erreur lors de la synchronisation: ' + error.message, 'danger');
        }
    }, 2000);
}

// Fonctionnalités d'importation Excel
function showImportModal() {
    // Créer une modale pour l'importation
    const modalHTML = `
        <div class="modal fade" id="importModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-file-import me-2"></i>Importer des interventions depuis Excel</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label for="excel-file" class="form-label">Sélectionnez un fichier Excel (.xlsx)</label>
                            <input type="file" class="form-control" id="excel-file" accept=".xlsx, .xls">
                            <div class="form-text">Le fichier doit avoir les colonnes: Date, Intervenant, Type de culte, Lieu, Observations</div>
                        </div>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Les données existantes seront conservées. Les nouvelles interventions seront ajoutées à la liste.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="import-file-btn">Importer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au DOM si elle n'existe pas déjà
    if (!document.getElementById('importModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialiser la modale Bootstrap
        const importModal = new bootstrap.Modal(document.getElementById('importModal'));
        importModal.show();

        // Ajouter l'événement pour le bouton d'importation
        document.getElementById('import-file-btn').addEventListener('click', function() {
            const fileInput = document.getElementById('excel-file');
            if (fileInput.files.length === 0) {
                showAlert('Veuillez sélectionner un fichier Excel.', 'warning');
                return;
            }

            const file = fileInput.files[0];
            importFromExcel(file);
            importModal.hide();
        });

        // Supprimer la modale quand elle est fermée
        document.getElementById('importModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Si la modale existe déjà, simplement l'afficher
        const importModal = new bootstrap.Modal(document.getElementById('importModal'));
        importModal.show();
    }
}

function importFromExcel(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});

            // Supposons que la première feuille contient les données
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                showAlert('Aucune donnée trouvée dans le fichier Excel.', 'warning');
                return;
            }

            // Convertir les données Excel en interventions
            const importedInterventions = jsonData.map((row, index) => {
                // Générer un ID unique pour chaque intervention importée
                const id = Date.now() + index;

                // Extraire les données du fichier Excel
                // Les colonnes attendues sont : Date, Intervenant, Type de culte, Lieu, Observations
                const date = formatDateForInput(row['DATES'] || row['Date'] || row['date'] || '');
                const fullName = row['Noms et Prénoms'] || row['Intervenant'] || row['intervenant'] || '';
                const cultType = row['Type de culte'] || row['Type'] || row['type'] || '';
                const place = row['Lieu'] || row['lieu'] || '';
                const observations = row['Observations'] || row['observations'] || row['Observation'] || '';

                // Extraire le prénom et le nom à partir du nom complet
                const nameParts = fullName.trim().split(' ');
                const firstName = nameParts.length > 0 ? nameParts[0] : '';
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                // Trouver le titre de l'intervenant dans la base de données
                let title = '';
                const existingIntervenant = intervenantsDB.find(i =>
                    i.firstName === firstName && i.lastName === lastName
                );
                if (existingIntervenant) {
                    title = existingIntervenant.title;
                }

                // Déterminer le jour de la semaine
                const dateObj = new Date(date);
                const dayOfWeek = daysOfWeek[dateObj.getDay()];

                // Déterminer le label de groupe
                let groupLabel = '';
                if (cultType === 'Principal' && place === 'BERACA') {
                    groupLabel = 'Les intervenants culte Dimanche BERACA';
                } else if (cultType === 'Culte des enfants') {
                    groupLabel = 'Les intervenants du culte des enfants';
                } else if (cultType === 'Culte des Adolescents') {
                    groupLabel = 'Les intervenants du culte des Adolescents';
                } else if (place === 'KPOTEYEI') {
                    if (dayOfWeek === 'Dimanche') {
                        groupLabel = 'Les intervenants de Dimanche à KPOTEYEI';
                    } else if (dayOfWeek === 'Mercredi') {
                        groupLabel = 'Les intervenants de Mercredi à KPOTEYEI';
                    } else if (dayOfWeek === 'Vendredi') {
                        groupLabel = 'Les intervenants de Vendredi à KPOTEYEI';
                    }
                } else if (place === 'GROS PORTEUR' && dayOfWeek === 'Mercredi') {
                    groupLabel = 'Les intervenants de Mercredi à GROS PORTEUR';
                } else if (place === 'WINKE' && dayOfWeek === 'Mercredi') {
                    groupLabel = 'Les intervenants de Mercredi à WINKE';
                } else if (cultType === 'Témoignage/Action de grâce/Prière' && dayOfWeek === 'Jeudi') {
                    groupLabel = 'Intervenants de Jeudi';
                } else if (cultType === 'Prière hebdomadaire' && dayOfWeek === 'Mardi') {
                    groupLabel = 'Intervenants de Mardi';
                } else if (cultType === 'Jeune et Prière') {
                    groupLabel = 'Intervenants de Jeune et Prière';
                } else if (cultType === 'Veillée de prière') {
                    groupLabel = 'Intervenants de Veillée de Prière';
                } else {
                    groupLabel = `Intervenants de ${dayOfWeek}`;
                }

                return {
                    id: id,
                    date: date,
                    formattedDate: date + ' 00:00:00',
                    dayOfWeek: dayOfWeek,
                    place: place,
                    cultType: cultType,
                    theme: '',
                    title: title,
                    firstName: firstName,
                    lastName: lastName,
                    fullName: fullName,
                    observations: observations,
                    groupLabel: groupLabel
                };
            });

            // Ajouter les interventions importées à la liste existante
            interventions = interventions.concat(importedInterventions);

            // Mettre à jour l'affichage
            updateInterventionsList();
            saveToLocalStorage();

            showAlert(`${importedInterventions.length} interventions importées avec succès!`, 'success');
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            showAlert('Erreur lors de l\'importation du fichier Excel.', 'danger');
        }
    };

    reader.onerror = function() {
        showAlert('Erreur lors de la lecture du fichier Excel.', 'danger');
    };

    reader.readAsArrayBuffer(file);
}

// Fonction pour formater la date au format YYYY-MM-DD
function formatDateForInput(dateValue) {
    if (!dateValue) return '';

    let dateObj;
    if (typeof dateValue === 'string') {
        // Si c'est une chaîne de caractères, essayer de la parser
        dateObj = new Date(dateValue);
    } else if (dateValue instanceof Date) {
        // Si c'est déjà un objet Date
        dateObj = dateValue;
    } else {
        // Si c'est un nombre (format Excel), le convertir
        dateObj = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
    }

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
        return new Date().toISOString().split('T')[0]; // Retourner la date d'aujourd'hui si invalide
    }

    // Formater au format YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// Fonction pour mettre à jour les options des filtres
function updateFilterOptions() {
    const typeFilter = document.getElementById('filter-type');
    const placeFilter = document.getElementById('filter-place');
    const intervenantFilter = document.getElementById('filter-intervenant');

    // Vider les options existantes
    typeFilter.innerHTML = '<option value="">Tous les types</option>';
    placeFilter.innerHTML = '<option value="">Tous les lieux</option>';
    intervenantFilter.innerHTML = '<option value="">Tous les intervenants</option>';

    // Extraire les types, lieux et intervenants uniques des interventions
    const uniqueTypes = [...new Set(interventions.map(i => i.cultType))];
    const uniquePlaces = [...new Set(interventions.map(i => i.place))];
    const uniqueIntervenants = [...new Set(interventions.map(i => i.fullName))];

    // Ajouter les options
    uniqueTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        typeFilter.appendChild(option);
    });

    uniquePlaces.forEach(place => {
        const option = document.createElement('option');
        option.value = place;
        option.textContent = place;
        placeFilter.appendChild(option);
    });

    uniqueIntervenants.forEach(intervenant => {
        const option = document.createElement('option');
        option.value = intervenant;
        option.textContent = intervenant;
        intervenantFilter.appendChild(option);
    });
}

// Fonction pour appliquer les filtres
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.trim().toLowerCase();
    const selectedDay = document.getElementById('filter-day').value;
    const selectedType = document.getElementById('filter-type').value;
    const selectedPlace = document.getElementById('filter-place').value;
    const selectedIntervenant = document.getElementById('filter-intervenant').value; // Nouveau filtre
    const startDate = document.getElementById('filter-start-date').value; // Nouveau filtre
    const endDate = document.getElementById('filter-end-date').value; // Nouveau filtre

    // Filtrer les interventions
    const filteredInterventions = interventions.filter(intervention => {
        // Correspondance avec le terme de recherche
        const matchesSearch = !searchTerm ||
            intervention.fullName.toLowerCase().includes(searchTerm) ||
            intervention.place.toLowerCase().includes(searchTerm) ||
            intervention.cultType.toLowerCase().includes(searchTerm) ||
            intervention.observations.toLowerCase().includes(searchTerm) ||
            intervention.theme.toLowerCase().includes(searchTerm);

        // Correspondance avec les filtres spécifiques
        const matchesDay = !selectedDay || intervention.dayOfWeek === selectedDay;
        const matchesType = !selectedType || intervention.cultType === selectedType;
        const matchesPlace = !selectedPlace || intervention.place === selectedPlace;
        const matchesIntervenant = !selectedIntervenant || intervention.fullName.toLowerCase().includes(selectedIntervenant.toLowerCase());

        // Correspondance avec les dates
        let matchesDateRange = true;
        if (startDate || endDate) {
            const interventionDate = new Date(intervention.date);
            if (startDate && interventionDate < new Date(startDate)) {
                matchesDateRange = false;
            }
            if (endDate && interventionDate > new Date(endDate)) {
                matchesDateRange = false;
            }
        }

        return matchesSearch && matchesDay && matchesType && matchesPlace && matchesIntervenant && matchesDateRange;
    });

    // Mettre à jour l'affichage avec les interventions filtrées
    displayInterventions(filteredInterventions);
}

// Fonction pour activer/désactiver les filtres avancés
function toggleAdvancedFilters() {
    const advancedFilters = document.getElementById('advanced-filters');
    if (advancedFilters.style.display === 'none' || !advancedFilters.style.display) {
        advancedFilters.style.display = 'block';
        document.getElementById('toggle-advanced-filters').textContent = 'Masquer les filtres avancés';
    } else {
        advancedFilters.style.display = 'none';
        document.getElementById('toggle-advanced-filters').textContent = 'Afficher les filtres avancés';
    }
}

// Fonction pour afficher les interventions (modifiée pour prendre en compte un sous-ensemble)
function displayInterventions(interventionsToDisplay) {
    const listContainer = document.getElementById('interventions-list');
    const countElement = document.getElementById('intervention-count');

    // Afficher le nombre d'interventions filtrées
    const totalCount = interventions.length;
    const displayedCount = interventionsToDisplay.length;
    countElement.textContent = displayedCount;

    // Ajouter un indicateur si des filtres sont appliqués
    if (displayedCount !== totalCount) {
        countElement.textContent += ` (sur ${totalCount})`;
    }

    if (interventionsToDisplay.length === 0) {
        listContainer.innerHTML = `
            <p class="text-muted text-center py-4">
                <i class="fas fa-search fa-2x mb-3 d-block"></i>
                Aucune intervention trouvée.<br>
                ${totalCount === 0 ? 'Commencez par ajouter des interventions ci-dessus.' : 'Essayez de modifier vos critères de recherche.'}
            </p>
        `;
        return;
    }

    // Trier par date
    interventionsToDisplay.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Grouper par label
    const grouped = {};
    interventionsToDisplay.forEach(intervention => {
        if (!grouped[intervention.groupLabel]) {
            grouped[intervention.groupLabel] = [];
        }
        grouped[intervention.groupLabel].push(intervention);
    });

    // Générer le HTML
    let html = '';

    for (const [groupName, groupInterventions] of Object.entries(grouped)) {
        html += `
            <div class="section-title">
                <h5><i class="fas fa-folder-open me-2"></i>${groupName}</h5>
            </div>
        `;

        groupInterventions.forEach(intervention => {
            const dateObj = new Date(intervention.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

            html += `
                <div class="intervention-card" data-id="${intervention.id}">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <div class="date-display">
                                <i class="fas fa-calendar-day intervention-icon"></i>
                                ${formattedDate}<br>
                                <small>${intervention.dayOfWeek}</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <strong><i class="fas fa-user intervention-icon"></i>Intervenant:</strong><br>
                            ${intervention.fullName}
                        </div>
                        <div class="col-md-3">
                            <strong><i class="fas fa-church intervention-icon"></i>Type:</strong><br>
                            ${intervention.cultType} - ${intervention.place}
                        </div>
                        <div class="col-md-3">
                            <strong><i class="fas fa-comment intervention-icon"></i>Observations:</strong><br>
                            ${intervention.observations || intervention.theme || '-'}
                        </div>
                        <div class="col-md-1 text-end">
                            <button class="btn btn-sm btn-outline-danger delete-intervention" data-id="${intervention.id}" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    listContainer.innerHTML = html;

    // Ajouter les événements de suppression
    document.querySelectorAll('.delete-intervention').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteIntervention(id);
        });
    });
}

// Fonction pour effacer les filtres
function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-day').value = '';
    document.getElementById('filter-type').value = '';
    document.getElementById('filter-place').value = '';
    document.getElementById('filter-intervenant').value = '';
    document.getElementById('filter-start-date').value = '';
    document.getElementById('filter-end-date').value = '';
    updateInterventionsList(); // Afficher toutes les interventions
}

// Fonction pour générer des statistiques
function generateStats() {
    if (interventions.length === 0) {
        return {
            totalInterventions: 0,
            interventionsByType: {},
            interventionsByPlace: {},
            interventionsByDay: {},
            interventionsByIntervenant: {},
            interventionsByMonth: {}
        };
    }

    const stats = {
        totalInterventions: interventions.length,
        interventionsByType: {},
        interventionsByPlace: {},
        interventionsByDay: {},
        interventionsByIntervenant: {},
        interventionsByMonth: {}
    };

    interventions.forEach(intervention => {
        // Statistiques par type
        stats.interventionsByType[intervention.cultType] = (stats.interventionsByType[intervention.cultType] || 0) + 1;

        // Statistiques par lieu
        stats.interventionsByPlace[intervention.place] = (stats.interventionsByPlace[intervention.place] || 0) + 1;

        // Statistiques par jour
        stats.interventionsByDay[intervention.dayOfWeek] = (stats.interventionsByDay[intervention.dayOfWeek] || 0) + 1;

        // Statistiques par intervenant
        stats.interventionsByIntervenant[intervention.fullName] = (stats.interventionsByIntervenant[intervention.fullName] || 0) + 1;

        // Statistiques par mois
        const date = new Date(intervention.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        stats.interventionsByMonth[monthKey] = (stats.interventionsByMonth[monthKey] || 0) + 1;
    });

    return stats;
}

// Fonction pour afficher les rapports
function showReports() {
    // Ouvrir la page de rapport détaillé dans un nouvel onglet
    window.open('rapport.html', '_blank');
}

// Fonction pour exporter les rapports
function exportReports(stats) {
    let reportContent = `Rapport d'Analyse des Interventions\n`;
    reportContent += `Généré le: ${new Date().toLocaleString()}\n\n`;

    reportContent += `Total des interventions: ${stats.totalInterventions}\n\n`;

    reportContent += `Interventions par type:\n`;
    Object.entries(stats.interventionsByType).forEach(([type, count]) => {
        reportContent += `- ${type}: ${count}\n`;
    });
    reportContent += `\n`;

    reportContent += `Interventions par lieu:\n`;
    Object.entries(stats.interventionsByPlace).forEach(([place, count]) => {
        reportContent += `- ${place}: ${count}\n`;
    });
    reportContent += `\n`;

    reportContent += `Interventions par jour:\n`;
    Object.entries(stats.interventionsByDay).forEach(([day, count]) => {
        reportContent += `- ${day}: ${count}\n`;
    });
    reportContent += `\n`;

    reportContent += `Interventions par intervenant:\n`;
    Object.entries(stats.interventionsByIntervenant).forEach(([intervenant, count]) => {
        reportContent += `- ${intervenant}: ${count}\n`;
    });
    reportContent += `\n`;

    reportContent += `Interventions par mois:\n`;
    Object.entries(stats.interventionsByMonth).forEach(([month, count]) => {
        reportContent += `- ${month}: ${count}\n`;
    });

    // Créer un blob et le télécharger
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rapport_Analyses_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    showAlert('Rapport exporté avec succès !', 'success');
}

// Fonction pour exporter en CSV
function generateCSV() {
    if (interventions.length === 0) {
        showAlert('Aucune intervention à exporter.', 'warning');
        return;
    }

    try {
        const quarter = document.getElementById('quarter').options[document.getElementById('quarter').selectedIndex].text;
        const year = document.getElementById('year').value;

        // Créer l'en-tête CSV
        let csvContent = `Planning des Interventions - ${quarter} ${year}\n`;
        csvContent += 'Date,Jour,Lieu,Type de culte,Thème,Intervenant,Observations\n';

        // Trier et ajouter les données
        const sortedInterventions = [...interventions].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedInterventions.forEach(item => {
            const dateObj = new Date(item.date);
            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
            
            const row = [
                formattedDate,
                item.dayOfWeek,
                item.place,
                item.cultType,
                item.theme || "",
                item.fullName,
                item.observations || ""
            ].map(field => `"${(field || '').replace(/"/g, '""')}"`).join(',');

            csvContent += row + '\n';
        });

        // Créer un blob et le télécharger
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Planning_BERACA_${year}_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        addToHistory("CSV", link.download);
        showAlert('Fichier CSV généré avec succès!', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export CSV:', error);
        showAlert('Erreur lors de la génération du fichier CSV.', 'danger');
    }
}

// Fonction pour afficher la modale de gestion des intervenants
function showManageIntervenantsModal() {
    // Créer la modale pour gérer les intervenants
    const modalHTML = `
        <div class="modal fade" id="manageIntervenantsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-users-cog me-2"></i>Gestion des Intervenants</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6>Liste des Intervenants</h6>
                            <button type="button" class="btn btn-sm btn-outline-primary" id="refresh-intervenants-btn">
                                <i class="fas fa-sync-alt me-1"></i>Actualiser
                            </button>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Titre</th>
                                        <th>Prénom</th>
                                        <th>Nom</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="intervenants-table-body">
                                    <!-- Rempli dynamiquement -->
                                </tbody>
                            </table>
                        </div>

                        <div class="mt-4">
                            <h6>Ajouter un nouvel intervenant</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <select class="form-select" id="new-intervenant-title">
                                        <option value="">Aucun</option>
                                        <option value="Pasteur">Pasteur</option>
                                        <option value="Diacre">Diacre</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Mme">Mme</option>
                                        <option value="Mlle">Mlle</option>
                                        <option value="Frère">Frère</option>
                                        <option value="Sœur">Sœur</option>
                                        <option value="Ancien">Ancien</option>
                                        <option value="Évangeliste">Évangeliste</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <input type="text" class="form-control" id="new-intervenant-firstname" placeholder="Prénom">
                                </div>
                                <div class="col-md-3">
                                    <input type="text" class="form-control" id="new-intervenant-lastname" placeholder="Nom">
                                </div>
                                <div class="col-md-1">
                                    <button type="button" class="btn btn-success" id="add-intervenant-to-db-btn">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au DOM si elle n'existe pas déjà
    if (!document.getElementById('manageIntervenantsModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialiser la modale Bootstrap
        const manageModal = new bootstrap.Modal(document.getElementById('manageIntervenantsModal'));
        manageModal.show();

        // Remplir la table des intervenants
        populateIntervenantsTable();

        // Ajouter les événements
        document.getElementById('refresh-intervenants-btn').addEventListener('click', populateIntervenantsTable);
        document.getElementById('add-intervenant-to-db-btn').addEventListener('click', addIntervenantToDB);

        // Supprimer la modale quand elle est fermée
        document.getElementById('manageIntervenantsModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Si la modale existe déjà, simplement l'afficher et rafraîchir les données
        populateIntervenantsTable();
        const manageModal = new bootstrap.Modal(document.getElementById('manageIntervenantsModal'));
        manageModal.show();
    }
}

// Fonction pour remplir la table des intervenants
function populateIntervenantsTable() {
    const tableBody = document.getElementById('intervenants-table-body');
    tableBody.innerHTML = '';

    intervenantsDB.forEach(intervenant => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${intervenant.title || ''}</td>
            <td>${intervenant.firstName}</td>
            <td>${intervenant.lastName}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning edit-intervenant-btn" data-id="${intervenant.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-intervenant-btn" data-id="${intervenant.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Ajouter les événements d'édition et de suppression
    document.querySelectorAll('.edit-intervenant-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editIntervenant(id);
        });
    });

    document.querySelectorAll('.delete-intervenant-btn').forEach(button => {
        button.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteIntervenantFromDB(id);
        });
    });
}

// Fonction pour ajouter un intervenant à la base de données
function addIntervenantToDB() {
    const title = document.getElementById('new-intervenant-title').value;
    const firstName = document.getElementById('new-intervenant-firstname').value.trim();
    const lastName = document.getElementById('new-intervenant-lastname').value.trim();

    if (!firstName || !lastName) {
        showAlert('Veuillez entrer au moins un prénom et un nom.', 'danger');
        return;
    }

    // Vérifier si l'intervenant existe déjà
    const exists = intervenantsDB.some(i =>
        i.firstName === firstName && i.lastName === lastName
    );

    if (exists) {
        showAlert('Cet intervenant existe déjà dans la base.', 'warning');
        return;
    }

    // Ajouter à la base de données
    const newIntervenant = {
        id: Date.now(),
        title: title,
        firstName: firstName,
        lastName: lastName
    };

    intervenantsDB.push(newIntervenant);

    // Mettre à jour la table
    populateIntervenantsTable();
    // Mettre à jour les listes déroulantes
    populateIntervenantsSelect();

    // Réinitialiser le formulaire
    document.getElementById('new-intervenant-title').value = '';
    document.getElementById('new-intervenant-firstname').value = '';
    document.getElementById('new-intervenant-lastname').value = '';

    showAlert(`Intervenant ${firstName} ${lastName} ajouté avec succès!`, 'success');
    saveToLocalStorage();
}

// Fonction pour éditer un intervenant
function editIntervenant(id) {
    const intervenant = intervenantsDB.find(i => i.id === id);
    if (!intervenant) {
        showAlert('Intervenant non trouvé.', 'danger');
        return;
    }

    // Créer une modale pour l'édition
    const editModalHTML = `
        <div class="modal fade" id="editIntervenantModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Éditer l\'Intervenant</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Titre</label>
                            <select class="form-select" id="edit-title">
                                <option value="">Aucun</option>
                                <option value="Pasteur" ${intervenant.title === 'Pasteur' ? 'selected' : ''}>Pasteur</option>
                                <option value="Diacre" ${intervenant.title === 'Diacre' ? 'selected' : ''}>Diacre</option>
                                <option value="Mr" ${intervenant.title === 'Mr' ? 'selected' : ''}>Mr</option>
                                <option value="Mme" ${intervenant.title === 'Mme' ? 'selected' : ''}>Mme</option>
                                <option value="Mlle" ${intervenant.title === 'Mlle' ? 'selected' : ''}>Mlle</option>
                                <option value="Frère" ${intervenant.title === 'Frère' ? 'selected' : ''}>Frère</option>
                                <option value="Sœur" ${intervenant.title === 'Sœur' ? 'selected' : ''}>Sœur</option>
                                <option value="Ancien" ${intervenant.title === 'Ancien' ? 'selected' : ''}>Ancien</option>
                                <option value="Évangeliste" ${intervenant.title === 'Évangeliste' ? 'selected' : ''}>Évangeliste</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Prénom</label>
                            <input type="text" class="form-control" id="edit-firstname" value="${intervenant.firstName}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nom</label>
                            <input type="text" class="form-control" id="edit-lastname" value="${intervenant.lastName}">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="save-intervenant-btn">Sauvegarder</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale d'édition au DOM
    document.body.insertAdjacentHTML('beforeend', editModalHTML);

    // Initialiser la modale Bootstrap
    const editModal = new bootstrap.Modal(document.getElementById('editIntervenantModal'));
    editModal.show();

    // Gestionnaire pour sauvegarder les modifications
    document.getElementById('save-intervenant-btn').addEventListener('click', function() {
        const newTitle = document.getElementById('edit-title').value;
        const newFirstname = document.getElementById('edit-firstname').value.trim();
        const newLastname = document.getElementById('edit-lastname').value.trim();

        if (!newFirstname || !newLastname) {
            showAlert('Veuillez entrer au moins un prénom et un nom.', 'danger');
            return;
        }

        // Mettre à jour l'intervenant
        intervenant.title = newTitle;
        intervenant.firstName = newFirstname;
        intervenant.lastName = newLastname;

        // Mettre à jour la table
        populateIntervenantsTable();
        // Mettre à jour les listes déroulantes
        populateIntervenantsSelect();

        showAlert(`Intervenant mis à jour avec succès!`, 'success');
        saveToLocalStorage();

        // Fermer la modale
        editModal.hide();
    });

    // Supprimer la modale d'édition quand elle est fermée
    document.getElementById('editIntervenantModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

// Fonction pour supprimer un intervenant de la base de données
function deleteIntervenantFromDB(id) {
    if (confirm('Voulez-vous vraiment supprimer cet intervenant ?')) {
        // Trouver l'index de l'intervenant
        const index = intervenantsDB.findIndex(i => i.id === id);

        if (index !== -1) {
            // Supprimer de la base de données
            const removedIntervenant = intervenantsDB.splice(index, 1)[0];

            // Mettre à jour la table
            populateIntervenantsTable();
            // Mettre à jour les listes déroulantes
            populateIntervenantsSelect();

            showAlert(`Intervenant ${removedIntervenant.firstName} ${removedIntervenant.lastName} supprimé.`, 'warning');
            saveToLocalStorage();
        } else {
            showAlert('Intervenant non trouvé.', 'danger');
        }
    }
}

// Fonction pour afficher la modale de planification automatique
function showAutoPlanModal() {
    // Créer la modale pour la planification automatique
    const modalHTML = `
        <div class="modal fade" id="autoPlanModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-robot me-2"></i>Planification Automatique</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6>Paramètres de la planification automatique</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <label for="auto-plan-start-date" class="form-label">Date de début</label>
                                    <input type="date" class="form-control" id="auto-plan-start-date">
                                </div>
                                <div class="col-md-6">
                                    <label for="auto-plan-end-date" class="form-label">Date de fin</label>
                                    <input type="date" class="form-control" id="auto-plan-end-date">
                                </div>
                            </div>

                            <div class="mt-3">
                                <label class="form-label">Jours de la semaine à planifier</label>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-sunday" value="Dimanche" checked>
                                            <label class="form-check-label" for="auto-plan-sunday">Dimanche</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-monday" value="Lundi">
                                            <label class="form-check-label" for="auto-plan-monday">Lundi</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-tuesday" value="Mardi" checked>
                                            <label class="form-check-label" for="auto-plan-tuesday">Mardi</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-wednesday" value="Mercredi" checked>
                                            <label class="form-check-label" for="auto-plan-wednesday">Mercredi</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-thursday" value="Jeudi" checked>
                                            <label class="form-check-label" for="auto-plan-thursday">Jeudi</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-friday" value="Vendredi" checked>
                                            <label class="form-check-label" for="auto-plan-friday">Vendredi</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-saturday" value="Samedi">
                                            <label class="form-check-label" for="auto-plan-saturday">Samedi</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-3">
                                <label class="form-label">Types d'intervention à planifier</label>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-principal" value="Principal" checked>
                                            <label class="form-check-label" for="auto-plan-type-principal">Culte Principal</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-enseignement" value="Enseignement" checked>
                                            <label class="form-check-label" for="auto-plan-type-enseignement">Enseignement</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-temoignage" value="Témoignage/Action de grâce/Prière" checked>
                                            <label class="form-check-label" for="auto-plan-type-temoignage">Témoignage/Action de grâce/Prière</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-priere-hebdo" value="Prière hebdomadaire" checked>
                                            <label class="form-check-label" for="auto-plan-type-priere-hebdo">Prière hebdomadaire</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-jeune-priere" value="Jeune et Prière">
                                            <label class="form-check-label" for="auto-plan-type-jeune-priere">Jeune et Prière</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-veille-priere" value="Veillée de prière">
                                            <label class="form-check-label" for="auto-plan-type-veille-priere">Veillée de prière</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-reunion" value="Réunion" checked>
                                            <label class="form-check-label" for="auto-plan-type-reunion">Réunion</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="auto-plan-type-culte-enfants" value="Culte des enfants" checked>
                                            <label class="form-check-label" for="auto-plan-type-culte-enfants">Culte des enfants</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-3">
                                <label for="auto-plan-place" class="form-label">Lieu d'intervention</label>
                                <select class="form-select" id="auto-plan-place">
                                    <option value="BERACA" selected>BERACA</option>
                                    <option value="KPOTEYEI">KPOTEYEI</option>
                                    <option value="GROS PORTEUR">GROS PORTEUR</option>
                                    <option value="WINKE">WINKE</option>
                                </select>
                            </div>

                            <div class="mt-3">
                                <label for="auto-plan-category" class="form-label">Catégorie d'intervenants</label>
                                <select class="form-select" id="auto-plan-category">
                                    <option value="all" selected>Toutes les catégories</option>
                                    <option value="clergy">Clergé</option>
                                    <option value="members">Membres</option>
                                    <option value="singers">Chanteurs</option>
                                    <option value="musicians">Musiciens</option>
                                    <option value="technical">Technique</option>
                                    <option value="volunteers">Bénévoles</option>
                                </select>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            La planification automatique va distribuer les interventions de manière équitable parmi les intervenants disponibles.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-success" id="execute-auto-plan-btn">Planifier</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au DOM si elle n'existe pas déjà
    if (!document.getElementById('autoPlanModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialiser la modale Bootstrap
        const autoPlanModal = new bootstrap.Modal(document.getElementById('autoPlanModal'));
        autoPlanModal.show();

        // Définir la date de début à aujourd'hui et la date de fin à 3 mois plus tard
        const today = new Date();
        const endDate = new Date();
        endDate.setMonth(today.getMonth() + 3);

        document.getElementById('auto-plan-start-date').valueAsDate = today;
        document.getElementById('auto-plan-end-date').valueAsDate = endDate;

        // Ajouter l'événement pour le bouton de planification
        document.getElementById('execute-auto-plan-btn').addEventListener('click', executeAutoPlan);

        // Supprimer la modale quand elle est fermée
        document.getElementById('autoPlanModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Si la modale existe déjà, simplement l'afficher
        const autoPlanModal = new bootstrap.Modal(document.getElementById('autoPlanModal'));
        autoPlanModal.show();
    }
}

// Fonction pour exécuter la planification automatique
function executeAutoPlan() {
    // Récupérer les paramètres
    const startDate = new Date(document.getElementById('auto-plan-start-date').value);
    const endDate = new Date(document.getElementById('auto-plan-end-date').value);

    // Jours sélectionnés
    const selectedDays = [];
    document.querySelectorAll('input[id^="auto-plan-"][id*="-day"]:checked').forEach(checkbox => {
        selectedDays.push(checkbox.value);
    });

    // Si aucun jour n'est sélectionné, utiliser tous les jours cochés
    if (selectedDays.length === 0) {
        // Utiliser les jours par défaut
        selectedDays.push('Dimanche', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi');
    }

    // Types sélectionnés
    const selectedTypes = [];
    document.querySelectorAll('input[id^="auto-plan-type-"]:checked').forEach(checkbox => {
        selectedTypes.push(checkbox.value);
    });

    const place = document.getElementById('auto-plan-place').value;

    // Vérifier que les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        showAlert('Veuillez entrer des dates valides.', 'danger');
        return;
    }

    if (startDate > endDate) {
        showAlert('La date de début doit être antérieure à la date de fin.', 'danger');
        return;
    }

    // Générer les dates
    const dates = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const dayOfWeek = daysOfWeek[currentDate.getDay()];

        if (selectedDays.includes(dayOfWeek)) {
            dates.push(new Date(currentDate));
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Vérifier s'il y a des dates à planifier
    if (dates.length === 0) {
        showAlert('Aucune date ne correspond aux critères sélectionnés.', 'warning');
        return;
    }

    // Vérifier s'il y a des intervenants disponibles
    if (intervenantsDB.length === 0) {
        showAlert('Aucun intervenant disponible pour la planification.', 'warning');
        return;
    }

    // Filtrer les intervenants par catégorie si nécessaire
    const categoryFilter = document.getElementById('auto-plan-category') ? document.getElementById('auto-plan-category').value : 'all';
    let filteredIntervenants = intervenantsDB;
    if (categoryFilter !== 'all') {
        filteredIntervenants = intervenantsDB.filter(intervenant => intervenant.category === categoryFilter);
        if (filteredIntervenants.length === 0) {
            showAlert(`Aucun intervenant dans la catégorie "${categoryFilter}" pour la planification.`, 'warning');
            return;
        }
    }

    // Planifier les interventions
    let intervenantIndex = 0;
    let typeIndex = 0;

    // Suivre combien de fois chaque intervenant a été planifié
    const intervenantCount = {};
    filteredIntervenants.forEach(intervenant => {
        intervenantCount[intervenant.id] = 0;
    });

    dates.forEach(date => {
        // Sélectionner un intervenant avec répartition équitable
        // Trouver l'intervenant avec le moins d'interventions
        let selectedIntervenant = null;
        let minCount = Infinity;

        filteredIntervenants.forEach(intervenant => {
            const count = intervenantCount[intervenant.id] || 0;
            if (count < minCount) {
                minCount = count;
                selectedIntervenant = intervenant;
            }
        });

        // Sélectionner un type (rotation)
        const cultType = selectedTypes[typeIndex % selectedTypes.length];

        // Créer l'intervention
        const intervention = {
            id: Date.now() + dates.indexOf(date),
            date: date.toISOString().split('T')[0],
            formattedDate: date.toISOString(),
            dayOfWeek: daysOfWeek[date.getDay()],
            place: place,
            cultType: cultType,
            theme: '',
            title: selectedIntervenant.title,
            firstName: selectedIntervenant.firstName,
            lastName: selectedIntervenant.lastName,
            fullName: (selectedIntervenant.title ? selectedIntervenant.title + ' ' : '') + selectedIntervenant.firstName + ' ' + selectedIntervenant.lastName,
            observations: '',
            groupLabel: getGroupLabel(cultType, place, daysOfWeek[date.getDay()])
        };

        // Ajouter à la liste des interventions
        interventions.push(intervention);

        // Mettre à jour le compteur pour cet intervenant
        intervenantCount[selectedIntervenant.id] = (intervenantCount[selectedIntervenant.id] || 0) + 1;

        // Passer au type suivant
        typeIndex++;
    });

    // Mettre à jour l'affichage
    updateInterventionsList();
    saveToLocalStorage();

    // Fermer la modale
    const autoPlanModal = bootstrap.Modal.getInstance(document.getElementById('autoPlanModal'));
    if (autoPlanModal) {
        autoPlanModal.hide();
    }

    showAlert(`${dates.length} interventions planifiées automatiquement avec répartition équitable!`, 'success');
}

// Fonction pour déterminer le label de groupe
function getGroupLabel(cultType, place, dayOfWeek) {
    if (cultType === 'Principal' && place === 'BERACA') {
        return 'Les intervenants culte Dimanche BERACA';
    } else if (cultType === 'Culte des enfants') {
        return 'Les intervenants du culte des enfants';
    } else if (cultType === 'Culte des Adolescents') {
        return 'Les intervenants du culte des Adolescents';
    } else if (place === 'KPOTEYEI') {
        if (dayOfWeek === 'Dimanche') {
            return 'Les intervenants de Dimanche à KPOTEYEI';
        } else if (dayOfWeek === 'Mercredi') {
            return 'Les intervenants de Mercredi à KPOTEYEI';
        } else if (dayOfWeek === 'Vendredi') {
            return 'Les intervenants de Vendredi à KPOTEYEI';
        }
    } else if (place === 'GROS PORTEUR' && dayOfWeek === 'Mercredi') {
        return 'Les intervenants de Mercredi à GROS PORTEUR';
    } else if (place === 'WINKE' && dayOfWeek === 'Mercredi') {
        return 'Les intervenants de Mercredi à WINKE';
    } else if (cultType === 'Témoignage/Action de grâce/Prière' && dayOfWeek === 'Jeudi') {
        return 'Intervenants de Jeudi';
    } else if (cultType === 'Prière hebdomadaire' && dayOfWeek === 'Mardi') {
        return 'Intervenants de Mardi';
    } else if (cultType === 'Jeune et Prière') {
        return 'Intervenants de Jeune et Prière';
    } else if (cultType === 'Veillée de prière') {
        return 'Intervenants de Veillée de Prière';
    } else {
        return `Intervenants de ${dayOfWeek}`;
    }
}

// Fonction pour gérer les profils de configuration
function showManageProfilesModal() {
    // Créer la modale pour gérer les profils
    const modalHTML = `
        <div class="modal fade" id="manageProfilesModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-folder-open me-2"></i>Gestion des Profils de Configuration</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6>Enregistrer un nouveau profil</h6>
                            <div class="row">
                                <div class="col-md-8">
                                    <input type="text" class="form-control" id="profile-name" placeholder="Nom du profil">
                                </div>
                                <div class="col-md-4">
                                    <button type="button" class="btn btn-success w-100" id="save-profile-btn">
                                        <i class="fas fa-save me-1"></i>Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6>Profils existants</h6>
                                <button type="button" class="btn btn-sm btn-outline-primary" id="refresh-profiles-btn">
                                    <i class="fas fa-sync-alt me-1"></i>Actualiser
                                </button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Nom du profil</th>
                                            <th>Date de création</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="profiles-table-body">
                                        <!-- Rempli dynamiquement -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Les profils de configuration permettent de sauvegarder et de charger facilement des configurations spécifiques.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au DOM si elle n'existe pas déjà
    if (!document.getElementById('manageProfilesModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Initialiser la modale Bootstrap
        const manageProfilesModal = new bootstrap.Modal(document.getElementById('manageProfilesModal'));
        manageProfilesModal.show();

        // Charger les profils existants
        loadSavedProfiles();

        // Ajouter les événements
        document.getElementById('save-profile-btn').addEventListener('click', saveCurrentProfile);
        document.getElementById('refresh-profiles-btn').addEventListener('click', loadSavedProfiles);

        // Supprimer la modale quand elle est fermée
        document.getElementById('manageProfilesModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    } else {
        // Si la modale existe déjà, simplement l'afficher et rafraîchir les données
        loadSavedProfiles();
        const manageProfilesModal = new bootstrap.Modal(document.getElementById('manageProfilesModal'));
        manageProfilesModal.show();
    }
}

// Fonction pour charger les profils sauvegardés
function loadSavedProfiles() {
    const tableBody = document.getElementById('profiles-table-body');
    tableBody.innerHTML = '';

    // Récupérer les profils depuis localStorage
    const profiles = JSON.parse(localStorage.getItem('churchPlanningProfiles') || '[]');

    if (profiles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">Aucun profil enregistré</td></tr>';
        return;
    }

    profiles.forEach((profile, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${profile.name}</td>
            <td>${new Date(profile.timestamp).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary load-profile-btn" data-index="${index}">
                    <i class="fas fa-download"></i> Charger
                </button>
                <button class="btn btn-sm btn-outline-danger delete-profile-btn" data-index="${index}">
                    <i class="fas fa-trash"></i> Supprimer
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Ajouter les événements de chargement et de suppression
    document.querySelectorAll('.load-profile-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            loadProfile(index);
        });
    });

    document.querySelectorAll('.delete-profile-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteProfile(index);
        });
    });
}

// Fonction pour sauvegarder le profil actuel
function saveCurrentProfile() {
    const profileName = document.getElementById('profile-name').value.trim();

    if (!profileName) {
        showAlert('Veuillez entrer un nom pour le profil.', 'danger');
        return;
    }

    // Récupérer les données actuelles
    const profileData = {
        name: profileName,
        timestamp: Date.now(),
        generalInfo: {
            churchName: document.getElementById('church-name').value,
            region: document.getElementById('region').value,
            section: document.getElementById('section').value,
            temple: document.getElementById('temple').value,
            year: document.getElementById('year').value,
            quarter: document.getElementById('quarter').value
        },
        configurations: {
            days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
            types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
            places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
            otherType: document.getElementById('type-other-specify').value,
            otherPlace: document.getElementById('place-other-specify').value
        },
        intervenants: intervenantsDB
    };

    // Récupérer les profils existants
    const profiles = JSON.parse(localStorage.getItem('churchPlanningProfiles') || '[]');

    // Vérifier si un profil avec ce nom existe déjà
    const existingIndex = profiles.findIndex(p => p.name === profileName);
    if (existingIndex !== -1) {
        if (!confirm('Un profil avec ce nom existe déjà. Voulez-vous le remplacer ?')) {
            return;
        }
        profiles[existingIndex] = profileData;
    } else {
        profiles.push(profileData);
    }

    // Sauvegarder dans localStorage
    localStorage.setItem('churchPlanningProfiles', JSON.stringify(profiles));

    // Réinitialiser le champ
    document.getElementById('profile-name').value = '';

    // Rafraîchir la liste
    loadSavedProfiles();

    showAlert(`Profil "${profileName}" sauvegardé avec succès!`, 'success');
}

// Fonction pour charger un profil
function loadProfile(index) {
    const profiles = JSON.parse(localStorage.getItem('churchPlanningProfiles') || '[]');

    if (index < 0 || index >= profiles.length) {
        showAlert('Profil non trouvé.', 'danger');
        return;
    }

    const profile = profiles[index];

    // Charger les informations générales
    document.getElementById('church-name').value = profile.generalInfo.churchName || '';
    document.getElementById('region').value = profile.generalInfo.region || '';
    document.getElementById('section').value = profile.generalInfo.section || '';
    document.getElementById('temple').value = profile.generalInfo.temple || '';
    document.getElementById('year').value = profile.generalInfo.year || '2025';
    document.getElementById('quarter').value = profile.generalInfo.quarter || '4';

    // Charger les configurations
    // Jours
    document.querySelectorAll('input[id^="day-"]').forEach(cb => {
        cb.checked = profile.configurations.days.includes(cb.value);
    });

    // Types
    document.querySelectorAll('input[id^="type-"]').forEach(cb => {
        cb.checked = profile.configurations.types.includes(cb.value);
    });

    // Lieux
    document.querySelectorAll('input[id^="place-"]').forEach(cb => {
        cb.checked = profile.configurations.places.includes(cb.value);
    });

    // Autres valeurs
    if (profile.configurations.otherType) {
        document.getElementById('type-other-specify').value = profile.configurations.otherType;
        document.getElementById('type-other').checked = true;
        document.getElementById('type-other-specify').disabled = false;
    } else {
        document.getElementById('type-other').checked = false;
        document.getElementById('type-other-specify').disabled = true;
        document.getElementById('type-other-specify').value = '';
    }

    if (profile.configurations.otherPlace) {
        document.getElementById('place-other-specify').value = profile.configurations.otherPlace;
        document.getElementById('place-other').checked = true;
        document.getElementById('place-other-specify').disabled = false;
    } else {
        document.getElementById('place-other').checked = false;
        document.getElementById('place-other-specify').disabled = true;
        document.getElementById('place-other-specify').value = '';
    }

    // Charger les intervenants
    if (profile.intervenants && Array.isArray(profile.intervenants)) {
        intervenantsDB = profile.intervenants;
        populateIntervenantsSelect();
    }

    // Mettre à jour les listes déroulantes
    updateDynamicSelects();

    // Fermer la modale
    const manageProfilesModal = bootstrap.Modal.getInstance(document.getElementById('manageProfilesModal'));
    if (manageProfilesModal) {
        manageProfilesModal.hide();
    }

    showAlert(`Profil "${profile.name}" chargé avec succès!`, 'success');
}

// Fonction pour supprimer un profil
function deleteProfile(index) {
    if (confirm('Voulez-vous vraiment supprimer ce profil ?')) {
        const profiles = JSON.parse(localStorage.getItem('churchPlanningProfiles') || '[]');

        if (index < 0 || index >= profiles.length) {
            showAlert('Profil non trouvé.', 'danger');
            return;
        }

        const profileName = profiles[index].name;
        profiles.splice(index, 1);

        // Sauvegarder dans localStorage
        localStorage.setItem('churchPlanningProfiles', JSON.stringify(profiles));

        // Rafraîchir la liste
        loadSavedProfiles();

        showAlert(`Profil "${profileName}" supprimé.`, 'warning');
    }
}

// Fonction pour déverrouiller les informations générales
function unlockGeneralInfo() {
    const password = prompt('Veuillez entrer le mot de passe de développeur pour modifier les informations générales :');

    if (password === 'Martial1989') {
        // Déverrouiller les champs
        document.getElementById('church-name').disabled = false;
        document.getElementById('region').disabled = false;
        document.getElementById('section').disabled = false;
        document.getElementById('temple').disabled = false;
        document.getElementById('year').disabled = false;
        document.getElementById('quarter').disabled = false;

        // Changer le message d'alerte
        const alertElement = document.querySelector('.alert.alert-info');
        if (alertElement) {
            alertElement.innerHTML = `
                <i class="fas fa-unlock me-2"></i>
                Les informations générales sont maintenant modifiables.
                <button type="button" class="btn btn-sm btn-outline-secondary ms-2" id="lock-general-info">
                    <i class="fas fa-lock me-1"></i>Verrouiller
                </button>
            `;

            // Ajouter l'événement pour verrouiller à nouveau
            document.getElementById('lock-general-info').addEventListener('click', lockGeneralInfo);
        }

        showAlert('Accès aux informations générales autorisé.', 'success');
    } else if (password !== null) { // Si l'utilisateur a annulé, ne pas afficher de message d'erreur
        showAlert('Mot de passe incorrect. Accès refusé.', 'danger');
    }
}

// Fonction pour verrouiller les informations générales
function lockGeneralInfo() {
    // Verrouiller les champs
    document.getElementById('church-name').disabled = true;
    document.getElementById('region').disabled = true;
    document.getElementById('section').disabled = true;
    document.getElementById('temple').disabled = true;
    document.getElementById('year').disabled = true;
    document.getElementById('quarter').disabled = true;

    // Changer le message d'alerte
    const alertElement = document.querySelector('.alert.alert-info');
    if (alertElement) {
        alertElement.innerHTML = `
            <i class="fas fa-lock me-2"></i>
            Les informations générales sont protégées. Pour les modifier, entrez le mot de passe de développeur.
            <button type="button" class="btn btn-sm btn-outline-primary ms-2" id="unlock-general-info">
                <i class="fas fa-unlock me-1"></i>Modifier
            </button>
        `;

        // Réajouter l'événement pour déverrouiller
        document.getElementById('unlock-general-info').addEventListener('click', unlockGeneralInfo);
    }

    showAlert('Informations générales verrouillées.', 'info');
}

// Fonction pour générer un PDF spécifique pour la page de rapport
async function generatePDFReport(interventionsToShow, options = {}, fileName = 'Rapport_Interventions') {
    if (interventionsToShow.length === 0) {
        showAlert('Aucune intervention à exporter.', 'warning');
        return null;
    }

    try {
        // Initialisation robuste de jsPDF
        let jsPDF;
        if (window.jspdf && window.jspdf.jsPDF) {
            jsPDF = window.jspdf.jsPDF;
        } else if (window.jsPDF) {
            jsPDF = window.jsPDF;
        } else {
            throw new Error("La bibliothèque jsPDF n'est pas chargée correctement.");
        }

        // Utiliser les options de personnalisation ou les valeurs par défaut
        const orientation = options.orientation || 'portrait';
        const format = options.format || 'a4';
        const margins = options.margins || { top: 10, right: 10, bottom: 10, left: 10 };
        const includeLogo = options.hasOwnProperty('includeLogo') ? options.includeLogo : true;

        // Créer le document PDF
        const doc = new jsPDF(orientation, 'mm', format);

        // Dimensions de la page
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Position de départ
        let yPosition = margins.top;

        // Ajouter le logo si demandé
        if (includeLogo) {
            try {
                const logo = new Image();
                logo.src = 'AD.jpeg';

                // Attendre le chargement de l'image
                await new Promise((resolve, reject) => {
                    logo.onload = resolve;
                    logo.onerror = reject;
                });

                // Calculer les dimensions du logo (max 30mm de hauteur)
                const logoMaxHeight = 30;
                const logoMaxWidth = 30;
                let logoWidth = logo.width * (logoMaxHeight / logo.height);
                let logoHeight = logoMaxHeight;

                if (logoWidth > logoMaxWidth) {
                    logoWidth = logoMaxWidth;
                    logoHeight = logo.height * (logoMaxWidth / logo.width);
                }

                // Positionner le logo en haut à gauche
                doc.addImage(logo, 'JPEG', margins.left, yPosition, logoWidth, logoHeight);

                // Mettre à jour la position verticale
                yPosition += Math.max(logoHeight, 20) + 5;
            } catch (error) {
                console.warn("Impossible de charger le logo:", error);
                // Continuer sans le logo
                yPosition += 10;
            }
        }

        // Ajouter le titre
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text("RAPPORT DÉTAILLÉ DES INTERVENTIONS", pageWidth / 2, yPosition, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        yPosition += 8;
        doc.text("Assemblées de Dieu du Bénin - Église BERACA", pageWidth / 2, yPosition, { align: 'center' });

        // Ajouter la date de génération
        yPosition += 8;
        doc.setFontSize(10);
        doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 12;

        // Générer le tableau des interventions
        const tableData = interventionsToShow.map((intervention, index) => {
            // Trouver les informations de l'intervenant
            const intervenant = intervenantsDB.find(i =>
                i.firstName === intervention.firstName && i.lastName === intervention.lastName
            );

            const categoryLabels = {
                'clergy': 'Clergé',
                'members': 'Membres',
                'singers': 'Chanteurs',
                'musicians': 'Musiciens',
                'technical': 'Technique',
                'volunteers': 'Bénévoles'
            };

            const category = intervenant ? categoryLabels[intervenant.category] || intervenant.category : 'Inconnue';

            return [
                (index + 1).toString(),
                formatDateForDisplay(intervention.date),
                intervention.dayOfWeek,
                intervention.cultType,
                intervention.place,
                intervention.theme,
                intervention.fullName,
                category,
                intervention.observations || ''
            ];
        });

        // En-têtes du tableau
        const headers = [
            "#",
            "Date",
            "Jour",
            "Type de culte",
            "Lieu",
            "Thème",
            "Intervenant",
            "Catégorie",
            "Observations"
        ];

        // Vérifier si jspdf-autotable est disponible
        if (typeof doc.autoTable !== 'function') {
            throw new Error("jspdf-autotable n'est pas chargé correctement.");
        }

        // Ajouter le tableau
        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: yPosition,
            margin: { top: margins.top, right: margins.right, bottom: margins.bottom, left: margins.left },
            styles: {
                fontSize: 8,
                cellPadding: 3
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            bodyStyles: {
                textColor: [0, 0, 0]
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            },
            columnStyles: {
                0: { cellWidth: 10 }, // Numéro
                1: { cellWidth: 25 }, // Date
                2: { cellWidth: 20 }, // Jour
                3: { cellWidth: 30 }, // Type de culte
                4: { cellWidth: 25 }, // Lieu
                5: { cellWidth: 35 }, // Thème
                6: { cellWidth: 40 }, // Intervenant
                7: { cellWidth: 25 }, // Catégorie
                8: { cellWidth: 35 }  // Observations
            },
            didDrawPage: function(data) {
                // Ajouter les numéros de page
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(10);
                const pageText = `Page ${data.pageNumber} sur ${pageCount}`;
                doc.text(pageText, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }
        });

        // Sauvegarder le PDF
        doc.save(`${fileName}.pdf`);

        // Afficher une alerte de succès
        showAlert(`PDF "${fileName}.pdf" généré avec succès!`, 'success');

        return doc;
    } catch (error) {
        console.error("Erreur lors de la génération du PDF:", error);
        showAlert(`Erreur lors de la génération du PDF: ${error.message}`, 'danger');
        return null;
    }
}

// Fonction pour publier les données
function publishData() {
    // Vérifier s'il y a des interventions à publier
    if (interventions.length === 0) {
        showAlert('Veuillez créer au moins une intervention avant de publier.', 'warning');
        return;
    }

    // Récupérer toutes les données nécessaires
    const dataToPublish = {
        interventions: interventions,
        intervenantsDB: intervenantsDB,
        generalInfo: {
            churchName: document.getElementById('church-name').value,
            region: document.getElementById('region').value,
            section: document.getElementById('section').value,
            temple: document.getElementById('temple').value,
            year: document.getElementById('year').value,
            quarter: document.getElementById('quarter').value
        },
        configurations: {
            days: [],
            types: [],
            places: [],
            otherType: '',
            otherPlace: ''
        },
        theme: document.body.className.replace('theme-', ''),
        publishedAt: new Date().toISOString()
    };

    // Récupérer les configurations cochées
    document.querySelectorAll('input[id^="day-"]:checked').forEach(checkbox => {
        dataToPublish.configurations.days.push(checkbox.value);
    });

    document.querySelectorAll('input[id^="type-"]:checked').forEach(checkbox => {
        dataToPublish.configurations.types.push(checkbox.value);
    });

    document.querySelectorAll('input[id^="place-"]:checked').forEach(checkbox => {
        dataToPublish.configurations.places.push(checkbox.value);
    });

    // Récupérer les valeurs "autres"
    const otherTypeInput = document.getElementById('type-other-specify');
    if (otherTypeInput && !otherTypeInput.disabled) {
        dataToPublish.configurations.otherType = otherTypeInput.value;
    }

    const otherPlaceInput = document.getElementById('place-other-specify');
    if (otherPlaceInput && !otherPlaceInput.disabled) {
        dataToPublish.configurations.otherPlace = otherPlaceInput.value;
    }

    try {
        // Convertir les données en chaîne JSON
        const dataStr = JSON.stringify(dataToPublish);

        // Encoder les données pour l'URL (compression et encodage sécurisé)
        const encodedData = btoa(encodeURIComponent(dataStr).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }));

        // Générer l'URL de partage
        const currentUrl = window.location.href.split('?')[0]; // Retirer les paramètres existants
        const publishUrl = `${currentUrl}?data=${encodedData}`;

        // Afficher une modale avec le lien de partage
        showPublishModal(publishUrl);

        // Ajouter les données au stockage local sans date d'expiration
        const storageKey = `published_data_${Date.now()}`;
        const storedData = {
            data: dataToPublish,
            createdAt: new Date().toISOString(),
            isPermanent: true // Indique que cette publication est permanente
        };

        localStorage.setItem(storageKey, JSON.stringify(storedData));

        // Sauvegarder la clé dans une liste pour gestion future
        let publishedKeys = JSON.parse(localStorage.getItem('published_keys') || '[]');
        publishedKeys.push({
            key: storageKey,
            url: publishUrl,
            createdAt: new Date().toISOString(),
            isPermanent: true
        });
        localStorage.setItem('published_keys', JSON.stringify(publishedKeys));

        // Sauvegarder aussi sur Supabase
        if (typeof saveToSupabase === 'function') {
            saveToSupabase();
        }

        showAlert('Données publiées avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la publication:', error);
        showAlert('Erreur lors de la publication des données: ' + error.message, 'danger');
    }
}

// Fonction pour afficher la modale de publication
function showPublishModal(publishUrl) {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('publishModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'publishModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-share-alt me-2"></i>Publication des Données</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p>Voici le lien pour accéder à ces données publiées :</p>
                        <div class="input-group mb-3">
                            <input type="text" class="form-control" id="publish-link" readonly>
                            <button class="btn btn-outline-secondary" type="button" id="copy-link-btn">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Ce lien permet d'accéder aux données planifiées.
                            Les données seront disponibles pendant 7 jours.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Mettre à jour le lien dans la modale
    document.getElementById('publish-link').value = publishUrl;

    // Configurer le bouton de copie
    document.getElementById('copy-link-btn').onclick = function() {
        const linkInput = document.getElementById('publish-link');
        linkInput.select();
        document.execCommand('copy');
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-check"></i> Copié!';
        setTimeout(() => {
            this.innerHTML = originalText;
        }, 2000);
        showAlert('Lien copié dans le presse-papiers', 'success');
    };

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour charger les données publiées à partir de l'URL
function loadPublishedData() {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');

    if (encodedData) {
        try {
            // Décoder les données
            const decodedData = decodeURIComponent(atob(encodedData).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const data = JSON.parse(decodedData);

            // Charger les données dans l'application
            interventions = data.interventions || [];
            intervenantsDB = data.intervenantsDB || intervenantsDB;

            // Charger les informations générales
            if (data.generalInfo) {
                document.getElementById('church-name').value = data.generalInfo.churchName || '';
                document.getElementById('region').value = data.generalInfo.region || '';
                document.getElementById('section').value = data.generalInfo.section || '';
                document.getElementById('temple').value = data.generalInfo.temple || '';
                document.getElementById('year').value = data.generalInfo.year || '2025';
                document.getElementById('quarter').value = data.generalInfo.quarter || '4';
            }

            // Charger les configurations
            if (data.configurations) {
                // Désélectionner tout d'abord
                document.querySelectorAll('input[id^="day-"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[id^="type-"]').forEach(cb => cb.checked = false);
                document.querySelectorAll('input[id^="place-"]').forEach(cb => cb.checked = false);

                // Jours
                data.configurations.days.forEach(dayValue => {
                    const checkbox = document.querySelector(`input[id^="day-"][value="${dayValue}"]`);
                    if (checkbox) checkbox.checked = true;
                });

                // Types
                data.configurations.types.forEach(typeValue => {
                    const checkbox = document.querySelector(`input[id^="type-"][value="${typeValue}"]`);
                    if (checkbox) checkbox.checked = true;
                });

                // Lieux
                data.configurations.places.forEach(placeValue => {
                    const checkbox = document.querySelector(`input[id^="place-"][value="${placeValue}"]`);
                    if (checkbox) checkbox.checked = true;
                });

                // Autres valeurs
                if (data.configurations.otherType) {
                    document.getElementById('type-other-specify').value = data.configurations.otherType;
                    document.getElementById('type-other').checked = true;
                    document.getElementById('type-other-specify').disabled = false;
                } else {
                    document.getElementById('type-other-specify').value = '';
                    document.getElementById('type-other').checked = false;
                    document.getElementById('type-other-specify').disabled = true;
                }
                if (data.configurations.otherPlace) {
                    document.getElementById('place-other-specify').value = data.configurations.otherPlace;
                    document.getElementById('place-other').checked = true;
                    document.getElementById('place-other-specify').disabled = false;
                } else {
                    document.getElementById('place-other-specify').value = '';
                    document.getElementById('place-other').checked = false;
                    document.getElementById('place-other-specify').disabled = true;
                }
            }

            // Charger le thème
            if (data.theme) {
                changeTheme(data.theme);
            }

            // Mettre à jour les interfaces
            populateIntervenantsSelect();
            updateDynamicSelects();
            updateInterventionsList();

            showAlert('Données publiées chargées avec succès !', 'success');
        } catch (error) {
            console.error('Erreur lors du chargement des données publiées:', error);
            showAlert('Erreur lors du chargement des données publiées: ' + error.message, 'danger');
        }
    }
}

// Fonction pour nettoyer les données expirées
function cleanupExpiredData() {
    // Pour le moment, ne fait rien car les publications sont permanentes
    // Cette fonction est conservée pour une éventuelle utilisation future
    // avec des publications temporaires
}

// Fonction pour enregistrer une modification dans l'historique
function saveToHistory(action, data, previousState = null) {
    // Récupérer l'historique existant ou initialiser
    let history = JSON.parse(localStorage.getItem('planningHistory') || '[]');

    // Créer un nouvel enregistrement d'historique
    const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        action: action,
        data: JSON.parse(JSON.stringify(data)), // Copie profonde
        previousState: previousState ? JSON.parse(JSON.stringify(previousState)) : null
    };

    // Ajouter à l'historique
    history.push(historyEntry);

    // Limiter l'historique à 50 entrées pour des raisons de performance
    if (history.length > 50) {
        history = history.slice(-50);
    }

    // Sauvegarder dans le localStorage
    localStorage.setItem('planningHistory', JSON.stringify(history));
}

// Fonction pour restaurer une intervention à partir de l'historique
function restoreFromHistory(historyId) {
    const history = JSON.parse(localStorage.getItem('planningHistory') || '[]');
    const historyEntry = history.find(entry => entry.id === historyId);

    if (!historyEntry) {
        console.error('Entrée d\'historique non trouvée');
        return false;
    }

    // Restaurer l'état précédent si disponible
    if (historyEntry.previousState) {
        interventions = JSON.parse(JSON.stringify(historyEntry.previousState));
        updateInterventionsList();
        saveToLocalStorage();
        autoSyncToReport();
        showAlert('Intervention restaurée à partir de l\'historique', 'success');
        return true;
    } else {
        console.error('Aucun état précédent disponible pour cette entrée');
        return false;
    }
}

// Fonction pour afficher l'historique des modifications
function showHistoryModal() {
    const history = JSON.parse(localStorage.getItem('planningHistory') || '[]').reverse(); // Inverser pour avoir les plus récents en premier

    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('historyModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'historyModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Historique des Modifications</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Action</th>
                                        <th>Détails</th>
                                        <th>Restaurer</th>
                                    </tr>
                                </thead>
                                <tbody id="history-table-body">
                                    <!-- Les entrées seront insérées ici -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-danger" id="clear-history-btn">Effacer l'historique</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événement pour effacer l'historique
        document.getElementById('clear-history-btn').addEventListener('click', function() {
            if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des modifications ?')) {
                localStorage.removeItem('planningHistory');
                const modalInstance = bootstrap.Modal.getInstance(modal);
                modalInstance.hide();
                showAlert('Historique effacé avec succès', 'info');
            }
        });
    }

    // Remplir le tableau avec l'historique
    const tableBody = document.getElementById('history-table-body');
    tableBody.innerHTML = '';

    if (history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Aucune modification enregistrée</td></tr>';
    } else {
        history.forEach(entry => {
            const row = document.createElement('tr');

            // Formater la date
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            // Déterminer le type d'action
            let actionLabel = '';
            let details = '';
            switch(entry.action) {
                case 'add':
                    actionLabel = 'Ajout';
                    details = `Ajout de l'intervention: ${entry.data.fullName} - ${entry.data.cultType}`;
                    break;
                case 'update':
                    actionLabel = 'Modification';
                    details = `Modification de: ${entry.data.fullName} - ${entry.data.cultType}`;
                    break;
                case 'delete':
                    actionLabel = 'Suppression';
                    details = `Suppression de: ${entry.data.fullName} - ${entry.data.cultType}`;
                    break;
                case 'clear':
                    actionLabel = 'Effacement';
                    details = 'Effacement de toutes les interventions';
                    break;
                default:
                    actionLabel = entry.action;
                    details = JSON.stringify(entry.data).substring(0, 50) + '...';
            }

            row.innerHTML = `
                <td>${formattedDate}</td>
                <td>${actionLabel}</td>
                <td>${details}</td>
                <td>
                    ${entry.previousState ?
                        `<button class="btn btn-sm btn-outline-primary restore-btn" data-id="${entry.id}">Restaurer</button>` :
                        '<span class="text-muted">Non disponible</span>'
                    }
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Ajouter les événements de restauration
        document.querySelectorAll('.restore-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const historyId = parseInt(this.getAttribute('data-id'));
                if (restoreFromHistory(historyId)) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    modalInstance.hide();
                }
            });
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour la planification automatique basée sur des règles
function showAutoPlanModal() {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('autoPlanModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'autoPlanModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Planification Automatique</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-4">
                            <h6>Règles de planification automatique</h6>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="rotation-enabled" checked>
                                <label class="form-check-label" for="rotation-enabled">
                                    Activer la rotation des intervenants
                                </label>
                            </div>
                            <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" id="avoid-conflicts" checked>
                                <label class="form-check-label" for="avoid-conflicts">
                                    Éviter les conflits (mêmes intervenants sur plusieurs interventions)
                                </label>
                            </div>
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="balance-workload">
                                <label class="form-check-label" for="balance-workload">
                                    Équilibrer la charge de travail
                                </label>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="start-date" class="form-label">Date de début</label>
                                    <input type="date" class="form-control" id="start-date">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="end-date" class="form-label">Date de fin</label>
                                    <input type="date" class="form-control" id="end-date">
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="intervenants-per-type" class="form-label">Nombre d'intervenants par type de culte</label>
                                <input type="number" class="form-control" id="intervenants-per-type" min="1" max="10" value="1">
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            La planification automatique générera des interventions selon les règles définies
                            et les données disponibles dans la base de données.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="generate-auto-plan">Générer la planification</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événement pour générer la planification automatique
        document.getElementById('generate-auto-plan').addEventListener('click', function() {
            generateAutoPlan();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });
    }

    // Définir les dates par défaut (aujourd'hui et dans 3 mois)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 3);

    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = futureDate;

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour demander la permission et afficher les notifications
function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications desktop');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                console.log('Permission pour les notifications accordée');
            }
        });
    }

    return Notification.permission === 'granted';
}

// Fonction pour afficher une notification
function showNotification(title, options = {}) {
    if (requestNotificationPermission()) {
        try {
            new Notification(title, options);
        } catch (e) {
            console.error('Erreur lors de l\'affichage de la notification:', e);
            // Fallback : afficher une alerte standard
            if (options.body) {
                showAlert(`${title}: ${options.body}`, options.tag || 'info');
            } else {
                showAlert(title, options.tag || 'info');
            }
        }
    } else {
        // Si la permission n'est pas accordée, afficher une alerte standard
        showAlert(title, options.tag || 'info');
    }
}

// Fonction pour envoyer une notification de changement important
function sendImportantChangeNotification(changeType, details) {
    const title = `Changement important : ${changeType}`;
    const options = {
        body: details,
        icon: 'AD.jpeg',
        tag: 'important-change',
        requireInteraction: true // La notification restera affichée jusqu'à ce que l'utilisateur l'interagisse
    };

    showNotification(title, options);
}

// Fonction pour vérifier les changements importants et envoyer des notifications
function checkAndNotifyImportantChanges() {
    // Récupérer l'état précédent sauvegardé
    const previousData = JSON.parse(localStorage.getItem('previousPlanningData') || 'null');

    if (!previousData) {
        // Si c'est la première fois, sauvegarder l'état actuel
        saveCurrentStateAsReference();
        return;
    }

    // Comparer avec l'état actuel
    const currentState = {
        interventionsCount: interventions.length,
        intervenantsCount: intervenantsDB.length,
        interventions: JSON.parse(JSON.stringify(interventions)),
        intervenants: JSON.parse(JSON.stringify(intervenantsDB))
    };

    // Vérifier les changements
    const changes = [];

    // Changement dans le nombre d'interventions
    if (previousData.interventionsCount !== currentState.interventionsCount) {
        const countDiff = currentState.interventionsCount - previousData.interventionsCount;
        if (countDiff > 0) {
            changes.push(`${countDiff} nouvelle(s) intervention(s) ajoutée(s)`);
        } else {
            changes.push(`${Math.abs(countDiff)} intervention(s) supprimée(s)`);
        }
    }

    // Vérifier les interventions spécifiques (ajouts, modifications, suppressions)
    const previousIds = new Set(previousData.interventions.map(i => i.id));
    const currentIds = new Set(currentState.interventions.map(i => i.id));

    // Interventions ajoutées
    const addedInterventions = currentState.interventions.filter(i => !previousIds.has(i.id));
    if (addedInterventions.length > 0) {
        changes.push(`Nouvelles interventions pour: ${addedInterventions.map(i => `${i.fullName} - ${i.cultType}`).join(', ')}`);
    }

    // Interventions supprimées
    const removedInterventions = previousData.interventions.filter(i => !currentIds.has(i.id));
    if (removedInterventions.length > 0) {
        changes.push(`Interventions supprimées: ${removedInterventions.map(i => `${i.fullName} - ${i.cultType}`).join(', ')}`);
    }

    // Envoyer les notifications pour les changements importants
    if (changes.length > 0) {
        const changeDetails = changes.join('; ');
        sendImportantChangeNotification('Mise à jour des interventions', changeDetails);
    }

    // Sauvegarder l'état actuel comme référence
    saveCurrentStateAsReference();
}

// Fonction pour sauvegarder l'état actuel comme référence
function saveCurrentStateAsReference() {
    const currentState = {
        interventionsCount: interventions.length,
        intervenantsCount: intervenantsDB.length,
        interventions: JSON.parse(JSON.stringify(interventions)),
        intervenants: JSON.parse(JSON.stringify(intervenantsDB)),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('previousPlanningData', JSON.stringify(currentState));
}

// Fonction pour générer des rapports statistiques
function showStatsReportModal() {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('statsReportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'statsReportModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Rapports Statistiques et Analyses</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <ul class="nav nav-tabs" id="statsTab" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab">Aperçu</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="intervenants-tab" data-bs-toggle="tab" data-bs-target="#intervenants" type="button" role="tab">Intervenants</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="types-tab" data-bs-toggle="tab" data-bs-target="#types" type="button" role="tab">Types de culte</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="dates-tab" data-bs-toggle="tab" data-bs-target="#dates" type="button" role="tab">Répartition temporelle</button>
                            </li>
                        </ul>
                        <div class="tab-content mt-3" id="statsTabContent">
                            <div class="tab-pane fade show active" id="overview" role="tabpanel">
                                <div class="row">
                                    <div class="col-md-3">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <h5 class="card-title">Total Interventions</h5>
                                                <h3 class="text-primary" id="total-interventions">0</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <h5 class="card-title">Intervenants Uniques</h5>
                                                <h3 class="text-success" id="unique-intervenants">0</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <h5 class="card-title">Types de Culte</h5>
                                                <h3 class="text-info" id="unique-types">0</h3>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <div class="card text-center">
                                            <div class="card-body">
                                                <h5 class="card-title">Période</h5>
                                                <h3 class="text-warning" id="period-days">0</h3>
                                                <p class="text-muted">jours</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <h5>Répartition par catégorie</h5>
                                    <canvas id="categoryChart" width="400" height="200"></canvas>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="intervenants" role="tabpanel">
                                <h5>Top Intervenants</h5>
                                <div class="table-responsive">
                                    <table class="table table-striped" id="top-intervenants-table">
                                        <thead>
                                            <tr>
                                                <th>Intervenant</th>
                                                <th>Catégorie</th>
                                                <th>Nombre d'interventions</th>
                                                <th>% du total</th>
                                            </tr>
                                        </thead>
                                        <tbody id="top-intervenants-body">
                                            <!-- Les données seront insérées ici -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="types" role="tabpanel">
                                <h5>Répartition par type de culte</h5>
                                <canvas id="typesChart" width="400" height="200"></canvas>
                                <div class="table-responsive mt-4">
                                    <table class="table table-striped" id="types-table">
                                        <thead>
                                            <tr>
                                                <th>Type de culte</th>
                                                <th>Nombre</th>
                                                <th>% du total</th>
                                            </tr>
                                        </thead>
                                        <tbody id="types-body">
                                            <!-- Les données seront insérées ici -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="tab-pane fade" id="dates" role="tabpanel">
                                <h5>Activité par période</h5>
                                <canvas id="datesChart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" id="export-stats-btn">Exporter les statistiques</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événement pour exporter les statistiques
        document.getElementById('export-stats-btn').addEventListener('click', function() {
            exportStatsReport();
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Mettre à jour les données après un court délai pour permettre l'affichage
    setTimeout(() => {
        updateStatsReportData();
    }, 300);
}

// Fonction pour mettre à jour les données du rapport statistique
function updateStatsReportData() {
    // Calculer les statistiques
    const stats = calculateStats();

    // Mettre à jour les indicateurs principaux
    document.getElementById('total-interventions').textContent = stats.totalInterventions;
    document.getElementById('unique-intervenants').textContent = stats.uniqueIntervenants;
    document.getElementById('unique-types').textContent = stats.uniqueTypes;
    document.getElementById('period-days').textContent = stats.periodDays;

    // Générer les graphiques
    generateCategoryChart(stats.categoryDistribution);
    generateTypesChart(stats.typeDistribution);
    generateDatesChart(stats.datesDistribution);

    // Remplir les tableaux
    populateTopIntervenantsTable(stats.topIntervenants);
    populateTypesTable(stats.typeDistribution);
}

// Fonction pour calculer les statistiques
function calculateStats() {
    if (interventions.length === 0) {
        return {
            totalInterventions: 0,
            uniqueIntervenants: 0,
            uniqueTypes: 0,
            periodDays: 0,
            categoryDistribution: {},
            typeDistribution: {},
            datesDistribution: {},
            topIntervenants: [],
            startDate: null,
            endDate: null
        };
    }

    // Calculer les différentes statistiques
    const intervenantCounts = {};
    const typeCounts = {};
    const categoryCounts = {};
    const dateCounts = {};

    let startDate = null;
    let endDate = null;

    interventions.forEach(intervention => {
        // Compter les intervenants
        const fullName = intervention.fullName;
        intervenantCounts[fullName] = (intervenantCounts[fullName] || 0) + 1;

        // Compter les types de culte
        const cultType = intervention.cultType;
        typeCounts[cultType] = (typeCounts[cultType] || 0) + 1;

        // Déterminer la catégorie de l'intervenant
        const intervenant = intervenantsDB.find(i =>
            i.firstName === intervention.firstName && i.lastName === intervention.lastName
        );
        const category = intervenant ? intervenant.category : 'inconnue';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;

        // Compter par date
        const date = intervention.date;
        dateCounts[date] = (dateCounts[date] || 0) + 1;

        // Déterminer les dates de début et de fin
        if (!startDate || new Date(date) < new Date(startDate)) {
            startDate = date;
        }
        if (!endDate || new Date(date) > new Date(endDate)) {
            endDate = date;
        }
    });

    // Calculer le nombre de jours dans la période
    let periodDays = 0;
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        periodDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Convertir les objets de comptage en tableaux triés
    const topIntervenants = Object.entries(intervenantCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10

    const typeDistribution = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

    const datesDistribution = Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
        totalInterventions: interventions.length,
        uniqueIntervenants: Object.keys(intervenantCounts).length,
        uniqueTypes: Object.keys(typeCounts).length,
        periodDays: periodDays,
        categoryDistribution: categoryCounts,
        typeDistribution: typeDistribution,
        datesDistribution: datesDistribution,
        topIntervenants: topIntervenants,
        startDate: startDate,
        endDate: endDate
    };
}

// Fonction pour générer le graphique des catégories
function generateCategoryChart(categoryDistribution) {
    const ctx = document.getElementById('categoryChart').getContext('2d');

    // Libérer l'instance précédente du graphique si elle existe
    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }

    // Définir les couleurs pour chaque catégorie
    const categoryColors = {
        'clergy': '#FF6384',
        'members': '#36A2EB',
        'singers': '#FFCE56',
        'musicians': '#4BC0C0',
        'technical': '#9966FF',
        'volunteers': '#FF9F40',
        'inconnue': '#8A8A8A'
    };

    const labels = Object.keys(categoryDistribution);
    const data = Object.values(categoryDistribution);
    const backgroundColors = labels.map(category => categoryColors[category] || '#8A8A8A');

    window.categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Répartition par catégorie d\'intervenants'
                }
            }
        }
    });
}

// Fonction pour générer le graphique des types de culte
function generateTypesChart(typeDistribution) {
    const ctx = document.getElementById('typesChart').getContext('2d');

    // Libérer l'instance précédente du graphique si elle existe
    if (window.typesChartInstance) {
        window.typesChartInstance.destroy();
    }

    const labels = typeDistribution.map(item => item.type);
    const data = typeDistribution.map(item => item.count);

    window.typesChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre d\'interventions',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Répartition par type de culte'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour générer le graphique des dates
function generateDatesChart(datesDistribution) {
    const ctx = document.getElementById('datesChart').getContext('2d');

    // Libérer l'instance précédente du graphique si elle existe
    if (window.datesChartInstance) {
        window.datesChartInstance.destroy();
    }

    const labels = datesDistribution.map(item => item.date);
    const data = datesDistribution.map(item => item.count);

    window.datesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Nombre d\'interventions',
                data: data,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Activité par date'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fonction pour remplir le tableau des top intervenants
function populateTopIntervenantsTable(topIntervenants) {
    const tbody = document.getElementById('top-intervenants-body');
    tbody.innerHTML = '';

    const totalInterventions = interventions.length;

    topIntervenants.forEach(item => {
        const percentage = ((item.count / totalInterventions) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${getIntervenantCategory(item.name)}</td>
            <td>${item.count}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction pour obtenir la catégorie d'un intervenant
function getIntervenantCategory(fullName) {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length < 2) return 'inconnue';

    const firstName = nameParts.slice(0, -1).join(' '); // Tous les éléments sauf le dernier
    const lastName = nameParts[nameParts.length - 1]; // Dernier élément

    const intervenant = intervenantsDB.find(i =>
        i.firstName === firstName && i.lastName === lastName
    );

    return intervenant ? intervenant.category : 'inconnue';
}

// Fonction pour remplir le tableau des types de culte
function populateTypesTable(typeDistribution) {
    const tbody = document.getElementById('types-body');
    tbody.innerHTML = '';

    const totalInterventions = interventions.length;

    typeDistribution.forEach(item => {
        const percentage = ((item.count / totalInterventions) * 100).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.type}</td>
            <td>${item.count}</td>
            <td>${percentage}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Fonction pour exporter les statistiques
function exportStatsReport() {
    const stats = calculateStats();
    const date = new Date().toLocaleDateString('fr-FR');

    // Générer un contenu de rapport
    let reportContent = `RAPPORT STATISTIQUE - ${date}\n\n`;
    reportContent += `Période: ${stats.startDate} à ${stats.endDate}\n`;
    reportContent += `Nombre total d'interventions: ${stats.totalInterventions}\n`;
    reportContent += `Nombre d'intervenants uniques: ${stats.uniqueIntervenants}\n`;
    reportContent += `Nombre de types de culte: ${stats.uniqueTypes}\n\n`;

    reportContent += "Répartition par catégorie d'intervenants:\n";
    Object.entries(stats.categoryDistribution).forEach(([category, count]) => {
        const percentage = ((count / stats.totalInterventions) * 100).toFixed(1);
        reportContent += `  ${category}: ${count} (${percentage}%)\n`;
    });

    reportContent += "\nTop 10 des intervenants:\n";
    stats.topIntervenants.slice(0, 10).forEach((item, index) => {
        const percentage = ((item.count / stats.totalInterventions) * 100).toFixed(1);
        reportContent += `  ${index + 1}. ${item.name}: ${item.count} interventions (${percentage}%)\n`;
    });

    reportContent += "\nRépartition par type de culte:\n";
    stats.typeDistribution.forEach((item, index) => {
        const percentage = ((item.count / stats.totalInterventions) * 100).toFixed(1);
        reportContent += `  ${index + 1}. ${item.type}: ${item.count} (${percentage}%)\n`;
    });

    // Créer un fichier texte avec le rapport
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Créer un lien de téléchargement
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_Statistique_${date.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();

    // Nettoyer
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);

    showAlert('Rapport statistique exporté avec succès!', 'success');
}

// Fonction pour gérer le cache des données
const DataCache = {
    // Durée de vie du cache en millisecondes (24 heures)
    TTL: 24 * 60 * 60 * 1000,

    // Sauvegarder des données dans le cache
    set: function(key, data) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            ttl: this.TTL
        };
        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
            return true;
        } catch (e) {
            console.error('Erreur lors de la mise en cache:', e);
            return false;
        }
    },

    // Récupérer des données du cache
    get: function(key) {
        try {
            const cached = localStorage.getItem(`cache_${key}`);
            if (!cached) return null;

            const cacheEntry = JSON.parse(cached);
            const now = Date.now();

            // Vérifier si le cache est expiré
            if (now - cacheEntry.timestamp > cacheEntry.ttl) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }

            return cacheEntry.data;
        } catch (e) {
            console.error('Erreur lors de la récupération du cache:', e);
            return null;
        }
    },

    // Supprimer une entrée du cache
    remove: function(key) {
        try {
            localStorage.removeItem(`cache_${key}`);
            return true;
        } catch (e) {
            console.error('Erreur lors de la suppression du cache:', e);
            return false;
        }
    },

    // Nettoyer les entrées expirées
    cleanup: function() {
        const now = Date.now();
        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                try {
                    const cacheEntry = JSON.parse(localStorage.getItem(key));
                    if (now - cacheEntry.timestamp > cacheEntry.ttl) {
                        keysToRemove.push(key);
                    }
                } catch (e) {
                    // Si le parsing échoue, supprimer la clé
                    keysToRemove.push(key);
                }
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    // Vider le cache
    clear: function() {
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        }
    }
};

// Fonction pour charger les données avec mise en cache
function loadFromLocalStorageWithCache() {
    // Vérifier d'abord le cache
    const cachedData = DataCache.get('planningData');
    if (cachedData) {
        console.log('Données chargées depuis le cache');
        interventions = cachedData.interventions || [];
        intervenantsDB = cachedData.intervenantsDB || intervenantsDB;
        return true;
    }

    // Si pas de cache, charger depuis le stockage local
    try {
        const savedData = localStorage.getItem('planningData');
        if (savedData) {
            const data = JSON.parse(savedData);
            interventions = data.interventions || [];
            intervenantsDB = data.intervenantsDB || intervenantsDB;

            // Mettre en cache les données chargées
            DataCache.set('planningData', {
                interventions: interventions,
                intervenantsDB: intervenantsDB
            });

            console.log('Données chargées depuis le stockage local et mises en cache');
            return true;
        }
    } catch (e) {
        console.error('Erreur lors du chargement des données:', e);
    }

    return false;
}

// Fonction pour sauvegarder les données avec mise en cache
function saveToLocalStorageWithCache() {
    try {
        const data = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            savedAt: new Date().toISOString()
        };

        // Sauvegarder dans le stockage local
        localStorage.setItem('planningData', JSON.stringify(data));

        // Mettre à jour le cache
        DataCache.set('planningData', data);

        console.log('Données sauvegardées localement et mises en cache');
        return true;
    } catch (e) {
        console.error('Erreur lors de la sauvegarde des données:', e);
        return false;
    }
}

// Fonction pour charger les données depuis Supabase avec mise en cache
async function loadFromSupabaseWithCache() {
    // Vérifier d'abord le cache
    const cachedData = DataCache.get('supabaseData');
    if (cachedData && cachedData.lastSync) {
        // Vérifier si le cache est encore valide (moins de 5 minutes)
        const now = Date.now();
        const cacheTime = new Date(cachedData.lastSync).getTime();
        if (now - cacheTime < 5 * 60 * 1000) { // 5 minutes
            console.log('Données chargées depuis le cache Supabase');
            interventions = cachedData.interventions || [];
            intervenantsDB = cachedData.intervenantsDB || intervenantsDB;

            // Mettre à jour l'interface
            if(typeof updateInterventionsList === 'function') {
                updateInterventionsList();
            } else {
                // Si on est sur la page de rapport, rafraîchir l'affichage
                if(typeof updateFilterOptions === 'function' && typeof displayInterventions === 'function') {
                    updateFilterOptions();
                    displayInterventions(interventions);
                }
            }

            return true;
        }
    }

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
            if(typeof updateInterventionsList === 'function') {
                updateInterventionsList();
            } else {
                // Si on est sur la page de rapport, rafraîchir l'affichage
                if(typeof updateFilterOptions === 'function' && typeof displayInterventions === 'function') {
                    updateFilterOptions();
                    displayInterventions(interventions);
                }
            }

            // Mettre en cache les données
            DataCache.set('supabaseData', {
                interventions: interventions,
                intervenantsDB: intervenantsDB,
                lastSync: record.saved_at || new Date().toISOString()
            });

            console.log('Données chargées depuis Supabase et mises en cache');
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

// Fonction pour sauvegarder les données dans Supabase avec mise en cache
async function saveToSupabaseWithCache() {
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

        // Mettre en cache les données sauvegardées
        DataCache.set('supabaseData', {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            lastSync: new Date().toISOString()
        });

        console.log('Données sauvegardées dans Supabase et mises en cache');
        showAlert('Données publiées en ligne avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans Supabase:', error);

        // Si la sauvegarde échoue, stocker les données localement pour une synchronisation ultérieure
        storeOfflineData();

        // Afficher un message à l'utilisateur
        showAlert('Erreur de connexion. Les données sont sauvegardées localement et seront synchronisées quand la connexion sera rétablie.', 'warning');
    }
}

// Fonction pour stocker les données localement en cas de déconnexion
function storeOfflineData() {
    try {
        const offlineData = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('offlineData', JSON.stringify(offlineData));
        console.log('Données sauvegardées localement pour synchronisation ultérieure');

        // Mettre à jour l'indicateur de synchronisation
        updateSyncIndicator('offline');
    } catch (e) {
        console.error('Erreur lors de la sauvegarde des données hors ligne:', e);
    }
}

// Fonction pour synchroniser les données quand la connexion est rétablie
async function syncOfflineData() {
    try {
        const offlineData = localStorage.getItem('offlineData');
        if (!offlineData) {
            // Aucune donnée hors ligne à synchroniser
            return false;
        }

        const data = JSON.parse(offlineData);

        // Mettre à jour les données locales avec celles sauvegardées hors ligne
        interventions = data.interventions || interventions;
        intervenantsDB = data.intervenantsDB || intervenantsDB;

        // Essayer de synchroniser avec Supabase
        await saveToSupabaseWithCache();

        // Si la synchronisation réussit, supprimer les données hors ligne
        localStorage.removeItem('offlineData');

        // Mettre à jour l'interface
        updateInterventionsList();
        saveToLocalStorageWithCache();

        console.log('Données synchronisées avec succès');
        updateSyncIndicator('synced');

        showAlert('Données synchronisées avec le serveur.', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de la synchronisation des données hors ligne:', error);
        updateSyncIndicator('error');
        return false;
    }
}

// Fonction pour gérer les changements d'état de la connexion
function setupOfflineSync() {
    // Vérifier l'état initial de la connexion
    checkConnectionAndSync();

    // Écouter les événements de connexion/déconnexion
    window.addEventListener('online', function() {
        console.log('Connexion réseau rétablie');
        updateSyncIndicator('loading');
        setTimeout(() => {
            checkConnectionAndSync();
        }, 1000); // Délai pour permettre la restauration complète de la connexion
    });

    window.addEventListener('offline', function() {
        console.log('Connexion réseau perdue');
        updateSyncIndicator('offline');
        showAlert('Connexion perdue. Les modifications seront synchronisées quand la connexion sera rétablie.', 'warning');
    });
}

// Fonction pour vérifier la connexion et synchroniser si nécessaire
function checkConnectionAndSync() {
    if (navigator.onLine) {
        // Vérifier s'il y a des données hors ligne à synchroniser
        const offlineData = localStorage.getItem('offlineData');
        if (offlineData) {
            console.log('Données hors ligne détectées, tentative de synchronisation...');
            syncOfflineData();
        } else {
            // Charger les données depuis Supabase si la connexion est bonne
            loadFromSupabaseWithCache();
        }
    } else {
        updateSyncIndicator('offline');
    }
}

// Fonction pour vérifier périodiquement l'état de la connexion
function startConnectionMonitoring() {
    // Vérifier la connexion toutes les 30 secondes
    setInterval(() => {
        checkConnectionAndSync();
    }, 30000);
}

// Fonction pour optimiser les appels API en regroupant les modifications
let pendingChanges = [];
let isSyncScheduled = false;

// Fonction pour ajouter une modification à la liste des modifications en attente
function addPendingChange(changeType, data) {
    pendingChanges.push({
        type: changeType,
        data: data,
        timestamp: Date.now()
    });

    // Planifier la synchronisation si ce n'est pas déjà fait
    if (!isSyncScheduled) {
        isSyncScheduled = true;
        // Délai de 2 secondes pour regrouper les modifications
        setTimeout(batchSyncChanges, 2000);
    }
}

// Fonction pour synchroniser les modifications par lots
async function batchSyncChanges() {
    if (pendingChanges.length === 0) {
        isSyncScheduled = false;
        return;
    }

    console.log(`Synchronisation de ${pendingChanges.length} modifications en lot`);

    try {
        // Sauvegarder toutes les données en une seule opération
        await saveToSupabaseWithCache();

        // Réinitialiser la liste des modifications
        pendingChanges = [];

        console.log('Toutes les modifications synchronisées avec succès');
    } catch (error) {
        console.error('Erreur lors de la synchronisation par lots:', error);
        // Réessayer plus tard
        setTimeout(batchSyncChanges, 5000);
    } finally {
        isSyncScheduled = false;
    }
}

// Modification de la fonction addIntervention pour utiliser l'optimisation
function addInterventionOptimized() {
    if (!validateInterventionForm()) {
        return;
    }

    const intervention = getInterventionFromForm();

    // Sauvegarder l'état précédent pour l'historique
    const previousState = JSON.parse(JSON.stringify(interventions));

    interventions.push(intervention);

    updateInterventionsList();
    resetInterventionForm();
    saveToLocalStorageWithCache(); // Utiliser la version avec cache

    // Enregistrer dans l'historique
    saveToHistory('add', intervention, previousState);

    // Ajouter à la liste des modifications en attente au lieu de synchroniser immédiatement
    addPendingChange('add', intervention);

    showAlert('Intervention ajoutée avec succès!', 'success');
}

// Modification de la fonction deleteIntervention pour utiliser l'optimisation
function deleteInterventionOptimized(id) {
    if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
        // Sauvegarder l'état précédent pour l'historique
        const previousState = JSON.parse(JSON.stringify(interventions));

        const deletedIntervention = interventions.find(intervention => intervention.id === id);
        interventions = interventions.filter(intervention => intervention.id !== id);
        updateInterventionsList();
        saveToLocalStorageWithCache(); // Utiliser la version avec cache
        autoSyncToReport(); // Synchroniser avec la page de rapport

        // Enregistrer dans l'historique
        if (deletedIntervention) {
            saveToHistory('delete', deletedIntervention, previousState);
        }

        // Ajouter à la liste des modifications en attente au lieu de synchroniser immédiatement
        if (deletedIntervention) {
            addPendingChange('delete', deletedIntervention);
        }

        showAlert('Intervention supprimée.', 'warning');
    }
}

// Modification de la fonction clearAllInterventions pour utiliser l'optimisation
function clearAllInterventionsOptimized() {
    if (interventions.length === 0) return;

    if (confirm(`Voulez-vous vraiment supprimer toutes les ${interventions.length} interventions ?`)) {
        // Sauvegarder l'état précédent pour l'historique
        const previousState = JSON.parse(JSON.stringify(interventions));

        interventions = [];
        updateInterventionsList();
        saveToLocalStorageWithCache(); // Utiliser la version avec cache
        autoSyncToReport(); // Synchroniser avec la page de rapport

        // Enregistrer dans l'historique
        saveToHistory('clear', { count: previousState.length }, previousState);

        // Ajouter à la liste des modifications en attente au lieu de synchroniser immédiatement
        addPendingChange('clear', { count: previousState.length });

        showAlert('Toutes les interventions ont été supprimées.', 'warning');
    }
}

// Fonction pour compresser les données avant l'envoi
function compressData(data) {
    // Pour l'instant, une compression simple en supprimant les propriétés inutiles
    // Dans une implémentation réelle, on pourrait utiliser une bibliothèque de compression
    return JSON.stringify(data);
}

// Fonction pour décompresser les données après réception
function decompressData(compressedData) {
    // Pour l'instant, décompression simple
    // Dans une implémentation réelle, on pourrait utiliser une bibliothèque de compression
    return JSON.parse(compressedData);
}

// Fonction pour réduire la fréquence des appels API en utilisant un système de temporisation
let lastApiCallTime = 0;
const MIN_API_CALL_INTERVAL = 1000; // 1 seconde minimum entre les appels

async function throttledApiCall(apiFunction, ...args) {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCallTime;

    if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
        // Attendre avant d'appeler l'API
        await new Promise(resolve =>
            setTimeout(resolve, MIN_API_CALL_INTERVAL - timeSinceLastCall)
        );
    }

    lastApiCallTime = Date.now();
    return await apiFunction.apply(this, args);
}

// Version optimisée de la fonction de sauvegarde dans Supabase
async function saveToSupabaseOptimized() {
    return throttledApiCall(async () => {
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

            // Mettre en cache les données sauvegardées
            DataCache.set('supabaseData', {
                interventions: interventions,
                intervenantsDB: intervenantsDB,
                lastSync: new Date().toISOString()
            });

            console.log('Données sauvegardées dans Supabase et mises en cache');
            return { success: true, message: 'Données publiées en ligne avec succès !' };
        } catch (error) {
            console.error('Erreur lors de la sauvegarde dans Supabase:', error);

            // Si la sauvegarde échoue, stocker les données localement pour une synchronisation ultérieure
            storeOfflineData();

            return { success: false, message: 'Erreur de connexion. Les données sont sauvegardées localement et seront synchronisées quand la connexion sera rétablie.' };
        }
    });
}

// Fonction pour créer une sauvegarde des données
function createBackup() {
    try {
        const backupData = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify')?.value || '',
                otherPlace: document.getElementById('place-other-specify')?.value || ''
            },
            generalInfo: {
                churchName: document.getElementById('church-name')?.value || 'EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU DU BENIN',
                region: document.getElementById('region')?.value || 'ATACORA',
                section: document.getElementById('section')?.value || 'NATITINGOU',
                temple: document.getElementById('temple')?.value || 'BERACA',
                year: document.getElementById('year')?.value || '2025',
                quarter: document.getElementById('quarter')?.value || '4'
            },
            theme: document.body.className.replace('theme-', ''),
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        // Créer un fichier JSON avec les données de sauvegarde
        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Créer un lien de téléchargement
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_planification_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();

        // Nettoyer
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('Sauvegarde créée avec succès');
        showAlert('Sauvegarde créée avec succès!', 'success');
        return true;
    } catch (e) {
        console.error('Erreur lors de la création de la sauvegarde:', e);
        showAlert('Erreur lors de la création de la sauvegarde.', 'danger');
        return false;
    }
}

// Fonction pour restaurer les données à partir d'une sauvegarde
function restoreFromBackup(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);

                // Valider la structure du fichier de sauvegarde
                if (!backupData.interventions || !backupData.intervenantsDB || !backupData.version) {
                    throw new Error('Fichier de sauvegarde invalide');
                }

                // Restaurer les données
                interventions = backupData.interventions;
                intervenantsDB = backupData.intervenantsDB;

                // Mettre à jour l'interface
                updateInterventionsList();
                populateIntervenantsSelect();
                saveToLocalStorageWithCache();

                // Mettre à jour les configurations si elles sont présentes
                if (backupData.configurations) {
                    updateConfigurationFromBackup(backupData.configurations);
                }

                // Mettre à jour les informations générales si elles sont présentes
                if (backupData.generalInfo) {
                    updateGeneralInfoFromBackup(backupData.generalInfo);
                }

                // Restaurer le thème
                if (backupData.theme) {
                    changeTheme(backupData.theme);
                }

                console.log('Données restaurées avec succès');
                showAlert('Données restaurées avec succès!', 'success');

                // Synchroniser avec la page de rapport
                autoSyncToReport();

                resolve(true);
            } catch (error) {
                console.error('Erreur lors de la restauration:', error);
                showAlert('Erreur lors de la restauration des données: ' + error.message, 'danger');
                reject(error);
            }
        };

        reader.onerror = function() {
            reject(new Error('Erreur de lecture du fichier'));
        };

        reader.readAsText(file);
    });
}

// Fonction pour charger un fichier de sauvegarde via l'interface
function loadBackupFile() {
    // Créer un élément input de type file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            restoreFromBackup(file);
        }
    };

    input.click();
}

// Fonction pour mettre à jour les configurations à partir de la sauvegarde
function updateConfigurationFromBackup(configurations) {
    try {
        // Réinitialiser les cases à cocher
        document.querySelectorAll('input[id^="day-"]').forEach(checkbox => {
            checkbox.checked = configurations.days.includes(checkbox.value);
        });

        document.querySelectorAll('input[id^="type-"]').forEach(checkbox => {
            checkbox.checked = configurations.types.includes(checkbox.value);
        });

        document.querySelectorAll('input[id^="place-"]').forEach(checkbox => {
            checkbox.checked = configurations.places.includes(checkbox.value);
        });

        // Mettre à jour les valeurs "autre"
        if (configurations.otherType) {
            document.getElementById('type-other-specify').value = configurations.otherType;
            document.getElementById('type-other').checked = true;
            document.getElementById('type-other-specify').disabled = false;
        }

        if (configurations.otherPlace) {
            document.getElementById('place-other-specify').value = configurations.otherPlace;
            document.getElementById('place-other').checked = true;
            document.getElementById('place-other-specify').disabled = false;
        }

        // Mettre à jour les sélections dynamiques
        updateDynamicSelects();
    } catch (e) {
        console.error('Erreur lors de la mise à jour des configurations:', e);
    }
}

// Fonction pour mettre à jour les informations générales à partir de la sauvegarde
function updateGeneralInfoFromBackup(generalInfo) {
    try {
        if (generalInfo.churchName) document.getElementById('church-name').value = generalInfo.churchName;
        if (generalInfo.region) document.getElementById('region').value = generalInfo.region;
        if (generalInfo.section) document.getElementById('section').value = generalInfo.section;
        if (generalInfo.temple) document.getElementById('temple').value = generalInfo.temple;
        if (generalInfo.year) document.getElementById('year').value = generalInfo.year;
        if (generalInfo.quarter) document.getElementById('quarter').value = generalInfo.quarter;
    } catch (e) {
        console.error('Erreur lors de la mise à jour des informations générales:', e);
    }
}

// Fonction pour gérer les sauvegardes automatiques
function setupAutoBackup() {
    // Sauvegarder automatiquement toutes les 10 minutes
    setInterval(() => {
        // Ne sauvegarder que si des modifications ont été apportées
        if (interventions.length > 0) {
            // Stocker la dernière sauvegarde dans le localStorage
            const autoBackupData = {
                interventions: interventions,
                intervenantsDB: intervenantsDB,
                lastBackup: new Date().toISOString()
            };

            localStorage.setItem('autoBackup', JSON.stringify(autoBackupData));
            console.log('Sauvegarde automatique effectuée');
        }
    }, 10 * 60 * 1000); // 10 minutes

    // Charger la sauvegarde automatique au démarrage si elle existe
    loadAutoBackup();
}

// Fonction pour charger la sauvegarde automatique
function loadAutoBackup() {
    try {
        const autoBackupData = localStorage.getItem('autoBackup');
        if (autoBackupData) {
            const data = JSON.parse(autoBackupData);

            // Charger les données uniquement si elles sont plus récentes que la dernière sauvegarde
            interventions = data.interventions || interventions;
            intervenantsDB = data.intervenantsDB || intervenantsDB;

            console.log('Données de sauvegarde automatique chargées');

            // Mettre à jour l'interface
            updateInterventionsList();
            populateIntervenantsSelect();
        }
    } catch (e) {
        console.error('Erreur lors du chargement de la sauvegarde automatique:', e);
    }
}

// Fonction pour gérer la sauvegarde/restauration via une modale
function showBackupRestoreModal() {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('backupRestoreModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'backupRestoreModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Sauvegarde et Restauration des Données</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Sauvegarder les données</h6>
                                <p class="text-muted">Téléchargez un fichier contenant toutes vos interventions et configurations.</p>
                                <button class="btn btn-primary" id="create-backup-btn">
                                    <i class="fas fa-download me-2"></i>Créer une sauvegarde
                                </button>
                            </div>
                            <div class="col-md-6">
                                <h6>Restaurer les données</h6>
                                <p class="text-muted">Chargez un fichier de sauvegarde pour restaurer vos données.</p>
                                <input type="file" class="form-control mb-2" id="restore-file-input" accept=".json">
                                <button class="btn btn-success" id="restore-backup-btn">
                                    <i class="fas fa-upload me-2"></i>Restaurer à partir d'un fichier
                                </button>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-12">
                                <h6>Sauvegardes automatiques</h6>
                                <p class="text-muted">Des sauvegardes automatiques sont effectuées toutes les 10 minutes.</p>
                                <button class="btn btn-outline-info" id="load-auto-backup-btn">
                                    <i class="fas fa-history me-2"></i>Charger la dernière sauvegarde automatique
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événements pour la sauvegarde
        document.getElementById('create-backup-btn').addEventListener('click', function() {
            createBackup();
        });

        // Événements pour la restauration
        document.getElementById('restore-backup-btn').addEventListener('click', function() {
            const fileInput = document.getElementById('restore-file-input');
            if (fileInput.files.length > 0) {
                restoreFromBackup(fileInput.files[0])
                    .then(() => {
                        const bootstrapModal = bootstrap.Modal.getInstance(modal);
                        bootstrapModal.hide();
                    })
                    .catch(error => {
                        console.error('Erreur lors de la restauration:', error);
                    });
            } else {
                showAlert('Veuillez sélectionner un fichier de sauvegarde.', 'warning');
            }
        });

        // Événements pour la sauvegarde automatique
        document.getElementById('load-auto-backup-btn').addEventListener('click', function() {
            loadAutoBackup();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
            showAlert('Dernière sauvegarde automatique chargée.', 'info');
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour afficher l'assistant de configuration initiale
function showSetupAssistant() {
    // Vérifier si l'utilisateur a déjà effectué la configuration initiale
    const hasCompletedSetup = localStorage.getItem('hasCompletedInitialSetup') === 'true';

    // Créer la modale de l'assistant si elle n'existe pas
    let modal = document.getElementById('setupAssistantModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'setupAssistantModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Assistant de Configuration Initiale</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="setup-progress mb-4">
                            <div class="progress">
                                <div class="progress-bar" id="setup-progress-bar" role="progressbar" style="width: 0%"></div>
                            </div>
                            <div class="text-center mt-2">
                                <small id="setup-step-info">Étape 1 sur 5</small>
                            </div>
                        </div>

                        <div class="setup-step" id="step-1">
                            <h4><i class="fas fa-church me-2"></i>Informations de l'Église</h4>
                            <p class="text-muted">Veuillez entrer les informations de base de votre église</p>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="setup-church-name" class="form-label">Nom de l'église</label>
                                    <input type="text" class="form-control" id="setup-church-name" placeholder="Ex: Église Évangélique des Assemblées de Dieu">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="setup-region" class="form-label">Région</label>
                                    <input type="text" class="form-control" id="setup-region" placeholder="Ex: ATACORA">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="setup-section" class="form-label">Section</label>
                                    <input type="text" class="form-control" id="setup-section" placeholder="Ex: NATITINGOU">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label for="setup-temple" class="form-label">Temple</label>
                                    <input type="text" class="form-control" id="setup-temple" placeholder="Ex: BERACA">
                                </div>
                            </div>
                        </div>

                        <div class="setup-step d-none" id="step-2">
                            <h4><i class="fas fa-calendar-alt me-2"></i>Configuration du Planning</h4>
                            <p class="text-muted">Sélectionnez les jours, types de culte et lieux que vous utilisez habituellement</p>

                            <h6>Jours de la semaine</h6>
                            <div class="row mb-4" id="setup-days-container">
                                <!-- Les cases à cocher seront ajoutées dynamiquement -->
                            </div>

                            <h6>Types de culte</h6>
                            <div class="row mb-4" id="setup-types-container">
                                <!-- Les cases à cocher seront ajoutées dynamiquement -->
                            </div>

                            <h6>Lieux</h6>
                            <div class="row mb-4" id="setup-places-container">
                                <!-- Les cases à cocher seront ajoutées dynamiquement -->
                            </div>
                        </div>

                        <div class="setup-step d-none" id="step-3">
                            <h4><i class="fas fa-users me-2"></i>Intervenants</h4>
                            <p class="text-muted">Ajoutez les intervenants principaux de votre église</p>

                            <div class="mb-3">
                                <button class="btn btn-outline-primary" id="setup-add-intervenant-btn">
                                    <i class="fas fa-plus me-2"></i>Ajouter un intervenant
                                </button>
                            </div>

                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Titre</th>
                                            <th>Prénom</th>
                                            <th>Nom</th>
                                            <th>Catégorie</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="setup-intervenants-table-body">
                                        <!-- Les intervenants seront ajoutés ici -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="setup-step d-none" id="step-4">
                            <h4><i class="fas fa-palette me-2"></i>Apparence</h4>
                            <p class="text-muted">Choisissez le thème et l'apparence de l'application</p>

                            <div class="row">
                                <div class="col-md-6 mb-4">
                                    <h6>Thème par défaut</h6>
                                    <div class="theme-selector">
                                        <div class="theme-btn theme-light-btn" title="Clair" data-theme="light"></div>
                                        <div class="theme-btn theme-dark-btn" title="Sombre" data-theme="dark"></div>
                                        <div class="theme-btn theme-neon-btn" title="Néon" data-theme="neon"></div>
                                        <div class="theme-btn theme-galaxy-btn" title="Galaxie" data-theme="galaxy"></div>
                                        <div class="theme-btn theme-rainbow-btn" title="Arc-en-ciel" data-theme="rainbow"></div>
                                        <div class="theme-btn theme-high-contrast-btn" title="Contraste élevé" data-theme="high-contrast">HC</div>
                                        <div class="theme-btn theme-pastel-btn" title="Pastel" data-theme="pastel">P</div>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-4">
                                    <h6>Configuration avancée</h6>
                                    <button class="btn btn-outline-primary" id="setup-customize-theme-btn">
                                        <i class="fas fa-sliders-h me-2"></i>Personnaliser le thème
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="setup-step d-none" id="step-5">
                            <h4><i class="fas fa-check-circle me-2"></i>Terminer</h4>
                            <p class="text-muted">Votre configuration est presque terminée. Confirmez les paramètres et commencez à utiliser l'application.</p>

                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                Vous pouvez modifier ces paramètres à tout moment dans les sections appropriées de l'application.
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary d-none" id="setup-prev-btn">Précédent</button>
                        <button type="button" class="btn btn-primary" id="setup-next-btn">Suivant</button>
                        <button type="button" class="btn btn-success d-none" id="setup-finish-btn">Terminer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Initialiser les données pour l'assistant
        initializeSetupAssistant(modal);
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Afficher la première étape
    showSetupStep(1);
}

// Fonction pour initialiser les données de l'assistant de configuration
function initializeSetupAssistant(modal) {
    // Remplir les jours de la semaine
    const daysContainer = document.getElementById('setup-days-container');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    days.forEach(day => {
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-2';
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="setup-day-${day}" value="${day}">
                <label class="form-check-label" for="setup-day-${day}">${day}</label>
            </div>
        `;
        daysContainer.appendChild(col);
    });

    // Remplir les types de culte
    const typesContainer = document.getElementById('setup-types-container');
    const allCultTypes = [...new Set(Object.values(cultTypesByDay).flat())];

    allCultTypes.forEach(type => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-2';
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="setup-type-${type}" value="${type}">
                <label class="form-check-label" for="setup-type-${type}">${type}</label>
            </div>
        `;
        typesContainer.appendChild(col);
    });

    // Remplir les lieux par défaut
    const placesContainer = document.getElementById('setup-places-container');
    const defaultPlaces = ['BERACA', 'KPOTEYEI', 'GROS PORTEUR', 'WINKE'];

    defaultPlaces.forEach(place => {
        const col = document.createElement('div');
        col.className = 'col-md-3 mb-2';
        col.innerHTML = `
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="setup-place-${place}" value="${place}">
                <label class="form-check-label" for="setup-place-${place}">${place}</label>
            </div>
        `;
        placesContainer.appendChild(col);
    });

    // Événements pour les boutons de navigation
    document.getElementById('setup-prev-btn').addEventListener('click', function() {
        showPrevSetupStep();
    });

    document.getElementById('setup-next-btn').addEventListener('click', function() {
        showNextSetupStep();
    });

    document.getElementById('setup-finish-btn').addEventListener('click', function() {
        finishSetup();
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
    });

    // Événements pour les thèmes
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            // Stocker le thème sélectionné
            localStorage.setItem('selectedSetupTheme', theme);
        });
    });

    // Événement pour ajouter un intervenant
    document.getElementById('setup-add-intervenant-btn').addEventListener('click', function() {
        addIntervenantFromSetup();
    });

    // Événement pour personnaliser le thème
    document.getElementById('setup-customize-theme-btn').addEventListener('click', function() {
        showThemeCustomizationModal();
    });
}

// Variables pour suivre l'état de l'assistant
let currentSetupStep = 1;
const totalSetupSteps = 5;

// Fonction pour afficher une étape spécifique de l'assistant
function showSetupStep(step) {
    // Cacher toutes les étapes
    document.querySelectorAll('.setup-step').forEach(el => {
        el.classList.add('d-none');
    });

    // Afficher l'étape demandée
    document.getElementById(`step-${step}`).classList.remove('d-none');

    // Mettre à jour le bouton précédent
    const prevBtn = document.getElementById('setup-prev-btn');
    prevBtn.classList.toggle('d-none', step === 1);

    // Mettre à jour les boutons suivant/terminer
    const nextBtn = document.getElementById('setup-next-btn');
    const finishBtn = document.getElementById('setup-finish-btn');
    nextBtn.classList.toggle('d-none', step === totalSetupSteps);
    finishBtn.classList.toggle('d-none', step !== totalSetupSteps);

    // Mettre à jour la barre de progression
    const progressPercent = (step / totalSetupSteps) * 100;
    document.getElementById('setup-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('setup-step-info').textContent = `Étape ${step} sur ${totalSetupSteps}`;

    // Mettre à jour l'étape courante
    currentSetupStep = step;

    // Charger les données de l'étape si nécessaire
    loadSetupStepData(step);
}

// Fonction pour afficher l'étape suivante
function showNextSetupStep() {
    if (currentSetupStep < totalSetupSteps) {
        // Valider l'étape actuelle avant de passer à la suivante
        if (validateCurrentSetupStep()) {
            showSetupStep(currentSetupStep + 1);
        }
    }
}

// Fonction pour afficher l'étape précédente
function showPrevSetupStep() {
    if (currentSetupStep > 1) {
        showSetupStep(currentSetupStep - 1);
    }
}

// Fonction pour valider l'étape actuelle
function validateCurrentSetupStep() {
    switch(currentSetupStep) {
        case 1:
            // Valider les informations de l'église
            const churchName = document.getElementById('setup-church-name').value.trim();
            if (!churchName) {
                showAlert('Veuillez entrer le nom de l\'église.', 'warning');
                return false;
            }
            return true;
        case 2:
            // Pour cette étape, on ne fait pas de validation stricte
            return true;
        case 3:
            // Vérifier qu'il y a au moins un intervenant
            const intervenantsCount = document.querySelectorAll('#setup-intervenants-table-body tr').length;
            if (intervenantsCount === 0) {
                showAlert('Veuillez ajouter au moins un intervenant.', 'warning');
                return false;
            }
            return true;
        case 4:
            // Pour cette étape, on ne fait pas de validation stricte
            return true;
        default:
            return true;
    }
}

// Fonction pour charger les données de l'étape
function loadSetupStepData(step) {
    switch(step) {
        case 1:
            // Charger les informations de l'église si elles existent
            document.getElementById('setup-church-name').value = document.getElementById('church-name')?.value || '';
            document.getElementById('setup-region').value = document.getElementById('region')?.value || '';
            document.getElementById('setup-section').value = document.getElementById('section')?.value || '';
            document.getElementById('setup-temple').value = document.getElementById('temple')?.value || '';
            break;
        case 2:
            // Charger les configurations existantes
            loadSetupConfigurations();
            break;
        case 3:
            // Charger les intervenants existants
            loadSetupIntervenants();
            break;
        case 4:
            // Sélectionner le thème actuel
            selectCurrentTheme();
            break;
    }
}

// Fonction pour charger les configurations dans l'assistant
function loadSetupConfigurations() {
    // Cocher les jours existants
    document.querySelectorAll('input[id^="day-"]').forEach(checkbox => {
        const setupCheckbox = document.getElementById(`setup-day-${checkbox.value}`);
        if (setupCheckbox) {
            setupCheckbox.checked = checkbox.checked;
        }
    });

    // Cocher les types existants
    document.querySelectorAll('input[id^="type-"]').forEach(checkbox => {
        const setupCheckbox = document.getElementById(`setup-type-${checkbox.value}`);
        if (setupCheckbox) {
            setupCheckbox.checked = checkbox.checked;
        }
    });

    // Cocher les lieux existants
    document.querySelectorAll('input[id^="place-"]').forEach(checkbox => {
        const setupCheckbox = document.getElementById(`setup-place-${checkbox.value}`);
        if (setupCheckbox) {
            setupCheckbox.checked = checkbox.checked;
        }
    });
}

// Fonction pour charger les intervenants dans l'assistant
function loadSetupIntervenants() {
    const tbody = document.getElementById('setup-intervenants-table-body');
    tbody.innerHTML = '';

    intervenantsDB.forEach(intervenant => {
        addIntervenantToSetupTable(intervenant);
    });
}

// Fonction pour ajouter un intervenant à la table de l'assistant
function addIntervenantToSetupTable(intervenant) {
    const tbody = document.getElementById('setup-intervenants-table-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${intervenant.title}</td>
        <td>${intervenant.firstName}</td>
        <td>${intervenant.lastName}</td>
        <td>${intervenant.category}</td>
        <td>
            <button class="btn btn-sm btn-outline-danger setup-remove-intervenant" data-id="${intervenant.id}">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tbody.appendChild(row);

    // Ajouter l'événement de suppression
    row.querySelector('.setup-remove-intervenant').addEventListener('click', function() {
        const id = parseInt(this.getAttribute('data-id'));
        removeIntervenantFromSetup(id);
    });
}

// Fonction pour ajouter un intervenant depuis l'assistant
function addIntervenantFromSetup() {
    // Créer un formulaire modal pour ajouter un intervenant
    let modal = document.getElementById('addIntervenantSetupModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addIntervenantSetupModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Ajouter un intervenant</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="setup-intervenant-title" class="form-label">Titre</label>
                                <select class="form-select" id="setup-intervenant-title">
                                    <option value="Pasteur">Pasteur</option>
                                    <option value="Diacre">Diacre</option>
                                    <option value="Diacre">Diacre</option>
                                    <option value="Soeur">Soeur</option>
                                    <option value="Frère">Frère</option>
                                    <option value="Mr">Mr</option>
                                    <option value="Mme">Mme</option>
                                    <option value="Mlle">Mlle</option>
                                </select>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="setup-intervenant-firstname" class="form-label">Prénom</label>
                                <input type="text" class="form-control" id="setup-intervenant-firstname">
                            </div>
                            <div class="col-md-4 mb-3">
                                <label for="setup-intervenant-lastname" class="form-label">Nom</label>
                                <input type="text" class="form-control" id="setup-intervenant-lastname">
                            </div>
                            <div class="col-12 mb-3">
                                <label for="setup-intervenant-category" class="form-label">Catégorie</label>
                                <select class="form-select" id="setup-intervenant-category">
                                    <option value="clergy">Clergé</option>
                                    <option value="members">Membres</option>
                                    <option value="singers">Chanteurs</option>
                                    <option value="musicians">Musiciens</option>
                                    <option value="technical">Technique</option>
                                    <option value="volunteers">Bénévoles</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary" id="setup-save-intervenant">Ajouter</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événement pour sauvegarder l'intervenant
        document.getElementById('setup-save-intervenant').addEventListener('click', function() {
            const title = document.getElementById('setup-intervenant-title').value;
            const firstName = document.getElementById('setup-intervenant-firstname').value.trim();
            const lastName = document.getElementById('setup-intervenant-lastname').value.trim();
            const category = document.getElementById('setup-intervenant-category').value;

            if (!firstName || !lastName) {
                showAlert('Veuillez entrer le prénom et le nom.', 'warning');
                return;
            }

            // Créer l'intervenant
            const newIntervenant = {
                id: Date.now(),
                title: title,
                firstName: firstName,
                lastName: lastName,
                category: category
            };

            // Vérifier si l'intervenant existe déjà
            const exists = intervenantsDB.some(i =>
                i.firstName === firstName && i.lastName === lastName
            );

            if (exists) {
                showAlert('Cet intervenant existe déjà.', 'warning');
                return;
            }

            // Ajouter à la liste de l'assistant
            addIntervenantToSetupTable(newIntervenant);

            // Fermer la modale
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour supprimer un intervenant de l'assistant
function removeIntervenantFromSetup(id) {
    // Dans l'assistant, on ne supprime que de la table temporaire
    const row = document.querySelector(`.setup-remove-intervenant[data-id="${id}"]`).closest('tr');
    if (row) {
        row.remove();
    }
}

// Fonction pour sélectionner le thème actuel dans l'assistant
function selectCurrentTheme() {
    // Désélectionner tous les thèmes
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('selected'));

    // Sélectionner le thème actuel
    const currentTheme = document.body.className.replace('theme-', '');
    const currentThemeBtn = document.querySelector(`.theme-btn[data-theme="${currentTheme}"]`);
    if (currentThemeBtn) {
        currentThemeBtn.classList.add('selected');
    }
}

// Fonction pour terminer la configuration
function finishSetup() {
    // Récupérer les données de l'assistant et les appliquer
    applySetupData();

    // Marquer la configuration comme terminée
    localStorage.setItem('hasCompletedInitialSetup', 'true');

    // Afficher un message de confirmation
    showAlert('Configuration initiale terminée avec succès!', 'success');
}

// Fonction pour appliquer les données de l'assistant
function applySetupData() {
    // Appliquer les informations de l'église
    document.getElementById('church-name').value = document.getElementById('setup-church-name').value;
    document.getElementById('region').value = document.getElementById('setup-region').value;
    document.getElementById('section').value = document.getElementById('setup-section').value;
    document.getElementById('temple').value = document.getElementById('setup-temple').value;

    // Appliquer les configurations
    applySetupConfigurations();

    // Appliquer les intervenants
    applySetupIntervenants();

    // Appliquer le thème
    const selectedTheme = localStorage.getItem('selectedSetupTheme') || 'light';
    changeTheme(selectedTheme);

    // Sauvegarder les données
    saveToLocalStorageWithCache();

    // Mettre à jour l'interface
    updateDynamicSelects();
    populateIntervenantsSelect();
}

// Fonction pour appliquer les configurations de l'assistant
function applySetupConfigurations() {
    // Appliquer les jours cochés
    document.querySelectorAll('input[id^="setup-day-"]').forEach(setupCheckbox => {
        const actualCheckbox = document.getElementById(`day-${setupCheckbox.value}`);
        if (actualCheckbox) {
            actualCheckbox.checked = setupCheckbox.checked;
        }
    });

    // Appliquer les types cochés
    document.querySelectorAll('input[id^="setup-type-"]').forEach(setupCheckbox => {
        const actualCheckbox = document.getElementById(`type-${setupCheckbox.value}`);
        if (actualCheckbox) {
            actualCheckbox.checked = setupCheckbox.checked;
        }
    });

    // Appliquer les lieux cochés
    document.querySelectorAll('input[id^="setup-place-"]').forEach(setupCheckbox => {
        const actualCheckbox = document.getElementById(`place-${setupCheckbox.value}`);
        if (actualCheckbox) {
            actualCheckbox.checked = setupCheckbox.checked;
        }
    });
}

// Fonction pour appliquer les intervenants de l'assistant
function applySetupIntervenants() {
    // Récupérer les intervenants de la table de l'assistant
    const intervenantRows = document.querySelectorAll('#setup-intervenants-table-body tr');

    // Réinitialiser la base de données des intervenants
    intervenantsDB = [];

    // Ajouter chaque intervenant de la table à la base de données
    intervenantRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 4) { // S'assurer qu'il y a suffisamment de cellules
            const intervenant = {
                id: Date.now() + Math.random(), // Générer un ID unique
                title: cells[0].textContent,
                firstName: cells[1].textContent,
                lastName: cells[2].textContent,
                category: cells[3].textContent
            };

            intervenantsDB.push(intervenant);
        }
    });
}

// Fonction pour afficher les tooltips d'aide
function showTooltips() {
    // Définir les tooltips pour différents éléments
    const tooltips = [
        {
            selector: '#intervention-date',
            title: 'Sélectionnez la date de l\'intervention',
            content: 'Choisissez la date à laquelle l\'intervention aura lieu. La date par défaut est aujourd\'hui.'
        },
        {
            selector: '#intervention-place',
            title: 'Lieu de l\'intervention',
            content: 'Sélectionnez le lieu où se déroulera l\'intervention. Les lieux disponibles sont configurables dans les paramètres.'
        },
        {
            selector: '#cult-type-select',
            title: 'Type de culte',
            content: 'Choisissez le type de culte pour cette intervention. Les types disponibles dépendent du jour de la semaine.'
        },
        {
            selector: '#intervenant-firstname, #intervenant-lastname',
            title: 'Sélection de l\'intervenant',
            content: 'Sélectionnez l\'intervenant qui participera à cette intervention. Vous pouvez ajouter de nouveaux intervenants.'
        },
        {
            selector: '#add-intervention-btn',
            title: 'Ajouter l\'intervention',
            content: 'Cliquez pour ajouter cette intervention à la liste. L\'intervention sera sauvegardée automatiquement.'
        },
        {
            selector: '#publish-btn',
            title: 'Publier les données',
            content: 'Partagez les données actuelles avec un lien de publication. Les autres pourront voir les interventions planifiées.'
        },
        {
            selector: '.theme-btn',
            title: 'Changer de thème',
            content: 'Cliquez sur un thème pour changer l\'apparence de l\'application selon vos préférences.'
        }
    ];

    // Afficher les tooltips
    tooltips.forEach(tooltip => {
        const element = document.querySelector(tooltip.selector);
        if (element) {
            // Créer un tooltip Bootstrap
            new bootstrap.Tooltip(element, {
                title: tooltip.title,
                placement: 'top',
                trigger: 'hover focus'
            });

            // Ajouter un événement de clic pour un tooltip plus détaillé
            element.addEventListener('click', function() {
                showDetailedTooltip(tooltip.title, tooltip.content);
            });
        }
    });
}

// Fonction pour afficher un tooltip détaillé
function showDetailedTooltip(title, content) {
    // Créer une modale pour le tooltip détaillé
    let modal = document.getElementById('detailedTooltipModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'detailedTooltipModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="tooltipModalTitle">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body" id="tooltipModalBody">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" id="next-tutorial-step">Suivant</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Ajouter l'événement pour le tutoriel
        document.getElementById('next-tutorial-step').addEventListener('click', function() {
            startTutorial();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });
    }

    // Mettre à jour le contenu
    document.getElementById('tooltipModalTitle').textContent = title;
    document.getElementById('tooltipModalBody').innerHTML = content;

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour démarrer un tutoriel guidé
function startTutorial() {
    // Définir les étapes du tutoriel
    const tutorialSteps = [
        {
            element: '#intervention-date',
            title: 'Étape 1: Sélection de la date',
            content: 'Commencez par sélectionner la date de votre intervention. Cela déterminera le jour de la semaine et les types de culte disponibles.'
        },
        {
            element: '#intervention-place',
            title: 'Étape 2: Choix du lieu',
            content: 'Sélectionnez le lieu où se déroulera l\'intervention. Vous pouvez ajouter de nouveaux lieux dans les paramètres.'
        },
        {
            element: '#cult-type-select',
            title: 'Étape 3: Type de culte',
            content: 'Choisissez le type de culte approprié. Les options varient selon le jour de la semaine.'
        },
        {
            element: '#intervenant-firstname, #intervenant-lastname',
            title: 'Étape 4: Sélection de l\'intervenant',
            content: 'Sélectionnez l\'intervenant pour cette intervention. Utilisez les listes déroulantes pour trouver la personne.'
        },
        {
            element: '#add-intervention-btn',
            title: 'Étape 5: Ajouter l\'intervention',
            content: 'Cliquez sur ce bouton pour ajouter l\'intervention à votre planning. Elle sera sauvegardée automatiquement.'
        },
        {
            element: '#publish-btn',
            title: 'Étape 6: Partager vos données',
            content: 'Utilisez ce bouton pour publier vos interventions et les partager avec d\'autres utilisateurs via un lien.'
        }
    ];

    // Commencer le tutoriel
    runTutorial(tutorialSteps, 0);
}

// Fonction pour exécuter le tutoriel
function runTutorial(steps, currentStep) {
    if (currentStep >= steps.length) {
        // Fin du tutoriel
        showAlert('Félicitations! Vous avez terminé le tutoriel.', 'success');
        return;
    }

    const step = steps[currentStep];
    const element = document.querySelector(step.element);

    if (element) {
        // Faire défiler jusqu'à l'élément
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Créer un écran de surbrillance
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.zIndex = '9998';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        // Créer le panneau d'instructions
        const panel = document.createElement('div');
        panel.className = 'card';
        panel.style.position = 'relative';
        panel.style.zIndex = '9999';
        panel.style.maxWidth = '500px';
        panel.style.margin = '20px';
        panel.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${step.title}</h5>
                <p class="card-text">${step.content}</p>
                <div class="d-flex justify-content-between">
                    <button class="btn btn-secondary" id="prev-tutorial-btn" ${currentStep === 0 ? 'disabled' : ''}>Précédent</button>
                    <button class="btn btn-primary" id="next-tutorial-btn">${currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</button>
                </div>
            </div>
        `;

        // Positionner le panneau près de l'élément ciblé
        const rect = element.getBoundingClientRect();
        panel.style.position = 'fixed';
        panel.style.left = rect.left + window.scrollX + 'px';
        panel.style.top = (rect.top + window.scrollY - panel.offsetHeight - 10) + 'px';

        // Ajouter les éléments au DOM
        document.body.appendChild(overlay);
        document.body.appendChild(panel);

        // Événements pour les boutons
        document.getElementById('prev-tutorial-btn').addEventListener('click', function() {
            // Supprimer les éléments actuels
            document.body.removeChild(overlay);
            document.body.removeChild(panel);
            // Passer à l'étape précédente
            runTutorial(steps, currentStep - 1);
        });

        document.getElementById('next-tutorial-btn').addEventListener('click', function() {
            // Supprimer les éléments actuels
            document.body.removeChild(overlay);
            document.body.removeChild(panel);
            // Passer à l'étape suivante
            runTutorial(steps, currentStep + 1);
        });

        // Mettre en évidence l'élément ciblé
        element.style.outline = '3px solid #00b4d8';
        element.style.outlineOffset = '5px';
        element.style.position = 'relative';
        element.style.zIndex = '10000';

        // Fonction pour nettoyer le style de mise en évidence
        function cleanupHighlight() {
            element.style.outline = '';
            element.style.outlineOffset = '';
            element.style.position = '';
            element.style.zIndex = '';
        }

        // Nettoyer le style de mise en évidence quand on quitte le tutoriel
        overlay.addEventListener('click', function() {
            document.body.removeChild(overlay);
            document.body.removeChild(panel);
            cleanupHighlight();
        });
    } else {
        // Passer à l'étape suivante si l'élément n'est pas trouvé
        runTutorial(steps, currentStep + 1);
    }
}

// Fonction pour afficher l'aide contextuelle
function showContextualHelp(elementId) {
    const helpContent = {
        'intervention-date': {
            title: 'Aide: Sélection de la date',
            content: 'Utilisez le sélecteur de date pour choisir quand l\'intervention aura lieu. La date par défaut est aujourd\'hui, mais vous pouvez naviguer dans le calendrier pour sélectionner une autre date.'
        },
        'intervention-place': {
            title: 'Aide: Sélection du lieu',
            content: 'Choisissez le lieu de l\'intervention parmi les options configurées. Si le lieu dont vous avez besoin n\'est pas disponible, vous pouvez l\'ajouter dans les paramètres de configuration.'
        },
        'cult-type-select': {
            title: 'Aide: Type de culte',
            content: 'Sélectionnez le type de culte approprié. Les options disponibles dépendent du jour de la semaine sélectionné. Par exemple, le dimanche propose généralement plus d\'options que les autres jours.'
        },
        'intervenant-firstname': {
            title: 'Aide: Sélection de l\'intervenant',
            content: 'Sélectionnez l\'intervenant à l\'aide des listes déroulantes. Vous pouvez filtrer par prénom et nom. Si l\'intervenant n\'existe pas, vous pouvez l\'ajouter en utilisant le bouton "Ajouter un intervenant".'
        },
        'add-intervention-btn': {
            title: 'Aide: Ajout d\'intervention',
            content: 'Une fois que vous avez rempli tous les champs requis, cliquez sur ce bouton pour ajouter l\'intervention à votre planning. L\'intervention est automatiquement sauvegardée.'
        },
        'publish-btn': {
            title: 'Aide: Publication des données',
            content: 'Utilisez ce bouton pour créer un lien de partage de vos interventions planifiées. Les autres utilisateurs peuvent accéder à ces données via le lien généré.'
        }
    };

    const help = helpContent[elementId];
    if (help) {
        showDetailedTooltip(help.title, help.content);
    }
}

// Fonction pour initialiser les fonctionnalités d'aide
function initializeHelpFeatures() {
    // Ajouter des événements d'aide contextuelle aux éléments pertinents
    const helpElements = [
        'intervention-date',
        'intervention-place',
        'cult-type-select',
        'intervenant-firstname',
        'add-intervention-btn',
        'publish-btn'
    ];

    helpElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            // Ajouter un événement de clic pour l'aide contextuelle
            element.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                showContextualHelp(elementId);
            });

            // Ajouter un tooltip Bootstrap
            new bootstrap.Tooltip(element, {
                title: 'Cliquez avec le bouton droit pour de l\'aide',
                placement: 'top'
            });
        }
    });

    // Afficher les tooltips au chargement
    showTooltips();
}

// Fonction pour activer la recherche avancée
function enableAdvancedSearch() {
    // Créer l'interface de recherche avancée si elle n'existe pas
    let searchContainer = document.getElementById('advanced-search-container');
    if (!searchContainer) {
        searchContainer = document.createElement('div');
        searchContainer.id = 'advanced-search-container';
        searchContainer.className = 'advanced-search-container mt-3 p-3 border rounded bg-light d-none';
        searchContainer.innerHTML = `
            <h6><i class="fas fa-search me-2"></i>Recherche Avancée</h6>
            <div class="row">
                <div class="col-md-3 mb-2">
                    <label for="search-intervenant" class="form-label">Intervenant</label>
                    <input type="text" class="form-control" id="search-intervenant" placeholder="Nom de l'intervenant">
                </div>
                <div class="col-md-3 mb-2">
                    <label for="search-cult-type" class="form-label">Type de culte</label>
                    <select class="form-select" id="search-cult-type">
                        <option value="">Tous les types</option>
                    </select>
                </div>
                <div class="col-md-3 mb-2">
                    <label for="search-place" class="form-label">Lieu</label>
                    <select class="form-select" id="search-place">
                        <option value="">Tous les lieux</option>
                    </option>
                </div>
                <div class="col-md-3 mb-2">
                    <label for="search-category" class="form-label">Catégorie</label>
                    <select class="form-select" id="search-category">
                        <option value="">Toutes les catégories</option>
                        <option value="clergy">Clergé</option>
                        <option value="members">Membres</option>
                        <option value="singers">Chanteurs</option>
                        <option value="musicians">Musiciens</option>
                        <option value="technical">Technique</option>
                        <option value="volunteers">Bénévoles</option>
                    </select>
                </div>
                <div class="col-md-6 mb-2">
                    <label for="search-date-from" class="form-label">Date de début</label>
                    <input type="date" class="form-control" id="search-date-from">
                </div>
                <div class="col-md-6 mb-2">
                    <label for="search-date-to" class="form-label">Date de fin</label>
                    <input type="date" class="form-control" id="search-date-to">
                </div>
                <div class="col-md-12 mb-2">
                    <label for="search-theme" class="form-label">Thème</label>
                    <input type="text" class="form-control" id="search-theme" placeholder="Mot-clé dans le thème">
                </div>
                <div class="col-md-12">
                    <div class="d-flex justify-content-between">
                        <div>
                            <button class="btn btn-outline-secondary" id="clear-advanced-search">
                                <i class="fas fa-eraser me-2"></i>Effacer
                            </button>
                        </div>
                        <div>
                            <button class="btn btn-primary" id="apply-advanced-search">
                                <i class="fas fa-search me-2"></i>Appliquer la recherche
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.querySelector('.main-card .card-body').prepend(searchContainer);

        // Remplir les sélections avec les données existantes
        populateSearchSelects();

        // Ajouter les événements
        document.getElementById('apply-advanced-search').addEventListener('click', function() {
            performAdvancedSearch();
        });

        document.getElementById('clear-advanced-search').addEventListener('click', function() {
            clearAdvancedSearch();
        });
    }

    // Afficher/masquer le conteneur de recherche
    searchContainer.classList.toggle('d-none');
}

// Fonction pour remplir les sélections de recherche
function populateSearchSelects() {
    const cultTypeSelect = document.getElementById('search-cult-type');
    const placeSelect = document.getElementById('search-place');

    // Récupérer les types de culte uniques
    const cultTypes = [...new Set(interventions.map(i => i.cultType))].filter(Boolean);
    cultTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        cultTypeSelect.appendChild(option);
    });

    // Récupérer les lieux uniques
    const places = [...new Set(interventions.map(i => i.place))].filter(Boolean);
    places.forEach(place => {
        const option = document.createElement('option');
        option.value = place;
        option.textContent = place;
        placeSelect.appendChild(option);
    });
}

// Fonction pour effectuer la recherche avancée
function performAdvancedSearch() {
    const searchParams = {
        intervenant: document.getElementById('search-intervenant').value.trim().toLowerCase(),
        cultType: document.getElementById('search-cult-type').value,
        place: document.getElementById('search-place').value,
        category: document.getElementById('search-category').value,
        dateFrom: document.getElementById('search-date-from').value,
        dateTo: document.getElementById('search-date-to').value,
        theme: document.getElementById('search-theme').value.trim().toLowerCase()
    };

    // Filtrer les interventions
    let filteredInterventions = [...interventions];

    if (searchParams.intervenant) {
        filteredInterventions = filteredInterventions.filter(i =>
            i.fullName.toLowerCase().includes(searchParams.intervenant)
        );
    }

    if (searchParams.cultType) {
        filteredInterventions = filteredInterventions.filter(i => i.cultType === searchParams.cultType);
    }

    if (searchParams.place) {
        filteredInterventions = filteredInterventions.filter(i => i.place === searchParams.place);
    }

    if (searchParams.category) {
        const intervenant = intervenantsDB.find(iv =>
            iv.firstName === i.firstName && iv.lastName === i.lastName
        );
        filteredInterventions = filteredInterventions.filter(i => {
            const iv = intervenantsDB.find(iv => iv.firstName === i.firstName && iv.lastName === i.lastName);
            return iv && iv.category === searchParams.category;
        });
    }

    if (searchParams.dateFrom) {
        filteredInterventions = filteredInterventions.filter(i => i.date >= searchParams.dateFrom);
    }

    if (searchParams.dateTo) {
        filteredInterventions = filteredInterventions.filter(i => i.date <= searchParams.dateTo);
    }

    if (searchParams.theme) {
        filteredInterventions = filteredInterventions.filter(i =>
            i.theme && i.theme.toLowerCase().includes(searchParams.theme)
        );
    }

    // Afficher les interventions filtrées
    displayInterventions(filteredInterventions);

    // Afficher un message de statut
    showAlert(`${filteredInterventions.length} intervention(s) trouvée(s) sur ${interventions.length} au total.`, 'info');
}

// Fonction pour effacer la recherche avancée
function clearAdvancedSearch() {
    document.getElementById('search-intervenant').value = '';
    document.getElementById('search-cult-type').value = '';
    document.getElementById('search-place').value = '';
    document.getElementById('search-category').value = '';
    document.getElementById('search-date-from').value = '';
    document.getElementById('search-date-to').value = '';
    document.getElementById('search-theme').value = '';

    // Réinitialiser l'affichage
    displayInterventions(interventions);
    showAlert('Filtres de recherche effacés.', 'info');
}

// Fonction pour activer la recherche instantanée
function enableLiveSearch() {
    // Écouter les changements dans le champ de recherche principal
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let timeout;
        searchInput.addEventListener('input', function() {
            // Définir un délai pour éviter les recherches trop fréquentes
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const searchTerm = this.value.trim().toLowerCase();
                if (searchTerm) {
                    // Effectuer la recherche
                    const filteredInterventions = interventions.filter(i =>
                        i.fullName.toLowerCase().includes(searchTerm) ||
                        i.cultType.toLowerCase().includes(searchTerm) ||
                        i.place.toLowerCase().includes(searchTerm) ||
                        (i.theme && i.theme.toLowerCase().includes(searchTerm))
                    );

                    displayInterventions(filteredInterventions);
                    showAlert(`${filteredInterventions.length} résultat(s) trouvé(s) pour "${searchTerm}".`, 'info');
                } else {
                    // Afficher toutes les interventions si le champ est vide
                    displayInterventions(interventions);
                }
            }, 300); // Délai de 300ms pour éviter les recherches trop fréquentes
        });
    }
}

// Fonction pour trier les interventions
function sortInterventions(sortBy, order = 'asc') {
    const sortedInterventions = [...interventions];

    switch(sortBy) {
        case 'date':
            sortedInterventions.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return order === 'asc' ? dateA - dateB : dateB - dateA;
            });
            break;
        case 'intervenant':
            sortedInterventions.sort((a, b) => {
                const nameA = a.fullName.toLowerCase();
                const nameB = b.fullName.toLowerCase();
                return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
            });
            break;
        case 'cultType':
            sortedInterventions.sort((a, b) => {
                const typeA = a.cultType.toLowerCase();
                const typeB = b.cultType.toLowerCase();
                return order === 'asc' ? typeA.localeCompare(typeB) : typeB.localeCompare(typeA);
            });
            break;
        case 'place':
            sortedInterventions.sort((a, b) => {
                const placeA = a.place.toLowerCase();
                const placeB = b.place.toLowerCase();
                return order === 'asc' ? placeA.localeCompare(placeB) : placeB.localeCompare(placeA);
            });
            break;
        default:
            // Aucun tri, retourner les interventions dans l'ordre original
            break;
    }

    return sortedInterventions;
}

// Fonction pour afficher les interventions avec options de tri
function displayInterventionsWithSort(interventionsToShow, sortBy = 'date', order = 'asc') {
    const sortedInterventions = sortInterventions(sortBy, order);
    displayInterventions(sortedInterventions);
}

// Fonction pour activer les options de tri
function enableSortingOptions() {
    // Créer les options de tri si elles n'existent pas
    let sortContainer = document.getElementById('sort-options-container');
    if (!sortContainer) {
        sortContainer = document.createElement('div');
        sortContainer.id = 'sort-options-container';
        sortContainer.className = 'sort-options-container mb-3';
        sortContainer.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <label for="sort-by" class="form-label">Trier par</label>
                    <select class="form-select" id="sort-by">
                        <option value="date">Date</option>
                        <option value="intervenant">Intervenant</option>
                        <option value="cultType">Type de culte</option>
                        <option value="place">Lieu</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label for="sort-order" class="form-label">Ordre</label>
                    <select class="form-select" id="sort-order">
                        <option value="asc">Croissant</option>
                        <option value="desc">Décroissant</option>
                    </select>
                </div>
            </div>
        `;

        // Insérer après le champ de recherche s'il existe
        const searchInput = document.querySelector('.main-card .card-body').firstChild;
        if (searchInput) {
            searchInput.parentNode.insertBefore(sortContainer, searchInput.nextSibling);
        } else {
            document.querySelector('.main-card .card-body').appendChild(sortContainer);
        }

        // Ajouter l'événement de changement
        document.getElementById('sort-by').addEventListener('change', function() {
            const sortBy = this.value;
            const order = document.getElementById('sort-order').value;
            displayInterventionsWithSort(interventions, sortBy, order);
        });

        document.getElementById('sort-order').addEventListener('change', function() {
            const sortBy = document.getElementById('sort-by').value;
            const order = this.value;
            displayInterventionsWithSort(interventions, sortBy, order);
        });
    }
}

// Fonction pour activer les filtres de plage de dates
function enableDateRangeFilters() {
    // Cette fonctionnalité est déjà incluse dans la recherche avancée
    // mais on peut ajouter des raccourcis pour des plages de dates prédéfinies
    const dateFilterContainer = document.createElement('div');
    dateFilterContainer.className = 'date-filter-shortcuts mt-2';
    dateFilterContainer.innerHTML = `
        <small>Filtres rapides: </small>
        <button class="btn btn-sm btn-outline-primary" data-range="today">Aujourd'hui</button>
        <button class="btn btn-sm btn-outline-primary" data-range="week">Cette semaine</button>
        <button class="btn btn-sm btn-outline-primary" data-range="month">Ce mois</button>
        <button class="btn btn-sm btn-outline-primary" data-range="quarter">Ce trimestre</button>
    `;

    // Ajouter les événements pour les filtres rapides
    dateFilterContainer.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function() {
            const range = this.getAttribute('data-range');
            applyDateRangeFilter(range);
        });
    });

    // Ajouter le conteneur à l'interface
    const searchContainer = document.getElementById('advanced-search-container');
    if (searchContainer) {
        searchContainer.appendChild(dateFilterContainer);
    }
}

// Fonction pour appliquer un filtre de plage de dates prédéfini
function applyDateRangeFilter(range) {
    const today = new Date();
    let startDate, endDate;

    switch(range) {
        case 'today':
            startDate = today.toISOString().split('T')[0];
            endDate = startDate;
            break;
        case 'week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche
            startDate = startOfWeek.toISOString().split('T')[0];
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Samedi
            endDate = endOfWeek.toISOString().split('T')[0];
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
            break;
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
            endDate = new Date(today.getFullYear(), (quarter * 3) + 3, 0).toISOString().split('T')[0];
            break;
        default:
            return;
    }

    // Mettre à jour les champs de date
    document.getElementById('search-date-from').value = startDate;
    document.getElementById('search-date-to').value = endDate;

    // Appliquer la recherche
    performAdvancedSearch();
}

// Fonction pour activer la recherche par correspondance exacte
function enableExactMatchSearch() {
    // Ajouter une option pour la recherche par correspondance exacte
    const exactMatchContainer = document.createElement('div');
    exactMatchContainer.className = 'exact-match-option mt-2';
    exactMatchContainer.innerHTML = `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" id="exact-match-checkbox">
            <label class="form-check-label" for="exact-match-checkbox">
                Correspondance exacte
            </label>
        </div>
    `;

    // Ajouter le conteneur à l'interface
    const searchContainer = document.getElementById('advanced-search-container');
    if (searchContainer) {
        const formGroup = searchContainer.querySelector('.row');
        if (formGroup) {
            formGroup.appendChild(exactMatchContainer);
        }
    }
}

// Fonction pour exporter les données au format CSV
function exportToCSV() {
    // Créer l'en-tête du fichier CSV
    let csvContent = 'Date,Jour,Type de culte,Lieu,Thème,Intervenant,Catégorie,Observations\n';

    // Ajouter chaque intervention au format CSV
    interventions.forEach(intervention => {
        // Obtenir la catégorie de l'intervenant
        const intervenant = intervenantsDB.find(iv =>
            iv.firstName === intervention.firstName && iv.lastName === intervention.lastName
        );
        const category = intervenant ? intervenant.category : 'inconnue';

        // Échapper les valeurs contenant des virgules ou des retours à la ligne
        const values = [
            `"${intervention.date.replace(/"/g, '""')}"`,
            `"${intervention.dayOfWeek.replace(/"/g, '""')}"`,
            `"${intervention.cultType.replace(/"/g, '""')}"`,
            `"${intervention.place.replace(/"/g, '""')}"`,
            `"${(intervention.theme || '').replace(/"/g, '""')}"`,
            `"${intervention.fullName.replace(/"/g, '""')}"`,
            `"${category.replace(/"/g, '""')}"`,
            `"${(intervention.observations || '').replace(/"/g, '""')}"`
        ];

        csvContent += values.join(',') + '\n';
    });

    // Créer un objet Blob avec le contenu CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Créer un lien de téléchargement
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `planning_interventions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAlert('Données exportées au format CSV avec succès!', 'success');
}

// Fonction pour importer des données depuis un fichier CSV
function importFromCSV(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function(e) {
            try {
                const csvData = e.target.result;
                const lines = csvData.split('\n');

                // Vérifier que le fichier contient l'en-tête attendu
                const headers = lines[0].trim().split(',');
                if (!headers.includes('Date') || !headers.includes('Intervenant')) {
                    throw new Error('Format de fichier CSV invalide');
                }

                // Extraire les interventions à partir des lignes de données
                const importedInterventions = [];

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue; // Sauter les lignes vides

                    // Parser la ligne CSV (gérer les cas où les champs contiennent des virgules)
                    const values = parseCSVLine(line);

                    if (values.length >= 6) { // Vérifier qu'il y a suffisamment de colonnes
                        const intervention = {
                            id: Date.now() + i, // Générer un ID unique
                            date: values[0].replace(/"/g, ''),
                            dayOfWeek: values[1].replace(/"/g, ''),
                            cultType: values[2].replace(/"/g, ''),
                            place: values[3].replace(/"/g, ''),
                            theme: values[4].replace(/"/g, ''),
                            fullName: values[5].replace(/"/g, ''),
                            observations: values[7] ? values[7].replace(/"/g, '') : ''
                        };

                        // Extraire prénom et nom de l'intervenant
                        const nameParts = intervention.fullName.split(' ');
                        if (nameParts.length >= 2) {
                            intervention.firstName = nameParts[0];
                            intervention.lastName = nameParts.slice(1).join(' ');
                        } else {
                            intervention.firstName = intervention.fullName;
                            intervention.lastName = '';
                        }

                        importedInterventions.push(intervention);
                    }
                }

                // Ajouter les interventions importées à la liste existante
                interventions = [...interventions, ...importedInterventions];

                // Mettre à jour l'interface
                updateInterventionsList();
                saveToLocalStorageWithCache();

                showAlert(`Importation terminée: ${importedInterventions.length} interventions ajoutées.`, 'success');
                resolve(importedInterventions.length);
            } catch (error) {
                console.error('Erreur lors de l\'importation du fichier CSV:', error);
                showAlert('Erreur lors de l\'importation du fichier CSV: ' + error.message, 'danger');
                reject(error);
            }
        };

        reader.onerror = function() {
            reject(new Error('Erreur de lecture du fichier'));
        };

        reader.readAsText(file);
    });
}

// Fonction utilitaire pour parser une ligne CSV
function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    values.push(currentValue);
    return values;
}

// Fonction pour exporter les données au format Excel (XLSX)
function exportToExcel() {
    // Pour exporter au format Excel, nous devons utiliser une bibliothèque tierce
    // Comme nous n'avons pas accès à des bibliothèques externes ici,
    // nous allons générer un fichier CSV qui peut être ouvert dans Excel

    exportToCSV(); // Réutiliser la fonction d'export CSV qui fonctionne avec Excel

    // Dans une implémentation complète, on utiliserait une bibliothèque comme SheetJS
    // pour générer un fichier XLSX réel avec mise en forme
}

// Fonction pour importer des données depuis un fichier Excel (XLSX)
function importFromExcel(file) {
    // Pour l'importation Excel, nous devons utiliser une bibliothèque tierce
    // Comme nous n'avons pas accès à des bibliothèques externes ici,
    // nous allons traiter le fichier comme un CSV

    // Vérifier l'extension du fichier
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Dans une implémentation complète, on utiliserait une bibliothèque comme SheetJS
        // pour lire le fichier Excel réellement
        showAlert('Le format Excel n\'est pas entièrement supporté dans cette version. Veuillez utiliser le format CSV.', 'warning');
        return Promise.reject(new Error('Format Excel non supporté'));
    } else if (file.name.endsWith('.csv')) {
        return importFromCSV(file);
    } else {
        return Promise.reject(new Error('Format de fichier non supporté'));
    }
}

// Fonction pour exporter les données au format PDF
function exportToPDF() {
    // Utiliser la fonction existante de génération de PDF
    if (typeof generatePDFReport === 'function') {
        generatePDFReport(interventions, {}, `Planning_Interventions_${new Date().toISOString().slice(0, 10)}`);
    } else {
        showAlert('La fonction d\'export PDF n\'est pas disponible.', 'danger');
    }
}

// Fonction pour gérer l'import de fichiers
function handleFileImport() {
    // Créer un élément input de type file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';

    input.onchange = function(event) {
        const file = event.target.files[0];
        if (file) {
            // Déterminer le type de fichier et appeler la fonction appropriée
            if (file.name.endsWith('.csv')) {
                importFromCSV(file);
            } else {
                importFromExcel(file);
            }
        }
    };

    input.click();
}

// Fonction pour afficher la modale d'import/export
function showImportExportModal() {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('importExportModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'importExportModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Import/Export de Données</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6 mb-4">
                                <h6>Exporter les données</h6>
                                <p class="text-muted">Téléchargez vos données dans différents formats</p>

                                <button class="btn btn-success w-100 mb-2" id="export-csv-btn">
                                    <i class="fas fa-file-csv me-2"></i>Exporter en CSV
                                </button>

                                <button class="btn btn-success w-100 mb-2" id="export-excel-btn">
                                    <i class="fas fa-file-excel me-2"></i>Exporter en Excel
                                </button>

                                <button class="btn btn-success w-100 mb-2" id="export-pdf-btn">
                                    <i class="fas fa-file-pdf me-2"></i>Exporter en PDF
                                </button>
                            </div>

                            <div class="col-md-6 mb-4">
                                <h6>Importer les données</h6>
                                <p class="text-muted">Chargez des données depuis un fichier</p>

                                <input type="file" class="form-control mb-2" id="import-file-input" accept=".csv,.xlsx,.xls">

                                <button class="btn btn-primary w-100" id="import-file-btn">
                                    <i class="fas fa-upload me-2"></i>Importer à partir d'un fichier
                                </button>

                                <div class="mt-3">
                                    <h6>Formats supportés</h6>
                                    <ul class="list-unstyled">
                                        <li><i class="fas fa-check text-success me-2"></i>CSV (Valeurs séparées par des virgules)</li>
                                        <li><i class="fas fa-check text-success me-2"></i>Excel (XLSX, XLS)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            L'importation de données ajoutera les nouvelles interventions à celles existantes.
                            Les doublons ne sont pas automatiquement détectés.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événements pour l'export
        document.getElementById('export-csv-btn').addEventListener('click', function() {
            exportToCSV();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });

        document.getElementById('export-excel-btn').addEventListener('click', function() {
            exportToExcel();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });

        document.getElementById('export-pdf-btn').addEventListener('click', function() {
            exportToPDF();
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });

        // Événements pour l'import
        document.getElementById('import-file-btn').addEventListener('click', function() {
            const fileInput = document.getElementById('import-file-input');
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                handleFileImportManually(file)
                    .then(() => {
                        const bootstrapModal = bootstrap.Modal.getInstance(modal);
                        bootstrapModal.hide();
                    })
                    .catch(error => {
                        console.error('Erreur lors de l\'importation:', error);
                    });
            } else {
                showAlert('Veuillez sélectionner un fichier à importer.', 'warning');
            }
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction utilitaire pour gérer l'import manuel de fichier
function handleFileImportManually(file) {
    return new Promise((resolve, reject) => {
        // Déterminer le type de fichier et appeler la fonction appropriée
        if (file.name.endsWith('.csv')) {
            importFromCSV(file)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                });
        } else {
            importFromExcel(file)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(error);
                });
        }
    });
}

// Fonction pour détecter les conflits de planning
function detectPlanningConflicts() {
    const conflicts = [];

    // Vérifier les conflits d'intervenants (mêmes intervenants à la même date/heure)
    for (let i = 0; i < interventions.length; i++) {
        for (let j = i + 1; j < interventions.length; j++) {
            const intervention1 = interventions[i];
            const intervention2 = interventions[j];

            // Vérifier si c'est le même intervenant à la même date
            if (intervention1.date === intervention2.date &&
                intervention1.fullName === intervention2.fullName) {

                // Vérifier s'ils sont dans le même lieu ou pas
                if (intervention1.place === intervention2.place) {
                    // Même lieu - conflit de disponibilité
                    conflicts.push({
                        type: 'availability',
                        message: `Même intervenant (${intervention1.fullName}) prévu à ${intervention1.place} pour deux interventions différentes le ${intervention1.date}`,
                        interventions: [intervention1, intervention2],
                        dates: [intervention1.date]
                    });
                } else {
                    // Lieux différents - conflit de présence
                    conflicts.push({
                        type: 'presence',
                        message: `${intervention1.fullName} est prévu(e) à ${intervention1.place} et ${intervention2.place} le même jour (${intervention1.date})`,
                        interventions: [intervention1, intervention2],
                        dates: [intervention1.date]
                    });
                }
            }
        }
    }

    // Vérifier les conflits de lieux (mêmes lieux à la même date)
    for (let i = 0; i < interventions.length; i++) {
        for (let j = i + 1; j < interventions.length; j++) {
            const intervention1 = interventions[i];
            const intervention2 = interventions[j];

            // Vérifier si c'est le même lieu à la même date
            if (intervention1.date === intervention2.date &&
                intervention1.place === intervention2.place) {

                // Même lieu - conflit de ressources
                conflicts.push({
                    type: 'resource',
                    message: `Le lieu ${intervention1.place} est réservé pour deux interventions différentes le ${intervention1.date}`,
                    interventions: [intervention1, intervention2],
                    dates: [intervention1.date]
                });
            }
        }
    }

    // Vérifier les conflits de type de culte inhabituels
    for (let i = 0; i < interventions.length; i++) {
        const intervention = interventions[i];

        // Vérifier si le type de culte correspond au jour de la semaine
        const dayOfWeek = new Date(intervention.date).toLocaleDateString('fr-FR', { weekday: 'long' });
        const expectedTypes = cultTypesByDay[dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)];

        if (expectedTypes && !expectedTypes.includes(intervention.cultType)) {
            conflicts.push({
                type: 'schedule',
                message: `Le type de culte "${intervention.cultType}" est inhabituel pour un ${dayOfWeek}`,
                interventions: [intervention],
                dates: [intervention.date]
            });
        }
    }

    return conflicts;
}

// Fonction pour afficher les conflits de planning
function showPlanningConflicts() {
    const conflicts = detectPlanningConflicts();

    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('conflictsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'conflictsModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Conflits de Planning</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <h6>Résumé des conflits</h6>
                            <div class="row" id="conflicts-summary">
                                <!-- Le résumé sera inséré ici -->
                            </div>
                        </div>

                        <div class="mb-3">
                            <h6>Détails des conflits</h6>
                            <div class="table-responsive">
                                <table class="table table-striped" id="conflicts-table">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Message</th>
                                            <th>Date</th>
                                            <th>Interventions</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="conflicts-table-body">
                                        <!-- Les conflits seront insérés ici -->
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            Gérez les conflits pour assurer une planification cohérente.
                            Les interventions en conflit peuvent être modifiées ou supprimées.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-primary" id="resolve-all-conflicts">Tout résoudre</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Événement pour résoudre tous les conflits
        document.getElementById('resolve-all-conflicts').addEventListener('click', function() {
            resolveAllConflicts(conflicts);
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            bootstrapModal.hide();
        });
    }

    // Remplir le résumé des conflits
    const summaryContainer = document.getElementById('conflicts-summary');
    const conflictTypes = {
        availability: 0,
        presence: 0,
        resource: 0,
        schedule: 0
    };

    conflicts.forEach(conflict => {
        conflictTypes[conflict.type]++;
    });

    summaryContainer.innerHTML = `
        <div class="col-md-3 text-center">
            <div class="card border-warning">
                <div class="card-body">
                    <h5 class="card-title text-warning">${conflictTypes.availability}</h5>
                    <p class="card-text">Conflits d'indisponibilité</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 text-center">
            <div class="card border-info">
                <div class="card-body">
                    <h5 class="card-title text-info">${conflictTypes.presence}</h5>
                    <p class="card-text">Conflits de présence</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 text-center">
            <div class="card border-danger">
                <div class="card-body">
                    <h5 class="card-title text-danger">${conflictTypes.resource}</h5>
                    <p class="card-text">Conflits de ressources</p>
                </div>
            </div>
        </div>
        <div class="col-md-3 text-center">
            <div class="card border-secondary">
                <div class="card-body">
                    <h5 class="card-title text-secondary">${conflictTypes.schedule}</h5>
                    <p class="card-text">Conflits de planning</p>
                </div>
            </div>
        </div>
    `;

    // Remplir le tableau des conflits
    const tableBody = document.getElementById('conflicts-table-body');
    tableBody.innerHTML = '';

    if (conflicts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun conflit détecté</td></tr>';
    } else {
        conflicts.forEach((conflict, index) => {
            const row = document.createElement('tr');

            // Déterminer la classe de style selon le type de conflit
            let rowClass = '';
            switch(conflict.type) {
                case 'availability':
                    rowClass = 'table-warning';
                    break;
                case 'presence':
                    rowClass = 'table-info';
                    break;
                case 'resource':
                    rowClass = 'table-danger';
                    break;
                case 'schedule':
                    rowClass = 'table-secondary';
                    break;
            }

            row.className = rowClass;

            // Créer les cellules du tableau
            row.innerHTML = `
                <td>
                    <span class="badge bg-${getConflictTypeColor(conflict.type)}">
                        ${getConflictTypeLabel(conflict.type)}
                    </span>
                </td>
                <td>${conflict.message}</td>
                <td>${formatDateForDisplay(conflict.dates[0])}</td>
                <td>${conflict.interventions.length} intervention(s)</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary conflict-details-btn" data-index="${index}">
                        <i class="fas fa-search me-1"></i>Détails
                    </button>
                    <button class="btn btn-sm btn-outline-success resolve-conflict-btn" data-index="${index}">
                        <i class="fas fa-check me-1"></i>Résoudre
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        });

        // Ajouter les événements pour les boutons de détails et de résolution
        document.querySelectorAll('.conflict-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                showConflictDetails(conflicts[index]);
            });
        });

        document.querySelectorAll('.resolve-conflict-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                resolveConflict(conflicts[index]);
                // Retirer la ligne du tableau après résolution
                this.closest('tr').remove();
            });
        });
    }

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour obtenir la couleur selon le type de conflit
function getConflictTypeColor(type) {
    switch(type) {
        case 'availability':
            return 'warning';
        case 'presence':
            return 'info';
        case 'resource':
            return 'danger';
        case 'schedule':
            return 'secondary';
        default:
            return 'secondary';
    }
}

// Fonction pour obtenir le libellé selon le type de conflit
function getConflictTypeLabel(type) {
    switch(type) {
        case 'availability':
            return 'Indisponibilité';
        case 'presence':
            return 'Présence';
        case 'resource':
            return 'Ressource';
        case 'schedule':
            return 'Planning';
        default:
            return 'Autre';
    }
}

// Fonction pour formater la date pour l'affichage
function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Fonction pour afficher les détails d'un conflit
function showConflictDetails(conflict) {
    // Créer une modale pour afficher les détails du conflit
    let modal = document.getElementById('conflictDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'conflictDetailsModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Détails du Conflit</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
                    </div>
                    <div class="modal-body" id="conflict-details-content">
                        <!-- Le contenu sera inséré ici -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Remplir le contenu de la modale
    const content = document.getElementById('conflict-details-content');
    content.innerHTML = `
        <h6>Type de conflit: <span class="badge bg-${getConflictTypeColor(conflict.type)}">${getConflictTypeLabel(conflict.type)}</span></h6>
        <p><strong>Message:</strong> ${conflict.message}</p>
        <p><strong>Date:</strong> ${formatDateForDisplay(conflict.dates[0])}</p>

        <h6 class="mt-3">Interventions concernées:</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Intervenant</th>
                        <th>Type de culte</th>
                        <th>Lieu</th>
                        <th>Thème</th>
                    </tr>
                </thead>
                <tbody>
                    ${conflict.interventions.map(intervention => `
                        <tr>
                            <td>${intervention.fullName}</td>
                            <td>${intervention.cultType}</td>
                            <td>${intervention.place}</td>
                            <td>${intervention.theme || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour résoudre un conflit
function resolveConflict(conflict) {
    // Selon le type de conflit, appliquer une solution appropriée
    switch(conflict.type) {
        case 'availability':
            // Pour les conflits d'indisponibilité, on pourrait proposer de modifier l'un des créneaux
            showAlert(`Conflit d'indisponibilité résolu pour ${conflict.interventions[0].fullName}`, 'info');
            break;
        case 'presence':
            // Pour les conflits de présence, on pourrait proposer de modifier l'un des lieux
            showAlert(`Conflit de présence résolu pour ${conflict.interventions[0].fullName}`, 'info');
            break;
        case 'resource':
            // Pour les conflits de ressources, on pourrait proposer de modifier l'un des lieux
            showAlert(`Conflit de ressource résolu pour ${conflict.interventions[0].place}`, 'info');
            break;
        case 'schedule':
            // Pour les conflits de planning, on pourrait proposer de modifier le type de culte
            showAlert(`Conflit de planning résolu pour le ${conflict.dates[0]}`, 'info');
            break;
    }
}

// Fonction pour résoudre tous les conflits
function resolveAllConflicts(conflicts) {
    conflicts.forEach(conflict => {
        resolveConflict(conflict);
    });

    showAlert(`Tous les conflits (${conflicts.length}) ont été résolus.`, 'success');
}

// Fonction pour valider une intervention avant ajout
function validateInterventionForConflicts(intervention) {
    // Vérifier s'il y a des conflits potentiels avec cette intervention
    const potentialConflicts = [];

    // Vérifier les conflits d'intervenants
    interventions.forEach(existing => {
        if (existing.date === intervention.date &&
            existing.fullName === intervention.fullName) {
            potentialConflicts.push({
                type: 'availability',
                message: `Attention: ${intervention.fullName} est déjà prévu(e) à ${existing.place} le ${intervention.date}`
            });
        }
    });

    // Vérifier les conflits de lieux
    interventions.forEach(existing => {
        if (existing.date === intervention.date &&
            existing.place === intervention.place) {
            potentialConflicts.push({
                type: 'resource',
                message: `Attention: ${intervention.place} est déjà réservé pour ${existing.fullName} le ${intervention.date}`
            });
        }
    });

    // Afficher les alertes si des conflits sont détectés
    if (potentialConflicts.length > 0) {
        let message = `Des conflits potentiels ont été détectés:\n\n`;
        potentialConflicts.forEach(conflict => {
            message += `- ${conflict.message}\n`;
        });
        message += `\nVoulez-vous quand même ajouter cette intervention?`;

        return confirm(message);
    }

    return true;
}

// Fonction pour surligner les interventions en conflit dans l'interface
function highlightConflictInterventions() {
    // Retirer les surlignages précédents
    document.querySelectorAll('.conflict-highlight').forEach(el => {
        el.classList.remove('conflict-highlight');
    });

    // Détecter les conflits
    const conflicts = detectPlanningConflicts();

    // Surligner les interventions en conflit
    conflicts.forEach(conflict => {
        conflict.interventions.forEach(intervention => {
            // Trouver l'élément correspondant dans l'interface
            const interventionElements = document.querySelectorAll(`[data-intervention-id="${intervention.id}"]`);
            interventionElements.forEach(el => {
                el.classList.add('conflict-highlight');
            });
        });
    });
}

// Fonction pour ajouter une intervention avec vérification de conflits
function addInterventionWithConflictCheck() {
    if (!validateInterventionForm()) {
        return;
    }

    const intervention = getInterventionFromForm();

    // Vérifier les conflits potentiels avant d'ajouter
    if (validateInterventionForConflicts(intervention)) {
        // Sauvegarder l'état précédent pour l'historique
        const previousState = JSON.parse(JSON.stringify(interventions));

        interventions.push(intervention);

        updateInterventionsList();
        resetInterventionForm();
        saveToLocalStorageWithCache();

        // Enregistrer dans l'historique
        saveToHistory('add', intervention, previousState);

        // Ajouter à la liste des modifications en attente au lieu de synchroniser immédiatement
        addPendingChange('add', intervention);

        showAlert('Intervention ajoutée avec succès!', 'success');

        // Vérifier les nouveaux conflits
        highlightConflictInterventions();
    } else {
        showAlert('Intervention annulée par l\'utilisateur.', 'info');
    }
}

// Fonction pour générer la planification automatique
function generateAutoPlan() {
    // Récupérer les paramètres de la planification
    const rotationEnabled = document.getElementById('rotation-enabled').checked;
    const avoidConflicts = document.getElementById('avoid-conflicts').checked;
    const balanceWorkload = document.getElementById('balance-workload').checked;
    const startDate = new Date(document.getElementById('start-date').value);
    const endDate = new Date(document.getElementById('end-date').value);
    const intervenantsPerType = parseInt(document.getElementById('intervenants-per-type').value) || 1;

    // Sauvegarder l'état précédent pour l'historique
    const previousState = JSON.parse(JSON.stringify(interventions));

    // Générer les interventions automatiques
    const generatedInterventions = [];

    // Récupérer les types de culte et lieux configurés
    const configuredTypes = Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value);
    const configuredPlaces = Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value);

    // Générer des dates pour la période
    const currentDate = new Date(startDate);
    let dateIndex = 0;

    while (currentDate <= endDate) {
        // Obtenir le jour de la semaine
        const dayOfWeek = daysOfWeek[currentDate.getDay()];

        // Filtrer les types de culte pour ce jour
        const typesForDay = cultTypesByDay[dayOfWeek] || [];
        const availableTypes = configuredTypes.filter(type => typesForDay.includes(type));

        // Générer des interventions pour chaque type de culte possible ce jour
        for (const cultType of availableTypes) {
            // Sélectionner des intervenants aléatoirement ou selon les règles de rotation
            const availableIntervenants = [...intervenantsDB]; // Copie du tableau

            // Si la rotation est activée, on peut appliquer une logique spécifique
            if (rotationEnabled) {
                // Pour l'instant, on sélectionne aléatoirement, mais on pourrait implémenter une rotation plus sophistiquée
                // basée sur l'historique des interventions
            }

            // Sélectionner un certain nombre d'intervenants pour ce type de culte
            for (let i = 0; i < intervenantsPerType && i < availableIntervenants.length; i++) {
                // Sélectionner un intervenant aléatoire parmi ceux disponibles
                const randomIndex = Math.floor(Math.random() * availableIntervenants.length);
                const selectedIntervenant = availableIntervenants.splice(randomIndex, 1)[0];

                // Sélectionner un lieu aléatoire parmi ceux configurés
                const randomPlaceIndex = Math.floor(Math.random() * configuredPlaces.length);
                const selectedPlace = configuredPlaces[randomPlaceIndex];

                // Créer l'intervention
                const intervention = {
                    id: Date.now() + dateIndex++,
                    date: currentDate.toISOString().split('T')[0],
                    formattedDate: currentDate.toISOString(),
                    dayOfWeek: dayOfWeek,
                    place: selectedPlace,
                    cultType: cultType,
                    theme: `Thème automatique pour ${cultType}`,
                    title: selectedIntervenant.title,
                    firstName: selectedIntervenant.firstName,
                    lastName: selectedIntervenant.lastName,
                    fullName: `${selectedIntervenant.title} ${selectedIntervenant.firstName} ${selectedIntervenant.lastName}`,
                    observations: 'Intervention générée automatiquement',
                    groupLabel: `Planifié automatiquement - ${dayOfWeek}`
                };

                generatedInterventions.push(intervention);
            }
        }

        // Passer au jour suivant
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Ajouter les interventions générées à la liste existante
    interventions = [...interventions, ...generatedInterventions];

    // Mettre à jour l'interface
    updateInterventionsList();
    saveToLocalStorage();
    autoSyncToReport();

    // Enregistrer dans l'historique
    saveToHistory('auto-plan', {
        count: generatedInterventions.length,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value
    }, previousState);

    // Envoyer une notification pour la génération automatique
    sendImportantChangeNotification(
        'Planification automatique',
        `Génération automatique terminée : ${generatedInterventions.length} interventions ajoutées du ${document.getElementById('start-date').value} au ${document.getElementById('end-date').value}`
    );

    showAlert(`Planification automatique générée avec succès! ${generatedInterventions.length} interventions ajoutées.`, 'success');
}

// Fonction pour supprimer une publication spécifique
function unpublishData(storageKey) {
    try {
        // Supprimer les données de stockage local
        localStorage.removeItem(storageKey);

        // Mettre à jour la liste des publications
        let publishedKeys = JSON.parse(localStorage.getItem('published_keys') || '[]');
        publishedKeys = publishedKeys.filter(item => item.key !== storageKey);
        localStorage.setItem('published_keys', JSON.stringify(publishedKeys));

        showAlert('Publication supprimée avec succès !', 'success');
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la publication:', error);
        showAlert('Erreur lors de la suppression de la publication: ' + error.message, 'danger');
        return false;
    }
}

// Fonction pour afficher les publications existantes
function showPublishedList() {
    try {
        const publishedKeys = JSON.parse(localStorage.getItem('published_keys') || '[]');

        if (publishedKeys.length === 0) {
            showAlert('Aucune publication active.', 'info');
            return;
        }

        showPublishedListModal(publishedKeys);
    } catch (error) {
        console.error('Erreur lors de l\'affichage des publications:', error);
        showAlert('Erreur lors de l\'affichage des publications: ' + error.message, 'danger');
    }
}

// Fonction pour afficher la modale de liste des publications
function showPublishedListModal(publishedKeys) {
    // Créer la modale si elle n'existe pas
    let modal = document.getElementById('publishedListModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'publishedListModal';
        modal.className = 'modal fade';
        modal.tabIndex = -1;
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-list me-2"></i>Liste des Publications</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="published-list-content">
                            <p>Voici la liste des publications actives :</p>
                            <div class="table-responsive">
                                <table class="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Date de publication</th>
                                            <th>Lien</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody id="published-list-body">
                                        <!-- Contenu généré dynamiquement -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Mettre à jour le contenu de la modale
    const tbody = document.getElementById('published-list-body');
    tbody.innerHTML = '';

    publishedKeys.forEach(item => {
        const row = document.createElement('tr');
        const date = new Date(item.createdAt).toLocaleString('fr-FR');

        row.innerHTML = `
            <td>${date}</td>
            <td>
                <div class="input-group">
                    <input type="text" class="form-control form-control-sm" value="${item.url}" readonly>
                    <button class="btn btn-outline-secondary btn-sm copy-url-btn" type="button" data-url="${item.url}">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td>
                <button class="btn btn-danger btn-sm" type="button" onclick="unpublishData('${item.key}')">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Ajouter les événements de copie
    document.querySelectorAll('.copy-url-btn').forEach(button => {
        button.addEventListener('click', function() {
            const url = this.getAttribute('data-url');
            navigator.clipboard.writeText(url).then(() => {
                const originalHtml = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    this.innerHTML = originalHtml;
                }, 2000);
                showAlert('Lien copié dans le presse-papiers', 'success');
            });
        });
    });

    // Afficher la modale
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Fonction pour activer le bouton de publication
function setupPublishButton() {
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
        publishBtn.addEventListener('click', publishData);
    }
}
