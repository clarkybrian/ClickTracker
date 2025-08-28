import { loadStripe } from '@stripe/stripe-js';

// Initialisation de Stripe avec votre clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export interface CheckoutSessionData {
  userId: string;
  userEmail: string;
  planType: 'business' | 'pro' | 'enterprise';
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = async (data: CheckoutSessionData) => {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création de la session');
    }

    const { sessionId } = await response.json();
    
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe n\'a pas pu être chargé');
    }

    // Redirection vers Stripe Checkout
    const { error } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erreur checkout:', error);
    throw error;
  }
};

export const redirectToStripeCheckout = async (planType: 'business' | 'pro' | 'enterprise', userEmail: string) => {
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe n\'a pas pu être chargé');
  }

  // Configuration des prix pour chaque plan (VOS VRAIS PRICE IDs)
  const priceIds = {
    pro: 'price_1S0tHgBTb6wwJE5ou7JuBLcy', // Plan Pro - 19€/mois
    business: 'price_1S0tIGBTb6wwJE5ogGSDGyS5', // Plan Business - 25€/mois  
    enterprise: 'price_1S0tFoBTb6wwJE5oeYP0xRlZ' // Plan Enterprise - 49€/mois
  };

  // Créer une session de checkout directement via Stripe
  try {
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{
        price: priceIds[planType],
        quantity: 1,
      }],
      mode: 'subscription',
      successUrl: `${window.location.origin}/dashboard?success=true`,
      cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      customerEmail: userEmail,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Erreur redirection Stripe:', error);
    throw error;
  }
};

export { stripePromise };
