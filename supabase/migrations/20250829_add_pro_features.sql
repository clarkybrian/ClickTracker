-- Extension pour les fonctionnalités Pro ClickTracker
-- Utilise la table 'clicks' existante qui contient déjà toutes les colonnes nécessaires

-- Table pour les exports de données
CREATE TABLE IF NOT EXISTS public.data_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  export_type TEXT NOT NULL, -- 'csv', 'json', 'xlsx'
  date_range_start TIMESTAMP WITH TIME ZONE,
  date_range_end TIMESTAMP WITH TIME ZONE,
  file_url TEXT, -- URL du fichier généré
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS pour data_exports
ALTER TABLE public.data_exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports" ON public.data_exports
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exports" ON public.data_exports
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Vues pour les statistiques avancées Pro
CREATE OR REPLACE VIEW public.clicks_pro AS
SELECT 
  c.*,
  l.short_code,
  l.title,
  p.subscription_tier
FROM public.clicks c
JOIN public.links l ON c.link_id = l.id
JOIN public.profiles p ON l.user_id = p.id
WHERE p.subscription_tier IN ('premium', 'enterprise');

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
  -- Vérifier que l'utilisateur a accès Pro
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium subscription required for detailed geographic stats';
  END IF;

  RETURN QUERY
  SELECT 
    c.country_name,
    c.city,
    c.region,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    AND c.city IS NOT NULL
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
  -- Vérifier que l'utilisateur a accès Pro
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium subscription required for device stats';
  END IF;

  RETURN QUERY
  SELECT 
    c.device_type,
    c.browser_name,
    c.os_name,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    AND c.device_type IS NOT NULL
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
  -- Vérifier que l'utilisateur a accès Pro
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
  ) THEN
    RAISE EXCEPTION 'Premium subscription required for traffic source stats';
  END IF;

  RETURN QUERY
  SELECT 
    CASE 
      WHEN c.referer IS NOT NULL THEN 
        regexp_replace(c.referer, '^https?://([^/]+).*', '\1')
      ELSE NULL 
    END as referrer_domain,
    c.utm_source,
    c.utm_medium,
    c.utm_campaign,
    COUNT(*)::BIGINT as click_count
  FROM public.clicks c
  JOIN public.links l ON c.link_id = l.id
  WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
  GROUP BY referrer_domain, c.utm_source, c.utm_medium, c.utm_campaign
  HAVING COUNT(*) > 0
  ORDER BY click_count DESC;
END;
$$;
