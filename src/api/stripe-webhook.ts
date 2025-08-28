import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client avec clé de service pour écrire dans la DB
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    // Vérification de la signature Stripe (à implémenter avec votre clé webhook)
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    // Pour l'instant, on parse directement le JSON
    const event = JSON.parse(body);

    console.log('Webhook reçu:', event.type);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Erreur webhook:', error);
    return new Response('Erreur', { status: 400 });
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('Checkout complété:', session);
  
  const { customer_email, metadata, subscription } = session;
  
  // Déterminer le plan basé sur l'amount_total ou metadata
  let planType = 'starter';
  const amount = session.amount_total / 100; // Convertir de centimes en euros
  
  if (amount === 19) planType = 'pro';
  else if (amount === 25) planType = 'business';
  else if (amount === 49) planType = 'enterprise';
  
  // Mettre à jour l'utilisateur dans Supabase
  if (customer_email) {
    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        email: customer_email,
        plan_type: planType,
        stripe_customer_id: session.customer,
        stripe_subscription_id: subscription,
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'email'
      });
    
    if (error) {
      console.error('Erreur mise à jour utilisateur:', error);
    } else {
      console.log(`Utilisateur ${customer_email} mis à jour avec plan ${planType}`);
    }
  }
}

async function handleSubscriptionCreated(subscription: any) {
  console.log('Abonnement créé:', subscription);
  
  const { customer, status, items } = subscription;
  
  // Récupérer l'email du customer Stripe
  // const customer_data = await stripe.customers.retrieve(customer);
  
  // Mise à jour directe par customer ID pour l'instant
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: status,
      subscription_start_date: new Date(subscription.start_date * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer);
  
  if (error) {
    console.error('Erreur mise à jour abonnement:', error);
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('Abonnement mis à jour:', subscription);
  
  const { customer, status } = subscription;
  
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer);
  
  if (error) {
    console.error('Erreur mise à jour statut:', error);
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log('Abonnement annulé:', subscription);
  
  const { customer } = subscription;
  
  const { error } = await supabaseAdmin
    .from('users')
    .update({
      plan_type: 'starter',
      subscription_status: 'canceled',
      subscription_end_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_customer_id', customer);
  
  if (error) {
    console.error('Erreur annulation:', error);
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Paiement réussi:', invoice);
  // Logique pour confirmer le paiement
}

async function handlePaymentFailed(invoice: any) {
  console.log('Paiement échoué:', invoice);
  // Logique pour gérer l'échec de paiement
}
