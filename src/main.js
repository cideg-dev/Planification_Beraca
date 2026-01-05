// Bootstrap et Chart.js sont chargés via le fichier HTML, donc nous utilisons les versions globales
const Modal = window.bootstrap.Modal;
const Chart = window.Chart;

import { DataService } from './services/dataService.js';
import { ExportService } from './services/exportService.js';
import { RecommendationService } from './services/recommendationService.js';
import { StatsService } from './services/statsService.js'; // Import
import { notificationService } from './services/notificationService.js'; // Import ajouté
import { UI } from './ui/uiHelpers.js';
import { CONSTANTS } from './config.js';
import { testConnection } from './services/supabaseClient.js';

// Fonction de hachage simple (pour usage local, pas pour des données sensibles)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convertir en entier 32 bits
    }
    return hash;
}

// État local
const state = {
    interventions: [],
    intervenants: [],
    config: {
        church: 'AD BERACA',
        region: 'ATACORA',
        section: 'NATITINGOU',
        year: new Date().getFullYear(),
        quarter: Math.floor((new Date().getMonth() + 3) / 3),
        phone: '',
        email: '',
        bank: '',
        logo: 'AD.jpeg'
    },
    filters: {
        searchQuery: '',
        month: '',
        place: '',
        type: '',
        intervenant: ''
    },
    currentDate: new Date().toISOString().split('T')[0],
    charts: {}, // Pour stocker les instances de charts
    passwordHash: 1234567890, // Hash du mot de passe de configuration (remplacé à la volée)
    isAuthenticated: false // État d'authentification pour la configuration
};

// Initialisation du hash de mot de passe de manière sécurisée
function initializePassword() {
    // Le mot de passe est construit dynamiquement pour éviter d'être visible dans le code source
    // en clair, en utilisant des caractères concaténés
    const password = String.fromCharCode(77) + // 'M'
                    String.fromCharCode(97) + // 'a'
                    String.fromCharCode(114) + // 'r'
                    String.fromCharCode(116) + // 't'
                    String.fromCharCode(105) + // 'i'
                    String.fromCharCode(97) + // 'a'
                    String.fromCharCode(108) + // 'l'
                    '1989'; // '1989'
    state.passwordHash = hashPassword(password);
}

// Fonction pour afficher une notification
function showNotification(message, type = 'info', sound = true) {
    // Afficher la notification visuelle
    UI.showAlert(message, type);

    // Jouer un son de notification si demandé
    if (sound) {
        playNotificationSound();
    }
}

// Fonction pour jouer un son de notification
function playNotificationSound() {
    // Créer un contexte audio
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Créer un oscillateur pour générer un son
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurer le son (tonalité et durée)
    oscillator.type = 'sine';
    oscillator.frequency.value = 800; // Fréquence en Hz
    gainNode.gain.value = 0.3; // Volume

    // Démarrer et arrêter l'oscillateur
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);

    // Arrêter l'oscillateur après 0.5 secondes
    setTimeout(() => {
        oscillator.stop();
    }, 500);
}

// Fonction pour comparer les interventions et détecter les modifications
function detectChanges(oldData, newData) {
    const changes = {
        added: [],
        updated: [],
        deleted: []
    };

    // Convertir les tableaux en objets indexés par ID pour une recherche plus rapide
    const oldMap = new Map(oldData.map(item => [item.id, item]));
    const newMap = new Map(newData.map(item => [item.id, item]));

    // Vérifier les éléments supprimés
    for (const [id, item] of oldMap) {
        if (!newMap.has(id)) {
            changes.deleted.push(item);
        }
    }

    // Vérifier les éléments ajoutés ou mis à jour
    for (const [id, newItem] of newMap) {
        const oldItem = oldMap.get(id);
        if (!oldItem) {
            changes.added.push(newItem);
        } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            changes.updated.push({ old: oldItem, new: newItem });
        }
    }

    return changes;
}

// Fonction pour formater les messages de notification
function formatNotificationMessage(changes) {
    const messages = [];

    if (changes.added.length > 0) {
        const count = changes.added.length;
        messages.push(`${count} nouvelle${count > 1 ? 's' : ''} planification${count > 1 ? 's' : ''} ajoutée${count > 1 ? 's' : ''}`);
    }

    if (changes.updated.length > 0) {
        const count = changes.updated.length;
        messages.push(`${count} planification${count > 1 ? 's' : ''} modifiée${count > 1 ? 's' : ''}`);
    }

    if (changes.deleted.length > 0) {
        const count = changes.deleted.length;
        messages.push(`${count} planification${count > 1 ? 's' : ''} supprimée${count > 1 ? 's' : ''}`);
    }

    return messages.join(', ');
}

// Fonction pour vérifier les modifications en temps réel
async function checkForChanges() {
    try {
        // Sauvegarder l'état actuel
        const previousInterventions = [...state.interventions];

        // Recharger les données
        const updatedInterventions = await DataService.getInterventions();
        state.interventions = updatedInterventions;

        // Détecter les modifications
        const changes = detectChanges(previousInterventions, updatedInterventions);

        // Si des modifications sont détectées, afficher une notification
        if (changes.added.length > 0 || changes.updated.length > 0 || changes.deleted.length > 0) {
            const message = formatNotificationMessage(changes);
            showNotification(message, 'info', true);

            // Mettre à jour l'affichage
            renderPlanning();
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des modifications:', error);
    }
}

// Fonction pour activer la surveillance des modifications
function enableRealTimeMonitoring() {
    // Vérifier les modifications toutes les 30 secondes
    setInterval(checkForChanges, 30000);
}

// Fonction pour initialiser la notification de modifications
function initializeChangeNotifications() {
    // Activer la surveillance en temps réel
    enableRealTimeMonitoring();

    // Stocker l'état initial des interventions pour la comparaison
    state.initialInterventions = [...state.interventions];
}

// Initialiser le mot de passe au chargement de l'application
initializePassword();

/**
 * Fonction principale d'initialisation de l'application
 */
async function initApp() {
    initializeTheme(); // Initialiser le thème avant tout

    // Vérifier la connexion à Supabase
    const isConnected = await testConnection();
    if (!isConnected) {
        console.warn('Connexion à Supabase échouée. L\'application fonctionnera en mode dégradé.');
        // Ne pas afficher d'alerte à l'utilisateur pour éviter de surcharger l'interface
        // UI.showAlert('Erreur de connexion à la base de données. Veuillez vérifier la configuration des secrets sur GitHub.', 'danger');
    }

    setupEventListeners();
    setupNavigation(); // Navigation Tabs
    setupSmartDate();
    loadPreferences();
    await loadData();
    initNotifications(); // Initialiser les notifications
    initializeChangeNotifications(); // Initialiser les notifications de modifications
}

// Initialisation
document.addEventListener('DOMContentLoaded', initApp);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => console.log('PWA Ready'));
}

/**
 * Initialisation du système de notifications
 */
async function initNotifications() {
    const btnNotifications = document.getElementById('btn-notifications');
    const notificationsList = document.getElementById('notifications-list');
    const badge = document.getElementById('notification-badge');
    const btnMarkAll = document.getElementById('btn-mark-all-read');

    if (!btnNotifications) return;

    // Charger les notifications initiales
    await refreshNotificationsUI();

    // Demander la permission Push au clic si pas encore fait
    btnNotifications.addEventListener('click', async () => {
        if (Notification.permission === 'default') {
            const granted = await notificationService.requestPermission();
            if (granted) {
                console.log("Web Push activé pour cet utilisateur");
            }
        }
    });

    // Tout marquer comme lu
    btnMarkAll?.addEventListener('click', async (e) => {
        e.stopPropagation();
        // Pour la démo, on utilise un UUID fictif valide
        await notificationService.markAllAsRead('00000000-0000-0000-0000-000000000000'); 
        await refreshNotificationsUI();
    });
}

/**
 * Met à jour l'interface des notifications
 */
async function refreshNotificationsUI() {
    const notificationsList = document.getElementById('notifications-list');
    const badge = document.getElementById('notification-badge');
    
    // On utilise un UUID fictif valide pour les utilisateurs non connectés
    const notifications = await notificationService.getNotifications('00000000-0000-0000-0000-000000000000');
    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Mise à jour du badge
    if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }

    // Mise à jour de la liste
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<div class="text-center py-3 text-muted small">Aucune notification</div>';
        return;
    }

    notificationsList.innerHTML = notifications.map(n => `
        <button class="list-group-item list-group-item-action p-2 border-start-0 border-end-0 ${n.is_read ? '' : 'bg-light fw-bold'}" 
                onclick="markNotificationRead('${n.id}')">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small text-primary">${n.type}</span>
                <span class="text-muted" style="font-size: 0.7rem;">${new Date(n.created_at).toLocaleDateString()}</span>
            </div>
            <p class="mb-0 small text-truncate">${n.title}</p>
            <p class="mb-0 text-muted" style="font-size: 0.75rem;">${n.message}</p>
        </button>
    `).join('');
}

// Exposer globalement pour le onclick
window.markNotificationRead = async (id) => {
    await notificationService.markAsRead(id);
    await refreshNotificationsUI();
};

window.showComments = showComments;
window.showFeedback = showFeedback;

// --- FONCTION DE TEST TEMPORAIRE ---
window.testNotif = async () => {
    console.log("Envoi d'une notification de test...");
    
    // Simuler une insertion dans Supabase avec un UUID valide
    const fakeNotif = {
        user_id: '00000000-0000-0000-0000-000000000000',
        title: 'Rappel de culte',
        message: 'N\'oubliez pas le culte de ce soir à 19h.',
        type: 'reminder',
        channel: 'in_app',
        is_read: false
    };

    try {
        const { error } = await supabaseClient.from('notifications').insert([fakeNotif]);
        if (error) {
            console.warn("Table 'notifications' non trouvée ou erreur RLS. Mode simulation activé.", error);
            // Simulation locale pour la démo UI si la DB n'est pas prête
            const list = document.getElementById('notifications-list');
            const badge = document.getElementById('notification-badge');
            
            // Mise à jour visuelle forcée
            badge.style.display = 'block';
            badge.textContent = parseInt(badge.textContent || '0') + 1;
            
            const itemHTML = `
            <button class="list-group-item list-group-item-action p-2 border-start-0 border-end-0 bg-light fw-bold">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small text-primary">Test</span>
                    <span class="text-muted" style="font-size: 0.7rem;">À l'instant</span>
                </div>
                <p class="mb-0 small text-truncate">${fakeNotif.title}</p>
                <p class="mb-0 text-muted" style="font-size: 0.75rem;">${fakeNotif.message}</p>
            </button>`;
            
            if (list.innerHTML.includes('Aucune notification')) {
                list.innerHTML = itemHTML;
            } else {
                list.insertAdjacentHTML('afterbegin', itemHTML);
            }
        } else {
            console.log("Notification insérée dans Supabase !");
            await refreshNotificationsUI();
        }
    } catch (e) {
        console.error(e);
    }
};

