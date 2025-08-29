-- Création d'une vue pour la table profiles manquante
CREATE OR REPLACE VIEW profiles AS
SELECT * FROM user_profiles;

-- Fonction pour détecter automatiquement la source de trafic
CREATE OR REPLACE FUNCTION auto_detect_traffic_source()
RETURNS TRIGGER AS $$
BEGIN
    -- Ne pas écraser les valeurs UTM si elles sont déjà définies manuellement
    IF NEW.utm_source IS NULL THEN
        -- Détection de la source à partir du referrer
        IF NEW.referer IS NOT NULL THEN
            -- Détection de plateforme sociale
            IF NEW.referer LIKE '%facebook.com%' THEN
                NEW.utm_source = 'facebook';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
            ELSIF NEW.referer LIKE '%instagram.com%' THEN
                NEW.utm_source = 'instagram';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
            ELSIF NEW.referer LIKE '%twitter.com%' OR NEW.referer LIKE '%x.com%' THEN
                NEW.utm_source = 'twitter';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
            ELSIF NEW.referer LIKE '%linkedin.com%' THEN
                NEW.utm_source = 'linkedin';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
            ELSIF NEW.referer LIKE '%youtube.com%' THEN
                NEW.utm_source = 'youtube';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
            ELSIF NEW.referer LIKE '%tiktok.com%' THEN
                NEW.utm_source = 'tiktok';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'social');
                
            -- Détection de moteurs de recherche
            ELSIF NEW.referer LIKE '%google.%' THEN
                NEW.utm_source = 'google';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'organic');
            ELSIF NEW.referer LIKE '%bing.com%' THEN
                NEW.utm_source = 'bing';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'organic');
            ELSIF NEW.referer LIKE '%yahoo.com%' THEN
                NEW.utm_source = 'yahoo';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'organic');
            ELSIF NEW.referer LIKE '%duckduckgo.com%' THEN
                NEW.utm_source = 'duckduckgo';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'organic');
                
            -- Détection d'email
            ELSIF NEW.referer LIKE '%mail.%' OR NEW.referer LIKE '%outlook.%' OR NEW.referer LIKE '%gmail.%' THEN
                NEW.utm_source = 'email';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'email');
                
            -- Autres sources
            ELSE
                NEW.utm_source = 'referral';
                NEW.utm_medium = COALESCE(NEW.utm_medium, 'referral');
            END IF;
        ELSE
            -- Si pas de referrer, considéré comme trafic direct
            NEW.utm_source = 'direct';
            NEW.utm_medium = COALESCE(NEW.utm_medium, 'none');
        END IF;
    END IF;
    
    -- Définir utm_campaign s'il n'est pas déjà défini
    IF NEW.utm_campaign IS NULL THEN
        -- Par défaut, utiliser la date comme campagne
        NEW.utm_campaign = 'auto_' || TO_CHAR(CURRENT_DATE, 'YYYY_MM');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création du trigger pour la détection automatique
DROP TRIGGER IF EXISTS auto_detect_traffic_source_trigger ON clicks;
CREATE TRIGGER auto_detect_traffic_source_trigger
BEFORE INSERT ON clicks
FOR EACH ROW
EXECUTE FUNCTION auto_detect_traffic_source();

-- Vue pour l'analyse des UTM par source
CREATE OR REPLACE VIEW utm_source_analysis AS
SELECT 
    l.user_id,
    c.utm_source,
    COUNT(*) as click_count,
    COUNT(DISTINCT c.id) as unique_visitors_count
FROM 
    links l
    JOIN clicks c ON l.id = c.link_id
WHERE 
    c.utm_source IS NOT NULL
GROUP BY 
    l.user_id, c.utm_source;

-- Vue pour l'analyse des UTM par medium
CREATE OR REPLACE VIEW utm_medium_analysis AS
SELECT 
    l.user_id,
    c.utm_medium,
    COUNT(*) as click_count,
    COUNT(DISTINCT c.id) as unique_visitors_count
FROM 
    links l
    JOIN clicks c ON l.id = c.link_id
WHERE 
    c.utm_medium IS NOT NULL
GROUP BY 
    l.user_id, c.utm_medium;

-- Vue pour l'analyse des UTM par campagne
CREATE OR REPLACE VIEW utm_campaign_analysis AS
SELECT 
    l.user_id,
    c.utm_campaign,
    COUNT(*) as click_count,
    COUNT(DISTINCT c.id) as unique_visitors_count
FROM 
    links l
    JOIN clicks c ON l.id = c.link_id
WHERE 
    c.utm_campaign IS NOT NULL
GROUP BY 
    l.user_id, c.utm_campaign;

-- Fonction pour obtenir les statistiques UTM pour un utilisateur
CREATE OR REPLACE FUNCTION get_utm_stats(user_uuid UUID)
RETURNS TABLE (
    source TEXT,
    medium TEXT,
    campaign TEXT,
    clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.utm_source as source,
        c.utm_medium as medium,
        c.utm_campaign as campaign,
        COUNT(*) as clicks
    FROM 
        links l
        JOIN clicks c ON l.id = c.link_id
    WHERE 
        l.user_id = user_uuid
        AND (c.utm_source IS NOT NULL OR c.utm_medium IS NOT NULL OR c.utm_campaign IS NOT NULL)
    GROUP BY 
        c.utm_source, c.utm_medium, c.utm_campaign
    ORDER BY 
        clicks DESC;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les statistiques UTM pour un lien spécifique
CREATE OR REPLACE FUNCTION get_link_utm_stats(link_uuid UUID)
RETURNS TABLE (
    source TEXT,
    medium TEXT,
    campaign TEXT,
    clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.utm_source as source,
        c.utm_medium as medium,
        c.utm_campaign as campaign,
        COUNT(*) as clicks
    FROM 
        clicks c
    WHERE 
        c.link_id = link_uuid
        AND (c.utm_source IS NOT NULL OR c.utm_medium IS NOT NULL OR c.utm_campaign IS NOT NULL)
    GROUP BY 
        c.utm_source, c.utm_medium, c.utm_campaign
    ORDER BY 
        clicks DESC;
END;
$$ LANGUAGE plpgsql;
