# ⚙️ Configuration des GitHub Secrets

## Problème actuel

```
Supabase non initialisé : URL manquante ou invalide
```

Cela signifie que les **GitHub Secrets ne sont pas configurés** dans votre repository.

---

## 📝 Étapes pour ajouter les Secrets

### Étape 1 : Accéder aux Settings du Repository

1. Allez à : [https://github.com/cideg-dev/Planification_Beraca](https://github.com/cideg-dev/Planification_Beraca)
2. Cliquez sur l'onglet **Settings**

![Settings](https://docs.github.com/en/rest/reference/repos)

### Étape 2 : Accéder aux Secrets

Dans le menu latéral gauche, allez à :

**Secrets and variables** → **Actions**

Ou accédez directement à :
[https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions](https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions)

### Étape 3 : Créer les 3 Secrets

Vous verrez un bouton **New repository secret**. Cliquez dessus 3 fois pour créer :

#### Secret 1 : `VITE_SUPABASE_URL`

- **Name** : `VITE_SUPABASE_URL`
- **Value** : `https://votre-projet.supabase.co`
  - Récupérez cette URL sur [https://app.supabase.com](https://app.supabase.com)
  - Project Settings → API → Project URL

#### Secret 2 : `VITE_SUPABASE_ANON_KEY`

- **Name** : `VITE_SUPABASE_ANON_KEY`
- **Value** : `votre_clé_anon_ici`
  - Sur [https://app.supabase.com](https://app.supabase.com)
  - Project Settings → API → anon public

#### Secret 3 : `VITE_ADMIN_CODE`

- **Name** : `VITE_ADMIN_CODE`
- **Value** : `votre_code_admin`
  - Code que vous souhaitez pour accéder aux paramètres admin

---

## ✅ Vérifier que tout fonctionne

Après avoir créé les 3 secrets :

1. Faites un `git push` simple (ou un commit vide avec `git commit --allow-empty -m "trigger deploy"`)
2. Allez à [https://github.com/cideg-dev/Planification_Beraca/actions](https://github.com/cideg-dev/Planification_Beraca/actions)
3. Observez le workflow **Deploy to GitHub Pages**
4. Attendez que le build soit terminé (badge ✅)
5. Visitez [https://cideg-dev.github.io/Planification_Beraca/](https://cideg-dev.github.io/Planification_Beraca/)
6. Ouvrez la console (F12) - plus d'erreur Supabase !

---

## 🔑 Où obtenir vos identifiants Supabase

### URL du Projet

1. Allez à [https://app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez à **Settings** → **API**
4. Copiez **Project URL** (ex: `https://abc123.supabase.co`)

### Clé Anon

1. Sur la même page **Settings → API**
2. Copiez **anon public** (commence par `eyJhbG...`)

---

## ⚠️ Important

- ✅ Les secrets GitHub sont **chiffrés** et sécurisés
- ✅ Ils ne s'affichent **jamais** dans les logs publics
- ✅ Seuls les administrateurs peuvent les voir
- ✅ Ne partagez **JAMAIS** ces valeurs publiquement

---

## 🐛 Dépannage

### Les secrets sont créés mais l'erreur persiste

1. Forcez le re-déploiement avec :
   ```bash
   git commit --allow-empty -m "trigger deploy"
   git push
   ```
2. Attendez que le workflow se termine
3. Videz le cache du navigateur (Ctrl+Shift+Del)

### Le workflow échoue

1. Allez à [https://github.com/cideg-dev/Planification_Beraca/actions](https://github.com/cideg-dev/Planification_Beraca/actions)
2. Cliquez sur le workflow échoué
3. Vérifiez les logs (step "Debug Secrets Availability")

