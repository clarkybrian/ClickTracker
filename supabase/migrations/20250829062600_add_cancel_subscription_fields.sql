-- Ajouter les colonnes pour la gestion de l'annulation d'abonnement
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;