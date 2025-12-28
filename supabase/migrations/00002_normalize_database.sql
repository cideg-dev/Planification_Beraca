-- Migration pour normaliser la base de données (Passage de JSON Blob à Relationnel)

-- 1. Table des intervenants
CREATE TABLE IF NOT EXISTS public.intervenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT, -- ex: "Pasteur", "Diacre", "Mme"
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('clergy', 'members')), -- Clergé ou Membres
    is_active BOOLEAN DEFAULT true
);

-- Index pour recherche rapide par nom
CREATE INDEX IF NOT EXISTS idx_intervenants_names ON public.intervenants(last_name, first_name);

-- 2. Table des interventions (Le cœur du planning)
CREATE TABLE IF NOT EXISTS public.interventions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    date DATE NOT NULL,
    day_of_week TEXT NOT NULL, -- "Dimanche", "Lundi", etc.
    cult_type TEXT NOT NULL, -- "Culte Principal", "Enseignement", etc.
    place TEXT NOT NULL, -- "Temple", "Cellule", etc.
    description TEXT, -- Détails supplémentaires
    
    -- Clé étrangère vers l'intervenant (optionnel car parfois c'est un groupe ou invité externe)
    intervenant_id UUID REFERENCES public.intervenants(id) ON DELETE SET NULL,
    
    -- Nom de l'intervenant si ce n'est pas quelqu'un de la base (ou pour historique)
    intervenant_name_snapshot TEXT
);

-- Index pour filtrer rapidement par date (pour les rapports)
CREATE INDEX IF NOT EXISTS idx_interventions_date ON public.interventions(date);

-- 3. Table de configuration (Une seule ligne prévue pour la config globale)
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY, -- ex: "church_info", "theme_settings"
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Politique de sécurité (RLS) - Basique pour commencer
ALTER TABLE public.intervenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique intervenants" ON public.intervenants FOR SELECT USING (true);
CREATE POLICY "Lecture publique interventions" ON public.interventions FOR SELECT USING (true);
CREATE POLICY "Lecture publique config" ON public.app_config FOR SELECT USING (true);

CREATE POLICY "Ecriture publique intervenants" ON public.intervenants FOR ALL USING (true);
CREATE POLICY "Ecriture publique interventions" ON public.interventions FOR ALL USING (true);
CREATE POLICY "Ecriture publique config" ON public.app_config FOR ALL USING (true);

-- 4. Insertion des données initiales (Intervenants)
INSERT INTO public.intervenants (title, first_name, last_name, category) VALUES
('Pasteur', 'Christophe', 'SATCHI AKOUETE', 'clergy'),
('Diacre', 'Dieudonné', 'N''DIMONTE', 'clergy'),
('Mr', 'Joël', 'SENOUWA', 'members'),
('Mr', 'Michel', 'MOUDA', 'members'),
('Mr', 'Jonas', 'KPANATCHE', 'members'),
('Mr', 'Ekué', 'DAVI', 'members'),
('Mme', 'ODETTE', 'N''TCHA', 'members'),
('Mme', 'SYLVIE', 'DOKO', 'members'),
('Diacre', 'Robert', 'NOUGBONAGNI', 'clergy'),
('Mme', 'Rébecca', 'N''DAH', 'members'),
('Mme', 'Pierrette', 'ALOYA', 'members'),
('Mr', 'GuY', 'LOKOSSOU', 'members'),
('Mme', 'Grace', 'PASTEUR', 'members'),
('Mr', 'Ezéchiel', 'AKOMEDI', 'members'),
('Diacre', 'Jonas', 'MEMEGNON', 'clergy'),
('Mme', 'Reine', 'N''DIMONTE', 'members'),
('Mme', 'Rebecca', 'SENOUWA', 'members'),
('Mme', '', 'KOMBETO', 'members'),
('Mme', 'REBECCA', 'N''DAH', 'members'),
('Mlle', 'Sandra', 'DJIHENTO', 'members');