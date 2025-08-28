// Utilitaires pour gérer les événements Stripe via webhook
// Ce fichier servira de référence pour configurer un endpoint webhook

export const STRIPE_WEBHOOK_EVENTS = {
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed'
};

export const PLAN_MAPPING = {
  // Remplacez ces price_ids par vos vrais IDs de Stripe
  'price_starter': 'starter',
  'price_pro': 'pro', 
  'price_business': 'business',
  'price_enterprise': 'enterprise'
};

// Configuration des URL de redirection après paiement
export const getSuccessUrl = (planType: string) => {
  return `${window.location.origin}/dashboard?payment=success&plan=${planType}`;
};

export const getCancelUrl = () => {
  return `${window.location.origin}/upgrade?payment=cancelled`;
};

// Instructions pour configurer le webhook Stripe
export const WEBHOOK_SETUP_INSTRUCTIONS = `
=== CONFIGURATION WEBHOOK STRIPE ===

1. Aller sur https://dashboard.stripe.com/webhooks
2. Cliquer sur "Add endpoint"
3. URL endpoint: ${typeof window !== 'undefined' ? window.location.origin : 'https://votre-domaine.com'}/api/stripe-webhook
4. Sélectionner ces événements:
   - customer.subscription.created
   - customer.subscription.updated  
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed

5. Copier le "Signing secret" et l'ajouter aux variables d'environnement

=== EXEMPLE DE FONCTION CLOUD SUPABASE ===

-- Fonction pour traiter les webhooks Stripe
CREATE OR REPLACE FUNCTION handle_stripe_webhook(payload jsonb)
RETURNS void AS $$
DECLARE
  event_type text;
  customer_id text;
  subscription_id text;
  plan_name text;
  subscription_status text;
BEGIN
  event_type := payload->>'type';
  
  IF event_type IN ('customer.subscription.created', 'customer.subscription.updated') THEN
    customer_id := payload->'data'->'object'->>'customer';
    subscription_id := payload->'data'->'object'->>'id';
    subscription_status := payload->'data'->'object'->>'status';
    
    -- Extraire le plan depuis les items de la subscription
    plan_name := CASE 
      WHEN payload->'data'->'object'->'items'->'data'->0->'price'->>'id' LIKE '%pro%' THEN 'pro'
      WHEN payload->'data'->'object'->'items'->'data'->0->'price'->>'id' LIKE '%business%' THEN 'business'
      WHEN payload->'data'->'object'->'items'->'data'->0->'price'->>'id' LIKE '%enterprise%' THEN 'enterprise'
      ELSE 'starter'
    END;
    
    -- Mettre à jour l'utilisateur
    UPDATE public.users 
    SET 
      plan_type = plan_name,
      stripe_subscription_id = subscription_id,
      subscription_status = CASE 
        WHEN subscription_status = 'active' THEN 'active'
        WHEN subscription_status = 'canceled' THEN 'canceled'
        WHEN subscription_status = 'past_due' THEN 'past_due'
        ELSE 'inactive'
      END,
      subscription_start_date = CASE 
        WHEN event_type = 'customer.subscription.created' 
        THEN to_timestamp((payload->'data'->'object'->>'current_period_start')::bigint)
        ELSE subscription_start_date
      END,
      subscription_end_date = to_timestamp((payload->'data'->'object'->>'current_period_end')::bigint),
      updated_at = now()
    WHERE stripe_customer_id = customer_id;
    
  ELSIF event_type = 'customer.subscription.deleted' THEN
    customer_id := payload->'data'->'object'->>'customer';
    
    -- Révoquer l'abonnement
    UPDATE public.users 
    SET 
      plan_type = 'starter',
      subscription_status = 'canceled',
      subscription_end_date = now(),
      updated_at = now()
    WHERE stripe_customer_id = customer_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

=== MISE À JOUR DES LIENS DE PAIEMENT ===

Pour que les paiements fonctionnent, il faut:
1. Remplacer les liens de test dans PricingSection.tsx par de vrais liens Stripe
2. Configurer les price_ids correspondants
3. Ajouter les metadata customer_id lors de la création des sessions Stripe
`;

console.log(WEBHOOK_SETUP_INSTRUCTIONS);
