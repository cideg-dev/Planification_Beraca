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
    // Mettre à jour les listes déroulantes
    updatePlaceSelect();
    updateCultTypeSelect();

    // Initialiser la langue
    initializeLanguage();
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
    const allowedThemes = ['light', 'dark', 'neon', 'galaxy', 'rainbow', 'high-contrast', 'pastel'];
    if (!allowedThemes.includes(theme)) {
        console.warn(`Thème non autorisé : ${theme}`);
        return;
    }

    document.body.className = 'theme-' + theme;
    saveToLocalStorage();
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
}

function addIntervention() {
    if (!validateInterventionForm()) {
        return;
    }
    
    const intervention = getInterventionFromForm();
    interventions.push(intervention);
    
    updateInterventionsList();
    resetInterventionForm();
    saveToLocalStorage();
    
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
}

function deleteIntervention(id) {
    if (confirm('Voulez-vous vraiment supprimer cette intervention ?')) {
        interventions = interventions.filter(intervention => intervention.id !== id);
        updateInterventionsList();
        saveToLocalStorage();
        showAlert('Intervention supprimée.', 'warning');
    }
}

function clearAllInterventions() {
    if (interventions.length === 0) return;
    
    if (confirm(`Voulez-vous vraiment supprimer toutes les ${interventions.length} interventions ?`)) {
        interventions = [];
        updateInterventionsList();
        saveToLocalStorage();
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
    const stats = generateStats();

    // Créer une modale pour afficher les rapports
    const modalHTML = `
        <div class="modal fade" id="reportsModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="fas fa-chart-bar me-2"></i>Rapports et Analyses</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Résumé Général</h6>
                                    </div>
                                    <div class="card-body">
                                        <p><strong>Total des interventions:</strong> ${stats.totalInterventions}</p>
                                    </div>
                                </div>

                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Interventions par Type</h6>
                                    </div>
                                    <div class="card-body">
                                        ${Object.entries(stats.interventionsByType).map(([type, count]) =>
                                            `<p><span class="badge bg-primary me-2">${type}</span> <span class="float-end">${count}</span></p>`
                                        ).join('')}
                                    </div>
                                </div>

                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Interventions par Jour</h6>
                                    </div>
                                    <div class="card-body">
                                        ${Object.entries(stats.interventionsByDay).map(([day, count]) =>
                                            `<p><span class="badge bg-info me-2">${day}</span> <span class="float-end">${count}</span></p>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Interventions par Lieu</h6>
                                    </div>
                                    <div class="card-body">
                                        ${Object.entries(stats.interventionsByPlace).map(([place, count]) =>
                                            `<p><span class="badge bg-success me-2">${place}</span> <span class="float-end">${count}</span></p>`
                                        ).join('')}
                                    </div>
                                </div>

                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Interventions par Intervenant</h6>
                                    </div>
                                    <div class="card-body">
                                        ${Object.entries(stats.interventionsByIntervenant).map(([intervenant, count]) =>
                                            `<p><span class="badge bg-warning me-2">${intervenant}</span> <span class="float-end">${count}</span></p>`
                                        ).join('')}
                                    </div>
                                </div>

                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">Interventions par Mois</h6>
                                    </div>
                                    <div class="card-body">
                                        ${Object.entries(stats.interventionsByMonth).map(([month, count]) =>
                                            `<p><span class="badge bg-secondary me-2">${month}</span> <span class="float-end">${count}</span></p>`
                                        ).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                        <button type="button" class="btn btn-outline-primary" id="export-reports-btn">
                            <i class="fas fa-file-export me-2"></i>Exporter les rapports
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Supprimer la modale existante si elle existe
    const existingModal = document.getElementById('reportsModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Ajouter la modale au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Initialiser la modale Bootstrap
    const reportsModal = new bootstrap.Modal(document.getElementById('reportsModal'));
    reportsModal.show();

    // Ajouter l'événement pour exporter les rapports
    document.getElementById('export-reports-btn').addEventListener('click', () => exportReports(stats));

    // Supprimer la modale quand elle est fermée
    document.getElementById('reportsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
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
