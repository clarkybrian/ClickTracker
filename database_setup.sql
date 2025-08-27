-- ========================================
-- CLICKTRACKER - CONFIGURATION BASE DE DONNÉES
-- ========================================
-- Exécutez ces scripts dans l'ordre dans Supabase SQL Editor

-- 1. EXTENSIONS REQUISES
-- ========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 2. TABLES D'AUTHENTIFICATION ET PROFILS
-- ========================================

-- Table des profils utilisateur (étend auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Abonnement et limites
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business')),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    subscription_ends_at TIMESTAMPTZ,
    
    -- Limites basées sur l'abonnement
    monthly_link_limit INTEGER DEFAULT 100,
    monthly_clicks_limit INTEGER DEFAULT 10000,
    custom_domains_limit INTEGER DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Index pour recherche rapide
    UNIQUE(email)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier, subscription_status);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- 3. DOMAINES PERSONNALISÉS
-- ========================================

CREATE TABLE public.custom_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    domain TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token TEXT,
    ssl_enabled BOOLEAN DEFAULT FALSE,
    
    -- Configuration DNS
    dns_records JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    
    UNIQUE(domain)
);

CREATE INDEX idx_custom_domains_user ON custom_domains(user_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);

-- 4. CAMPAGNES ET ORGANISATION
-- ========================================

CREATE TABLE public.campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Configuration de la campagne
    color TEXT DEFAULT '#3B82F6', -- Couleur pour l'UI
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_user ON campaigns(user_id);
CREATE INDEX idx_campaigns_active ON campaigns(user_id, is_active);

-- 5. LIENS RACCOURCIS
-- ========================================

CREATE TABLE public.links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    
    -- URLs
    original_url TEXT NOT NULL,
    short_code TEXT NOT NULL,
    custom_domain_id UUID REFERENCES public.custom_domains(id) ON DELETE SET NULL,
    
    -- Métadonnées du lien
    title TEXT,
    description TEXT,
    favicon_url TEXT,
    og_image_url TEXT,
    
    -- Configuration
    is_active BOOLEAN DEFAULT TRUE,
    password_protected BOOLEAN DEFAULT FALSE,
    password_hash TEXT, -- Hash bcrypt si protégé par mot de passe
    expires_at TIMESTAMPTZ,
    
    -- Redirections avancées
    device_targeting JSONB DEFAULT '{}', -- Redirect différent par device
    geo_targeting JSONB DEFAULT '{}', -- Redirect différent par pays
    
    -- Suivi UTM automatique
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Métadonnées
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contraintes
    UNIQUE(short_code, custom_domain_id),
    CHECK (LENGTH(short_code) >= 3)
);

-- Index optimisés pour les redirections rapides
CREATE UNIQUE INDEX idx_links_short_code_domain ON links(short_code, custom_domain_id);
CREATE INDEX idx_links_user ON links(user_id);
CREATE INDEX idx_links_campaign ON links(campaign_id);
CREATE INDEX idx_links_active ON links(is_active, expires_at);

-- 6. SUIVI DES CLICS
-- ========================================

CREATE TABLE public.clicks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
    
    -- Informations de la requête
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    -- Géolocalisation (via service externe)
    country_code CHAR(2),
    country_name TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timezone TEXT,
    
    -- Analyse de l'user agent
    browser_name TEXT,
    browser_version TEXT,
    os_name TEXT,
    os_version TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    device_brand TEXT,
    device_model TEXT,
    
    -- Informations de session
    session_id TEXT, -- ID de session pour détecter les visites uniques
    is_unique_visitor BOOLEAN DEFAULT TRUE,
    is_bot BOOLEAN DEFAULT FALSE,
    
    -- UTM et tracking
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Métadonnées
    clicked_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Données brutes pour analyses avancées
    raw_data JSONB DEFAULT '{}'
);

-- Index pour requêtes analytiques rapides
CREATE INDEX idx_clicks_link_time ON clicks(link_id, clicked_at);
CREATE INDEX idx_clicks_link_unique ON clicks(link_id, is_unique_visitor);
CREATE INDEX idx_clicks_session ON clicks(session_id);
CREATE INDEX idx_clicks_geo ON clicks(country_code, city);
CREATE INDEX idx_clicks_device ON clicks(device_type, browser_name);
CREATE INDEX idx_clicks_time ON clicks(clicked_at);

-- 7. AGRÉGATIONS POUR ANALYTICS
-- ========================================

-- Statistiques quotidiennes par lien
CREATE TABLE public.link_daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Métriques
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    
    -- Répartition par source
    clicks_by_referer JSONB DEFAULT '{}',
    clicks_by_country JSONB DEFAULT '{}',
    clicks_by_device JSONB DEFAULT '{}',
    clicks_by_browser JSONB DEFAULT '{}',
    
    -- Heures de pointe
    clicks_by_hour JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(link_id, date)
);

CREATE INDEX idx_link_daily_stats_link_date ON link_daily_stats(link_id, date);
CREATE INDEX idx_link_daily_stats_date ON link_daily_stats(date);

-- Statistiques globales utilisateur
CREATE TABLE public.user_daily_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    
    -- Métriques globales
    total_clicks INTEGER DEFAULT 0,
    unique_clicks INTEGER DEFAULT 0,
    total_links INTEGER DEFAULT 0,
    active_links INTEGER DEFAULT 0,
    
    -- Performance des campagnes
    top_campaigns JSONB DEFAULT '{}',
    top_links JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

