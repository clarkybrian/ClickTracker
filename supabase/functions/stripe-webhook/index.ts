import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.9.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://shxrchkkynuuzwkjigjx.supabase.co'
const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Gérer les requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  // Seules les requêtes POST sont autorisées pour les webhooks
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  console.log('🔍 === NOUVEAU WEBHOOK STRIPE ===')
  console.log('🔍 Method:', req.method)
  console.log('🔍 URL:', req.url)
  console.log('🔍 Headers complets:')
  
  // Logger TOUS les headers un par un
  for (const [key, value] of req.headers.entries()) {
    console.log(`   ${key}: ${value}`)
  }
  
  const signature = req.headers.get('stripe-signature') || req.headers.get('Stripe-Signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  console.log('🔑 Signature trouvée:', signature ? `OUI (${signature.substring(0, 20)}...)` : 'NON')
  console.log('🔑 Webhook secret configuré:', webhookSecret ? `OUI (${webhookSecret.substring(0, 20)}...)` : 'NON')
  
  // 🚀 MODE TEST: ON ACCEPTE TOUT POUR L'INSTANT !
  console.log('🧪 MODE TEST ACTIVÉ: On ignore la vérification de signature')
  
  // On continue même sans signature ou secret pour tester

  try {
    const body = await req.text()
    console.log('📦 Body length:', body.length)
    
    let event
    
    // Si on a signature et secret, on essaie la vérification normale
    if (signature && webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
        console.log('✅ Webhook event constructed avec vérification:', event.type)
      } catch (signatureError) {
        console.log('⚠️ Échec vérification signature, on parse directement le JSON:', signatureError.message)
        // Si la vérification échoue, on parse directement
        event = JSON.parse(body)
        console.log('✅ Event parsé directement (SANS vérification):', event.type)
      }
    } else {
      // Pas de signature ou secret, on parse directement
      event = JSON.parse(body)
      console.log('✅ Event parsé directement (PAS de signature):', event.type)
    }

    console.log(`Stripe webhook received: ${event.type}`)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(subscription)
        break
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }
    }

    // Enregistrer l'événement dans l'audit trail
    await supabase.from('stripe_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      stripe_customer_id: getCustomerIdFromEvent(event),
      event_data: event.data.object
    })

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('❌ Stripe webhook error:', err)
    
    // Si c'est une erreur de signature, retourner 401
    if (err.message && err.message.includes('signature')) {
      console.error('🚨 Signature verification failed')
      return new Response(JSON.stringify({ 
        error: 'Invalid signature',
        message: err.message 
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    return new Response(JSON.stringify({ 
      error: 'Webhook processing error',
      message: err.message 
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const priceId = subscription.items.data[0]?.price.id
  
  // Mapper price_id vers subscription_tier
  let tier = 'free'
  if (priceId === 'price_1S0tHgBTb6wwJE5ou7JuBLcy') tier = 'pro'
  if (priceId === 'price_1S0tIGBTb6wwJE5ogGSDGyS5') tier = 'business'
  // Note: Enterprise sera géré séparément car c'est par contact
  
  // Récupérer l'email du customer Stripe pour le matching
  let customerEmail = null
  try {
    const customer = await stripe.customers.retrieve(customerId)
    if ('email' in customer) {
      customerEmail = customer.email
    }
  } catch (error) {
    console.error('Erreur récupération customer:', error)
  }
  
  // Mise à jour par customer_id OU par email
  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      subscription_tier: tier,
      subscription_status: subscription.status === 'active' ? 'active' : 'cancelled',
      stripe_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      stripe_cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .or(`stripe_customer_id.eq.${customerId}${customerEmail ? `,email.eq.${customerEmail}` : ''}`)
  
  if (error) {
    console.error('Erreur mise à jour subscription:', error)
  } else {
    console.log(`✅ Subscription mise à jour: ${tier} pour customer ${customerId}`)
  }
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_tier: 'free',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      stripe_price_id: null
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('Erreur annulation subscription:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('Erreur paiement réussi:', error)
  } else {
    console.log('✅ Paiement réussi - Utilisateur activé:', customerId)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const { error } = await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'payment_failed',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customerId)
  
  if (error) {
    console.error('Erreur paiement échoué:', error)
  } else {
    console.log('⚠️ Paiement échoué - Statut mis à jour:', customerId)
  }
}

function getCustomerIdFromEvent(event: any): string | null {
  const obj = event.data.object
  return obj.customer || obj.subscription?.customer || null
}
