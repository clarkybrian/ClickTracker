-- ================================================
-- MISE À JOUR DES VUES POUR INCLURE LES NOUVEAUX CHAMPS
-- ================================================

-- Utilisation d'un bloc PL/pgSQL pour s'assurer que tout s'exécute correctement
DO $$
BEGIN
    -- Supprimer la vue si elle existe
    DROP VIEW IF EXISTS links_with_stats;
    
    -- Créer la nouvelle vue avec tous les champs
    EXECUTE '
    CREATE VIEW links_with_stats AS
    SELECT 
        l.id,
        l.user_id,
        l.original_url,
        l.short_code,
        l.title,
        l.description,
        l.is_active,
        l.expires_at,
        l.password_protected,
        l.password_hash,
        l.utm_source,
        l.utm_medium,
        l.utm_campaign,
        l.is_private,
        l.tracking_enabled,
        l.created_at,
        l.updated_at,
        -- Calcul du nombre total de clics
        (SELECT COUNT(*) FROM clicks c WHERE c.link_id = l.id) AS total_clicks,
        -- Calcul du nombre de clics uniques (basé sur les adresses IP distinctes)
        (SELECT COUNT(DISTINCT ip_address) FROM clicks c WHERE c.link_id = l.id) AS unique_clicks,
        -- Récupération de la date du dernier clic
        (SELECT MAX(clicked_at) FROM clicks c WHERE c.link_id = l.id) AS last_clicked_at
    FROM 
        links l;
    ';
END $$;
