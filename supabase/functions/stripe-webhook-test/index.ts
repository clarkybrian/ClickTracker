import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

  console.log('🔍 === TEST WEBHOOK SANS SIGNATURE ===')
  console.log('🔍 Method:', req.method)
  console.log('🔍 URL:', req.url)
  console.log('🔍 Headers complets:')
  
  // Logger TOUS les headers un par un
  for (const [key, value] of req.headers.entries()) {
    console.log(`   ${key}: ${value}`)
  }

  try {
    const body = await req.text()
    console.log('📦 Body length:', body.length)
    console.log('📦 Body sample:', body.substring(0, 100) + '...')
    
    // Essayer de parser le JSON
    const event = JSON.parse(body)
    console.log('✅ Event type:', event.type)
    console.log('✅ Event ID:', event.id)
    
    if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object
      console.log('📋 Subscription ID:', subscription.id)
      console.log('📋 Customer ID:', subscription.customer)
      console.log('📋 Status:', subscription.status)
      console.log('📋 Price ID:', subscription.items.data[0]?.price?.id)
    }

    // Enregistrer l'événement dans la base de données
    const { error } = await supabase
      .from('stripe_events')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        processed_at: new Date().toISOString(),
        event_data: event
      })

    if (error) {
      console.error('❌ Database error:', error)
    } else {
      console.log('✅ Event saved to database')
    }

    return new Response(JSON.stringify({ 
      received: true, 
      event_type: event.type,
      event_id: event.id,
      test_mode: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('❌ Webhook error:', err)
    
    return new Response(JSON.stringify({ 
      error: 'Webhook processing error',
      message: err.message,
      test_mode: true
    }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
