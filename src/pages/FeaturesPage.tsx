import React from 'react';
import { BarChart3, Zap, Globe, Shield, Users, TrendingUp, Clock, Download } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: "Analytics en Temps Réel",
    description: "Suivez vos clics instantanément avec des graphiques détaillés et des métriques précises.",
    image: "📊"
  },
  {
    icon: Globe,
    title: "Géolocalisation Avancée",
    description: "Découvrez d'où viennent vos visiteurs dans le monde entier, jusqu'au niveau de la ville.",
    image: "🌍"
  },
  {
    icon: Zap,
    title: "Redirection Ultra-Rapide",
    description: "Temps de réponse garanti sous 100ms grâce à notre infrastructure mondiale.",
    image: "⚡"
  },
  {
    icon: Shield,
    title: "Sécurité Maximale",
    description: "Protection contre le spam, liens malveillants et respect total de votre confidentialité.",
    image: "🛡️"
  },
  {
    icon: Users,
    title: "Gestion d'Équipe",
    description: "Collaborez avec votre équipe et partagez vos analytics en toute sécurité.",
    image: "👥"
  },
  {
    icon: Download,
    title: "Export de Données",
    description: "Exportez toutes vos données en Excel, CSV ou via notre API pour des analyses approfondies.",
    image: "📥"
  }
];

const useCases = [
  {
    title: "Marketing Digital",
    description: "Optimisez vos campagnes en analysant les performances de vos liens sur différents canaux.",
    benefits: ["ROI tracking", "A/B testing", "Attribution modeling"],
    icon: "📈"
  },
  {
    title: "Réseaux Sociaux",
    description: "Mesurez l'engagement de votre audience et identifiez le contenu qui performe le mieux.",
    benefits: ["Engagement tracking", "Audience insights", "Content optimization"],
    icon: "📱"
  },
  {
    title: "E-commerce",
    description: "Trackez le parcours client et optimisez vos conversions avec des données précises.",
    benefits: ["Conversion tracking", "Customer journey", "Sales attribution"],
    icon: "🛒"
  },
  {
    title: "Blogging & Contenu",
    description: "Comprenez quel contenu résonne avec votre audience et améliorer votre stratégie.",
    benefits: ["Content performance", "Audience analysis", "Traffic sources"],
    icon: "✍️"
  }
];

export const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Fonctionnalités
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Avancées
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Découvrez tous les outils dont vous avez besoin pour transformer vos liens 
            en données précieuses et optimiser votre stratégie digitale.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez <span className="gradient-text">besoin</span>
            </h2>
            <p className="text-xl text-gray-600">
              Une suite complète d'outils pour analyser et optimiser vos liens
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
                >
                  <div className="text-center mb-6">
                    <div className="text-6xl mb-4">{feature.image}</div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-center leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cas d'<span className="gradient-text">Usage</span>
            </h2>
            <p className="text-xl text-gray-600">
              Comment ClickTracker peut transformer votre activité
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl">{useCase.icon}</div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{useCase.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {useCase.benefits.map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                      <span className="text-gray-700 font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Des chiffres qui parlent
            </h2>
            <p className="text-xl text-gray-300">
              ClickTracker en quelques statistiques
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, value: "10M+", label: "Liens créés", color: "from-green-400 to-blue-500" },
              { icon: Users, value: "500K+", label: "Utilisateurs actifs", color: "from-purple-400 to-pink-500" },
              { icon: Globe, value: "195", label: "Pays couverts", color: "from-blue-400 to-indigo-500" },
              { icon: Clock, value: "99.9%", label: "Uptime garanti", color: "from-yellow-400 to-orange-500" }
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-300">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Prêt à découvrir toutes ces fonctionnalités ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Commencez gratuitement et explorez tout le potentiel de ClickTracker
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
              Essayer Gratuitement
            </button>
            <button className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-blue-500 hover:bg-blue-800 transition-all duration-300">
              Voir une Démo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
