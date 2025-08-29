-- Correction des fonctions analytics pour utiliser 'pro' et 'business' au lieu de 'premium' et 'enterprise'

-- Fonction pour les statistiques géographiques
CREATE OR REPLACE FUNCTION get_geographic_stats(link_uuid uuid, user_uuid uuid)
RETURNS TABLE (
    country text,
    city text,
    click_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur a accès aux analytics avancés (pro ou business)
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier IN ('pro', 'business')
    ) THEN
        RAISE EXCEPTION 'Accès refusé: Abonnement Pro ou Business requis';
    END IF;

    RETURN QUERY
    SELECT 
        COALESCE(c.country, 'Inconnu') as country,
        COALESCE(c.city, 'Inconnu') as city,
        COUNT(*) as click_count
    FROM clicks c
    INNER JOIN links l ON c.link_id = l.id
    WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    GROUP BY c.country, c.city
    ORDER BY click_count DESC;
END;
$$;

-- Fonction pour les statistiques d'appareils
CREATE OR REPLACE FUNCTION get_device_stats(link_uuid uuid, user_uuid uuid)
RETURNS TABLE (
    device_type text,
    browser text,
    os text,
    click_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur a accès aux analytics avancés (pro ou business)
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier IN ('pro', 'business')
    ) THEN
        RAISE EXCEPTION 'Accès refusé: Abonnement Pro ou Business requis';
    END IF;

    RETURN QUERY
    SELECT 
        COALESCE(c.device_type, 'Inconnu') as device_type,
        COALESCE(c.browser, 'Inconnu') as browser,
        COALESCE(c.os, 'Inconnu') as os,
        COUNT(*) as click_count
    FROM clicks c
    INNER JOIN links l ON c.link_id = l.id
    WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    GROUP BY c.device_type, c.browser, c.os
    ORDER BY click_count DESC;
END;
$$;

-- Fonction pour les sources de trafic
CREATE OR REPLACE FUNCTION get_traffic_sources(link_uuid uuid, user_uuid uuid)
RETURNS TABLE (
    referrer text,
    source_type text,
    click_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vérifier que l'utilisateur a accès aux analytics avancés (pro ou business)
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier IN ('pro', 'business')
    ) THEN
        RAISE EXCEPTION 'Accès refusé: Abonnement Pro ou Business requis';
    END IF;

    RETURN QUERY
    SELECT 
        COALESCE(c.referrer, 'Direct') as referrer,
        CASE 
            WHEN c.referrer IS NULL OR c.referrer = '' THEN 'Direct'
            WHEN c.referrer ILIKE '%google%' THEN 'Search Engine'
            WHEN c.referrer ILIKE '%facebook%' OR c.referrer ILIKE '%twitter%' OR c.referrer ILIKE '%linkedin%' THEN 'Social Media'
            WHEN c.referrer ILIKE '%email%' OR c.referrer ILIKE '%newsletter%' THEN 'Email'
            ELSE 'Other'
        END as source_type,
        COUNT(*) as click_count
    FROM clicks c
    INNER JOIN links l ON c.link_id = l.id
    WHERE l.id = link_uuid 
    AND l.user_id = user_uuid
    GROUP BY c.referrer
    ORDER BY click_count DESC;
END;
$$;

-- Fonction pour créer un export de données
CREATE OR REPLACE FUNCTION create_data_export(user_uuid uuid, export_format text DEFAULT 'csv')
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    export_id uuid;
BEGIN
    -- Vérifier que l'utilisateur a accès aux exports (pro ou business)
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = user_uuid 
        AND subscription_tier IN ('pro', 'business')
    ) THEN
        RAISE EXCEPTION 'Accès refusé: Abonnement Pro ou Business requis pour les exports';
    END IF;

    -- Créer un nouvel export
    INSERT INTO data_exports (user_id, format, status)
    VALUES (user_uuid, export_format, 'pending')
    RETURNING id INTO export_id;

    RETURN export_id;
END;
$$;
