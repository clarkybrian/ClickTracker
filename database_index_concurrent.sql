-- ========================================
-- CLICKTRACKER - INDEX CONCURRENT (À exécuter APRÈS database_setup.sql)
-- ========================================
-- Ce script doit être exécuté séparément car CREATE INDEX CONCURRENTLY
-- ne peut pas fonctionner dans un bloc de transaction

-- Index optimisé pour les redirections rapides
-- Améliore les performances des requêtes de redirection
CREATE INDEX CONCURRENTLY idx_links_redirect_lookup 
ON public.links(short_code, is_active, expires_at) 
WHERE is_active = true;

-- Vérifier que l'index a été créé
-- SELECT indexname, schemaname, tablename 
-- FROM pg_indexes 
-- WHERE tablename = 'links' 
-- AND indexname = 'idx_links_redirect_lookup';

-- ========================================
-- INSTRUCTIONS D'EXÉCUTION
-- ========================================
-- 1. Exécutez d'abord database_setup.sql completement
-- 2. Ensuite exécutez ce script séparément
-- 3. L'index sera créé en arrière-plan sans bloquer les opérations
-- 4. Vérifiez le statut avec la requête de vérification ci-dessus
