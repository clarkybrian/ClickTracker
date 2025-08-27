import React from 'react';
import { BarChart3, Globe, Smartphone, TrendingUp, Zap, Shield, Clock, Users } from 'lucide-react';

const features = [
  {
    icon: BarChart3,
    title: "Analytics Avancés",
    description: "Suivez vos clics en temps réel avec des graphiques détaillés"
  },
  {
    icon: Globe,
    title: "Géolocalisation",
    description: "Découvrez d'où viennent vos visiteurs dans le monde entier"
  },
  {
    icon: Smartphone,
    title: "Multi-Device",
    description: "Analysez le comportement mobile vs desktop de vos utilisateurs"
  },
  {
    icon: TrendingUp,
    title: "Tendances",
    description: "Identifiez les pics de trafic et optimisez votre contenu"
  },
  {
    icon: Zap,
    title: "Redirection Rapide",
    description: "Temps de réponse ultra-rapide pour une expérience optimale"
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Protection contre le spam et les liens malveillants"
  },
  {
    icon: Clock,
    title: "Historique",
    description: "Accédez à l'historique complet de vos liens et statistiques"
  },
  {
    icon: Users,
    title: "Audience",
    description: "Comprenez votre audience avec des métriques détaillées"
  }
];

export const FeaturesCarousel: React.FC = () => {
  return (
    <div className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir <span className="text-blue-600">ClickTracker</span> ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bien plus qu'un simple raccourcisseur de liens, découvrez une plateforme complète d'analytics
          </p>
        </div>

        {/* Features Grid with Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-200 transition-colors duration-300">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
