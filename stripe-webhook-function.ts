import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.text()
    const event = JSON.parse(body)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Webhook reçu:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerId = session.customer
        const subscriptionId = session.subscription
        
        // Déterminer le plan selon le price_id
        let planType = 'starter'
        const priceId = session.line_items?.data?.[0]?.price?.id
        
        // Vos vrais Price IDs
        if (priceId === 'price_1S0tHgBTb6wwJE5ou7JuBLcy') { // Pro
          planType = 'pro'
        } else if (priceId === 'price_1S0tIGBTb6wwJE5ogGSDGyS5') { // Business
          planType = 'business'
        } else if (priceId === 'price_1S0tFoBTb6wwJE5oeYP0xRlZ') { // Enterprise
          planType = 'enterprise'
        }
        
        const { error: updateError } = await supabase
          .from('users')
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_type: planType,
            subscription_status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq('email', session.customer_details?.email)

        if (updateError) {
          console.error('Erreur mise à jour utilisateur:', updateError)
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        await supabase
          .from('users')
          .update({
            subscription_status: subscription.status,
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString()
          })
          .eq('stripe_customer_id', subscription.customer)
        break
      }
      
      case 'customer.subscription.deleted': {
        const canceledSub = event.data.object
        
        await supabase
          .from('users')
          .update({
            plan_type: 'starter',
            subscription_status: 'canceled',
            subscription_end_date: new Date().toISOString()
          })
          .eq('stripe_customer_id', canceledSub.customer)
        break
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Erreur webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
