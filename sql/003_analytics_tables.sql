-- ================================================
-- TABLES POUR ANALYTICS ET REPORTING
-- ================================================

-- Table des événements personnalisés
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL, -- 'click', 'view', 'download', 'signup', etc.
  event_data JSONB,         -- Données personnalisées de l'événement
  ip_address INET,
  user_agent TEXT,
  country_code CHAR(2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des campagnes
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  budget DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table de liaison entre liens et campagnes
CREATE TABLE public.campaign_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE NOT NULL,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, link_id)
);

-- Table des rapports programmés
CREATE TABLE public.scheduled_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  email_recipients TEXT[],
  filters JSONB,           -- Filtres pour le rapport
  next_run_at TIMESTAMP WITH TIME ZONE,
  last_run_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des alertes
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- 'click_threshold', 'unusual_activity', 'link_expired'
  threshold_value INTEGER,
  condition_type TEXT,      -- 'greater_than', 'less_than', 'equals'
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les données aggregées (performance)
CREATE TABLE public.daily_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_clicks INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  clicks_by_hour JSONB,    -- {0: 5, 1: 3, 2: 0, ...}
  top_countries JSONB,     -- {FR: 45, US: 23, ...}
  top_devices JSONB,       -- {mobile: 67, desktop: 33}
  top_browsers JSONB,      -- {chrome: 45, firefox: 25, ...}
  total_revenue DECIMAL(10,2) DEFAULT 0, -- Si e-commerce
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(link_id, date)
);

-- Politique de sécurité RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Politiques pour events
CREATE POLICY "Users can view events on own links" ON public.events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.links 
      WHERE links.id = events.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Politiques pour campaigns
CREATE POLICY "Users can manage own campaigns" ON public.campaigns
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour campaign_links
CREATE POLICY "Users can manage own campaign links" ON public.campaign_links
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_links.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Politiques pour scheduled_reports
CREATE POLICY "Users can manage own reports" ON public.scheduled_reports
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour alerts
CREATE POLICY "Users can manage own alerts" ON public.alerts
  FOR ALL USING (auth.uid() = user_id);

-- Politiques pour daily_stats
CREATE POLICY "Users can view own stats" ON public.daily_stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.links 
      WHERE links.id = daily_stats.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Index pour les performances
CREATE INDEX idx_events_link_date ON public.events(link_id, created_at);
CREATE INDEX idx_daily_stats_link_date ON public.daily_stats(link_id, date);
CREATE INDEX idx_clicks_session ON public.clicks(session_id);
CREATE INDEX idx_links_user_created ON public.links(user_id, created_at);
CREATE INDEX idx_links_short_code ON public.links(short_code);

-- Fonction pour aggréger les stats quotidiennes
CREATE OR REPLACE FUNCTION aggregate_daily_stats()
RETURNS void AS $$
DECLARE
  yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
  INSERT INTO public.daily_stats (link_id, date, total_clicks, unique_clicks, top_countries, top_devices)
  SELECT 
    c.link_id,
    yesterday,
    COUNT(*) as total_clicks,
    COUNT(*) FILTER (WHERE c.is_unique = true) as unique_clicks,
    jsonb_object_agg(c.country_code, country_count) as top_countries,
    jsonb_object_agg(c.device_type, device_count) as top_devices
  FROM public.clicks c
  LEFT JOIN (
    SELECT link_id, country_code, COUNT(*) as country_count
    FROM public.clicks 
    WHERE DATE(clicked_at) = yesterday
    GROUP BY link_id, country_code
  ) countries ON c.link_id = countries.link_id
  LEFT JOIN (
    SELECT link_id, device_type, COUNT(*) as device_count
    FROM public.clicks 
    WHERE DATE(clicked_at) = yesterday
    GROUP BY link_id, device_type
  ) devices ON c.link_id = devices.link_id
  WHERE DATE(c.clicked_at) = yesterday
  GROUP BY c.link_id
  ON CONFLICT (link_id, date) DO UPDATE SET
    total_clicks = EXCLUDED.total_clicks,
    unique_clicks = EXCLUDED.unique_clicks,
    top_countries = EXCLUDED.top_countries,
    top_devices = EXCLUDED.top_devices;
END;
$$ LANGUAGE plpgsql;
