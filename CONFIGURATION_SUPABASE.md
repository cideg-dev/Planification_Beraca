# Configuration Supabase - Guide Complet

## ⚠️ Erreur actuelle

```
Supabase non initialisé : URL manquante ou invalide
Connexion à Supabase échouée. L'application fonctionnera en mode dégradé.
```

Cette erreur indique que les variables d'environnement Supabase ne sont pas configurées.

## 🔧 Configuration en Développement Local

### 1. Créer un fichier `.env`

À la racine du projet, créez un fichier `.env` :

```bash
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre_clé_anon_ici
VITE_ADMIN_CODE=votre_code_admin
```

### 2. Obtenir vos identifiants Supabase

1. Accédez à https://app.supabase.com
2. Sélectionnez votre projet
3. Allez à **Settings** → **API**
4. Copiez :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

### 3. Redémarrer le serveur

```bash
npm run dev
```

Le serveur détectera automatiquement le fichier `.env`.

---

## 🚀 Configuration en Production (GitHub Pages)

### 1. Accéder aux Secrets du Repository

1. Allez à : https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions
2. Cliquez sur **New repository secret**

### 2. Créer les 3 Secrets

#### Secret 1 : `VITE_SUPABASE_URL`
- **Name** : `VITE_SUPABASE_URL`
- **Value** : `https://votre-projet.supabase.co`

#### Secret 2 : `VITE_SUPABASE_ANON_KEY`
- **Name** : `VITE_SUPABASE_ANON_KEY`
- **Value** : `votre_clé_anon_ici`

#### Secret 3 : `VITE_ADMIN_CODE`
- **Name** : `VITE_ADMIN_CODE`
- **Value** : `votre_code_admin`

### 3. Déclencher le Deploy

1. Faites un `git push` sur la branche `main`
2. Allez à : https://github.com/cideg-dev/Planification_Beraca/actions
3. Observez le workflow **Deploy to GitHub Pages**

Le workflow injectera automatiquement les secrets au moment du build.

---

## ✅ Vérifier que tout fonctionne

Après la configuration :

1. **En développement** :
   ```bash
   npm run dev
   ```
   Ouvrez la console (F12) - le message d'erreur Supabase ne devrait plus apparaître

2. **En production** :
   - Attendez que le deploy soit terminé (badge ✅ sur GitHub)
   - Visitez https://cideg-dev.github.io/Planification_Beraca/
   - Ouvrez la console (F12) - pas d'erreur Supabase

---

## 🔐 Sécurité

- ✅ Ne commitez **JAMAIS** le `.env` local (il est dans `.gitignore`)
- ✅ Les secrets GitHub sont chiffrés et sécurisés
- ✅ Les secrets ne s'affichent jamais dans les logs GitHub Actions
- ✅ Seuls les administrateurs du repository peuvent voir/modifier les secrets

---

## 🐛 Dépannage

### Erreur : "URL manquante ou invalide"
- ✅ Vérifiez que `.env` existe et contient les bonnes valeurs
- ✅ Redémarrez le serveur avec `npm run dev`

### Erreur en production après push
- ✅ Vérifiez les GitHub Secrets : https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions
- ✅ Attendez la fin du workflow (visible sur la page Actions)
- ✅ Videz le cache du navigateur (Ctrl+Shift+Del)

### La base de données ne se connecte pas
- ✅ Vérifiez que le project Supabase est actif
- ✅ Vérifiez les clés API (Settings → API)
- ✅ Assurez-vous que les tables existent dans Supabase