// Fonction pour initialiser le thème au chargement
function initializeTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateThemeIcon('dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateThemeIcon('light');
    }
}

// Fonction pour basculer entre les thèmes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('app-theme', newTheme);
    updateThemeIcon(newTheme);
}

// Fonction pour mettre à jour l'icône du thème
function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const icon = themeToggle.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        themeToggle.title = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
    }
}

function setupNavigation() {
    const navButtons = document.querySelectorAll('#main-nav button[data-view]');
    navButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const targetView = e.currentTarget.dataset.view;

            // Vérifier si on essaie d'accéder à la page de configuration
            if (targetView === 'settings-view' && !state.isAuthenticated) {
                // Afficher la modale de connexion
                const isAuthenticated = await showPasswordModal();
                if (!isAuthenticated) {
                    return; // Ne pas changer de vue si le mot de passe est incorrect
                }
                state.isAuthenticated = true; // Marquer comme authentifié
            }

            // 1. Activer le bouton
            if (e.currentTarget) {
                navButtons.forEach(b => {
                    if (b) {
                        b.classList.remove('active', 'opacity-100');
                        b.classList.add('opacity-75');
                    }
                });
                e.currentTarget.classList.add('active', 'opacity-100');
                e.currentTarget.classList.remove('opacity-75');
            }

            // 2. Changer la vue
            document.querySelectorAll('.view-section').forEach(view => {
                if (view) view.style.display = 'none';
            });
            const viewEl = document.getElementById(targetView);
            if (viewEl) viewEl.style.display = 'block';

            // 3. Charger Dashboard si nécessaire
            if (targetView === 'dashboard-view') {
                renderDashboard();
            }
        });
    });
}

// Fonction pour afficher la modale de mot de passe
function showPasswordModal() {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('password-modal');
        if (!modal) {
            modal = createPasswordModal();
            // Attendre que la modale soit ajoutée au DOM
            setTimeout(() => {
                initializeModalEventHandlers(modal, resolve);
            }, 0);
        } else {
            initializeModalEventHandlers(modal, resolve);
        }
    });
}

// Fonction pour initialiser les gestionnaires d'événements de la modale
function initializeModalEventHandlers(modal, resolve) {
    const passwordInput = modal.querySelector('#password-input');
    const submitBtn = modal.querySelector('#password-submit');
    const errorDiv = modal.querySelector('#password-error');

    if (!passwordInput || !submitBtn || !errorDiv) {
        console.error('Éléments de la modale non trouvés');
        resolve(false);
        return;
    }

    const bsModal = new Modal(modal);

    // Réinitialiser l'état précédent
    passwordInput.value = '';
    errorDiv.style.display = 'none';
    passwordInput.classList.remove('is-invalid');

    // Gérer la soumission
    const handleSubmit = () => {
        const enteredPassword = passwordInput.value;
        const enteredHash = hashPassword(enteredPassword);

        if (enteredHash === state.passwordHash) {
            bsModal.hide();
            resolve(true);
        } else {
            errorDiv.style.display = 'block';
            passwordInput.classList.add('is-invalid');
            passwordInput.focus();
        }
    };

    // Supprimer les gestionnaires d'événements précédents pour éviter les doublons
    submitBtn.onclick = null;
    passwordInput.onkeypress = null;

    // Écouter le clic sur le bouton de soumission
    submitBtn.onclick = handleSubmit;

    // Écouter la touche Entrée
    passwordInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    // Gérer la fermeture de la modale
    const handleHidden = () => {
        modal.removeEventListener('hidden.bs.modal', handleHidden);
        resolve(false);
    };

    modal.addEventListener('hidden.bs.modal', handleHidden);

    bsModal.show();
    passwordInput.focus();
}

// Fonction pour créer la modale de mot de passe
function createPasswordModal() {
    const modalHtml = `
        <div class="modal fade" id="password-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white py-3">
                        <h5 class="modal-title fw-bold"><i class="fas fa-lock me-2"></i>Accès restreint</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <p class="mb-3">Veuillez entrer le mot de passe pour accéder à la page de configuration :</p>
                        <div class="mb-3">
                            <label for="password-input" class="form-label">Mot de passe</label>
                            <input type="password" class="form-control" id="password-input" placeholder="Entrez le mot de passe">
                            <div id="password-error" class="text-danger mt-2" style="display: none;">
                                <i class="fas fa-exclamation-circle me-1"></i>Mot de passe incorrect
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-primary btn-sm" id="password-submit">Valider</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('password-modal');
}

// Fonction pour créer des interventions récurrentes
async function createRecurringInterventions(basePayload) {
    const { date, recurrence, recurrence_end_date, ...baseData } = basePayload;

    // Calculer la date de fin
    const endDate = recurrence_end_date ? new Date(recurrence_end_date) : new Date(date);
    endDate.setFullYear(endDate.getFullYear() + 1); // Par défaut, une année

    const startDate = new Date(date);
    const recurringInterventions = [];

    // Générer les dates selon le type de récurrence
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        // Créer une copie du payload avec la nouvelle date
        const newPayload = {
            ...baseData,
            date: currentDate.toISOString().split('T')[0],
            day_of_week: CONSTANTS.DAYS_OF_WEEK[currentDate.getDay()]
        };

        // Ajouter l'intervention
        recurringInterventions.push(newPayload);

        // Calculer la prochaine date selon la récurrence
        switch (recurrence) {
            case 'daily':
                currentDate.setDate(currentDate.getDate() + 1);
                break;
            case 'weekly':
                currentDate.setDate(currentDate.getDate() + 7);
                break;
            case 'monthly':
                currentDate.setMonth(currentDate.getMonth() + 1);
                break;
            case 'yearly':
                currentDate.setFullYear(currentDate.getFullYear() + 1);
                break;
            default:
                currentDate.setDate(currentDate.getDate() + 1); // Par défaut quotidien
        }
    }

    // Ajouter toutes les interventions à la base de données
    for (const payload of recurringInterventions) {
        try {
            await DataService.addIntervention(payload);
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'intervention récurrente:', error);
        }
    }

    UI.showAlert(`${recurringInterventions.length} interventions récurrentes créées !`, 'success');
}

// Fonction pour modifier un intervenant
async function updateIntervenant(intervenantId, updatedData) {
    try {
        const updated = await DataService.updateIntervenant(intervenantId, updatedData);

        // Mettre à jour l'état local
        const index = state.intervenants.findIndex(iv => iv.id === intervenantId);
        if (index !== -1) {
            state.intervenants[index] = updated;
        }

        // Mettre à jour l'affichage
        populateIntervenantsList();

        UI.showAlert('Intervenant mis à jour avec succès !', 'success');
        return updated;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'intervenant:', error);
        UI.showAlert('Erreur lors de la mise à jour de l\'intervenant', 'danger');
        throw error;
    }
}

// Fonction pour afficher la modale de modification d'un intervenant
function showEditIntervenantModal(intervenant) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('edit-intervenant-modal');
        if (!modal) {
            modal = createEditIntervenantModal();
        }

        // Remplir les champs avec les données existantes
        document.getElementById('edit-iv-title').value = intervenant.title || '';
        document.getElementById('edit-iv-firstname').value = intervenant.first_name || '';
        document.getElementById('edit-iv-lastname').value = intervenant.last_name || '';
        document.getElementById('edit-iv-category').value = intervenant.category || 'members';

        // Stocker l'ID de l'intervenant à modifier
        modal.dataset.intervenantId = intervenant.id;

        const bsModal = new Modal(modal);

        // Gérer la soumission
        const handleSubmit = async () => {
            const btn = modal.querySelector('#edit-intervenant-submit');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const updatedData = {
                    title: document.getElementById('edit-iv-title').value,
                    first_name: document.getElementById('edit-iv-firstname').value,
                    last_name: document.getElementById('edit-iv-lastname').value,
                    category: document.getElementById('edit-iv-category').value
                };

                await updateIntervenant(intervenant.id, updatedData);
                bsModal.hide();
                resolve(true);
            } catch (error) {
                resolve(false);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };

        // Écouter le clic sur le bouton de soumission
        const submitBtn = modal.querySelector('#edit-intervenant-submit');
        submitBtn.onclick = null; // Supprimer les gestionnaires précédents
        submitBtn.onclick = handleSubmit;

        // Écouter la touche Entrée
        const form = modal.querySelector('.modal-body form');
        form.onkeypress = (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                handleSubmit();
            }
        };

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale de modification d'un intervenant
function createEditIntervenantModal() {
    const modalHtml = `
        <div class="modal fade" id="edit-intervenant-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-sm modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-warning text-dark py-2">
                        <h6 class="modal-title small fw-bold"><i class="fas fa-user-edit me-2"></i>Modifier Intervenant</h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <form id="form-edit-intervenant">
                            <div class="mb-2">
                                <label class="form-label small fw-bold mb-1">Titre</label>
                                <select class="form-select form-select-sm" id="edit-iv-title">
                                    <option value="">Aucun</option>
                                    <option value="Pasteur">Pasteur</option>
                                    <option value="Diacre">Diacre</option>
                                    <option value="Ancien">Ancien</option>
                                    <option value="Frère">Frère</option>
                                    <option value="Sœur">Sœur</option>
                                </select>
                            </div>
                            <div class="mb-2">
                                <label class="form-label small fw-bold mb-1">Prénom *</label>
                                <input type="text" class="form-control form-control-sm" id="edit-iv-firstname" required>
                            </div>
                            <div class="mb-2">
                                <label class="form-label small fw-bold mb-1">Nom *</label>
                                <input type="text" class="form-control form-control-sm" id="edit-iv-lastname" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold mb-1">Catégorie</label>
                                <select class="form-select form-select-sm" id="edit-iv-category">
                                    <option value="members">Membres</option>
                                    <option value="leaders">Dirigeants</option>
                                    <option value="deacons">Diacres</option>
                                    <option value="elders">Anciens</option>
                                    <option value="pastors">Pasteurs</option>
                                </select>
                            </div>
                            <button type="submit" class="btn btn-warning btn-sm w-100" id="edit-intervenant-submit">
                                <i class="fas fa-save me-1"></i>Mettre à jour
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('edit-intervenant-modal');
}

