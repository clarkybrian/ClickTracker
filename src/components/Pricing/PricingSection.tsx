import React from 'react';
import { Check, X, Zap, BarChart3, Globe, Download, Crown, Shield } from 'lucide-react';

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    description: "Parfait pour commencer",
    icon: Zap,
    features: [
      { text: "5 liens par jour", included: true },
      { text: "Statistiques 24h", included: true },
      { text: "Analytics basiques", included: true },
      { text: "Support email", included: true },
      { text: "Analytics par pays", included: false },
      { text: "Export de données", included: false },
      { text: "Liens personnalisés illimités", included: false },
      { text: "Support prioritaire", included: false }
    ],
    buttonText: "Commencer Gratuitement",
    buttonStyle: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    popular: false
  },
  {
    name: "Premium",
    price: "9€",
    period: "/mois",
    description: "Pour les professionnels",
    icon: Crown,
    features: [
      { text: "Liens illimités", included: true },
      { text: "Analytics avancés", included: true },
      { text: "Géolocalisation détaillée", included: true },
      { text: "Export Excel/CSV", included: true },
      { text: "Analytics par device", included: true },
      { text: "Historique complet", included: true },
      { text: "Liens personnalisés", included: true },
      { text: "Support prioritaire", included: true }
    ],
    buttonText: "Essayer Premium",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl transform hover:-translate-y-1",
    popular: true
  }
];

export const PricingSection: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Plan</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Commencez gratuitement, upgradez quand vous êtes prêt pour plus de fonctionnalités
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <div
                key={index}
                className={`relative bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                      ⭐ Le plus populaire
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${
                      plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-100'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${plan.popular ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-xl text-gray-500 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-300 mr-3 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${plan.buttonStyle}`}>
                    {plan.buttonText}
                  </button>
                </div>

                {/* Premium Badge Icons */}
                {plan.popular && (
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Shield className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Benefits Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Globe,
              title: "Géolocalisation Avancée",
              description: "Découvrez d'où viennent vos visiteurs avec une précision au niveau ville"
            },
            {
              icon: Download,
              title: "Export de Données",
              description: "Exportez vos analytics en Excel ou CSV pour des analyses approfondies"
            },
            {
              icon: BarChart3,
              title: "Tableaux de Bord",
              description: "Visualisez vos données avec des graphiques interactifs et en temps réel"
            }
          ].map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
