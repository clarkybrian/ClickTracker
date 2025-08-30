-- ========================================
-- CLICKTRACKER - AJOUT INTÉGRATION STRIPE
-- ========================================

-- Ajout des colonnes Stripe à la table user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_cancel_at_period_end BOOLEAN DEFAULT false;

-- Index pour optimiser les recherches Stripe
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer 
ON public.user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription 
ON public.user_profiles(stripe_subscription_id);

-- Mise à jour des limites pour les plans gratuits (cohérent avec la fonction)
UPDATE public.user_profiles 
SET monthly_link_limit = 1, monthly_clicks_limit = 10000, custom_domains_limit = 1 
WHERE subscription_tier = 'free' OR subscription_tier IS NULL;

-- Table pour stocker les événements Stripe (audit trail)
CREATE TABLE IF NOT EXISTS public.stripe_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    event_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la table stripe_events
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON public.stripe_events(event_type);
CREATE INDEX IF NOT EXISTS idx_stripe_events_customer ON public.stripe_events(stripe_customer_id);

-- Fonction pour mettre à jour les limites selon l'abonnement
CREATE OR REPLACE FUNCTION update_subscription_limits()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour des limites selon le plan
    CASE NEW.subscription_tier
        WHEN 'free' THEN
            NEW.monthly_link_limit := 1;
            NEW.monthly_clicks_limit := 10000;
            NEW.custom_domains_limit := 1;
        WHEN 'pro' THEN
            NEW.monthly_link_limit := 3;
            NEW.monthly_clicks_limit := 100000;
            NEW.custom_domains_limit := 3;
        WHEN 'business' THEN
            NEW.monthly_link_limit := 5;
            NEW.monthly_clicks_limit := 1000000;
            NEW.custom_domains_limit := 5;
        WHEN 'enterprise' THEN
            NEW.monthly_link_limit := 12;
            NEW.monthly_clicks_limit := 10000000;
            NEW.custom_domains_limit := 12;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour automatiquement les limites
DROP TRIGGER IF EXISTS trigger_update_subscription_limits ON public.user_profiles;
CREATE TRIGGER trigger_update_subscription_limits
    BEFORE UPDATE OF subscription_tier ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_limits();