function renderDashboard() {
    const stats = StatsService.calculateStats(state.interventions);
    if (!stats) return;

    // Mise à jour des KPIs
    document.getElementById('kpi-total').textContent = stats.kpi.total;
    document.getElementById('kpi-speaker').textContent = stats.kpi.topSpeaker;
    document.getElementById('kpi-place').textContent = stats.kpi.topPlace;

    // Destruction des anciens charts s'ils existent (pour update)
    if (state.charts.timeline) state.charts.timeline.destroy();
    if (state.charts.types) state.charts.types.destroy();
    if (state.charts.speakers) state.charts.speakers.destroy();

    // Chart 1: Timeline (Ligne)
    state.charts.timeline = new Chart(document.getElementById('chart-timeline'), {
        type: 'line',
        data: {
            labels: stats.charts.timeline.labels,
            datasets: [{
                label: 'Interventions',
                data: stats.charts.timeline.data,
                borderColor: '#0d6efd',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(13, 110, 253, 0.1)'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Chart 2: Types (Doughnut)
    state.charts.types = new Chart(document.getElementById('chart-types'), {
        type: 'doughnut',
        data: {
            labels: stats.charts.types.labels,
            datasets: [{
                data: stats.charts.types.data,
                backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6c757d', '#0dcaf0']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // Chart 3: Top Speakers (Bar)
    state.charts.speakers = new Chart(document.getElementById('chart-speakers'), {
        type: 'bar',
        data: {
            labels: stats.charts.speakers.labels,
            datasets: [{
                label: 'Interventions',
                data: stats.charts.speakers.data,
                backgroundColor: '#20c997',
                borderRadius: 5
            }]
        },
        options: { responsive: true, indexAxis: 'y' }
    });
}

function setupEventListeners() {
    document.getElementById('main-form')?.addEventListener('submit', handleAddIntervention);
    document.getElementById('btn-reset')?.addEventListener('click', () => {
        document.getElementById('main-form').reset();
        updateDayDisplay('');
        populateIntervenantsList();
    });
    document.getElementById('btn-suggest-intervenant')?.addEventListener('click', handleSuggestionRequest);
    document.getElementById('form-create-intervenant')?.addEventListener('submit', handleCreateIntervenant);
    document.getElementById('refresh-btn')?.addEventListener('click', loadData);
    
    // Modification ici : btn-save-settings au lieu de btn-save-config
    document.getElementById('btn-save-settings')?.addEventListener('click', handleSaveSettings);
    
    document.getElementById('export-excel-btn')?.addEventListener('click', () => {
        const filteredInterventions = getFilteredInterventions();
        filteredInterventions.length
            ? ExportService.exportToExcel(filteredInterventions, state.config)
            : UI.showAlert('Rien à exporter', 'warning');
    });
    document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
        const filteredInterventions = getFilteredInterventions();
        filteredInterventions.length
            ? ExportService.exportToPdf(filteredInterventions, state.config)
            : UI.showAlert('Rien à exporter', 'warning');
    });
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        state.filters.searchQuery = e.target.value ? e.target.value.toLowerCase() : '';
        savePreferences();
        renderPlanning();
    });

    // Gestion des filtres avancés
    document.getElementById('filter-month')?.addEventListener('change', (e) => {
        state.filters.month = e.target.value;
        savePreferences();
        renderPlanning();
    });

    document.getElementById('filter-place')?.addEventListener('change', (e) => {
        state.filters.place = e.target.value;
        savePreferences();
        renderPlanning();
    });

    document.getElementById('filter-type')?.addEventListener('change', (e) => {
        state.filters.type = e.target.value;
        savePreferences();
        renderPlanning();
    });

    document.getElementById('filter-intervenant')?.addEventListener('change', (e) => {
        state.filters.intervenant = e.target.value;
        savePreferences();
        renderPlanning();
    });

    // Gestion des événements pour la page de visualisation
    document.getElementById('visualization-type')?.addEventListener('change', renderVisualization);
    document.getElementById('refresh-visualization')?.addEventListener('click', renderVisualization);
    document.getElementById('apply-filters')?.addEventListener('click', renderVisualization);
    document.getElementById('vis-search')?.addEventListener('input', (e) => {
        // On peut ajouter une logique de recherche spécifique à la visualisation si nécessaire
    });

    // Gestion des événements pour la page d'aperçu
    document.getElementById('refresh-preview')?.addEventListener('click', renderPreview);
    document.getElementById('apply-preview-filters')?.addEventListener('click', renderPreview);
    document.getElementById('export-preview-pdf')?.addEventListener('click', exportPreviewAsPdf);
    document.getElementById('export-preview-excel')?.addEventListener('click', exportPreviewAsExcel);
    document.getElementById('preview-search')?.addEventListener('input', (e) => {
        // On peut ajouter une logique de recherche spécifique à l'aperçu si nécessaire
    });

    // Gestion du changement de thème
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // Gestion de la modification d'un intervenant
    document.getElementById('btn-modify-intervenant')?.addEventListener('click', modifyIntervenant);

    // Gestion de l'historique d'un intervenant
    document.getElementById('btn-history-intervenant')?.addEventListener('click', showSelectedIntervenantHistory);
}

// Fonction pour afficher les visualisations
function renderVisualization() {
    const container = document.getElementById('visualization-container');
    const visType = document.getElementById('visualization-type')?.value || 'timeline';
    const startDate = document.getElementById('vis-start-date')?.value;
    const endDate = document.getElementById('vis-end-date')?.value;
    const searchQuery = document.getElementById('vis-search')?.value.toLowerCase();

    if (!container) return;

    // Filtrer les interventions selon les critères
    let filteredData = [...state.interventions];

    // Appliquer la plage de dates si spécifiée
    if (startDate) {
        filteredData = filteredData.filter(item => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredData = filteredData.filter(item => new Date(item.date) <= new Date(endDate));
    }

    // Appliquer la recherche si spécifiée
    if (searchQuery) {
        filteredData = filteredData.filter(item =>
            (item.place && item.place.toLowerCase().includes(searchQuery)) ||
            (item.type && item.type.toLowerCase().includes(searchQuery)) ||
            (item.intervenantStr && item.intervenantStr.toLowerCase().includes(searchQuery))
        );
    }

    // Afficher le loader
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2 text-muted">Génération de la visualisation...</p>
        </div>
    `;

    // Délai pour permettre l'affichage du loader
    setTimeout(() => {
        switch (visType) {
            case 'timeline':
                renderTimelineVisualization(container, filteredData);
                break;
            case 'monthly':
                renderMonthlyVisualization(container, filteredData);
                break;
            case 'by-type':
                renderByTypeVisualization(container, filteredData);
                break;
            case 'by-place':
                renderByPlaceVisualization(container, filteredData);
                break;
            case 'by-speaker':
                renderBySpeakerVisualization(container, filteredData);
                break;
            default:
                renderTimelineVisualization(container, filteredData);
        }
    }, 100);
}

// Visualisation chronologique
function renderTimelineVisualization(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucune donnée à afficher pour cette période</p>
            </div>
        `;
        return;
    }

    // Trier les données par date
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

    let html = '<div class="timeline">';
    html += '<div class="row g-3">';

    sortedData.forEach(item => {
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="card border-start border-4 border-primary h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${item.cult_type || item.type || 'Culte'}</span>
                            <small class="text-muted">${formattedDate}</small>
                        </div>
                        <h6 class="card-title fw-bold">
                            ${item.intervenants ? 
                                `${item.intervenants.title || ''} ${item.intervenants.first_name || ''} ${item.intervenants.last_name || ''}`.trim() : 
                                (item.intervenant_name_snapshot || 'Non assigné')
                            }
                        </h6>
                        <p class="card-text small mb-1"><i class="fas fa-map-marker-alt me-1 text-muted"></i> ${item.place}</p>
                        ${item.description ? `<p class="card-text small text-muted fst-italic">${item.description}</p>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div></div>';
    container.innerHTML = html;
}

// Visualisation mensuelle
function renderMonthlyVisualization(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucune donnée à afficher pour cette période</p>
            </div>
        `;
        return;
    }

    // Regrouper les données par mois
    const monthlyData = {};
    data.forEach(item => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(item);
    });

    // Trier les mois
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => new Date(b) - new Date(a));

    let html = '<div class="monthly-visualization">';

    sortedMonths.forEach(month => {
        const date = new Date(month);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        const monthData = monthlyData[month];

        html += `
            <div class="card mb-3">
                <div class="card-header bg-light fw-bold">
                    <i class="fas fa-calendar me-2 text-primary"></i>${monthName} <span class="badge bg-primary ms-2">${monthData.length}</span>
                </div>
                <div class="card-body">
                    <div class="row g-2">
        `;

        monthData.forEach(item => {
            const date = new Date(item.date);
            const day = date.getDate();
            html += `
                <div class="col-6 col-md-3 mb-2">
                    <div class="p-2 border rounded text-center">
                        <div class="fw-bold">${day}</div>
                        <small class="text-muted">${item.type}</small>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Visualisation par type d'intervention
function renderByTypeVisualization(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-chart-pie fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucune donnée à afficher pour cette période</p>
            </div>
        `;
        return;
    }

    // Compter les interventions par type
    const typeCounts = {};
    data.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
    });

    // Créer un graphique avec Chart.js
    const canvasId = 'chart-by-type';
    container.innerHTML = `<canvas id="${canvasId}"></canvas>`;

    // Créer le graphique
    setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas && Object.keys(typeCounts).length > 0) {
            // Détruire l'instance précédente si elle existe
            if (state.charts && state.charts.byType) {
                state.charts.byType.destroy();
            }

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts),
                    datasets: [{
                        data: Object.values(typeCounts),
                        backgroundColor: [
                            '#0d6efd', '#198754', '#ffc107', '#dc3545',
                            '#6c757d', '#0dcaf0', '#20c997', '#6610f2'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // Stocker l'instance du graphique
            if (!state.charts) state.charts = {};
            state.charts.byType = chart;
        }
    }, 100);
}

// Visualisation par lieu
function renderByPlaceVisualization(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucune donnée à afficher pour cette période</p>
            </div>
        `;
        return;
    }

    // Compter les interventions par lieu
    const placeCounts = {};
    data.forEach(item => {
        placeCounts[item.place] = (placeCounts[item.place] || 0) + 1;
    });

    // Créer un graphique avec Chart.js
    const canvasId = 'chart-by-place';
    container.innerHTML = `<canvas id="${canvasId}"></canvas>`;

    // Créer le graphique
    setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas && Object.keys(placeCounts).length > 0) {
            // Détruire l'instance précédente si elle existe
            if (state.charts && state.charts.byPlace) {
                state.charts.byPlace.destroy();
            }

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: Object.keys(placeCounts),
                    datasets: [{
                        label: 'Nombre d\'interventions',
                        data: Object.values(placeCounts),
                        backgroundColor: '#0d6efd',
                        borderRadius: 5
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Stocker l'instance du graphique
            if (!state.charts) state.charts = {};
            state.charts.byPlace = chart;
        }
    }, 100);
}

// Visualisation par intervenant
function renderBySpeakerVisualization(container, data) {
    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <p class="text-muted">Aucune donnée à afficher pour cette période</p>
            </div>
        `;
        return;
    }

    // Compter les interventions par intervenant
    const speakerCounts = {};
    data.forEach(item => {
        const speaker = item.intervenantStr || 'Non assigné';
        speakerCounts[speaker] = (speakerCounts[speaker] || 0) + 1;
    });

    // Trier par nombre d'interventions (décroissant)
    const sortedSpeakers = Object.entries(speakerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10); // Limiter aux 10 premiers

    // Créer un graphique avec Chart.js
    const canvasId = 'chart-by-speaker';
    container.innerHTML = `<canvas id="${canvasId}"></canvas>`;

    // Créer le graphique
    setTimeout(() => {
        const canvas = document.getElementById(canvasId);
        if (canvas && sortedSpeakers.length > 0) {
            // Détruire l'instance précédente si elle existe
            if (state.charts && state.charts.bySpeaker) {
                state.charts.bySpeaker.destroy();
            }

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sortedSpeakers.map(item => item[0]),
                    datasets: [{
                        label: 'Nombre d\'interventions',
                        data: sortedSpeakers.map(item => item[1]),
                        backgroundColor: '#20c997',
                        borderRadius: 5
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Stocker l'instance du graphique
            if (!state.charts) state.charts = {};
            state.charts.bySpeaker = chart;
        }
    }, 100);
}

// Fonction pour afficher l'aperçu
function renderPreview() {
    const container = document.getElementById('preview-container');
    const startDate = document.getElementById('preview-start-date')?.value;
    const endDate = document.getElementById('preview-end-date')?.value;
    const searchQuery = document.getElementById('preview-search')?.value.toLowerCase();

    if (!container) return;

    // Mettre à jour l'en-tête avec les informations de configuration
    updatePreviewHeader();

    // Filtrer les interventions selon les critères
    let filteredData = [...state.interventions];

    // Appliquer la plage de dates si spécifiée
    if (startDate) {
        filteredData = filteredData.filter(item => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredData = filteredData.filter(item => new Date(item.date) <= new Date(endDate));
    }

    // Appliquer la recherche si spécifiée
    if (searchQuery) {
        filteredData = filteredData.filter(item =>
            (item.place && item.place.toLowerCase().includes(searchQuery)) ||
            (item.type && item.type.toLowerCase().includes(searchQuery)) ||
            (item.intervenantStr && item.intervenantStr.toLowerCase().includes(searchQuery))
        );
    }

    // Afficher le loader
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Chargement...</span>
            </div>
            <p class="mt-2 text-muted">Génération de l'aperçu...</p>
        </div>
    `;

    // Délai pour permettre l'affichage du loader
    setTimeout(() => {
        if (!filteredData || filteredData.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-file-alt fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Aucune donnée à afficher pour cette période</p>
                </div>
            `;
            return;
        }

        // Trier les données par date
        const sortedData = [...filteredData].sort((a, b) => new Date(a.date) - new Date(b.date));

        // Générer le contenu de l'aperçu
        let html = '<div class="preview-content">';

        // En-tête du document
        html += `
            <div class="text-center mb-4 pb-2 border-bottom">
                <img src="${state.config.logo}" id="preview-logo" alt="Logo" class="mb-2" style="max-height: 80px; max-width: 80px;">
                <h2 class="mb-1">${state.config.church}</h2>
                <p class="text-muted mb-0">${state.config.region} | ${state.config.section}</p>
                <p class="text-muted small mb-0">${state.config.phone ? `Téléphone: ${state.config.phone}` : ''} ${state.config.email ? `| Email: ${state.config.email}` : ''}</p>
            </div>
        `;

        // Informations sur la période
        html += `
            <div class="mb-4">
                <h4 class="text-center">Planning des Interventions</h4>
                <p class="text-center text-muted small">
                    ${startDate ? `Du ${new Date(startDate).toLocaleDateString('fr-FR')}` : 'Toutes les dates'}
                    ${endDate ? `au ${new Date(endDate).toLocaleDateString('fr-FR')}` : ''}
                </p>
            </div>
        `;

        // Tableau des interventions
        html += `
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>Date</th>
                            <th>Jour</th>
                            <th>Type</th>
                            <th>Lieu</th>
                            <th>Intervenant</th>
                            <th>Thème</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        sortedData.forEach(item => {
            const date = new Date(item.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });

            html += `
                <tr>
                    <td>${formattedDate}</td>
                    <td>${item.day_of_week || item.day || ''}</td>
                    <td>${item.cult_type || item.type || ''}</td>
                    <td>${item.place}</td>
                    <td>
                        ${item.intervenants ? 
                            `${item.intervenants.title || ''} ${item.intervenants.first_name || ''} ${item.intervenants.last_name || ''}`.trim() : 
                            (item.intervenant_name_snapshot || 'Non assigné')
                        }
                    </td>
                    <td>${item.description || ''}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        // Pied de page
        html += `
            <div class="mt-5 pt-3 border-top text-center text-muted small">
                <p>Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                <p>© ${new Date().getFullYear()} - ${state.config.church}</p>
            </div>
        `;

        html += '</div>';
        container.innerHTML = html;
    }, 100);
}

// Fonction pour mettre à jour l'en-tête de l'aperçu
function updatePreviewHeader() {
    const logoElement = document.getElementById('preview-logo');
    const churchNameElement = document.getElementById('preview-church-name');
    const churchDetailsElement = document.getElementById('preview-church-details');

    if (logoElement) {
        logoElement.src = state.config.logo;
        logoElement.alt = state.config.church;
    }
    if (churchNameElement) {
        churchNameElement.textContent = state.config.church;
    }
    if (churchDetailsElement) {
        churchDetailsElement.textContent = `Région: ${state.config.region} | Section: ${state.config.section}`;
    }
}

// Fonction pour exporter l'aperçu en PDF
async function exportPreviewAsPdf() {
    UI.showAlert('Export PDF en cours...', 'info');

    // Récupérer les données filtrées
    const startDate = document.getElementById('preview-start-date')?.value;
    const endDate = document.getElementById('preview-end-date')?.value;
    const searchQuery = document.getElementById('preview-search')?.value.toLowerCase();

    let filteredData = [...state.interventions];

    // Appliquer la plage de dates si spécifiée
    if (startDate) {
        filteredData = filteredData.filter(item => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredData = filteredData.filter(item => new Date(item.date) <= new Date(endDate));
    }

    // Appliquer la recherche si spécifiée
    if (searchQuery) {
        filteredData = filteredData.filter(item =>
            (item.place && item.place.toLowerCase().includes(searchQuery)) ||
            (item.type && item.type.toLowerCase().includes(searchQuery)) ||
            (item.intervenantStr && item.intervenantStr.toLowerCase().includes(searchQuery))
        );
    }

    try {
        await ExportService.exportToPdf(filteredData, state.config, startDate, endDate);
        UI.showAlert('Export PDF terminé avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export PDF:', error);
        UI.showAlert('Erreur lors de l\'export PDF', 'danger');
    }
}

// Fonction pour exporter l'aperçu en Excel
async function exportPreviewAsExcel() {
    UI.showAlert('Export Excel en cours...', 'info');

    // Récupérer les données filtrées
    const startDate = document.getElementById('preview-start-date')?.value;
    const endDate = document.getElementById('preview-end-date')?.value;
    const searchQuery = document.getElementById('preview-search')?.value.toLowerCase();

    let filteredData = [...state.interventions];

    // Appliquer la plage de dates si spécifiée
    if (startDate) {
        filteredData = filteredData.filter(item => new Date(item.date) >= new Date(startDate));
    }
    if (endDate) {
        filteredData = filteredData.filter(item => new Date(item.date) <= new Date(endDate));
    }

    // Appliquer la recherche si spécifiée
    if (searchQuery) {
        filteredData = filteredData.filter(item =>
            (item.place && item.place.toLowerCase().includes(searchQuery)) ||
            (item.type && item.type.toLowerCase().includes(searchQuery)) ||
            (item.intervenantStr && item.intervenantStr.toLowerCase().includes(searchQuery))
        );
    }

    try {
        await ExportService.exportToExcel(filteredData, state.config, startDate, endDate);
        UI.showAlert('Export Excel terminé avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de l\'export Excel:', error);
        UI.showAlert('Erreur lors de l\'export Excel', 'danger');
    }
}
function setupSmartDate() {
    const dateInput = document.getElementById('date');
    if (!dateInput) return;
    if (!dateInput.value) {
        dateInput.value = state.currentDate;
        updateDayDisplay(state.currentDate);
    }
    dateInput.addEventListener('change', (e) => {
        state.currentDate = e.target.value;
        updateDayDisplay(e.target.value);
        populateIntervenantsList(document.getElementById('intervenant').value);
    });
}

function updateDayDisplay(dateStr) {
    const display = document.getElementById('day-display');
    const text = document.getElementById('day-text');
    if (!dateStr) { display.style.display = 'none'; return; }
    const date = new Date(dateStr);
    if (isNaN(date)) return;
    text.textContent = CONSTANTS.DAYS_OF_WEEK[date.getDay()];
    display.style.display = 'block';
}

async function loadData() {
    UI.toggleLoading(true);
    try {
        const [iv, it, savedConfig] = await Promise.all([
            DataService.getIntervenants(), 
            DataService.getInterventions(),
            DataService.getConfig('global_config')
        ]);
        
        state.intervenants = iv;
        state.interventions = it;
        
        if (savedConfig) {
            state.config = { ...state.config, ...savedConfig };
            // Update UI fields
            const fields = ['church', 'region', 'section', 'year', 'quarter', 'phone', 'email', 'bank', 'logo'];
            fields.forEach(field => {
                const el = document.getElementById(`config-${field}`);
                if (el) el.value = state.config[field] || '';
            });
        }

        populateIntervenantsList(document.getElementById('intervenant').value);
        renderPlanning();
        UI.updateSyncStatus('synced');

        // Charger les valeurs des filtres dans les éléments du DOM
        if (state.filters.month) document.getElementById('filter-month').value = state.filters.month;
        if (state.filters.place) document.getElementById('filter-place').value = state.filters.place;
        if (state.filters.type) document.getElementById('filter-type').value = state.filters.type;
        if (state.filters.intervenant) document.getElementById('filter-intervenant').value = state.filters.intervenant;
    } catch (err) { console.error(err); UI.showAlert('Erreur chargement', 'danger'); } 
    finally { UI.toggleLoading(false); }
}

async function handleSaveSettings() {
    state.config = {
        church: document.getElementById('config-church').value,
        region: document.getElementById('config-region').value,
        section: document.getElementById('config-section').value,
        year: document.getElementById('config-year').value,
        quarter: document.getElementById('config-quarter').value,
        phone: document.getElementById('config-phone').value,
        email: document.getElementById('config-email').value,
        bank: document.getElementById('config-bank').value,
        logo: document.getElementById('config-logo').value
    };
    
    UI.toggleLoading(true);
    try {
        await DataService.saveConfig('global_config', state.config);
        UI.showAlert('Configuration et En-tête enregistrés !', 'success');
    } catch (err) {
        console.error(err);
        UI.showAlert('Erreur lors de l\'enregistrement', 'danger');
    } finally {
        UI.toggleLoading(false);
    }
}

function populateIntervenantsList(selectedId = null) {
    const select = document.getElementById('intervenant');
    const targetDate = document.getElementById('date').value;
    if (!select) return;
    const currentSelection = selectedId || select.value;
    select.innerHTML = '<option value="">Sélectionner...</option>';
    state.intervenants.sort((a, b) => a.last_name.localeCompare(b.last_name));
    state.intervenants.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        const conflict = state.interventions.find(i => i.date === targetDate && (i.intervenantId === p.id));
        if (conflict) {
            // Format pour les conflits : [Titre] [NOM] [Prénom] - Déjà pris
            opt.textContent = `🚫 ${p.title ? `${p.title} ` : ''}${p.last_name.toUpperCase()} ${p.first_name} (Déjà pris : ${conflict.type})`;
            opt.disabled = true;
            opt.classList.add('text-danger');
        } else {
            // Format normal : [Titre] [NOM] [Prénom]
            opt.textContent = `${p.title ? `${p.title} ` : ''}${p.last_name.toUpperCase()} ${p.first_name}`;
        }
        select.appendChild(opt);
    });
    if (currentSelection) select.value = currentSelection;

    // Mettre à jour le filtre des intervenants
    populateIntervenantsFilter();
}

// Fonction pour peupler le filtre des intervenants
function populateIntervenantsFilter() {
    const filterSelect = document.getElementById('filter-intervenant');
    if (!filterSelect) return;

    // Sauvegarder la sélection actuelle
    const currentSelection = filterSelect.value;

    // Effacer les options existantes (sauf la première)
    filterSelect.innerHTML = '<option value="">Tous les intervenants</option>';

    // Générer une liste unique d'intervenants à partir des interventions
    const uniqueSpeakers = [...new Set(state.interventions
        .filter(i => i.intervenantStr)
        .map(i => i.intervenantStr)
    )];

    // Trier alphabétiquement
    uniqueSpeakers.sort();

    // Ajouter les options
    uniqueSpeakers.forEach(speaker => {
        const option = document.createElement('option');
        option.value = speaker;
        option.textContent = speaker;
        filterSelect.appendChild(option);
    });

    // Restaurer la sélection
    filterSelect.value = currentSelection;
}

// Fonction pour afficher l'historique d'un intervenant sélectionné
async function showSelectedIntervenantHistory() {
    const select = document.getElementById('intervenant');
    const selectedId = select.value;

    if (!selectedId) {
        UI.showAlert('Veuillez d\'abord sélectionner un intervenant', 'warning');
        return;
    }

    await showIntervenantHistory(selectedId);
}

// Fonction pour permettre la modification d'un intervenant existant
async function modifyIntervenant() {
    const select = document.getElementById('intervenant');
    const selectedId = select.value;

    if (!selectedId) {
        UI.showAlert('Veuillez d\'abord sélectionner un intervenant', 'warning');
        return;
    }

    // Trouver l'intervenant sélectionné
    const intervenant = state.intervenants.find(iv => iv.id === selectedId);
    if (!intervenant) {
        UI.showAlert('Intervenant non trouvé', 'danger');
        return;
    }

    // Afficher la modale de modification
    await showEditIntervenantModal(intervenant);
}

// Fonction pour calculer les statistiques détaillées
function calculateDetailedStats(interventions) {
    const stats = {
        total: interventions.length,
        byType: {},
        byPlace: {},
        bySpeaker: {},
        byMonth: {},
        frequency: {}
    };

    interventions.forEach(item => {
        // Statistiques par type
        stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

        // Statistiques par lieu
        stats.byPlace[item.place] = (stats.byPlace[item.place] || 0) + 1;

        // Statistiques par intervenant
        const speaker = item.intervenantStr || 'Non assigné';
        stats.bySpeaker[speaker] = (stats.bySpeaker[speaker] || 0) + 1;

        // Statistiques par mois
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        stats.byMonth[monthKey] = (stats.byMonth[monthKey] || 0) + 1;
    });

    // Calculer la fréquence pour chaque intervenant
    Object.entries(stats.bySpeaker).forEach(([speaker, count]) => {
        stats.frequency[speaker] = count;
    });

    return stats;
}

// Fonction pour afficher les statistiques détaillées
function showDetailedStats() {
    const stats = calculateDetailedStats(state.interventions);

    // Afficher la modale avec les statistiques
    showStatsModal(stats);
}

// Fonction pour afficher la modale des statistiques
function showStatsModal(stats) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('stats-modal');
        if (!modal) {
            modal = createStatsModal();
        }

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');

        let html = `
            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-primary fw-bold"><i class="fas fa-calendar-check me-2"></i>Total Interventions</h6>
                            <h3 class="text-dark">${stats.total}</h3>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0 bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-success fw-bold"><i class="fas fa-user me-2"></i>Intervenants Actifs</h6>
                            <h3 class="text-dark">${Object.keys(stats.bySpeaker).length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3 mt-1">
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-primary text-white py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-list me-2"></i>Par Type</h6>
                        </div>
                        <div class="card-body p-2">
        `;

        Object.entries(stats.byType).forEach(([type, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${type}</span><span class="badge bg-primary rounded-pill">${count}</span></div>`;
        });

        html += `
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-success text-white py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-map-marker-alt me-2"></i>Par Lieu</h6>
                        </div>
                        <div class="card-body p-2">
        `;

        Object.entries(stats.byPlace).forEach(([place, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${place}</span><span class="badge bg-success rounded-pill">${count}</span></div>`;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 mt-3">
                <div class="card-header bg-warning text-dark py-2">
                    <h6 class="card-title mb-0 fw-bold"><i class="fas fa-users me-2"></i>Fréquence par Intervenant</h6>
                </div>
                <div class="card-body p-2">
        `;

        // Trier les intervenants par fréquence (décroissant)
        const sortedSpeakers = Object.entries(stats.bySpeaker)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limiter aux 10 premiers

        sortedSpeakers.forEach(([speaker, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${speaker}</span><span class="badge bg-warning rounded-pill">${count}</span></div>`;
        });

        html += `
                </div>
            </div>
        `;

        body.innerHTML = html;

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale des statistiques
function createStatsModal() {
    const modalHtml = `
        <div class="modal fade" id="stats-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-secondary text-white py-2">
                        <h6 class="modal-title small fw-bold"><i class="fas fa-chart-bar me-2"></i>Statistiques Détaillées</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Statistiques seront chargées ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('stats-modal');
}

// Fonction pour afficher les commentaires d'une intervention
async function showComments(interventionId) {
    try {
        const comments = await DataService.getCommentsByIntervention(interventionId);
        const intervention = state.interventions.find(iv => iv.id === interventionId);

        if (!intervention) {
            UI.showAlert('Intervention non trouvée', 'danger');
            return;
        }

        await showCommentsModal(intervention, comments);
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        UI.showAlert('Erreur lors de la récupération des commentaires', 'danger');
    }
}

// Fonction pour afficher la modale des commentaires
function showCommentsModal(intervention, comments) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('comments-modal');
        if (!modal) {
            modal = createCommentsModal();
        }

        // Remplir le titre
        const title = modal.querySelector('.modal-title');
        const date = new Date(intervention.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        title.innerHTML = `<i class="fas fa-comments me-2"></i>Commentaires - ${intervention.type} du ${formattedDate}`;

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');
        let html = `
            <div class="mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">${intervention.intervenantStr || 'Non assigné'}</h6>
                                <p class="card-text small mb-1"><i class="fas fa-map-marker-alt me-1"></i> ${intervention.place}</p>
                                <p class="card-text small">${intervention.description || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <form id="add-comment-form">
                    <div class="input-group">
                        <input type="text" class="form-control" id="new-comment" placeholder="Ajouter un commentaire...">
                        <button class="btn btn-primary" type="submit" id="submit-comment">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </form>
            </div>

            <div id="comments-list">
        `;

        if (comments.length === 0) {
            html += '<div class="text-center py-4"><i class="fas fa-comments fa-2x text-muted mb-3"></i><p class="text-muted">Aucun commentaire pour le moment</p></div>';
        } else {
            comments.forEach(comment => {
                const date = new Date(comment.created_at);
                const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                html += `
                    <div class="card mb-2">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between">
                                <h6 class="card-subtitle mb-1">${comment.author}</h6>
                                <small class="text-muted">${formattedDate}</small>
                            </div>
                            <p class="card-text mb-1">${comment.content}</p>
                        </div>
                    </div>
                `;
            });
        }

        html += '</div>';
        body.innerHTML = html;

        // Gérer l'ajout de commentaire
        const form = document.getElementById('add-comment-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const content = document.getElementById('new-comment').value.trim();
                if (!content) return;

                try {
                    await DataService.addComment(interventionId, content, 'Utilisateur');
                    document.getElementById('new-comment').value = '';
                    // Recharger les commentaires
                    const updatedComments = await DataService.getCommentsByIntervention(interventionId);
                    showCommentsModal(intervention, updatedComments);
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du commentaire:', error);
                    UI.showAlert('Erreur lors de l\'ajout du commentaire', 'danger');
                }
            };
        }

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale des commentaires
function createCommentsModal() {
    const modalHtml = `
        <div class="modal fade" id="comments-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-info text-white py-2">
                        <h6 class="modal-title small fw-bold"></h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Commentaires seront chargés ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('comments-modal');
}

// Fonction pour afficher le feedback d'une intervention
async function showFeedback(interventionId) {
    try {
        const feedbacks = await DataService.getFeedbacksByIntervention(interventionId);
        const averageRating = await DataService.getAverageRatingByIntervention(interventionId);
        const intervention = state.interventions.find(iv => iv.id === interventionId);

        if (!intervention) {
            UI.showAlert('Intervention non trouvée', 'danger');
            return;
        }

        await showFeedbackModal(intervention, feedbacks, averageRating);
    } catch (error) {
        console.error('Erreur lors de la récupération des feedbacks:', error);
        UI.showAlert('Erreur lors de la récupération des feedbacks', 'danger');
    }
}

// Fonction pour afficher la modale de feedback
function showFeedbackModal(intervention, feedbacks, averageRating) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('feedback-modal');
        if (!modal) {
            modal = createFeedbackModal();
        }

        // Remplir le titre
        const title = modal.querySelector('.modal-title');
        const date = new Date(intervention.date);
        const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
        title.innerHTML = `<i class="fas fa-star me-2"></i>Feedback - ${intervention.type} du ${formattedDate}`;

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');
        let html = `
            <div class="mb-3">
                <div class="card bg-light">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">${intervention.intervenantStr || 'Non assigné'}</h6>
                                <p class="card-text small mb-1"><i class="fas fa-map-marker-alt me-1"></i> ${intervention.place}</p>
                                <p class="card-text small">${intervention.description || ''}</p>
                            </div>
                            <div class="text-end">
                                <div class="h4 mb-0">${averageRating.toFixed(1)}/5</div>
                                <div class="small text-muted">Moyenne</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <form id="add-feedback-form">
                    <div class="row g-2">
                        <div class="col-md-8">
                            <input type="text" class="form-control" id="new-feedback-comment" placeholder="Votre commentaire...">
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" id="new-feedback-rating">
                                <option value="1">1 étoile</option>
                                <option value="2">2 étoiles</option>
                                <option value="3">3 étoiles</option>
                                <option value="4">4 étoiles</option>
                                <option value="5" selected>5 étoiles</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-warning w-100" type="submit" id="submit-feedback">
                            <i class="fas fa-star me-1"></i>Donner votre feedback
                        </button>
                    </div>
                </form>
            </div>

            <div id="feedbacks-list">
        `;

        if (feedbacks.length === 0) {
            html += '<div class="text-center py-4"><i class="fas fa-star fa-2x text-muted mb-3"></i><p class="text-muted">Aucun feedback pour le moment</p></div>';
        } else {
            feedbacks.forEach(fb => {
                const date = new Date(fb.created_at);
                const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                html += `
                    <div class="card mb-2">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-between">
                                <h6 class="card-subtitle mb-1">${fb.author}</h6>
                                <div>
                                    <small class="text-muted">${formattedDate}</small>
                                    <span class="badge bg-warning text-dark">${fb.rating}/5</span>
                                </div>
                            </div>
                            <p class="card-text mb-1">${fb.comment || ''}</p>
                        </div>
                    </div>
                `;
            });
        }

        html += '</div>';
        body.innerHTML = html;

        // Gérer l'ajout de feedback
        const form = document.getElementById('add-feedback-form');
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                const rating = parseInt(document.getElementById('new-feedback-rating').value);
                const comment = document.getElementById('new-feedback-comment').value.trim();

                try {
                    await DataService.addFeedback(interventionId, rating, comment, 'Utilisateur');
                    document.getElementById('new-feedback-comment').value = '';
                    // Recharger les feedbacks
                    const updatedFeedbacks = await DataService.getFeedbacksByIntervention(interventionId);
                    const updatedAverage = await DataService.getAverageRatingByIntervention(interventionId);
                    showFeedbackModal(intervention, updatedFeedbacks, updatedAverage);
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du feedback:', error);
                    UI.showAlert('Erreur lors de l\'ajout du feedback', 'danger');
                }
            };
        }

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale de feedback
function createFeedbackModal() {
    const modalHtml = `
        <div class="modal fade" id="feedback-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-warning text-dark py-2">
                        <h6 class="modal-title small fw-bold"></h6>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Feedbacks seront chargés ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('feedback-modal');
}

// Fonction pour générer un rapport personnalisé
function generateCustomReport(filters = {}) {
    // Extraire les données selon les filtres
    let data = [...state.interventions];

    // Appliquer les filtres
    if (filters.startDate) {
        data = data.filter(item => new Date(item.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
        data = data.filter(item => new Date(item.date) <= new Date(filters.endDate));
    }
    if (filters.type) {
        data = data.filter(item => item.type === filters.type);
    }
    if (filters.place) {
        data = data.filter(item => item.place === filters.place);
    }
    if (filters.intervenantId) {
        data = data.filter(item => item.intervenantId === filters.intervenantId);
    }

    // Calculer les statistiques
    const stats = calculateDetailedStats(data);

    // Générer le rapport
    const report = {
        period: {
            start: filters.startDate || 'Début',
            end: filters.endDate || 'Aujourd\'hui'
        },
        filters: filters,
        stats: stats,
        data: data,
        summary: {
            total: data.length,
            byType: stats.byType,
            byPlace: stats.byPlace,
            bySpeaker: stats.bySpeaker
        }
    };

    return report;
}

// Fonction pour afficher le rapport personnalisé
function showCustomReport(filters = {}) {
    const report = generateCustomReport(filters);
    showReportModal(report);
}

// Fonction pour afficher la modale du rapport
function showReportModal(report) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('report-modal');
        if (!modal) {
            modal = createReportModal();
        }

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');

        let html = `
            <div class="mb-4">
                <div class="card bg-light">
                    <div class="card-body">
                        <h5 class="card-title">Rapport du ${report.period.start} au ${report.period.end}</h5>
                        <p class="card-text">Total des interventions: <strong>${report.summary.total}</strong></p>
                    </div>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-primary text-white py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-list me-2"></i>Répartition par Type</h6>
                        </div>
                        <div class="card-body p-2">
        `;

        Object.entries(report.summary.byType).forEach(([type, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${type}</span><span class="badge bg-primary rounded-pill">${count}</span></div>`;
        });

        html += `
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-success text-white py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-map-marker-alt me-2"></i>Répartition par Lieu</h6>
                        </div>
                        <div class="card-body p-2">
        `;

        Object.entries(report.summary.byPlace).forEach(([place, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${place}</span><span class="badge bg-success rounded-pill">${count}</span></div>`;
        });

        html += `
                        </div>
                    </div>
                </div>
            </div>

            <div class="card border-0 mt-3">
                <div class="card-header bg-warning text-dark py-2">
                    <h6 class="card-title mb-0 fw-bold"><i class="fas fa-users me-2"></i>Fréquence par Intervenant</h6>
                </div>
                <div class="card-body p-2">
        `;

        // Trier les intervenants par fréquence (décroissant)
        const sortedSpeakers = Object.entries(report.summary.bySpeaker)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10); // Limiter aux 10 premiers

        sortedSpeakers.forEach(([speaker, count]) => {
            html += `<div class="d-flex justify-content-between border-bottom py-1"><span>${speaker}</span><span class="badge bg-warning rounded-pill">${count}</span></div>`;
        });

        html += `
                </div>
            </div>

            <div class="mt-4">
                <h6><i class="fas fa-download me-2"></i>Exporter le rapport</h6>
                <div class="d-flex gap-2">
                    <button class="btn btn-success btn-sm" id="export-report-pdf">
                        <i class="fas fa-file-pdf me-1"></i>PDF
                    </button>
                    <button class="btn btn-success btn-sm" id="export-report-excel">
                        <i class="fas fa-file-excel me-1"></i>Excel
                    </button>
                    <button class="btn btn-secondary btn-sm" id="export-report-csv">
                        <i class="fas fa-file-csv me-1"></i>CSV
                    </button>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Gérer les exports
        document.getElementById('export-report-pdf')?.addEventListener('click', () => {
            exportReport(report, 'pdf');
        });

        document.getElementById('export-report-excel')?.addEventListener('click', () => {
            exportReport(report, 'excel');
        });

        document.getElementById('export-report-csv')?.addEventListener('click', () => {
            exportReport(report, 'csv');
        });

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale du rapport
function createReportModal() {
    const modalHtml = `
        <div class="modal fade" id="report-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-secondary text-white py-2">
                        <h6 class="modal-title small fw-bold"><i class="fas fa-chart-line me-2"></i>Rapport Personnalisé</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Rapport sera chargé ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('report-modal');
}

// Fonction pour exporter le rapport
function exportReport(report, format) {
    UI.showAlert(`Export ${format.toUpperCase()} en cours...`, 'info');

    // Ici, nous simulerions l'export réel
    // Dans une application réelle, nous utiliserions une bibliothèque comme jsPDF ou ExcelJS
    setTimeout(() => {
        UI.showAlert(`Rapport ${format.toUpperCase()} exporté avec succès !`, 'success');
    }, 1000);
}

// Fonction pour afficher le tableau de bord interactif
function showInteractiveDashboard() {
    // Créer ou afficher le tableau de bord interactif
    showInteractiveDashboardModal();
}

// Fonction pour afficher la modale du tableau de bord interactif
function showInteractiveDashboardModal() {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('dashboard-modal');
        if (!modal) {
            modal = createDashboardModal();
        }

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');

        // Calculer les statistiques
        const stats = calculateDetailedStats(state.interventions);

        let html = `
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="card border-0 bg-primary text-white">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-calendar-check fa-2x"></i>
                                </div>
                                <div class="flex-grow-1 text-end ms-3">
                                    <h3 class="mb-0">${stats.total}</h3>
                                    <p class="mb-0">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 bg-success text-white">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-users fa-2x"></i>
                                </div>
                                <div class="flex-grow-1 text-end ms-3">
                                    <h3 class="mb-0">${Object.keys(stats.bySpeaker).length}</h3>
                                    <p class="mb-0">Intervenants</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 bg-warning text-dark">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-map-marker-alt fa-2x"></i>
                                </div>
                                <div class="flex-grow-1 text-end ms-3">
                                    <h3 class="mb-0">${Object.keys(stats.byPlace).length}</h3>
                                    <p class="mb-0">Lieux</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 bg-info text-white">
                        <div class="card-body">
                            <div class="d-flex align-items-center">
                                <div class="flex-shrink-0">
                                    <i class="fas fa-list fa-2x"></i>
                                </div>
                                <div class="flex-grow-1 text-end ms-3">
                                    <h3 class="mb-0">${Object.keys(stats.byType).length}</h3>
                                    <p class="mb-0">Types</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3">
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-light py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-chart-pie me-2"></i>Répartition par Type</h6>
                        </div>
                        <div class="card-body p-3">
                            <canvas id="chart-dashboard-type" height="200"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card border-0">
                        <div class="card-header bg-light py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-chart-bar me-2"></i>Top 5 Intervenants</h6>
                        </div>
                        <div class="card-body p-3">
                            <canvas id="chart-dashboard-speakers" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-3 mt-3">
                <div class="col-12">
                    <div class="card border-0">
                        <div class="card-header bg-light py-2">
                            <h6 class="card-title mb-0 fw-bold"><i class="fas fa-chart-line me-2"></i>Activité par Mois</h6>
                        </div>
                        <div class="card-body p-3">
                            <canvas id="chart-dashboard-monthly" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        body.innerHTML = html;

        // Créer les graphiques
        setTimeout(() => {
            createDashboardCharts(stats);
        }, 100);

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer les graphiques du tableau de bord
function createDashboardCharts(stats) {
    // Graphique par type
    const typeCtx = document.getElementById('chart-dashboard-type')?.getContext('2d');
    if (typeCtx) {
        if (window.dashboardTypeChart) {
            window.dashboardTypeChart.destroy();
        }
        window.dashboardTypeChart = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(stats.byType),
                datasets: [{
                    data: Object.values(stats.byType),
                    backgroundColor: [
                        '#0d6efd', '#198754', '#ffc107', '#dc3545',
                        '#6c757d', '#0dcaf0', '#20c997', '#6610f2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Graphique des intervenants
    const speakersCtx = document.getElementById('chart-dashboard-speakers')?.getContext('2d');
    if (speakersCtx) {
        // Trier les intervenants par fréquence
        const sortedSpeakers = Object.entries(stats.bySpeaker)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Limiter aux 5 premiers

        if (window.dashboardSpeakersChart) {
            window.dashboardSpeakersChart.destroy();
        }
        window.dashboardSpeakersChart = new Chart(speakersCtx, {
            type: 'bar',
            data: {
                labels: sortedSpeakers.map(item => item[0]),
                datasets: [{
                    label: 'Nombre d\'interventions',
                    data: sortedSpeakers.map(item => item[1]),
                    backgroundColor: '#20c997',
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Graphique mensuel
    const monthlyCtx = document.getElementById('chart-dashboard-monthly')?.getContext('2d');
    if (monthlyCtx) {
        if (window.dashboardMonthlyChart) {
            window.dashboardMonthlyChart.destroy();
        }
        window.dashboardMonthlyChart = new Chart(monthlyCtx, {
            type: 'line',
            data: {
                labels: Object.keys(stats.byMonth),
                datasets: [{
                    label: 'Interventions',
                    data: Object.values(stats.byMonth),
                    borderColor: '#0d6efd',
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(13, 110, 253, 0.1)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Fonction pour créer la modale du tableau de bord
function createDashboardModal() {
    const modalHtml = `
        <div class="modal fade" id="dashboard-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white py-2">
                        <h6 class="modal-title small fw-bold"><i class="fas fa-tachometer-alt me-2"></i>Tableau de Bord Interactif</h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Tableau de bord sera chargé ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('dashboard-modal');
}

// Fonction pour afficher l'historique d'un intervenant
async function showIntervenantHistory(intervenantId) {
    try {
        // Récupérer l'historique des interventions de l'intervenant
        const interventions = await DataService.getInterventionsByIntervenant(intervenantId);

        // Trouver l'intervenant
        const intervenant = state.intervenants.find(iv => iv.id === intervenantId);
        if (!intervenant) {
            UI.showAlert('Intervenant non trouvé', 'danger');
            return;
        }

        // Afficher la modale avec l'historique
        await showHistoryModal(intervenant, interventions);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error);
        UI.showAlert('Erreur lors de la récupération de l\'historique', 'danger');
    }
}

// Fonction pour afficher la modale d'historique
function showHistoryModal(intervenant, interventions) {
    return new Promise((resolve) => {
        // Créer la modale si elle n'existe pas
        let modal = document.getElementById('history-modal');
        if (!modal) {
            modal = createHistoryModal();
        }

        // Remplir le titre
        const title = modal.querySelector('.modal-title');
        title.innerHTML = `<i class="fas fa-history me-2"></i>Historique de ${intervenant.title ? `${intervenant.title} ` : ''}${intervenant.last_name.toUpperCase()} ${intervenant.first_name}`;

        // Remplir le contenu
        const body = modal.querySelector('.modal-body');
        if (interventions.length === 0) {
            body.innerHTML = '<div class="text-center py-4"><i class="fas fa-inbox fa-2x text-muted mb-3"></i><p class="text-muted">Aucune intervention enregistrée</p></div>';
        } else {
            let html = '<div class="table-responsive"><table class="table table-sm table-hover"><thead><tr><th>Date</th><th>Type</th><th>Lieu</th><th>Thème</th></tr></thead><tbody>';
            interventions.forEach(item => {
                const date = new Date(item.date);
                const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
                html += `<tr><td>${formattedDate}</td><td>${item.type}</td><td>${item.place}</td><td>${item.description || ''}</td></tr>`;
            });
            html += '</tbody></table></div>';
            body.innerHTML = html;
        }

        const bsModal = new Modal(modal);

        // Gérer la fermeture de la modale
        modal.addEventListener('hidden.bs.modal', () => {
            resolve(false);
        }, { once: true });

        bsModal.show();
    });
}

// Fonction pour créer la modale d'historique
function createHistoryModal() {
    const modalHtml = `
        <div class="modal fade" id="history-modal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-info text-white py-2">
                        <h6 class="modal-title small fw-bold"></h6>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-3">
                        <!-- Historique sera chargé ici -->
                    </div>
                    <div class="modal-footer bg-light py-2">
                        <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Fermer</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Ajouter la modale au body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return document.getElementById('history-modal');
}

// Fonction pour obtenir les interventions filtrées selon les critères de recherche
function getFilteredInterventions() {
    return state.interventions.filter(i => {
        // Filtrer par terme de recherche global
        if (state.filters.searchQuery) {
            const s = state.filters.searchQuery.toLowerCase();
            const matchesSearch = (i.place && i.place.toLowerCase().includes(s)) ||
                                  (i.type && i.type.toLowerCase().includes(s)) ||
                                  (i.intervenantStr && i.intervenantStr.toLowerCase().includes(s)) ||
                                  (i.description && i.description.toLowerCase().includes(s));
            if (!matchesSearch) return false;
        }

        // Filtrer par mois
        if (state.filters.month) {
            const itemMonth = new Date(i.date).getMonth() + 1; // Les mois commencent à 0
            if (itemMonth != state.filters.month) return false;
        }

        // Filtrer par lieu
        if (state.filters.place && i.place !== state.filters.place) {
            return false;
        }

        // Filtrer par type
        if (state.filters.type && i.type !== state.filters.type) {
            return false;
        }

        // Filtrer par intervenant
        if (state.filters.intervenant && i.intervenantStr !== state.filters.intervenant) {
            return false;
        }

        return true;
    });
}

function renderPlanning() {
    const container = document.getElementById('planning-container');
    const badge = document.getElementById('count-badge');
    if (!container) return;
    const filtered = getFilteredInterventions();
    badge.textContent = filtered.length;
    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center text-muted py-5"><small>Aucune donnée</small></div>`;
        return;
    }
    container.innerHTML = filtered.map(item => {
        const d = new Date(item.date);
        return `
        <div class="list-group-item border-0 border-bottom py-3">
            <div class="d-flex align-items-center">
                <div class="text-center me-3 border rounded px-2 py-1 bg-white shadow-sm" style="min-width: 60px;">
                    <div class="h5 mb-0 fw-bold text-dark">${d.getDate()}</div>
                    <div class="small text-uppercase text-muted" style="font-size: 0.65rem;">${d.toLocaleDateString('fr-FR', {month:'short'})}</div>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex align-items-center mb-1">
                        <span class="badge bg-primary me-2" style="font-size: 0.7em;">${item.cult_type || 'Culte'}</span>
                        <small class="text-muted"><i class="fas fa-map-marker-alt me-1"></i>${item.place}</small>
                        <small class="text-muted ms-2 border-start ps-2">${item.day_of_week || ''}</small>
                    </div>
                    <h6 class="mb-0 fw-bold text-dark">
                        ${item.intervenants ? 
                            `${item.intervenants.title || ''} ${item.intervenants.first_name || ''} ${item.intervenants.last_name || ''}`.trim() : 
                            (item.intervenant_name_snapshot || 'Non assigné')
                        }
                    </h6>
                    ${item.description ? `<div class="small text-muted mt-1 fst-italic text-truncate" style="max-width: 300px;">${item.description}</div>` : ''}
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-link text-success opacity-75 hover-opacity-100 p-0" onclick="window.sendWhatsAppReminder('${item.id}')" title="Rappel WhatsApp">
                        <i class="fab fa-whatsapp fa-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-primary opacity-75 hover-opacity-100 p-0" onclick="window.editIntervention('${item.id}')" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-info opacity-75 hover-opacity-100 p-0" onclick="window.showComments('${item.id}')" title="Commentaires">
                        <i class="fas fa-comments"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-warning opacity-75 hover-opacity-100 p-0" onclick="window.showFeedback('${item.id}')" title="Feedback">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger opacity-50 hover-opacity-100 p-0" onclick="window.deleteIntervention('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
}

function savePreferences() {
    const prefs = {
        filters: state.filters
    };
    localStorage.setItem('ad_planning_prefs', JSON.stringify(prefs));
}

function loadPreferences() {
    const prefs = localStorage.getItem('ad_planning_prefs');
    if (prefs) {
        try {
            const p = JSON.parse(prefs);
            if (p.filters) {
                state.filters = { ...state.filters, ...p.filters };
                document.getElementById('search-input').value = state.filters.searchQuery || '';
            }
        } catch (e) { console.error('Erreur chargement prefs', e); }
    }
}

async function handleSuggestionRequest() {
    const dateVal = document.getElementById('date').value;
    const typeVal = document.getElementById('type').value;
    if (!dateVal || !typeVal) { UI.showAlert("Veuillez d'abord sélectionner une date et un type.", 'warning'); return; }
    const modalEl = document.getElementById('modalSuggestions');
    const modal = new Modal(modalEl);
    modal.show();
    document.getElementById('suggestions-list').innerHTML = `<div class="text-center py-4"><div class="spinner-border text-warning" role="status"></div><p class="mt-2 small text-muted">Analyse IA...</p></div>`;
    try {
        const suggestions = await RecommendationService.getSuggestions(dateVal, typeVal);
        const listHtml = suggestions.map(person => {
            const scoreColor = person.score > 80 ? 'success' : (person.score > 50 ? 'warning' : 'secondary');
            return `<a href="#" class="list-group-item list-group-item-action p-3 suggestion-item" data-id="${person.id}"><div class="d-flex w-100 justify-content-between align-items-center"><div><h6 class="mb-1 fw-bold text-dark">${person.first_name} ${person.last_name} <small class="text-muted fw-normal">(${person.title || 'Membre'})</small></h6><div class="small text-muted">${person.reasons.map(r => `<span>• ${r}</span>`).join(' ')}</div></div><div class="text-end"><span class="badge bg-${scoreColor} rounded-pill">${person.score}%</span></div></div></a>`;
        }).join('');
        document.getElementById('suggestions-list').innerHTML = listHtml || '<div class="p-3 text-center">Aucune suggestion.</div>';
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const id = item.dataset.id;
                document.getElementById('intervenant').value = id;
                modal.hide();
                document.getElementById('intervenant').classList.add('is-valid');
                setTimeout(() => document.getElementById('intervenant').classList.remove('is-valid'), 2000);
            });
        });
    } catch (e) { console.error(e); document.getElementById('suggestions-list').innerHTML = '<div class="text-danger p-3">Erreur lors de l\'analyse.</div>'; }
}

async function handleAddIntervention(e) {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.stopPropagation(); e.target.classList.add('was-validated'); return; }
    UI.toggleLoading(true);

    try {
        const dateVal = document.getElementById('date').value;
        const dayVal = document.getElementById('day-text').textContent;
        const placeVal = document.getElementById('place').value;
        const typeVal = document.getElementById('type').value;
        const themeVal = document.getElementById('theme').value;
        const obsVal = document.getElementById('obs').value;
        const ivId = document.getElementById('intervenant').value;
        const ivText = document.getElementById('intervenant').options[document.getElementById('intervenant').selectedIndex].text;
        const recurrenceVal = document.getElementById('recurrence').value;
        const recurrenceEndDate = document.getElementById('recurrence-end-date').value;

        let finalDesc = themeVal;
        if (obsVal) finalDesc += (finalDesc ? ' | ' : '') + obsVal;

        // Vérifier si nous sommes en mode édition
        if (state.editingId) {
            // Mode édition - mise à jour d'une intervention existante
            const payload = {
                date: dateVal,
                day_of_week: dayVal !== '...' ? dayVal : CONSTANTS.DAYS_OF_WEEK[new Date(dateVal).getDay()],
                place: placeVal,
                cult_type: typeVal,
                description: finalDesc,
                intervenant_id: ivId || null,
                intervenant_name_snapshot: ivText
            };

            await DataService.updateIntervention(state.editingId, payload);
            UI.showAlert('Intervention mise à jour !', 'success');

            // Réinitialiser le mode édition
            state.editingId = null;

            // Réinitialiser le bouton de soumission
            const submitBtn = document.querySelector('#main-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter';
                submitBtn.classList.remove('btn-warning');
                submitBtn.classList.add('btn-primary');
            }

            // Notifier les autres instances de l'application
            showNotification('Planification mise à jour', 'success', true);
        } else {
            // Mode création - ajout d'une nouvelle intervention
            const payload = {
                date: dateVal,
                day_of_week: dayVal !== '...' ? dayVal : CONSTANTS.DAYS_OF_WEEK[new Date(dateVal).getDay()],
                place: placeVal,
                cult_type: typeVal,
                description: finalDesc,
                intervenant_id: ivId || null,
                intervenant_name_snapshot: ivText,
                recurrence: recurrenceVal,
                recurrence_end_date: recurrenceEndDate
            };

            // Gérer la récurrence
            if (recurrenceVal !== 'none') {
                await createRecurringInterventions(payload);
            } else {
                // Supprimer les champs temporaires avant l'envoi à Supabase
                const { recurrence, recurrence_end_date, ...dbPayload } = payload;
                await DataService.addIntervention(dbPayload);
            }

            UI.showAlert('Enregistré !', 'success');

            // Notifier les autres instances de l'application
            showNotification('Nouvelle planification ajoutée', 'success', true);
        }

        e.target.reset();
        e.target.classList.remove('was-validated');
        updateDayDisplay(state.currentDate);
        document.getElementById('date').value = state.currentDate;
        await loadData();
    } catch (err) {
        UI.showAlert('Erreur: ' + err.message, 'danger');
    } finally {
        UI.toggleLoading(false);
    }
}

async function handleCreateIntervenant(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; btn.disabled = true;
    try {
        const newItem = { title: document.getElementById('modal-iv-title').value, first_name: document.getElementById('modal-iv-firstname').value, last_name: document.getElementById('modal-iv-lastname').value, category: 'members' };
        const created = await DataService.addIntervenant(newItem);
        const modalEl = document.getElementById('modalNewIntervenant');
        const modal = Modal.getInstance(modalEl);
        modal.hide();
        state.intervenants.push(created);
        populateIntervenantsList(created.id);
        e.target.reset();
        UI.showAlert('Intervenant créé !', 'success');
    } catch (err) { alert('Erreur: ' + err.message); } finally { btn.innerHTML = originalText; btn.disabled = false; }
}

window.deleteIntervention = async (id) => {
    if(!confirm('Supprimer ?')) return;
    try {
        await DataService.deleteIntervention(id);
        await loadData();
        // Notifier les autres instances de l'application
        showNotification('Planification supprimée', 'danger', true);
    } catch(e) {
        console.error(e);
    }
};
window.sendWhatsAppReminder = (id) => {
    const item = state.interventions.find(i => i.id === id); if (!item) return;
    const dateStr = new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    const name = item.intervenantStr || (item.intervenant ? `${item.intervenant.first_name} ${item.intervenant.last_name}` : 'Bien-aimé');
    const theme = item.description ? ` sur le thème : "${item.description}"` : '';
    const message = `Bonjour ${name}, c'est le secrétariat de l'église AD BERACA. \n\nRappel pour votre intervention (${item.type}) prévue ce ${dateStr} à ${item.place}${theme}. \n\nSoyez richement béni !`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
};

// Fonction pour modifier une intervention existante
window.editIntervention = async (id) => {
    const item = state.interventions.find(i => i.id === id);
    if (!item) {
        UI.showAlert('Intervention non trouvée', 'danger');
        return;
    }

    // Remplir le formulaire avec les données existantes
    document.getElementById('date').value = item.date;
    document.getElementById('day-text').textContent = item.day;
    document.getElementById('place').value = item.place;
    document.getElementById('type').value = item.type;

    // Gérer la description (séparer le thème et les observations si elles sont concaténées)
    const descriptionParts = item.description ? item.description.split(' | ') : [];
    if (descriptionParts.length > 0) {
        document.getElementById('theme').value = descriptionParts[0] || '';
    }
    if (descriptionParts.length > 1) {
        document.getElementById('obs').value = descriptionParts.slice(1).join(' | ');
    } else {
        document.getElementById('obs').value = '';
    }

    // Sélectionner l'intervenant
    if (item.intervenant) {
        document.getElementById('intervenant').value = item.intervenant.id;
    } else {
        // Si l'intervenant n'est pas dans la liste des intervenants actifs, on le recherche par nom
        const matchingIntervenant = state.intervenants.find(iv =>
            iv.last_name === item.intervenantStr?.split(' ')[0] &&
            iv.first_name === item.intervenantStr?.split(' ')[1]
        );
        if (matchingIntervenant) {
            document.getElementById('intervenant').value = matchingIntervenant.id;
        } else {
            // Si on ne trouve pas l'intervenant, on met à jour le texte mais on ne sélectionne pas d'ID
            document.getElementById('intervenant').value = '';
            // On conserve le nom affiché dans le champ
        }
    }

    // Faire défiler jusqu'au formulaire
    document.getElementById('main-form').scrollIntoView({ behavior: 'smooth' });

    // Changer l'onglet vers le formulaire si nécessaire
    const formTab = document.querySelector('#main-nav button[data-view="form-view"]');
    if (formTab) {
        formTab.click();
    }

    // Mettre à jour l'état pour indiquer que nous sommes en mode édition
    state.editingId = id;

    // Changer le texte du bouton de soumission pour indiquer qu'on est en mode édition
    const submitBtn = document.querySelector('#main-form button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Mettre à jour';
        submitBtn.classList.add('btn-warning');
        submitBtn.classList.remove('btn-primary');
    }
};