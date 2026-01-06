# 🔧 Dépannage Supabase - Les secrets ne marchent pas

## ❌ Erreur que vous voyez

```
Supabase non initialisé : URL manquante ou invalide
{url: ''}
```

Cela signifie que l'URL Supabase **n'est pas passée** au moment du build en production.

---

## ✅ Checklist de diagnostic

### 1. Vérifier les GitHub Secrets

**⚠️ C'est l'étape CRITIQUE**

1. Allez à : [https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions](https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions)

2. Vérifiez que **3 secrets** existent :
   - ✓ `VITE_SUPABASE_URL`
   - ✓ `VITE_SUPABASE_ANON_KEY`
   - ✓ `VITE_ADMIN_CODE`

3. **Si un secret est manquant** :
   - Cliquez sur "New repository secret"
   - Ajoutez-le avec la valeur correcte
   - **Important** : Après ajout d'un secret, le ancien workflow ne le voit pas !

### 2. Redéclencher le workflow

Après avoir créé/modifié les secrets, vous **DEVEZ** redéclencher le workflow :

```bash
git commit --allow-empty -m "trigger: redeploy with secrets"
git push
```

### 3. Vérifier que le workflow s'exécute

1. Allez à : [https://github.com/cideg-dev/Planification_Beraca/actions](https://github.com/cideg-dev/Planification_Beraca/actions)
2. Cherchez le workflow "Deploy to GitHub Pages"
3. Cliquez dessus pour voir les logs
4. Vérifiez l'étape "Debug Secrets Availability"
5. Cela devrait dire :
   ```
   VITE_SUPABASE_URL is set (length: 34)
   VITE_SUPABASE_ANON_KEY is set (length: 232)
   VITE_ADMIN_CODE is set (length: 10)
   ```

### 4. Vider le cache du navigateur

Si tout semble configuré mais l'erreur persiste :

- **Chrome/Edge** : Ctrl+Shift+Del
- **Firefox** : Ctrl+Shift+Del
- **Safari** : Préférences → Confidentialité → Gérer les données de sites web → Supprimer tout

Puis rechargez la page avec **Ctrl+F5** (hard reload)

---

## 🐛 Si le workflow affiche une erreur

### Erreur : "VITE_SUPABASE_URL is NOT set"

Cela signifie que le secret n'existe pas ou est mal nommé.

**Solutions** :
- Vérifiez que vous avez créé le secret avec le **nom exact** : `VITE_SUPABASE_URL`
- Redéclenchez le workflow après création

### Erreur : "Build failed"

1. Allez à l'onglet "Build" du workflow
2. Scrollez pour voir l'erreur complète
3. Si c'est une erreur npm : essayez `npm ci` en local

---

## 🚀 Étapes finales - Checklist complète

- [ ] 1. Allez à Settings → Secrets and variables → Actions
- [ ] 2. Créez `VITE_SUPABASE_URL` avec `https://supywgkoghcphlynktmr.supabase.co`
- [ ] 3. Créez `VITE_SUPABASE_ANON_KEY` avec votre clé anon
- [ ] 4. Créez `VITE_ADMIN_CODE` avec votre code admin
- [ ] 5. Redéclenchez le workflow : `git commit --allow-empty -m "trigger" && git push`
- [ ] 6. Attendez ~2 minutes
- [ ] 7. Vérifiez https://github.com/cideg-dev/Planification_Beraca/actions
- [ ] 8. Vérifiez les logs du workflow (step "Debug Secrets Availability")
- [ ] 9. Videz le cache du navigateur
- [ ] 10. Visitez https://cideg-dev.github.io/Planification_Beraca/ et ouvrez la console (F12)

---

## 📞 Besoin d'aide ?

Si le problème persiste après tous ces pas :

1. Allez à : [https://github.com/cideg-dev/Planification_Beraca/actions](https://github.com/cideg-dev/Planification_Beraca/actions)
2. Trouvez le dernier workflow qui a échoué
3. Cliquez dessus et copiez les logs d'erreur
4. Posez une question avec les détails

