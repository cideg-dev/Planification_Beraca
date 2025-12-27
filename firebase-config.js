// Configuration Firebase
// Cette configuration doit être mise à jour avec vos propres valeurs Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Fonction pour sauvegarder les données dans Firebase
async function saveToFirebase() {
    try {
        const data = {
            interventions: interventions,
            intervenantsDB: intervenantsDB,
            generalInfo: {
                churchName: document.getElementById('church-name')?.value || 'EGLISE EVANGELIQUE DES ASSEMBLEES DE DIEU DU BENIN',
                region: document.getElementById('region')?.value || 'ATACORA',
                section: document.getElementById('section')?.value || 'NATITINGOU',
                temple: document.getElementById('temple')?.value || 'BERACA',
                year: document.getElementById('year')?.value || '2025',
                quarter: document.getElementById('quarter')?.value || '4'
            },
            configurations: {
                days: Array.from(document.querySelectorAll('input[id^="day-"]:checked')).map(cb => cb.value),
                types: Array.from(document.querySelectorAll('input[id^="type-"]:checked')).map(cb => cb.value),
                places: Array.from(document.querySelectorAll('input[id^="place-"]:checked')).map(cb => cb.value),
                otherType: document.getElementById('type-other-specify')?.value || '',
                otherPlace: document.getElementById('place-other-specify')?.value || ''
            },
            theme: document.body.className.replace('theme-', ''),
            savedAt: new Date().toISOString(),
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Sauvegarder dans la collection 'planning'
        await db.collection('planning').doc('current').set(data);
        
        console.log('Données sauvegardées dans Firebase avec succès');
        showAlert('Données publiées en ligne avec succès !', 'success');
    } catch (error) {
        console.error('Erreur lors de la sauvegarde dans Firebase:', error);
        showAlert('Erreur lors de la sauvegarde en ligne: ' + error.message, 'danger');
    }
}

// Fonction pour charger les données depuis Firebase
async function loadFromFirebase() {
    try {
        const doc = await db.collection('planning').doc('current').get();
        
        if (doc.exists) {
            const data = doc.data();
            
            // Charger les données dans l'application
            interventions = data.interventions || [];
            intervenantsDB = data.intervenantsDB || intervenantsDB;
            
            // Mettre à jour les interfaces
            updateInterventionsList();
            
            console.log('Données chargées depuis Firebase avec succès');
            return true;
        } else {
            console.log('Aucune donnée trouvée dans Firebase');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis Firebase:', error);
        showAlert('Erreur lors du chargement des données en ligne: ' + error.message, 'danger');
        return false;
    }
}

// Fonction pour charger les données depuis Firebase (spécifique à la page de rapport)
async function loadFromFirebaseForReport() {
    try {
        const doc = await db.collection('planning').doc('current').get();
        
        if (doc.exists) {
            const data = doc.data();
            
            // Charger les données dans l'application
            interventions = data.interventions || [];
            intervenantsDB = data.intervenantsDB || intervenantsDB;
            
            // Charger le thème
            if (data.theme) {
                changeTheme(data.theme);
            }

            // Mettre à jour les interfaces
            updateFilterOptions();
            displayInterventions(interventions);
            
            console.log('Données chargées depuis Firebase avec succès');
            showAlert(`${interventions.length} intervention(s) chargée(s) depuis le serveur.`, 'success');
            return true;
        } else {
            console.log('Aucune donnée trouvée dans Firebase');
            return false;
        }
    } catch (error) {
        console.error('Erreur lors du chargement depuis Firebase:', error);
        showAlert('Erreur lors du chargement des données en ligne: ' + error.message, 'danger');
        return false;
    }
}

// Fonction pour activer l'écoute en temps réel
function enableRealTimeSync() {
    db.collection('planning').doc('current')
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                
                // Charger les données dans l'application
                interventions = data.interventions || [];
                intervenantsDB = data.intervenantsDB || intervenantsDB;
                
                // Mettre à jour les interfaces
                updateInterventionsList();
                
                console.log('Données mises à jour en temps réel depuis Firebase');
            } else {
                console.log('Aucune donnée trouvée dans Firebase');
            }
        }, (error) => {
            console.error('Erreur lors de l\'écoute en temps réel:', error);
        });
}