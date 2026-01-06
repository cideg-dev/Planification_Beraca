# Configuration de Supabase

Ce document explique comment configurer correctement l'application avec Supabase.

## Variables d'environnement

L'application utilise plusieurs variables d'environnement pour se connecter à Supabase :

- `VITE_SUPABASE_URL` : L'URL de votre projet Supabase
- `VITE_SUPABASE_ANON_KEY` : La clé anonyme de votre projet Supabase
- `VITE_ADMIN_CODE` : Un code d'administration pour les opérations sensibles

## Environnement de développement

Pour le développement local, créez un fichier `.env` à la racine du projet avec vos valeurs :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.etc...
VITE_ADMIN_CODE=votre_code_admin
```

## Environnement de production

En production, l'application essaie de charger un fichier `runtime-config.json` à la racine du site web. Ce fichier doit contenir :

```json
{
  "SUPABASE_URL": "https://votre-projet.supabase.co",
  "SUPABASE_ANON_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.etc...",
  "ADMIN_CODE": "votre_code_admin"
}
```

## GitHub Actions

Pour le déploiement via GitHub Actions, assurez-vous d'ajouter les secrets suivants dans les paramètres de votre dépôt :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_CODE`

## Dépannage

Si vous voyez l'erreur "Supabase non initialisé : URL manquante ou invalide", vérifiez que :

1. Les variables d'environnement sont correctement définies
2. Le fichier `runtime-config.json` est accessible en production
3. Les secrets GitHub sont correctement configurés