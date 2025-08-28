import React, { useState } from 'react';
import { ArrowLeft, Check, Crown, TrendingUp, Target } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { redirectToStripeCheckout } from '../lib/stripe';

const plans = [
  {
    name: "Pro",
    price: 19,
    period: "/mois",
    description: "Le plus populaire",
    stripeId: "pro",
    features: [
      "5 liens actifs",
      "Clics uniques vs totaux",
      "Géolocalisation détaillée",
      "Types d'appareils",
      "Navigateurs utilisés",
      "Sources de trafic"
    ],
    icon: Crown,
    gradient: "from-blue-500 to-purple-600",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
  },
  {
    name: "Business",
    price: 25,
    period: "/mois", 
    description: "Meilleure valeur",
    stripeId: "business",
    features: [
      "15 liens actifs",
      "Tracking temps réel",
      "Heures de pointe",
      "Export données avancé",
      "Liens personnalisés",
      "QR codes personnalisés",
      "Statistiques comparatives",
      "Rapports automatisés"
    ],
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-600",
    buttonStyle: "bg-gradient-to-r from-green-500 to-emerald-600 text-white",
    popular: true
  },
  {
    name: "Enterprise",
    price: 49,
    period: "/mois",
    description: "Pour les entreprises", 
    stripeId: "enterprise",
    features: [
      "25 liens actifs",
      "API complète + webhooks",
      "Multi-domaines personnalisés",
      "Intégrations tierces",
      "White-label complet",
      "Analytics prédictives",
      "Support dédié 24/7",
      "SLA 99.9% garanti",
      "Manager de compte"
    ],
    icon: Target,
    gradient: "from-purple-600 to-indigo-700",
    buttonStyle: "bg-gradient-to-r from-purple-600 to-indigo-700 text-white"
  }
];

const UpgradePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  
  const selectedPlan = searchParams.get('selectedPlan');

  const handleUpgrade = async (planName: string) => {
    if (!user?.email) {
      alert('Vous devez être connecté pour effectuer un upgrade');
      return;
    }

    if (planName === 'Enterprise') {
      // Pour Enterprise, rediriger vers un formulaire de contact
      window.open('mailto:contact@clicktracker.app?subject=Demande plan Enterprise', '_blank');
      return;
    }

    setLoading(planName);
    try {
      await redirectToStripeCheckout(planName.toLowerCase() as 'business' | 'pro' | 'enterprise', user.email);
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la redirection vers Stripe');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header avec bouton retour */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour au Dashboard</span>
            </button>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedPlan ? `Souscription au plan ${selectedPlan}` : 'Upgradez votre plan'}
              </h1>
              <p className="text-gray-600">
                {selectedPlan 
                  ? `Finalisez votre souscription au plan ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`
                  : 'Débloquez plus de fonctionnalités'
                }
              </p>
            </div>
            <div className="w-32"></div>
          </div>
        </div>
      </div>

      {/* Section de pricing personnalisée */}
      <div className="py-12">
        {selectedPlan && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-blue-400">ℹ️</div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} sélectionné
                  </h3>
                  <div className="mt-1 text-sm text-blue-700">
                    Cliquez sur le bouton du plan {selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} ci-dessous pour finaliser votre souscription.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Plans de pricing */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              const isSelected = selectedPlan && selectedPlan.toLowerCase() === plan.name.toLowerCase();
              
              return (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                    plan.popular ? 'border-green-500 lg:scale-105' : 
                    isSelected ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        💎 Meilleure valeur
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 bg-gradient-to-r ${plan.gradient}`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{plan.description}</p>
                      
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-gray-900">{plan.price}€</span>
                        <span className="text-base text-gray-500 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={loading === plan.name}
                      className={`w-full py-3 px-4 rounded-lg font-semibold text-base transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
                    >
                      {loading === plan.name ? 'Chargement...' : 
                       plan.name === 'Enterprise' ? 'Contacter les ventes' :
                       isSelected ? `Choisir ${plan.name}` : `Upgrader vers ${plan.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section informative */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Pourquoi upgrader maintenant ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analytics Avancés</h3>
              <p className="text-gray-600 text-sm">
                Géolocalisation, appareils, sources de trafic et bien plus
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Plus de Liens</h3>
              <p className="text-gray-600 text-sm">
                Créez jusqu'à 25 liens actifs simultanément
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Temps Réel</h3>
              <p className="text-gray-600 text-sm">
                Suivez vos performances en direct
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
