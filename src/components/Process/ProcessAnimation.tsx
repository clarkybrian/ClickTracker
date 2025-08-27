import React, { useState, useEffect } from 'react';
import { Copy, CheckCircle, Zap, TrendingUp, Users, Globe } from 'lucide-react';

const animations = [
  {
    step: 1,
    title: "Collez votre lien",
    description: "Entrez l'URL que vous souhaitez raccourcir",
    visual: "📝"
  },
  {
    step: 2,
    title: "Obtenez un lien court",
    description: "Recevez instantanément votre lien personnalisé",
    visual: "🔗"
  },
  {
    step: 3,
    title: "Partagez partout",
    description: "Utilisez votre lien sur tous vos canaux",
    visual: "📱"
  },
  {
    step: 4,
    title: "Trackez en temps réel",
    description: "Suivez chaque clic avec des analytics détaillés",
    visual: "📊"
  }
];

const benefits = [
  {
    icon: Zap,
    title: "Redirection Ultra-Rapide",
    description: "Temps de réponse < 100ms garanti",
    color: "from-yellow-400 to-orange-500"
  },
  {
    icon: TrendingUp,
    title: "Analytics Avancés",
    description: "Graphiques détaillés et métriques précises",
    color: "from-green-400 to-blue-500"
  },
  {
    icon: Users,
    title: "Audience Insights",
    description: "Comprenez qui clique sur vos liens",
    color: "from-purple-400 to-pink-500"
  },
  {
    icon: Globe,
    title: "Couverture Mondiale",
    description: "CDN global pour une performance optimale",
    color: "from-blue-400 to-indigo-500"
  }
];

export const ProcessAnimation: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => (prev + 1) % animations.length);
        setIsAnimating(false);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comment ça <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Fonctionne</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un processus simple en 4 étapes pour transformer vos liens en données précieuses
          </p>
        </div>

        {/* Animated Process Steps */}
        <div className="relative mb-20">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200"></div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {animations.map((animation, index) => (
              <div
                key={index}
                className={`relative text-center transition-all duration-700 transform ${
                  currentStep === index 
                    ? 'scale-110 z-10' 
                    : currentStep > index 
                      ? 'scale-100 opacity-70' 
                      : 'scale-95 opacity-50'
                } ${isAnimating && currentStep === index ? 'animate-pulse' : ''}`}
              >
                {/* Step Circle */}
                <div className={`relative mx-auto w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-4 transition-all duration-500 ${
                  currentStep === index 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-2xl' 
                    : currentStep > index
                      ? 'bg-green-500 shadow-lg'
                      : 'bg-gray-200 shadow-md'
                }`}>
                  {currentStep > index ? (
                    <CheckCircle className="h-8 w-8 text-white" />
                  ) : (
                    <span className={currentStep === index ? 'text-white' : 'text-gray-600'}>
                      {animation.visual}
                    </span>
                  )}
                  
                  {/* Step Number */}
                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep >= index ? 'bg-white text-blue-600' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {animation.step}
                  </div>
                </div>

                {/* Step Content */}
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  currentStep === index ? 'text-blue-600' : 'text-gray-700'
                }`}>
                  {animation.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {animation.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Demo Link Transformation */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Transformation en Action</h3>
            <p className="text-gray-600">Voyez comment vos liens se transforment</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Before */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-red-600 flex items-center">
                <span className="mr-2">❌</span> Lien Original
              </h4>
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="text-sm text-red-800 break-all font-mono">
                  https://www.example-very-long-domain.com/articles/how-to-create-amazing-content-that-converts-visitors-into-customers?utm_source=newsletter&utm_medium=email&utm_campaign=march2024
                </div>
              </div>
              <div className="text-sm text-red-600">
                • 🔴 Lien trop long et peu attrayant<br/>
                • 🔴 Aucune donnée sur les clics<br/>
                • 🔴 Impossible à mémoriser
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="hidden md:block text-4xl animate-bounce">
                ➡️
              </div>
              <div className="md:hidden text-4xl rotate-90 animate-bounce">
                ➡️
              </div>
            </div>

            {/* After */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-green-600 flex items-center">
                <span className="mr-2">✅</span> Avec ClickTracker
              </h4>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg text-green-800 font-mono">
                    clt.kr/amazing-content
                  </div>
                  <button className="p-2 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                    <Copy className="h-4 w-4 text-green-600" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-green-600">
                • ✅ Lien court et professionnel<br/>
                • ✅ Analytics détaillés en temps réel<br/>
                • ✅ Facile à partager et mémoriser
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {benefit.title}
                </h4>
                <p className="text-gray-600 text-sm">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
