-- ================================================
-- AJOUT DES COLONNES POUR LA CONFIDENTIALITÉ ET LE TRACKING
-- ================================================

-- Vérifier si les colonnes existent déjà
DO $$
BEGIN
    -- Ajout de la colonne is_private pour les liens privés
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.links'::regclass AND attname = 'is_private') THEN
        ALTER TABLE public.links ADD COLUMN is_private BOOLEAN DEFAULT false;
    END IF;
    
    -- Ajout de la colonne tracking_enabled pour activer/désactiver le tracking
    IF NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid = 'public.links'::regclass AND attname = 'tracking_enabled') THEN
        ALTER TABLE public.links ADD COLUMN tracking_enabled BOOLEAN DEFAULT true;
    END IF;
END
$$;

-- Commentaires pour expliquer les nouvelles colonnes
COMMENT ON COLUMN public.links.is_private IS 'Si true, le lien n''apparaît pas dans les listes publiques et nécessite une authentification';
COMMENT ON COLUMN public.links.tracking_enabled IS 'Si false, aucune donnée de tracking n''est collectée pour ce lien';

-- Mettre à jour les liens existants pour activer le tracking par défaut
UPDATE public.links SET tracking_enabled = true WHERE tracking_enabled IS NULL;

-- Index pour les recherches filtrées
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_links_privacy') THEN
        CREATE INDEX idx_links_privacy ON public.links(is_private);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_links_tracking') THEN
        CREATE INDEX idx_links_tracking ON public.links(tracking_enabled);
    END IF;
END
$$;
