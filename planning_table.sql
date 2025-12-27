-- Migration pour créer la table planning_data
-- Fichier: supabase/migrations/00001_create_planning_table.sql

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

-- Créer un index sur la colonne saved_at pour des recherches plus rapides
CREATE INDEX IF NOT EXISTS idx_planning_data_saved_at ON planning_data(saved_at);

-- Rendre la colonne id non modifiable après la création
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