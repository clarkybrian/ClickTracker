import { loadStripe } from '@stripe/stripe-js';

// Charger Stripe avec votre clé publique
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export interface CheckoutSessionData {
  userId: string;
  userEmail: string;
  planType: 'business' | 'pro' | 'enterprise';
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export const redirectToStripeCheckout = async (planType: 'business' | 'pro' | 'enterprise', userEmail: string, userId?: string) => {
  // Configuration des prix pour chaque plan (VOS PRICE IDs)
  const priceIds = {
    pro: 'price_1S0tHgBTb6wwJE5ou7JuBLcy',     // Plan Pro - 19€/mois
    business: 'price_1S0tIGBTb6wwJE5ogGSDGyS5', // Plan Business - 25€/mois  
    enterprise: 'contact' // Plan Enterprise - Contact direct
  };

  // Pour le plan Enterprise, rediriger vers contact
  if (planType === 'enterprise') {
    window.location.href = 'mailto:contact@clicktracker.com?subject=Demande Plan Enterprise';
    return;
  }

  // Utiliser les Payment Links avec email pré-rempli
  const checkoutUrls = {
    pro: `https://buy.stripe.com/test_8x2cN454QdBP7B321k8Vi03?prefilled_email=${encodeURIComponent(userEmail)}&success_url=${encodeURIComponent(window.location.origin + '/payment-success')}`,
    business: `https://buy.stripe.com/test_00w6oGapa9lz6wZdK28Vi04?prefilled_email=${encodeURIComponent(userEmail)}&success_url=${encodeURIComponent(window.location.origin + '/payment-success')}`
  };

  // Rediriger vers le lien de paiement Stripe avec email pré-rempli
  window.location.href = checkoutUrls[planType];
};

export { stripePromise };
