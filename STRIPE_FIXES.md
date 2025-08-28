# Stripe Payment Integration Fixes

## Problem
Users could authenticate but encountered errors when trying to upgrade to paid plans.

## Root Cause
The payment flow was redirecting authenticated users to `/pricing?plan=...` instead of the proper upgrade page.

## Fixes Applied

### 1. Payment Flow Redirection (PricingSection.tsx)
**Before:**
```tsx
// Si connecté, rediriger vers la page de pricing pour l'upgrade
navigate(`/pricing?plan=${planName.toLowerCase()}`);
```

**After:**
```tsx
// Si connecté, rediriger vers la page d'upgrade avec le plan sélectionné
navigate(`/upgrade?selectedPlan=${planName.toLowerCase()}`);
```

### 2. Stripe Price IDs (SubscriptionPage.tsx)
Updated all Price IDs to match the actual Stripe configuration:

- **Pro**: `price_1S0tHgBTb6wwJE5ou7JuBLcy` (19€/mois)
- **Business**: `price_1S0tIGBTb6wwJE5ogGSDGyS5` (25€/mois) 
- **Enterprise**: `price_1S0tFoBTb6wwJE5oeYP0xRlZ` (49€/mois)

### 3. Webhook Configuration
Verified webhook functions handle the correct events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Expected Flow After Fixes
1. User clicks on paid plan in PricingSection
2. If authenticated → redirects to `/upgrade?selectedPlan=...`
3. UpgradePage shows selected plan and calls `redirectToStripeCheckout()`
4. Stripe checkout uses correct Price IDs
5. Webhook processes payment completion

## Next Steps for User
1. Configure webhook URL: `https://uwufajfxoqupomiltumc.supabase.co/functions/v1/stripe-webhook`
2. Ensure Supabase environment variables are set
3. Test the payment flow with actual Stripe credentials