CREATE INDEX idx_user_daily_stats_user_date ON user_daily_stats(user_id, date);

-- 8. FONCTIONS ET TRIGGERS
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_link_daily_stats_updated_at BEFORE UPDATE ON link_daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_daily_stats_updated_at BEFORE UPDATE ON user_daily_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer un profil utilisateur automatiquement
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. POLITIQUES DE SÉCURITÉ (RLS)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_stats ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour campaigns
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
    FOR ALL USING (auth.uid() = user_id);

-- Politiques pour links
CREATE POLICY "Users can manage own links" ON public.links
    FOR ALL USING (auth.uid() = user_id);

-- Politique spéciale pour les redirections publiques (lecture seule)
CREATE POLICY "Anyone can read active public links" ON public.links
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Politiques pour clicks (insertion ouverte pour tracking, lecture restreinte)
CREATE POLICY "Anyone can insert clicks" ON public.clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view clicks for own links" ON public.clicks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE links.id = clicks.link_id 
            AND links.user_id = auth.uid()
        )
    );

-- Politiques pour les statistiques
CREATE POLICY "Users can view own link stats" ON public.link_daily_stats
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.links 
            WHERE links.id = link_daily_stats.link_id 
            AND links.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view own user stats" ON public.user_daily_stats
    FOR ALL USING (auth.uid() = user_id);

-- 10. VUES UTILES POUR L'APPLICATION
-- ========================================

-- Vue pour les statistiques de liens avec agrégation
CREATE VIEW public.link_stats AS
SELECT 
    l.id,
    l.user_id,
    l.short_code,
    l.original_url,
    l.title,
    l.is_active,
    l.created_at,
    COALESCE(SUM(lds.total_clicks), 0) as total_clicks,
    COALESCE(SUM(lds.unique_clicks), 0) as unique_clicks,
    COUNT(DISTINCT lds.date) as active_days,
    MAX(c.clicked_at) as last_clicked_at
FROM public.links l
LEFT JOIN public.link_daily_stats lds ON l.id = lds.link_id
LEFT JOIN public.clicks c ON l.id = c.link_id
GROUP BY l.id, l.user_id, l.short_code, l.original_url, l.title, l.is_active, l.created_at;

-- Vue pour les top referers
CREATE VIEW public.top_referers AS
SELECT 
    l.user_id,
    c.referer,
    COUNT(*) as clicks,
    COUNT(DISTINCT c.session_id) as unique_visitors
FROM public.clicks c
JOIN public.links l ON c.link_id = l.id
WHERE c.referer IS NOT NULL AND c.referer != ''
GROUP BY l.user_id, c.referer
ORDER BY clicks DESC;

-- 11. DONNÉES DE TEST
-- ========================================

-- Insérer une campagne par défaut pour tous les nouveaux utilisateurs
-- (sera fait via trigger ou fonction application)

-- 12. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour générer un code court unique
CREATE OR REPLACE FUNCTION public.generate_short_code(length INTEGER DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    FOR i IN 1..length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques quotidiennes
CREATE OR REPLACE FUNCTION public.update_daily_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
BEGIN
    -- Mettre à jour les stats par lien
    INSERT INTO public.link_daily_stats (link_id, date, total_clicks, unique_clicks, unique_visitors)
    SELECT 
        c.link_id,
        target_date,
        COUNT(*),
        COUNT(DISTINCT c.session_id),
        COUNT(DISTINCT c.ip_address)
    FROM public.clicks c
    WHERE DATE(c.clicked_at) = target_date
    GROUP BY c.link_id
    ON CONFLICT (link_id, date) 
    DO UPDATE SET
        total_clicks = EXCLUDED.total_clicks,
        unique_clicks = EXCLUDED.unique_clicks,
        unique_visitors = EXCLUDED.unique_visitors,
        updated_at = NOW();

    -- Mettre à jour les stats utilisateur
    INSERT INTO public.user_daily_stats (user_id, date, total_clicks, unique_clicks, total_links, active_links)
    SELECT 
        l.user_id,
        target_date,
        COALESCE(SUM(lds.total_clicks), 0),
        COALESCE(SUM(lds.unique_clicks), 0),
        COUNT(DISTINCT l.id),
        COUNT(DISTINCT CASE WHEN l.is_active THEN l.id END)
    FROM public.links l
    LEFT JOIN public.link_daily_stats lds ON l.id = lds.link_id AND lds.date = target_date
    GROUP BY l.user_id
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_clicks = EXCLUDED.total_clicks,
        unique_clicks = EXCLUDED.unique_clicks,
        total_links = EXCLUDED.total_links,
        active_links = EXCLUDED.active_links,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- FIN DE LA CONFIGURATION
-- ========================================

-- Commandes à exécuter après la création :
-- 1. Configurer les variables d'environnement dans votre app :
--    SUPABASE_URL=votre-url-supabase
--    SUPABASE_ANON_KEY=votre-clé-anonyme
--    SUPABASE_SERVICE_ROLE_KEY=votre-clé-service (pour opérations admin)

-- 2. Configurer l'authentification OAuth dans Supabase Dashboard
-- 3. Configurer les triggers pour les statistiques en temps réel si nécessaire
-- 4. Mettre en place un cron job pour exécuter update_daily_stats() chaque nuit
