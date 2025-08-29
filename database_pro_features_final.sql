-- ================================================
-- FONCTIONNALITÉS PRO ET BUSINESS POUR CLICKTRACKER
-- Version corrigée - utilise user_profiles.id au lieu de uuid
-- ================================================

-- Table pour les exports de données (Pro/Business)
CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL CHECK (export_type IN ('csv', 'json', 'xlsx')),
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS pour data_exports
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports" ON public.data_exports
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own exports" ON public.data_exports
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid()
    AND subscription_tier IN ('premium', 'enterprise')
  )
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_data_exports_user_status ON public.data_exports(user_id, status);
CREATE INDEX IF NOT EXISTS idx_data_exports_created ON public.data_exports(created_at);

-- Vue pour les statistiques avancées Pro/Business
CREATE OR REPLACE VIEW public.clicks_premium AS
SELECT 
  c.*,
  l.short_code,
  l.title,
  l.original_url,
  up.subscription_tier,
  up.email as user_email
FROM public.clicks c
JOIN public.links l ON c.link_id = l.id
JOIN public.user_profiles up ON l.user_id = up.id
WHERE up.subscription_tier IN ('premium', 'enterprise');

-- Fonction pour obtenir les stats géographiques détaillées
CREATE OR REPLACE FUNCTION public.get_geographic_stats(link_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  country TEXT,
  city TEXT,
  region TEXT,
  click_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur a accès Premium/Enterprise
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium or Enterprise subscription required for detailed geographic stats';
  END IF;

  -- Vérifier que le lien appartient à l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM public.links l
    WHERE l.id = link_uuid AND l.user_id = user_uuid
  ) THEN
    RAISE EXCEPTION 'Link not found or access denied';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(c.country_name, 'Unknown') as country,
    COALESCE(c.city, 'Unknown') as city,
    COALESCE(c.region, 'Unknown') as region,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
  GROUP BY c.country_name, c.city, c.region
  ORDER BY click_count DESC;
END;
$$;

-- Fonction pour obtenir les stats d'appareils
CREATE OR REPLACE FUNCTION public.get_device_stats(link_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  device_type TEXT,
  browser TEXT,
  os TEXT,
  click_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur a accès Premium/Enterprise
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium or Enterprise subscription required for device stats';
  END IF;

  -- Vérifier que le lien appartient à l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM public.links l
    WHERE l.id = link_uuid AND l.user_id = user_uuid
  ) THEN
    RAISE EXCEPTION 'Link not found or access denied';
  END IF;

  RETURN QUERY
  SELECT 
    COALESCE(c.device_type, 'Unknown') as device_type,
    COALESCE(c.browser_name, 'Unknown') as browser,
    COALESCE(c.os_name, 'Unknown') as os,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
  GROUP BY c.device_type, c.browser_name, c.os_name
  ORDER BY click_count DESC;
END;
$$;

