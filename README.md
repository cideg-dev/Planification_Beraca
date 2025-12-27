# Planificateur d'Interventions - Assemblées de Dieu du Bénin

## Structure de l'Application

Ce projet contient un planificateur d'interventions pour les Assemblées de Dieu du Bénin avec les fonctionnalités suivantes :

### Pages de l'Application

1. **accueil.html** - Page d'accueil principale
   - Point d'entrée unique pour l'application
   - Permet d'accéder à la planification ou au rapport
   - Interface pour accéder aux publications partagées

2. **index.html** - Page de planification
   - Interface pour créer et gérer les interventions
   - Configuration des cultes et lieux
   - Gestion des intervenants
   - Possibilité de publier les données et d'accéder au rapport

3. **rapport.html** - Page de rapport
   - Visualisation des interventions avec filtres avancés
   - Exportation PDF des données filtrées
   - Affichage des données publiées via liens

### Fonctionnalités

- **Planification des interventions** : Ajout, modification et suppression d'interventions
- **Gestion des intervenants** : Base de données locale des intervenants
- **Fonctionnalité de publication** : Partage de données via liens uniques
- **Filtres avancés** : Filtres multiples sur la page de rapport
- **Exportation PDF** : Génération de rapports PDF avec options de personnalisation
- **Stockage local** : Sauvegarde des données dans le navigateur
- **Thèmes visuels** : Plusieurs thèmes disponibles (clair, sombre, néon, etc.)

### Architecture de Navigation

- La page d'accueil (accueil.html) sert de point d'entrée principal
- Depuis la page d'accueil, on peut accéder au rapport (rapport.html) directement
- Pour accéder à la planification (index.html), un code administrateur est requis
- Depuis la page de planification (index.html), on peut accéder à la page de rapport (rapport.html)
- La page de rapport (rapport.html) ne permet pas de revenir à la page de planification
- Les données publiées sont accessibles via des liens uniques sur les pages index.html et rapport.html

### Système d'Authentification

- L'accès à la page de planification (index.html) est protégé par un code administrateur
- Code administrateur requis : **BeraComi26**
- L'authentification est stockée dans le stockage local du navigateur
- Les administrateurs peuvent se déconnecter via le bouton de déconnexion sur la page d'accueil
- L'accès non autorisé à la page de planification redirige vers la page d'accueil

### Technologies Utilisées

- HTML5, CSS3, JavaScript
- Bootstrap 5 pour le design responsive
- Select2 pour les sélecteurs avancés
- jsPDF pour l'exportation PDF
- Stockage local du navigateur pour la persistance des données