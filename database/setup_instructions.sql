-- ÉTAPE 1: Exécuter ce script dans Supabase SQL Editor
-- Ce script est déjà dans database/users_table.sql

-- ÉTAPE 2: Configurer les variables d'environnement dans Supabase
-- Aller dans Settings > API et ajouter ces variables:

-- STRIPE_WEBHOOK_SECRET=whsec_xxxxx (depuis Stripe Dashboard > Webhooks)
-- STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx (depuis Stripe Dashboard > API Keys)
-- STRIPE_SECRET_KEY=sk_test_xxxxx (depuis Stripe Dashboard > API Keys)

-- ÉTAPE 3: Créer une fonction Edge pour le webhook Stripe
-- Créer un nouveau fichier dans Supabase Edge Functions:

/*
-- Nom de la fonction: stripe-webhook
-- Code:

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const body = await req.text()

    // Vérifier la signature Stripe ici (optionnel en mode test)
    
    const event = JSON.parse(body)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerId = session.customer
      const subscriptionId = session.subscription
      
      // Récupérer la ligne d'item pour déterminer le plan
      const lineItem = session.line_items?.data?.[0]
      const priceId = lineItem?.price?.id
      
      let planType = 'starter'
      if (priceId?.includes('pro')) planType = 'pro'
      else if (priceId?.includes('business')) planType = 'business'
      else if (priceId?.includes('enterprise')) planType = 'enterprise'
      
      // Mettre à jour l'utilisateur
      await supabase
        .from('users')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan_type: planType,
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 jours
        })
        .eq('email', session.customer_details?.email)
    }
    
    else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      const customerId = subscription.customer
      
      await supabase
        .from('users')
        .update({
          subscription_status: subscription.status,
          subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_customer_id', customerId)
    }
    
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      const customerId = subscription.customer
      
      await supabase
        .from('users')
        .update({
          plan_type: 'starter',
          subscription_status: 'canceled',
          subscription_end_date: new Date().toISOString()
        })
        .eq('stripe_customer_id', customerId)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
*/

-- ÉTAPE 4: Configurer le webhook dans Stripe Dashboard
-- 1. Aller sur https://dashboard.stripe.com/webhooks
-- 2. Cliquer "Add endpoint"  
-- 3. URL: https://[votre-project-id].supabase.co/functions/v1/stripe-webhook
-- 4. Événements à sélectionner:
--    - checkout.session.completed
--    - customer.subscription.updated
--    - customer.subscription.deleted
-- 5. Copier le webhook secret et l'ajouter aux variables d'environnement

-- ÉTAPE 5: Tester le système
-- 1. Créer un compte dans votre app
-- 2. Aller sur /upgrade
-- 3. Cliquer sur un plan payant
-- 4. Utiliser la carte de test: 4242 4242 4242 4242
-- 5. Vérifier dans Supabase que l'utilisateur a été mis à jour

-- ÉTAPE 6: Production
-- Remplacer les clés de test par les clés de production Stripe
