-- ========================================
-- CLICKTRACKER - INDEX NORMAL (Alternative au concurrent)
-- ========================================
-- Index pour les redirections rapides (version normale)

CREATE INDEX idx_links_redirect_lookup 
ON public.links(short_code, is_active, expires_at) 
WHERE is_active = true;

-- Vérifier que l'index a été créé
SELECT indexname, schemaname, tablename 
FROM pg_indexes 
WHERE tablename = 'links' 
AND indexname = 'idx_links_redirect_lookup';
