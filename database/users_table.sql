-- Création de la table users pour gérer les abonnements
CREATE TABLE IF NOT EXISTS public.users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text DEFAULT 'starter' CHECK (plan_type IN ('starter', 'pro', 'business', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid', 'inactive')),
  subscription_start_date timestamptz,
  subscription_end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON public.users(stripe_customer_id);

-- RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres données
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth_user_id = auth.uid());

-- Politique pour l'insertion (webhook Stripe)
CREATE POLICY "Enable insert for service role" ON public.users
  FOR INSERT WITH CHECK (true);

-- Politique pour mise à jour via webhook
CREATE POLICY "Enable update for service role" ON public.users
  FOR UPDATE USING (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users 
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
