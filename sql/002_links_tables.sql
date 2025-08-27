-- ================================================
-- TABLES POUR LE TRACKING DES LIENS
-- ================================================

-- Table principale des liens raccourcis
CREATE TABLE public.links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Informations du lien
  original_url TEXT NOT NULL,
  short_code TEXT UNIQUE NOT NULL, -- Code court unique (ex: "abc123")
  full_short_url TEXT NOT NULL,    -- URL complète (ex: "https://clicktracker.app/abc123")
  custom_alias TEXT,               -- Alias personnalisé optionnel
  
  -- Métadonnées
  title TEXT,                      -- Titre de la page de destination
  description TEXT,                -- Description de la page
  favicon_url TEXT,                -- URL de l'icône de la page
  
  -- Paramètres
  is_active BOOLEAN DEFAULT true,
  password_protected BOOLEAN DEFAULT false,
  password_hash TEXT,              -- Hash du mot de passe si protégé
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Limites et restrictions
  click_limit INTEGER,             -- Limite de clics (null = illimité)
  geo_restrictions JSONB,          -- Restrictions géographiques
  device_restrictions JSONB,       -- Restrictions d'appareils
  
  -- Tags et organisation
  tags TEXT[],                     -- Tags pour organiser les liens
  folder_id UUID,                  -- Pour l'organisation en dossiers
  
  -- Statistiques rapides (mise à jour par triggers)
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  last_clicked_at TIMESTAMP WITH TIME ZONE,
  
  -- Métadonnées système
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index pour les performances
  CONSTRAINT valid_url CHECK (original_url ~* '^https?://'),
  CONSTRAINT valid_short_code CHECK (short_code ~* '^[a-zA-Z0-9_-]+$')
);

-- Table des dossiers pour organiser les liens
CREATE TABLE public.folders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  parent_folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, name, parent_folder_id)
);

-- Table des clics (données de tracking)
CREATE TABLE public.clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  
  -- Informations de la visite
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  
  -- Géolocalisation
  country_code CHAR(2),
  country_name TEXT,
  region TEXT,
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  timezone TEXT,
  
  -- Informations de l'appareil
  device_type TEXT, -- mobile, desktop, tablet
  device_brand TEXT,
  device_model TEXT,
  os_name TEXT,
  os_version TEXT,
  browser_name TEXT,
  browser_version TEXT,
  
  -- Informations de la session
  session_id TEXT,   -- Pour identifier les visiteurs uniques
  is_unique BOOLEAN DEFAULT true, -- Premier clic de cette session
  is_bot BOOLEAN DEFAULT false,   -- Détection de bot
  
  -- UTM et paramètres de tracking
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Métadonnées
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index pour les requêtes fréquentes
  INDEX idx_clicks_link_id (link_id),
  INDEX idx_clicks_clicked_at (clicked_at),
  INDEX idx_clicks_country (country_code),
  INDEX idx_clicks_device (device_type)
);

-- Table des domaines personnalisés
CREATE TABLE public.custom_domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_token TEXT,
  ssl_certificate TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Politique de sécurité RLS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_domains ENABLE ROW LEVEL SECURITY;

-- Politiques pour links
CREATE POLICY "Users can manage own links" ON public.links
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour folders
CREATE POLICY "Users can manage own folders" ON public.folders
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour clicks (lecture seule pour les propriétaires de liens)
CREATE POLICY "Users can view clicks on own links" ON public.clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.links 
      WHERE links.id = clicks.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Politiques pour custom_domains
CREATE POLICY "Users can manage own domains" ON public.custom_domains
  FOR ALL USING (auth.uid() = user_id);

-- Fonction pour générer un code court unique
CREATE OR REPLACE FUNCTION generate_short_code(length INTEGER DEFAULT 6)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour les statistiques de liens
CREATE OR REPLACE FUNCTION update_link_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.links 
  SET 
    total_clicks = total_clicks + 1,
    last_clicked_at = NEW.clicked_at,
    unique_clicks = CASE 
      WHEN NEW.is_unique THEN unique_clicks + 1 
      ELSE unique_clicks 
    END
  WHERE id = NEW.link_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les stats
CREATE TRIGGER update_link_stats_trigger
  AFTER INSERT ON public.clicks
  FOR EACH ROW EXECUTE FUNCTION update_link_stats();
