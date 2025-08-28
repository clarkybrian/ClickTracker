import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { redirectToStripeCheckout } from '../lib/stripe';

export const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription(user);
  const navigate = useNavigate();
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès restreint</h1>
          <p className="text-gray-600">Veuillez vous connecter pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const plans = [
    {
      name: 'Starter',
      price: 0,
      period: 'Gratuit',
      icon: Target,
      color: 'from-gray-500 to-gray-600',
      description: 'Parfait pour commencer',
      features: [
        '1 lien trackable',
        'Analytics de base',
        'Support communautaire'
      ],
      limitations: [
        'Pas de domaine personnalisé',
        'Pas de géolocalisation',
        'Pas d\'API'
      ],
      stripePriceId: null,
      buttonText: 'Plan actuel',
      isCurrentPlan: subscription?.planType === 'starter'
    },
    {
      name: 'Pro',
      price: 19,
      period: '/mois',
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      description: 'Pour les professionnels',
      features: [
        '5 liens trackables',
        'Analytics avancés',
        'Géolocalisation des clics',
        'Domaines personnalisés',
        'Accès API',
        'Support prioritaire'
      ],
      limitations: [],
      stripePriceId: 'price_1QSn4SJYF9r3SjRw8yk8oWW8',
      buttonText: subscription?.planType === 'pro' ? 'Plan actuel' : 'Passer au Pro',
      isCurrentPlan: subscription?.planType === 'pro'
    },
    {
      name: 'Business',
      price: 25,
      period: '/mois',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      description: 'Pour les équipes',
      features: [
        '25 liens trackables',
        'Tout du plan Pro',
        'Opérations en masse',
        'Personnalisation marque',
        'Export de données',
        'Gestion d\'équipe',
        'Rapports avancés'
      ],
      limitations: [],
      stripePriceId: 'price_business',
      buttonText: subscription?.planType === 'business' ? 'Plan actuel' : 'Passer au Business',
      isCurrentPlan: subscription?.planType === 'business'
    },
    {
      name: 'Enterprise',
      price: 49,
      period: '/mois',
      icon: Crown,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Solution complète',
      features: [
        'Liens illimités',
        'Tout des plans précédents',
        'White label',
        'Gestionnaire dédié',
        'Intégrations personnalisées',
        'Sécurité entreprise',
        'SLA garanti'
      ],
      limitations: [],
      stripePriceId: 'price_enterprise',
      buttonText: subscription?.planType === 'enterprise' ? 'Plan actuel' : 'Passer à Enterprise',
      isCurrentPlan: subscription?.planType === 'enterprise'
    }
  ];

  const handleUpgrade = async (plan: typeof plans[0]) => {
    if (plan.isCurrentPlan || !user?.email) return;
    
    if (plan.name === 'Enterprise') {
      // Pour Enterprise, rediriger vers un formulaire de contact
      window.open('mailto:contact@clicktracker.app?subject=Demande plan Enterprise', '_blank');
      return;
    }

    setUpgradeLoading(plan.name);
    try {
      await redirectToStripeCheckout(plan.name.toLowerCase() as 'business' | 'pro' | 'enterprise', user.email);
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la redirection vers Stripe');
    } finally {
      setUpgradeLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Gestion de l'abonnement
              </h1>
              <p className="text-gray-600 mt-1">
                Choisissez le plan qui vous convient le mieux
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statut actuel */}
        {subscription && (
          <div className="mb-12 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Votre plan actuel</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 bg-gradient-to-r ${plans.find(p => p.name.toLowerCase() === subscription.planType)?.color} text-white rounded-lg`}>
                    {plans.find(p => p.name.toLowerCase() === subscription.planType)?.icon && (
                      React.createElement(plans.find(p => p.name.toLowerCase() === subscription.planType)!.icon, { className: "w-5 h-5" })
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Plan {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Statut: {subscription.subscriptionStatus === 'active' ? '✅ Actif' : '❌ Inactif'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {plans.find(p => p.name.toLowerCase() === subscription.planType)?.price || 0}€
                  <span className="text-sm text-gray-600">/mois</span>
                </p>
                {subscription.subscriptionStartDate && (
                  <p className="text-xs text-gray-500">
                    Depuis le {new Date(subscription.subscriptionStartDate).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Plans disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            
            return (
              <div
                key={plan.name}
                className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.isCurrentPlan 
                    ? 'border-blue-500 ring-2 ring-blue-500/20' 
                    : 'border-gray-100 hover:border-blue-200'
                }`}
              >
                {/* Header du plan */}
                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white rounded-t-xl`}>
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className="w-8 h-8" />
                    {plan.isCurrentPlan && (
                      <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                        Actuel
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{plan.price}€</span>
                    <span className="text-white/80 ml-1">{plan.period}</span>
                  </div>
                  <p className="text-white/80 text-sm mt-2">{plan.description}</p>
                </div>

                {/* Contenu du plan */}
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={plan.isCurrentPlan || upgradeLoading === plan.name}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.isCurrentPlan
                        ? 'bg-gray-100 text-gray-500'
                        : plan.name === 'Pro'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : plan.name === 'Business'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : plan.name === 'Enterprise'
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {upgradeLoading === plan.name ? 'Chargement...' : plan.buttonText}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Besoin d'aide pour choisir ?
          </h3>
          <p className="text-gray-600 mb-4">
            Notre équipe est là pour vous accompagner dans votre choix
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  );
};