-- Fonction pour obtenir les sources de trafic
CREATE OR REPLACE FUNCTION public.get_traffic_sources(link_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  referrer_domain TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  click_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur a accès Premium/Enterprise
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium or Enterprise subscription required for traffic source stats';
  END IF;

  -- Vérifier que le lien appartient à l'utilisateur
  IF NOT EXISTS (
    SELECT 1 FROM public.links l
    WHERE l.id = link_uuid AND l.user_id = user_uuid
  ) THEN
    RAISE EXCEPTION 'Link not found or access denied';
  END IF;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.referer IS NOT NULL AND c.referer != '' THEN 
        regexp_replace(c.referer, '^https?://([^/]+).*', '\1')
      ELSE 'Direct'
    END as referrer_domain,
    COALESCE(c.utm_source, '') as utm_source,
    COALESCE(c.utm_medium, '') as utm_medium,
    COALESCE(c.utm_campaign, '') as utm_campaign,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
  GROUP BY referrer_domain, c.utm_source, c.utm_medium, c.utm_campaign
  ORDER BY click_count DESC;
END;
$$;

-- Fonction pour obtenir les stats temporelles avancées (Pro/Business)
CREATE OR REPLACE FUNCTION public.get_temporal_stats(link_uuid UUID, user_uuid UUID, date_range TEXT DEFAULT '30')
RETURNS TABLE (
  date_hour TIMESTAMP WITH TIME ZONE,
  click_count BIGINT,
  unique_visitors BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur a accès Premium/Enterprise
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium or Enterprise subscription required for temporal stats';
  END IF;

  RETURN QUERY
  SELECT 
    date_trunc('hour', c.clicked_at) as date_hour,
    COUNT(*)::BIGINT as click_count,
    COUNT(DISTINCT c.session_id)::BIGINT as unique_visitors
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    AND c.clicked_at >= NOW() - INTERVAL '1 day' * date_range::INTEGER
  GROUP BY date_trunc('hour', c.clicked_at)
  ORDER BY date_hour;
END;
$$;

-- Fonction pour obtenir le top des liens d'un utilisateur (Business)
CREATE OR REPLACE FUNCTION public.get_user_top_links(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  link_id UUID,
  title TEXT,
  short_code TEXT,
  original_url TEXT,
  total_clicks BIGINT,
  unique_visitors BIGINT,
  last_click TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que l'utilisateur a accès Enterprise
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = user_uuid 
    AND subscription_tier = 'enterprise'
  ) THEN
    RAISE EXCEPTION 'Enterprise subscription required for user analytics';
  END IF;

  RETURN QUERY
  SELECT 
    l.id as link_id,
    l.title,
    l.short_code,
    l.original_url,
    COUNT(c.id)::BIGINT as total_clicks,
    COUNT(DISTINCT c.session_id)::BIGINT as unique_visitors,
    MAX(c.clicked_at) as last_click
  FROM public.links l
  LEFT JOIN public.clicks c ON l.id = c.link_id
  WHERE l.user_id = user_uuid
    AND l.is_active = true
  GROUP BY l.id, l.title, l.short_code, l.original_url
  ORDER BY total_clicks DESC
  LIMIT limit_count;
END;
$$;

-- Table pour les alertes personnalisées (Business/Enterprise)
CREATE TABLE IF NOT EXISTS public.user_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('click_threshold', 'unusual_activity', 'geo_block', 'device_block')),
  threshold_value INTEGER,
  condition_type TEXT CHECK (condition_type IN ('greater_than', 'less_than', 'equals')),
  is_active BOOLEAN DEFAULT true,
  notification_email BOOLEAN DEFAULT true,
  notification_webhook TEXT,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pour user_alerts
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own alerts" ON public.user_alerts
FOR ALL USING (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid()
    AND subscription_tier IN ('premium', 'enterprise')
  )
);

-- Index pour les alertes
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_active ON public.user_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_alerts_link ON public.user_alerts(link_id);

-- Ajout de colonnes manquantes dans la table user_profiles pour Pro/Business
-- (Seulement si elles n'existent pas déjà)
DO $$
BEGIN
  -- Vérifier et ajouter api_key pour les intégrations Business
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'api_key'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN api_key TEXT UNIQUE;
  END IF;

  -- Vérifier et ajouter webhook_url pour les notifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'webhook_url'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN webhook_url TEXT;
  END IF;

  -- Vérifier et ajouter advanced_analytics_enabled
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' 
    AND column_name = 'advanced_analytics_enabled'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN advanced_analytics_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Mise à jour automatique du flag advanced_analytics pour les abonnés Premium/Enterprise
UPDATE public.user_profiles 
SET advanced_analytics_enabled = true 
WHERE subscription_tier IN ('premium', 'enterprise');

-- Trigger pour mettre à jour automatiquement le flag lors des changements d'abonnement
CREATE OR REPLACE FUNCTION update_advanced_analytics_flag()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier IN ('premium', 'enterprise') THEN
    NEW.advanced_analytics_enabled = true;
  ELSE
    NEW.advanced_analytics_enabled = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_advanced_analytics ON public.user_profiles;
CREATE TRIGGER trigger_update_advanced_analytics
  BEFORE UPDATE OF subscription_tier ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_advanced_analytics_flag();

-- Commentaires pour la documentation
COMMENT ON TABLE public.data_exports IS 'Table des exports de données pour les utilisateurs Premium/Enterprise';
COMMENT ON FUNCTION public.get_geographic_stats IS 'Statistiques géographiques détaillées pour Premium/Enterprise';
COMMENT ON FUNCTION public.get_device_stats IS 'Statistiques d''appareils détaillées pour Premium/Enterprise';
COMMENT ON FUNCTION public.get_traffic_sources IS 'Sources de trafic détaillées pour Premium/Enterprise';
COMMENT ON TABLE public.user_alerts IS 'Alertes personnalisées pour Premium/Enterprise';

-- Finalisation
SELECT 'Fonctionnalités Pro/Business installées avec succès!' as status;
