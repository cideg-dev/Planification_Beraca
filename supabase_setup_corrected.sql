-- Script de configuration des politiques d'accès pour la table planning_data
-- Fichier: supabase_setup.sql

-- Désactiver temporairement RLS pour la table (facultatif, selon vos besoins de sécurité)
ALTER TABLE planning_data DISABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent déjà
DROP POLICY IF EXISTS "Allow read access to planning_data" ON planning_data;
DROP POLICY IF EXISTS "Allow insert access to planning_data" ON planning_data;
DROP POLICY IF EXISTS "Allow update access to planning_data" ON planning_data;
DROP POLICY IF EXISTS "Allow delete access to planning_data" ON planning_data;

-- Créer des politiques spécifiques pour permettre les accès nécessaires
-- Politique pour permettre la lecture à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY "Allow read access to planning_data" ON planning_data
FOR SELECT TO authenticated, anon
USING (true);

-- Politique pour permettre l'insertion à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY "Allow insert access to planning_data" ON planning_data
FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- Politique pour permettre la mise à jour à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY "Allow update access to planning_data" ON planning_data
FOR UPDATE TO authenticated, anon
USING (true);

-- Politique pour permettre la suppression (facultatif, selon vos besoins)
CREATE POLICY "Allow delete access to planning_data" ON planning_data
FOR DELETE TO authenticated, anon
USING (true);

-- Vérifier que la table existe et afficher sa structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'planning_data'
ORDER BY ordinal_position;

-- Afficher les politiques créées
SELECT policyname, permissive, roles, cmd, row_security
FROM pg_policies
WHERE tablename = 'planning_data';