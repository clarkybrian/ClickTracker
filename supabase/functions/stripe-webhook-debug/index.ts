import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('🚀 FONCTION DEBUG SIMPLE APPELÉE')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Toujours accepter OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('✅ Requête OPTIONS - CORS OK')
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  // Logger tous les headers
  console.log('=== HEADERS REÇUS ===')
  for (const [key, value] of req.headers.entries()) {
    console.log(`${key}: ${value}`)
  }

  try {
    const body = await req.text()
    console.log('Body reçu, length:', body.length)
    
    // Essayer de parser le JSON
    const data = JSON.parse(body)
    console.log('JSON parsé avec succès')
    console.log('Type événement:', data.type || 'INCONNU')
    
    return new Response(JSON.stringify({ 
      success: true, 
      received_event: data.type || 'unknown',
      body_length: body.length,
      headers_count: req.headers.size
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
    return new Response(JSON.stringify({ 
      error: 'Error processing request',
      message: error.message 
    }), {
      status: 200, // On retourne 200 pour éviter que Stripe pense que c'est un problème
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
