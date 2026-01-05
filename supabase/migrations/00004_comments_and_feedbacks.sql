-- 1. Table des commentaires
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    intervention_id UUID REFERENCES public.interventions(id) ON DELETE CASCADE NOT NULL,
    author TEXT NOT NULL DEFAULT 'Anonyme',
    content TEXT NOT NULL
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_comments_intervention ON public.comments(intervention_id);

-- 2. Table des feedbacks (évaluations)
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    intervention_id UUID REFERENCES public.interventions(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    author TEXT DEFAULT 'Anonyme'
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_feedbacks_intervention ON public.feedbacks(intervention_id);

-- 3. Sécurité (RLS)
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture publique comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Ecriture publique comments" ON public.comments FOR ALL USING (true);

CREATE POLICY "Lecture publique feedbacks" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Ecriture publique feedbacks" ON public.feedbacks FOR ALL USING (true);
