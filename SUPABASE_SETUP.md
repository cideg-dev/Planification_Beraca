# Configuration de Supabase pour Planification_Beraca

Ce projet utilise Supabase pour synchroniser les données entre la page de planification et la page de rapport.

## Étapes de configuration requises

### 1. Créer la table dans Supabase

Si ce n'est pas déjà fait, exécutez le script de migration suivant dans l'éditeur SQL de votre projet Supabase :

```sql
-- Créer la table planning_data si elle n'existe pas
CREATE TABLE IF NOT EXISTS planning_data (
    id TEXT PRIMARY KEY,
    interventions JSONB NOT NULL,
    intervenantsDB JSONB NOT NULL,
    general_info JSONB NOT NULL,
    configurations JSONB NOT NULL,
    theme TEXT,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index sur la colonne saved_at
CREATE INDEX IF NOT EXISTS idx_planning_data_saved_at ON planning_data(saved_at);

-- Fonction pour empêcher la modification de l'id
CREATE OR REPLACE FUNCTION prevent_id_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.id <> OLD.id THEN
        RAISE EXCEPTION 'La colonne id ne peut pas être modifiée';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour empêcher la modification de l'id
DROP TRIGGER IF EXISTS prevent_id_update_trigger ON planning_data;
CREATE TRIGGER prevent_id_update_trigger
    BEFORE UPDATE ON planning_data
    FOR EACH ROW
    EXECUTE FUNCTION prevent_id_update();
```

### 2. Configurer les politiques d'accès

Exécutez ce script dans l'éditeur SQL de votre projet Supabase pour configurer les politiques d'accès :

```sql
-- Désactiver temporairement RLS pour la table (facultatif, selon vos besoins de sécurité)
ALTER TABLE planning_data DISABLE ROW LEVEL SECURITY;

-- Créer des politiques spécifiques pour permettre les accès nécessaires
-- Politique pour permettre la lecture à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY IF NOT EXISTS "Allow read access to planning_data" ON planning_data
FOR SELECT TO authenticated, anon
USING (true);

-- Politique pour permettre l'insertion à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY IF NOT EXISTS "Allow insert access to planning_data" ON planning_data
FOR INSERT TO authenticated, anon
WITH CHECK (true);

-- Politique pour permettre la mise à jour à tous les utilisateurs (authentifiés et anonymes)
CREATE POLICY IF NOT EXISTS "Allow update access to planning_data" ON planning_data
FOR UPDATE TO authenticated, anon
USING (true);

-- Politique pour permettre la suppression (facultatif, selon vos besoins)
CREATE POLICY IF NOT EXISTS "Allow delete access to planning_data" ON planning_data
FOR DELETE TO authenticated, anon
USING (true);

-- Vérifier que la table existe et afficher sa structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'planning_data'
ORDER BY ordinal_position;
```

### 3. Utilisation du script CLI (optionnel)

Vous pouvez également utiliser le script CLI pour exécuter les commandes :

1. Assurez-vous que Supabase CLI est installé
2. Connectez-vous à votre projet Supabase
3. Exécutez : `supabase db remote exec '/chemin/vers/supabase_setup.sql'`

## Vérification

Après avoir exécuté ces commandes, vous devriez pouvoir :
- Sauvegarder des données depuis la page de planification
- Charger les données sur la page de rapport
- Voir les données synchronisées en temps réel

## Résolution des problèmes

Si vous rencontrez toujours des erreurs :
1. Vérifiez que la table `planning_data` existe
2. Vérifiez que les politiques d'accès sont correctement configurées
3. Vérifiez que votre projet Supabase est correctement configuré avec les bonnes autorisations