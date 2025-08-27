import React from 'react';
import { PricingSection } from '../components/Pricing/PricingSection';
import { CheckCircle, Zap, TrendingUp, Globe, Download, Shield, BarChart3 } from 'lucide-react';

const faqData = [
  {
    question: "Comment fonctionne le plan gratuit ?",
    answer: "Avec le plan gratuit, vous pouvez créer jusqu'à 5 liens par jour et accéder aux statistiques des dernières 24 heures. C'est parfait pour tester notre service."
  },
  {
    question: "Puis-je upgrader ou downgrader à tout moment ?",
    answer: "Oui, vous pouvez changer de plan à tout moment. Les changements prennent effet immédiatement et votre facturation est ajustée au prorata."
  },
  {
    question: "Mes données sont-elles sécurisées ?",
    answer: "Absolument. Nous utilisons un chiffrement de niveau bancaire et nous ne vendons jamais vos données à des tiers. Votre confidentialité est notre priorité."
  },
  {
    question: "Y a-t-il un engagement de durée ?",
    answer: "Non, nos abonnements sont sans engagement. Vous pouvez annuler à tout moment depuis votre dashboard."
  }
];

const comparisonFeatures = [
  {
    category: "Création de liens",
    features: [
      { name: "Liens par jour", free: "5", premium: "Illimité" },
      { name: "Alias personnalisés", free: "❌", premium: "✅" },
      { name: "Liens actifs", free: "50", premium: "Illimité" }
    ]
  },
  {
    category: "Analytics",
    features: [
      { name: "Historique", free: "24h", premium: "Illimité" },
      { name: "Géolocalisation", free: "Basique", premium: "Détaillée" },
      { name: "Analytics par device", free: "❌", premium: "✅" },
      { name: "Export de données", free: "❌", premium: "Excel/CSV" }
    ]
  },
  {
    category: "Support",
    features: [
      { name: "Support email", free: "✅", premium: "✅" },
      { name: "Support prioritaire", free: "❌", premium: "✅" },
      { name: "Temps de réponse", free: "48h", premium: "4h" }
    ]
  }
];

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6">
            Choisissez le plan qui vous
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              convient le mieux
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto px-4">
            Commencez gratuitement et upgrader quand vous êtes prêt pour des fonctionnalités avancées.
            Pas d'engagement, annulez à tout moment.
          </p>
        </div>
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* Detailed Comparison */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comparaison <span className="gradient-text">Détaillée</span>
            </h2>
            <p className="text-xl text-gray-600">
              Toutes les fonctionnalités en un coup d'œil
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-3 gap-0">
              <div className="p-8 bg-gray-50">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fonctionnalités</h3>
              </div>
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
                  <Zap className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Gratuit</h3>
              </div>
              <div className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Premium</h3>
              </div>
            </div>

            {comparisonFeatures.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <div className="grid md:grid-cols-3 gap-0 border-t border-gray-200">
                  <div className="p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900">{category.category}</h4>
                  </div>
                  <div className="md:col-span-2"></div>
                </div>
                
                {category.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="grid md:grid-cols-3 gap-0 border-t border-gray-100">
                    <div className="p-4 pl-8">
                      <span className="text-gray-700">{feature.name}</span>
                    </div>
                    <div className="p-4 text-center">
                      <span className="text-gray-600">{feature.free}</span>
                    </div>
                    <div className="p-4 text-center bg-blue-50/30">
                      <span className="text-blue-600 font-medium">{feature.premium}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="gradient-text">Premium</span> ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Globe,
                title: "Géolocalisation Avancée",
                description: "Découvrez d'où viennent vos visiteurs avec une précision au niveau ville et région"
              },
              {
                icon: Download,
                title: "Export Complet",
                description: "Exportez toutes vos données en Excel ou CSV pour des analyses approfondies"
              },
              {
                icon: BarChart3,
                title: "Tableaux de Bord",
                description: "Visualisez vos données avec des graphiques interactifs et personnalisables"
              },
              {
                icon: Shield,
                title: "Support Prioritaire",
                description: "Obtenez de l'aide rapidement avec notre support client dédié"
              }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions <span className="gradient-text">Fréquentes</span>
            </h2>
          </div>

          <div className="space-y-6">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Rejoignez des milliers d'utilisateurs qui font confiance à ClickTracker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Commencer Gratuitement
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-blue-500 hover:bg-blue-800 transition-all duration-300">
              Voir la Démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
