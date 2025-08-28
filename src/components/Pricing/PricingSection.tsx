import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Zap, BarChart3, Globe, Download, Crown, Shield, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const plans = [
  {
    name: "Starter",
    price: "0€",
    period: "/mois",
    description: "Pour découvrir",
    icon: Zap,
    features: [
      { text: "Raccourcissement de liens", included: true },
      { text: "1 lien actif seulement", included: true },
      { text: "Clics totaux (24h)", included: true },
      { text: "Pays principal des visiteurs", included: false },
      { text: "Clics uniques vs totaux", included: false },
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
      { text: "5 liens actifs", included: true },
      { text: "Clics uniques vs totaux", included: true },
      { text: "Géolocalisation détaillée (pays/villes)", included: true },
      { text: "Types d'appareils (mobile/desktop)", included: true },
      { text: "Navigateurs utilisés", included: true },
      { text: "Sources de trafic", included: true },
      { text: "Tracking temps réel", included: false },
      { text: "Heures de pointe d'activité", included: false },
      { text: "Export données avancé", included: false }
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
      { text: "15 liens actifs", included: true },
      { text: "Tracking temps réel", included: true },
      { text: "Heures de pointe d'activité", included: true },
      { text: "Export données avancé", included: true },
      { text: "Liens personnalisés", included: true },
      { text: "QR codes personnalisés", included: true },
      { text: "Statistiques comparatives", included: true },
      { text: "Rapports automatisés", included: true },
      { text: "API complète", included: false }
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
      { text: "25 liens actifs", included: true },
      { text: "API complète + webhooks", included: true },
      { text: "Multi-domaines personnalisés", included: true },
      { text: "Intégrations tierces", included: true },
      { text: "White-label complet", included: true },
      { text: "Analytics prédictives", included: true },
      { text: "Support dédié 24/7", included: true },
      { text: "SLA 99.9% garanti", included: true },
      { text: "Manager de compte", included: true }
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

  const handlePlanClick = (planName: string) => {
    if (planName === "Starter") {
      // Pour le plan gratuit, rediriger selon l'état de connexion
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/auth');
      }
    } else {
      // Pour tous les plans payants, rediriger vers auth si non connecté
      if (!user) {
        // Rediriger vers auth avec intention de payer le plan sélectionné
        navigate(`/auth?plan=${planName.toLowerCase()}&intent=upgrade`);
      } else {
        // Si connecté, rediriger vers la page de pricing pour l'upgrade
        navigate(`/pricing?plan=${planName.toLowerCase()}`);
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
            return (
              <div
                key={index}
                className={`ck-pricing-card relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-blue-500 lg:scale-105 order-1 lg:order-none' 
                    : plan.badge?.includes('valeur')
                    ? 'border-green-500 lg:scale-102 order-2 lg:order-none'
                    : 'border-gray-200'
                }`}
              >
                {plan.badge && (
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
                    className={`ck-pricing-btn w-full py-2 md:py-3 px-3 md:px-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-300 ${plan.buttonStyle}`}
                  >
                    {plan.buttonText}
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
