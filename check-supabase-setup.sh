#!/bin/bash

echo "🔍 Vérification de la configuration Supabase"
echo "==========================================="
echo ""

# Vérifier le fichier .env
if [ -f ".env" ]; then
    echo "✅ Fichier .env trouvé"
    echo ""
    echo "Contenu du .env (sans les vraies valeurs pour la sécurité) :"
    grep -v "^#" .env | while IFS='=' read -r key value; do
        if [ ! -z "$key" ]; then
            length=${#value}
            echo "  - $key : ${value:0:10}...[$length chars]"
        fi
    done
else
    echo "❌ Fichier .env NON TROUVÉ"
    echo "   Créez-le avec vos identifiants Supabase"
fi

echo ""
echo "🔐 GitHub Secrets"
echo "=================="
echo ""
echo "Allez à : https://github.com/cideg-dev/Planification_Beraca/settings/secrets/actions"
echo ""
echo "Vérifiez que ces 3 secrets existent :"
echo "  ✓ VITE_SUPABASE_URL"
echo "  ✓ VITE_SUPABASE_ANON_KEY"
echo "  ✓ VITE_ADMIN_CODE"
echo ""
echo "⚠️  Si vous venez de les créer :"
echo "  1. Faites un commit vide pour redéclencher le workflow"
echo "  2. Attendez ~2 minutes que GitHub Actions finisse"
echo "  3. Videz le cache du navigateur (Ctrl+Shift+Del)"
echo ""

# Commande pour redéclencher le workflow
echo "🚀 Pour redéclencher le workflow :"
echo "   git commit --allow-empty -m 'trigger: force redeploy with secrets'"
echo "   git push"
