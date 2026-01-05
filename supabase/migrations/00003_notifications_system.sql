-- 1. Table des préférences de notification utilisateur
-- Permet de gérer le filtrage et les canaux préférés
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT true,
    phone_number TEXT, -- Nécessaire pour les SMS
    notify_on_new_planning BOOLEAN DEFAULT true,
    notify_on_changes BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table de l'historique des notifications
-- Permet de gérer l'historique et le statut lu/non lu
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'system', 'planning_update', 'reminder'
    channel TEXT NOT NULL, -- 'in_app', 'email', 'sms', 'push'
    is_read BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}'::jsonb, -- Pour stocker des liens ou ID liés
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour accélérer la récupération des notifications non lues
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id) WHERE is_read = false;

-- 3. Configuration de la sécurité (RLS)

-- Activer RLS
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour les préférences
CREATE POLICY "Users can view their own settings" ON user_notification_settings
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_notification_settings
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_notification_settings
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Politiques pour les notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update read status" ON notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_notification_settings_modtime
    BEFORE UPDATE ON user_notification_settings
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
