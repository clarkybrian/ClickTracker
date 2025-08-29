import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, BarChart3, Globe, Download, Crown, Shield, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { redirectToStripeCheckout } from '../../lib/stripe';

const plans = [
  {
    name: "Starter",
    price: "0€",
    period: "/mois",
    description: "Pour découvrir",
    icon: Zap,
    features: [
      { text: "Raccourcissement de liens", included: true },
      { text: "1 lien actif", included: true },
      { text: "10 000 clics par mois", included: true },
      { text: "1 domaine personnalisé", included: true },
      { text: "Statistiques de base", included: true },
      { text: "Géolocalisation détaillée", included: false },
      { text: "Types d'appareils", included: false },
      { text: "Navigateurs utilisés", included: false },
      { text: "Sources de trafic", included: false },
      { text: "Tracking temps réel", included: false }
    ],
    buttonText: "Commencer",
    buttonStyle: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    popular: false,
    badge: null,
    savings: null,
    originalPrice: null
  },
  {
    name: "Pro",
    price: "19€",
    period: "/mois",
    description: "Le plus populaire",
    icon: Crown,
    features: [
      { text: "Raccourcissement de liens", included: true },
      { text: "3 liens actifs", included: true },
      { text: "100 000 clics par mois", included: true },
      { text: "3 domaines personnalisés", included: true },
      { text: "Géolocalisation détaillée (pays/villes)", included: true },
      { text: "Types d'appareils (mobile/desktop)", included: true },
      { text: "Navigateurs utilisés", included: true },
      { text: "Sources de trafic", included: true },
      { text: "Statistiques avancées", included: true },
      { text: "Export des données", included: true }
    ],
    buttonText: "Essayer Pro",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-1",
    popular: true,
    badge: "🔥 Le plus populaire",
    savings: null,
    originalPrice: null
  },
  {
    name: "Business",
    price: "25€",
    period: "/mois",
    description: "Meilleure valeur",
    icon: TrendingUp,
    features: [
      { text: "Raccourcissement de liens", included: true },
      { text: "5 liens actifs", included: true },
      { text: "1 000 000 clics par mois", included: true },
      { text: "5 domaines personnalisés", included: true },
      { text: "Tracking temps réel", included: true },
      { text: "Heures de pointe d'activité", included: true },
      { text: "Export données avancé", included: true },
      { text: "Liens personnalisés", included: true },
      { text: "QR codes personnalisés", included: true },
      { text: "Rapports automatisés", included: true }
    ],
    buttonText: "Choisir Business",
    buttonStyle: "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-xl transform hover:-translate-y-1",
    popular: false,
    badge: "💎 Meilleure valeur",
    savings: "Économisez 17%",
    originalPrice: "30€"
  },
  {
    name: "Enterprise",
    price: "49€",
    period: "/mois",
    description: "Pour les entreprises",
    icon: Target,
    features: [
      { text: "Raccourcissement de liens", included: true },
      { text: "12 liens actifs", included: true },
      { text: "10 000 000 clics par mois", included: true },
      { text: "12 domaines personnalisés", included: true },
      { text: "API complète + webhooks", included: true },
      { text: "Intégrations tierces", included: true },
      { text: "White-label complet", included: true },
      { text: "Analytics prédictives", included: true },
      { text: "Support dédié 24/7", included: true },
      { text: "Manager de compte dédié", included: true }
    ],
    buttonText: "Contacter les ventes",
    buttonStyle: "bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:shadow-xl transform hover:-translate-y-1",
    popular: false,
    badge: "🚀 Enterprise",
    savings: null,
    originalPrice: null
  }
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useSubscription();

  // Fonction pour déterminer si un plan est désactivé
  const isPlanDisabled = (planName: string) => {
    if (!profile) return false;
    
    const currentTier = profile.subscription_tier;
    const planLower = planName.toLowerCase();
    
    // Si l'utilisateur a un plan gratuit, aucun plan n'est désactivé
    if (currentTier === 'free') return false;
    
    // Si l'utilisateur a un plan pro, désactiver free et pro
    if (currentTier === 'pro') {
      return planLower === 'starter' || planLower === 'pro';
    }
    
    // Si l'utilisateur a un plan business, désactiver free et business
    if (currentTier === 'business') {
      return planLower === 'starter' || planLower === 'business';
    }
    
    return false;
  };

  // Fonction pour obtenir le texte du bouton selon l'état
  const getButtonText = (planName: string, originalText: string) => {
    if (!profile) return originalText;
    
    const currentTier = profile.subscription_tier;
    const planLower = planName.toLowerCase();
    
    // Si c'est le plan actuel
    if ((currentTier === 'free' && planLower === 'starter') ||
        (currentTier === 'pro' && planLower === 'pro') ||
        (currentTier === 'business' && planLower === 'business')) {
      return 'Plan actuel';
    }
    
    // Si le plan est inférieur au plan actuel
    if (isPlanDisabled(planName)) {
      return 'Indisponible';
    }
    
    return originalText;
  };

  const handlePlanClick = async (planName: string) => {
    // Si le plan est désactivé, ne rien faire
    if (isPlanDisabled(planName)) {
      return;
    }
    
    if (planName === "Starter") {
      // Pour le plan gratuit, rediriger selon l'état de connexion
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    } else {
      // Pour TOUS les plans payants (Pro, Business, Enterprise)
      if (!user) {
        // Si pas connecté, TOUJOURS rediriger vers auth
        navigate(`/auth?plan=${planName.toLowerCase()}&intent=upgrade`);
      } else {
        // Si connecté, utiliser la nouvelle fonction avec email pré-rempli
        try {
          if (planName === "Pro") {
            await redirectToStripeCheckout('pro', user.email || '', user.id);
          } else if (planName === "Business") {
            await redirectToStripeCheckout('business', user.email || '', user.id);
          } else if (planName === "Enterprise") {
            await redirectToStripeCheckout('enterprise', user.email || '', user.id);
          }
        } catch (error) {
          console.error('Erreur lors de la redirection:', error);
          // En cas d'erreur, fallback vers les Payment Links avec success_url
          if (planName === "Pro") {
            window.location.href = `https://buy.stripe.com/test_8x2cN454QdBP7B321k8Vi03?prefilled_email=${encodeURIComponent(user.email || '')}&success_url=${encodeURIComponent(window.location.origin + '/payment-success')}`;
          } else if (planName === "Business") {
            window.location.href = `https://buy.stripe.com/test_00w6oGapa9lz6wZdK28Vi04?prefilled_email=${encodeURIComponent(user.email || '')}&success_url=${encodeURIComponent(window.location.origin + '/payment-success')}`;
          }
        }
      }
    }
  };
  return (
    <div className="ck-pricing py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Plan</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Des fonctionnalités puissantes pour chaque besoin. Commencez gratuitement, évoluez selon vos objectifs.
          </p>
          <div className="mt-6 inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            <span>⚡</span>
            <span>Lancement : -50% sur tous les plans jusqu'au 30 septembre !</span>
          </div>
        </div>

        <div className="ck-pricing-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-6">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const isDisabled = isPlanDisabled(plan.name);
            const isCurrentPlan = profile && (
              (profile.subscription_tier === 'free' && plan.name === 'Starter') ||
              (profile.subscription_tier === 'pro' && plan.name === 'Pro') ||
              (profile.subscription_tier === 'business' && plan.name === 'Business')
            );
            
            return (
              <div
                key={index}
                className={`ck-pricing-card relative rounded-2xl shadow-xl border-2 transition-all duration-300 ${
                  isDisabled || isCurrentPlan
                    ? 'bg-gray-50 border-gray-300 opacity-60'
                    : plan.popular 
                    ? 'bg-white border-blue-500 lg:scale-105 order-1 lg:order-none hover:shadow-2xl hover:-translate-y-2' 
                    : plan.badge?.includes('valeur')
                    ? 'bg-white border-green-500 lg:scale-102 order-2 lg:order-none hover:shadow-2xl hover:-translate-y-2'
                    : 'bg-white border-gray-200 hover:shadow-2xl hover:-translate-y-2'
                }`}
              >
                {plan.badge && !isDisabled && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : plan.badge.includes('valeur')
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-700'
                    }`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Plan actuel
                    </div>
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-2 -right-2">
                    <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold transform rotate-12">
                      {plan.savings}
                    </div>
                  </div>
                )}

                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="text-center mb-4 md:mb-6">
                    <div className={`inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl mb-2 md:mb-3 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                        : plan.badge?.includes('valeur')
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : plan.badge?.includes('Enterprise')
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-700'
                        : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-5 w-5 md:h-6 md:w-6 ${
                        plan.popular || plan.badge?.includes('valeur') || plan.badge?.includes('Enterprise') 
                          ? 'text-white' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-3">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center">
                      {plan.originalPrice && (
                        <span className="text-sm text-gray-400 line-through mr-2">{plan.originalPrice}</span>
                      )}
                      <span className="text-2xl md:text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm md:text-base text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-2 flex-shrink-0" />
                        ) : (
                          <X className="h-3 w-3 md:h-4 md:w-4 text-gray-300 mr-2 flex-shrink-0" />
                        )}
                        <span className={`text-xs md:text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button 
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isDisabled || !!isCurrentPlan}
                    className={`ck-pricing-btn w-full py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${
                      isDisabled 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : isCurrentPlan
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : plan.buttonStyle
                    }`}
                  >
                    {getButtonText(plan.name, plan.buttonText)}
                  </button>
                </div>

                {/* Premium Badge Icons */}
                {(plan.popular || plan.badge?.includes('valeur')) && (
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 flex space-x-1">
                    <div className="p-1 bg-blue-100 rounded-md">
                      <Shield className="h-2 w-2 md:h-3 md:w-3 text-blue-600" />
                    </div>
                    <div className="p-1 bg-purple-100 rounded-md">
                      <BarChart3 className="h-2 w-2 md:h-3 md:w-3 text-purple-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust Signals */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="flex flex-wrap justify-center items-center space-x-6 md:space-x-8 text-gray-600">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm">Paiement sécurisé</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Annulation libre</span>
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-sm">Activation immédiate</span>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="ck-benefits-grid mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              icon: Globe,
              title: "Analytics Géographiques",
              description: "Découvrez d'où viennent vos visiteurs avec une précision au niveau ville et optimisez vos campagnes"
            },
            {
              icon: Download,
              title: "Export & Intégrations",
              description: "Exportez vos données en Excel/CSV et connectez-vous à vos outils CRM favoris"
            },
            {
              icon: BarChart3,
              title: "Tableaux de Bord Temps Réel",
              description: "Visualisez vos performances avec des graphiques interactifs et des alertes automatiques"
            }
          ].map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="ck-benefit-card text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                <h4 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-sm md:text-base text-gray-600 px-4">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
