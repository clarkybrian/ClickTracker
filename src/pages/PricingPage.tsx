import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingSection } from '../components/Pricing/PricingSection';
import { CheckCircle, Zap, TrendingUp, Globe, Download, Shield, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const faqData = [
  {
    question: "Comment fonctionne le plan Starter ?",
    answer: "Avec le plan Starter, vous pouvez créer 1 lien actif et accéder aux statistiques des dernières 24 heures. C'est parfait pour tester notre service gratuitement."
  },
  {
    question: "Pourquoi le plan Business coûte-t-il moins cher que le Pro ?",
    answer: "C'est notre offre de lancement ! Le plan Business offre plus de fonctionnalités à un prix réduit pour encourager les utilisateurs à découvrir nos fonctionnalités avancées."
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
  },
  {
    question: "Qu'est-ce que l'A/B Testing ?",
    answer: "L'A/B Testing vous permet de tester différentes destinations pour un même lien court et de voir quelle version convertit le mieux."
  }
];

const comparisonFeatures = [
  {
    category: "Gestion des liens",
    features: [
      { name: "Liens actifs", starter: "1", pro: "5", business: "15", enterprise: "25" },
      { name: "Liens personnalisés", starter: "❌", pro: "✅", business: "✅", enterprise: "✅" },
      { name: "QR Codes", starter: "❌", pro: "❌", business: "Personnalisés", enterprise: "Avancés" },
      { name: "Multi-domaines", starter: "❌", pro: "❌", business: "❌", enterprise: "Illimité" }
    ]
  },
  {
    category: "Analytics & Tracking",
    features: [
      { name: "Historique", starter: "24h", pro: "Illimité", business: "Illimité", enterprise: "Illimité" },
      { name: "Clics uniques vs totaux", starter: "❌", pro: "✅", business: "✅", enterprise: "✅" },
      { name: "Géolocalisation", starter: "Pays principal", pro: "Pays/Villes", business: "Détaillée", enterprise: "Prédictive" },
      { name: "Types d'appareils", starter: "❌", pro: "✅", business: "✅", enterprise: "✅" },
      { name: "Navigateurs utilisés", starter: "❌", pro: "✅", business: "✅", enterprise: "✅" },
      { name: "Sources de trafic", starter: "❌", pro: "✅", business: "✅", enterprise: "✅" },
      { name: "Tracking temps réel", starter: "❌", pro: "❌", business: "✅", enterprise: "✅" },
      { name: "Heures de pointe", starter: "❌", pro: "❌", business: "✅", enterprise: "✅" }
    ]
  },
  {
    category: "Export & Intégrations",
    features: [
      { name: "Export de données", starter: "❌", pro: "❌", business: "Avancé", enterprise: "API complète" },
      { name: "Rapports automatisés", starter: "❌", pro: "❌", business: "✅", enterprise: "✅" },
      { name: "API & Webhooks", starter: "❌", pro: "❌", business: "❌", enterprise: "✅" },
      { name: "Intégrations tierces", starter: "❌", pro: "❌", business: "❌", enterprise: "✅" },
      { name: "White-label", starter: "❌", pro: "❌", business: "❌", enterprise: "Complet" }
    ]
  },
  {
    category: "Support & Services",
    features: [
      { name: "Support", starter: "Communauté", pro: "Email", business: "Prioritaire", enterprise: "24/7 + Manager" },
      { name: "SLA garanti", starter: "❌", pro: "❌", business: "❌", enterprise: "99.9%" },
      { name: "Formation", starter: "❌", pro: "❌", business: "❌", enterprise: "Personnalisée" }
    ]
  }
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartFree = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 pt-20 pb-12 md:pb-20">
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

          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-5 gap-0">
                <div className="p-6 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Fonctionnalités</h3>
                </div>
                <div className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl mb-3">
                    <Zap className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Starter</h3>
                  <p className="text-sm text-gray-500">0€/mois</p>
                </div>
                <div className="p-6 text-center bg-blue-50/30">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-3">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
                  <p className="text-sm text-blue-600 font-medium">19€/mois</p>
                </div>
                <div className="p-6 text-center bg-green-50/30">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl mb-3">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Business</h3>
                  <p className="text-sm text-green-600 font-medium">25€/mois</p>
                </div>
                <div className="p-6 text-center bg-purple-50/30">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl mb-3">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Enterprise</h3>
                  <p className="text-sm text-purple-600 font-medium">49€/mois</p>
                </div>
              </div>

              {comparisonFeatures.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <div className="grid grid-cols-5 gap-0 border-t border-gray-200">
                    <div className="p-4 bg-gray-50">
                      <h4 className="font-semibold text-gray-900">{category.category}</h4>
                    </div>
                    <div className="col-span-4 bg-gray-50"></div>
                  </div>
                  
                  {category.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="grid grid-cols-5 gap-0 border-t border-gray-100">
                      <div className="p-3 pl-6">
                        <span className="text-gray-700 text-sm">{feature.name}</span>
                      </div>
                      <div className="p-3 text-center">
                        <span className="text-gray-600 text-sm">{feature.starter}</span>
                      </div>
                      <div className="p-3 text-center bg-blue-50/20">
                        <span className="text-blue-600 font-medium text-sm">{feature.pro}</span>
                      </div>
                      <div className="p-3 text-center bg-green-50/20">
                        <span className="text-green-600 font-medium text-sm">{feature.business}</span>
                      </div>
                      <div className="p-3 text-center bg-purple-50/20">
                        <span className="text-purple-600 font-medium text-sm">{feature.enterprise}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="gradient-text">Business</span> ?
            </h2>
            <p className="text-xl text-gray-600">
              La meilleure valeur pour les professionnels ambitieux
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Globe,
                title: "A/B Testing Avancé",
                description: "Testez différentes destinations et optimisez vos taux de conversion automatiquement"
              },
              {
                icon: Download,
                title: "API Complète",
                description: "Intégrez ClickTracker directement dans vos applications avec notre API RESTful"
              },
              {
                icon: BarChart3,
                title: "Analytics Prédictives",
                description: "Anticipez les tendances avec notre IA et optimisez vos campagnes futures"
              },
              {
                icon: Shield,
                title: "White-label",
                description: "Utilisez votre propre branding et proposez le service à vos clients"
              }
            ].map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          {/* Pricing Psychology Section */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 md:p-12 text-white">
              <h3 className="text-3xl font-bold mb-4">
                🎯 Offre de Lancement Limitée
              </h3>
              <p className="text-xl mb-6">
                Obtenez le plan Business à <span className="text-2xl font-bold">25€/mois</span> au lieu de 30€
              </p>
              <p className="text-lg mb-8">
                Plus de fonctionnalités, prix plus bas. Cette offre se termine le 30 septembre !
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/auth')}
                  className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all duration-300"
                >
                  Profiter de l'offre
                </button>
                <button 
                  onClick={() => navigate('/contact')}
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
                >
                  Demander une démo
                </button>
              </div>
            </div>
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
            <button 
              onClick={handleStartFree}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
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
