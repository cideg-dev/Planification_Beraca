# ⚡ Configuration rapide des GitHub Secrets

Vous avez maintenant vos identifiants Supabase. Voici comment les utiliser :

## 🚀 Étape 1 : Test en local

Un fichier `.env` a été créé. Il est dans `.gitignore` et ne sera **jamais** committé.

## 🔑 Étape 2 : Configurer GitHub Secrets

1. Allez à : https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions

2. Créez **3 secrets** avec ces valeurs exactes :

### Secret 1 : VITE_SUPABASE_URL
```
https://supywgkoghcphlynktmr.supabase.co
```

### Secret 2 : VITE_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1cHl3Z2tvZ2hjcGhseW5rdG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NTYzNjQsImV4cCI6MjA4MjQzMjM2NH0.b_6COwOKkt2sWOuzM42W-LZfraPJJSKXhax69IUGwWc
```

### Secret 3 : VITE_ADMIN_CODE
```
Martial1989
```
(Ou le code admin de votre choix)

---

## ✅ Après configuration

1. Attendez que GitHub Actions redéploie l'app
2. Rendez-vous sur https://cideg-dev.github.io/Planification_Beraca/
3. Ouvrez la console (F12) - l'erreur Supabase devrait avoir disparu

---

## 📝 Notes

- ✅ Ces secrets sont **chiffrés** sur GitHub
- ✅ Seuls les admins du repo peuvent les voir
- ✅ Ils ne s'affichent jamais dans les logs publics
- ✅ Le fichier `.env` local est ignoré par Git (sécurisé)

