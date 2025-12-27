#!/bin/bash

# Script de configuration Supabase pour l'application Planification_Beraca
# Ce script configure les politiques d'accès pour la table planning_data

# Variables - à remplacer par vos valeurs réelles
PROJECT_ID="supywgkoghcphlynktmr"
DB_PASSWORD=""  # Vous devrez peut-être utiliser votre mot de passe de base de données

echo "Configuration des politiques d'accès pour le projet Supabase..."

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "Erreur: Supabase CLI n'est pas installé"
    exit 1
fi

# Connexion au projet (optionnel, selon votre configuration)
echo "Connexion au projet Supabase..."

# Création des politiques d'accès pour la table planning_data
echo "Création des politiques d'accès pour la table planning_data..."

# Configuration des politiques via SQL
SQL_STATEMENTS="
-- Désactiver temporairement RLS pour la table
ALTER TABLE planning_data DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent déjà
DROP POLICY IF EXISTS \"Allow read access to planning_data\" ON planning_data;
DROP POLICY IF EXISTS \"Allow insert access to planning_data\" ON planning_data;
DROP POLICY IF EXISTS \"Allow update access to planning_data\" ON planning_data;
DROP POLICY IF EXISTS \"Allow delete access to planning_data\" ON planning_data;

-- Créer des politiques spécifiques
CREATE POLICY \"Allow read access to planning_data\" ON planning_data
FOR SELECT TO authenticated, anon
USING (true);

CREATE POLICY \"Allow insert access to planning_data\" ON planning_data
FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY \"Allow update access to planning_data\" ON planning_data
FOR UPDATE TO authenticated, anon
USING (true);

-- Politique pour permettre la suppression (facultatif, selon vos besoins)
CREATE POLICY \"Allow delete access to planning_data\" ON planning_data
FOR DELETE TO authenticated, anon
USING (true);

-- Vérifier que la table existe et afficher sa structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'planning_data'
ORDER BY ordinal_position;

-- Afficher les politiques créées
SELECT policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'planning_data';
"

# Sauvegarder les commandes SQL dans un fichier temporaire
SQL_FILE="/tmp/supabase_setup.sql"
echo "$SQL_STATEMENTS" > "$SQL_FILE"

echo "Exécution des commandes SQL..."
echo "Veuillez exécuter manuellement ces commandes dans l'éditeur SQL de votre projet Supabase :"
echo "https://app.supabase.com/project/$PROJECT_ID/database/sql"

# Afficher les commandes à exécuter manuellement
echo ""
echo "--- COPIEZ-COLLEZ CE QUI SUIT DANS L'ÉDITEUR SQL DE SUPABASE ---"
echo "$SQL_STATEMENTS"
echo "--- FIN DES COMMANDES ---"

echo ""
echo "OU utilisez la commande suivante si vous avez configuré l'accès distant :"
echo "supabase db remote exec '$SQL_FILE'"

# Alternative : configuration via le service de migration
echo ""
echo "Configuration alternative :"
echo "1. Connectez-vous à votre projet Supabase sur https://app.supabase.com"
echo "2. Allez dans Database > SQL Editor"
echo "3. Exécutez les commandes SQL ci-dessus"
echo "4. La synchronisation devrait fonctionner correctement après cela"

# Nettoyage
rm -f "$SQL_FILE"

echo "Configuration terminée. Veuillez vérifier que la table 'planning_data' existe"
echo "et que les politiques d'accès sont correctement configurées."