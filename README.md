# Planificateur d'Interventions - AD BERACA (V2)

Application de gestion de planning pour l'église AD BERACA.
Version modernisée utilisant Vite, Supabase et une architecture modulaire.

## Fonctionnalités

- **Planification** : Ajout rapide d'interventions (Culte, Enseignement, etc.).
- **Données Relationnelles** : Utilisation d'une base de données SQL (Supabase).
- **Exports** : Génération de fichiers PDF et Excel.
- **Migration** : Outil intégré pour importer les données de l'ancienne version V1.
- **Sécurité** : Gestion des clés API via variables d'environnement.

## Installation et Démarrage

1. **Installer les dépendances :**

   ```bash
   npm install
   ```

2. **Configurer l'environnement :**

   Assurez-vous d'avoir le fichier `.env` à la racine avec vos clés Supabase.

3. **Lancer en développement :**

   ```bash
   npm run dev
   ```

4. **Construire pour la production :**

   ```bash
   npm run build
   ```

   Les fichiers seront générés dans le dossier `dist/`.

## Configuration Supabase

### En développement local

1. Créez un fichier `.env` à la racine du projet :

   ```text
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   VITE_ADMIN_CODE=votre_code_admin
   ```

2. Redémarrez le serveur de développement

### En production (GitHub Pages)

