import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Globe, TrendingUp } from 'lucide-react';

const stats = [
  { value: "10M+", label: "Liens créés", icon: ArrowRight },
  { value: "500K+", label: "Utilisateurs actifs", icon: Users },
  { value: "50+", label: "Pays couverts", icon: Globe },
  { value: "99.9%", label: "Uptime garanti", icon: TrendingUp }
];

const beforeAfterData = [
  {
    before: {
      title: "Avant ClickTracker",
      problems: [
        "❌ Liens longs et peu attrayants",
        "❌ Aucune visibilité sur les clics",
        "❌ Pas de données géographiques",
        "❌ Impossible de modifier les liens"
      ]
    },
    after: {
      title: "Avec ClickTracker",
      benefits: [
        "✅ Liens courts et personnalisés",
        "✅ Analytics détaillés en temps réel",
        "✅ Géolocalisation des visiteurs",
        "✅ Gestion complète des liens"
      ]
    }
  }
];

export const HeroSection: React.FC = () => {
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            Raccourcissez.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Trackez.
            </span>
            <span className="block">Analysez.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Transformez vos liens en données précieuses avec notre plateforme d'analytics avancée.
            Découvrez qui clique, d'où et quand.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
              Commencer Gratuitement
              <ArrowRight className="inline ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transition-all duration-300">
              Voir la Démo
            </button>
          </div>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`text-center p-6 rounded-2xl backdrop-blur-sm transition-all duration-500 ${
                  currentStat === index 
                    ? 'bg-white/20 border border-white/30 transform scale-105' 
                    : 'bg-white/10 border border-white/10'
                }`}
              >
                <IconComponent className="h-8 w-8 text-blue-300 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-200 text-sm">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {beforeAfterData.map((data, index) => (
            <React.Fragment key={index}>
              {/* Before */}
              <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-red-300 mb-6 text-center">
                  {data.before.title}
                </h3>
                <div className="space-y-4">
                  {data.before.problems.map((problem, i) => (
                    <div key={i} className="text-red-200 flex items-center">
                      {problem}
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-green-300 mb-6 text-center">
                  {data.after.title}
                </h3>
                <div className="space-y-4">
                  {data.after.benefits.map((benefit, i) => (
                    <div key={i} className="text-green-200 flex items-center">
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
