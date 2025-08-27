import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, Globe, Zap, TrendingUp, Crown, Check } from 'lucide-react';
import { ClickDemo } from '../components/Demo/ClickDemo';

// Stats qui défilent
const statsCarousel = [
  { value: "2.3M", label: "Clics aujourd'hui", icon: TrendingUp },
  { value: "847K", label: "Liens créés", icon: BarChart3 },
  { value: "156", label: "Pays actifs", icon: Globe },
  { value: "98.7%", label: "Uptime", icon: Zap }
];

// Features principales
const features = [
  {
    icon: BarChart3,
    title: "Analytics en temps réel",
    description: "Suivez chaque clic instantanément"
  },
  {
    icon: Globe,
    title: "Géolocalisation",
    description: "Découvrez d'où viennent vos visiteurs"
  },
  {
    icon: Zap,
    title: "Ultra Rapide",
    description: "Redirection en moins de 100ms"
  }
];

// Plans pricing
const plans = [
  {
    name: "Gratuit",
    price: "0€",
    description: "Parfait pour commencer",
    features: ["5 liens/jour", "Analytics 24h", "Support email"],
    buttonText: "Commencer",
    buttonStyle: "bg-gray-900 text-white hover:bg-gray-800",
    popular: false
  },
  {
    name: "Premium",
    price: "9€",
    description: "Pour les professionnels",
    features: ["Liens illimités", "Analytics avancés", "Export de données", "Support prioritaire"],
    buttonText: "Essayer Premium",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    popular: true
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStat, setCurrentStat] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  const handleGetStarted = () => {
    navigate('/shorten');
  };

  const handleShowDemo = () => {
    setShowDemo(true);
  };

  // Animation des stats
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % statsCarousel.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white">
      {/* Zone 1: Hero avec graphiques animés */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden">
          {/* Grille subtile */}
          <div className="absolute inset-0 opacity-[0.09]">
            <div className="absolute inset-0" style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.24) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0,0,0,0.24) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          {/* Formes géométriques flottantes */}
          <div className="absolute top-10 left-1/4 w-32 h-32 opacity-[0.12]">
            <div className="w-full h-full bg-blue-400 rounded-full animate-morph"></div>
          </div>
          
          <div className="absolute top-1/3 right-1/4 w-24 h-24 opacity-[0.12]">
            <div className="w-full h-full bg-purple-400 animate-drift" style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}></div>
          </div>

          <div className="absolute bottom-1/3 left-1/6 w-20 h-20 opacity-[0.12]">
            <div className="w-full h-full bg-indigo-400 rounded-lg animate-wave transform rotate-45"></div>
          </div>

          {/* Particules orbitales */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative w-1 h-1">
              <div className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-orbit"></div>
              <div className="absolute w-1 h-1 bg-purple-300 rounded-full opacity-40 animate-orbit" style={{ animationDelay: '5s', animationDuration: '25s' }}></div>
              <div className="absolute w-3 h-3 bg-indigo-300 rounded-full opacity-20 animate-orbit" style={{ animationDelay: '10s', animationDuration: '35s' }}></div>
            </div>
          </div>

          {/* Ondulations fluides */}
          <div className="absolute inset-0 opacity-[0.12]">
            <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
              <path d="M0,400 C300,300 600,500 900,350 C1050,250 1150,400 1200,350 L1200,800 L0,800 Z" 
                    fill="url(#wave1)" className="animate-wave" />
              <path d="M0,500 C200,400 400,600 700,450 C900,350 1100,500 1200,450 L1200,800 L0,800 Z" 
                    fill="url(#wave2)" className="animate-wave" style={{ animationDelay: '2s' }} />
              <defs>
                <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.21" />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.21" />
                </linearGradient>
                <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.21" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.21" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          
          {/* Graphiques animés en arrière-plan améliorés */}
          <div className="absolute top-20 left-20 w-64 h-32 opacity-[0.18]">
            <svg viewBox="0 0 300 120" className="w-full h-full">
              <path
                d="M0,100 Q75,20 150,60 T300,40"
                stroke="#3B82F6"
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
              />
              <path
                d="M0,80 Q75,40 150,50 T300,70"
                stroke="#8B5CF6"
                strokeWidth="3"
                fill="none"
                className="animate-pulse"
                style={{ animationDelay: '1s' }}
              />
              <path
                d="M0,60 Q75,80 150,40 T300,90"
                stroke="#06B6D4"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
                style={{ animationDelay: '2s' }}
              />
              {/* Points de données animés */}
              {[...Array(8)].map((_, i) => (
                <circle
                  key={i}
                  cx={i * 40 + 20}
                  cy={Math.random() * 80 + 20}
                  r="3"
                  fill="#3B82F6"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.5}s` }}
                />
              ))}
            </svg>
          </div>

          {/* Histogramme amélioré */}
          <div className="absolute bottom-20 right-20 w-48 h-48 opacity-[0.18]">
            <div className="relative w-full h-full">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 rounded-t-lg animate-pulse"
                  style={{
                    left: `${i * 12}%`,
                    width: '10%',
                    height: `${20 + (i % 4) * 20}%`,
                    background: `linear-gradient(to top, ${i % 2 === 0 ? '#3B82F6' : '#8B5CF6'}, ${i % 2 === 0 ? '#60A5FA' : '#A78BFA'})`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Cercles décoratifs flottants */}
          <div className="absolute top-1/4 right-1/3 w-16 h-16 opacity-[0.12]">
            <div className="w-full h-full border-2 border-blue-300 rounded-full animate-float"></div>
          </div>
          
          <div className="absolute bottom-1/4 left-1/3 w-12 h-12 opacity-[0.12]">
            <div className="w-full h-full border-2 border-purple-300 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="absolute top-2/3 right-1/6 w-8 h-8 opacity-[0.12]">
            <div className="w-full h-full border border-indigo-300 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
        </div>

        {/* Contenu principal avec Z-index plus élevé */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Stats carousel en haut */}
          <div className="mb-12">
            <div className="inline-flex items-center space-x-4 bg-gray-50 rounded-2xl p-4 backdrop-blur-sm">
              {statsCarousel.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-500 ${
                      currentStat === index 
                        ? 'bg-white shadow-lg scale-105' 
                        : 'opacity-50'
                    }`}
                  >
                    <IconComponent className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Titre principal */}
          <h1 className="text-6xl md:text-8xl font-light text-gray-900 mb-6 tracking-tight">
            Des liens.
            <br />
            <span className="font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Des insights.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Transformez vos liens en données précieuses. Analytics en temps réel, 
            géolocalisation avancée, et insights qui font la différence.
          </p>

          {/* Ajout d'un simple call-to-action à la place du formulaire */}
          <div className="max-w-2xl mx-auto mb-16 text-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Prêt à raccourcir votre premier lien ?
              </h3>
              <p className="text-gray-600 mb-6">
                Créez des liens courts élégants et suivez leurs performances en temps réel.
              </p>
              <button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <span>Raccourcir un lien</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-medium text-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Commencer gratuitement</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            <button 
              onClick={handleShowDemo}
              className="text-blue-600 px-8 py-4 rounded-2xl font-medium text-lg hover:bg-gray-50 transition-all duration-300"
            >
              Voir une démo
            </button>
          </div>
        </div>

        {/* Demo Modal */}
        <ClickDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />
      </section>

      {/* Zone 2: Features avec carrousel */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
              Fonctionnalités <span className="font-medium text-blue-600">avancées</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des outils puissants pour maximiser l'impact de vos liens
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:shadow-2xl transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Zone 3: Pricing simplifié */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
              Plans <span className="font-medium text-blue-600">simples</span>
            </h2>
            <p className="text-xl text-gray-600">
              Choisissez le plan qui correspond à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative p-8 rounded-3xl border-2 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-500 shadow-2xl scale-105' 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>Populaire</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="text-5xl font-light text-gray-900 mb-2">
                    {plan.price}<span className="text-lg text-gray-500">/mois</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <button className={`w-full py-4 px-6 rounded-2xl font-medium transition-all duration-300 ${plan.buttonStyle}`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zone 4: CTA Final */}
      <section className="py-32 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-light text-white mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-xl text-gray-300 mb-12 font-light">
            Rejoignez des milliers d'utilisateurs qui font confiance à ClickTracker.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGetStarted}
              className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-medium text-lg hover:bg-gray-100 transition-all duration-300"
            >
              Commencer gratuitement
            </button>
            <button className="border border-gray-600 text-white px-8 py-4 rounded-2xl font-medium text-lg hover:border-gray-400 transition-all duration-300">
              Parler à un expert
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
