import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Globe, TrendingUp } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

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
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleAuthClick = () => {
    if (user) {
      // Si l'utilisateur est connecté, rediriger vers le dashboard
      navigate('/dashboard');
    } else {
      // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
      navigate('/auth');
    }
  };

  const handleShortenClick = () => {
    navigate('/shorten');
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center mb-12 md:mb-16">
          <div className="mb-4 md:mb-6">
            <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-blue-200 text-sm md:text-base font-medium border border-white/20">
              ✨ Plateforme d'Analytics Premium
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light text-white mb-4 md:mb-6 tracking-tight leading-[1.1]">
            <span className="block font-extralight">
              Le meilleur 
              <span className="relative inline-block ml-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 font-bold">
                  outil
                </span>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-pink-400/20 blur-lg rounded-lg"></div>
              </span>
            </span>
            <span className="block">
              pour 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 font-bold italic">
                tracker
              </span>
              <span className="font-light"> vos liens.</span>
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-blue-100/90 max-w-4xl mx-auto mb-6 md:mb-8 leading-relaxed px-4 font-light">
            Transformez vos liens en 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 font-medium"> données précieuses </span>
            avec des analytics ultra-précises, une géolocalisation avancée et des insights en temps réel.
            <span className="hidden lg:block mt-2 text-blue-200/80 text-base italic">
              Découvrez qui clique, d'où et quand.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-4">
            {/* Bouton secondaire - Raccourcir un lien */}
            <button 
              onClick={handleShortenClick}
              className="border-2 border-white/30 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
            >
              Raccourcir un lien
            </button>
            
            {/* Bouton principal - Tracker vos liens gratuitement */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <button 
                onClick={handleAuthClick}
                className="relative ck-hero-cta-primary group bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white px-6 md:px-10 py-3 md:py-5 rounded-xl font-semibold text-base md:text-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-white/20 backdrop-blur-sm"
              >
                <span className="relative z-10 flex items-center">
                  Tracker vos liens gratuitement
                  <ArrowRight className="inline ml-3 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Animated Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={index}
                className={`ck-hero-stat text-center p-3 md:p-6 rounded-xl md:rounded-2xl backdrop-blur-sm transition-all duration-500 ${
                  currentStat === index 
                    ? 'bg-white/20 border border-white/30 transform scale-105' 
                    : 'bg-white/10 border border-white/10'
                }`}
              >
                <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-blue-300 mx-auto mb-2 md:mb-3" />
                <div className="text-lg md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-blue-200 text-xs md:text-sm leading-tight">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Before/After Comparison */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {beforeAfterData.map((data, index) => (
            <React.Fragment key={index}>
              {/* Before */}
              <div className="ck-hero-comparison bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl md:rounded-2xl p-4 md:p-8">
                <h3 className="text-lg md:text-2xl font-bold text-red-300 mb-4 md:mb-6 text-center">
                  {data.before.title}
                </h3>
                <div className="space-y-2 md:space-y-4">
                  {data.before.problems.map((problem, i) => (
                    <div key={i} className="text-red-200 flex items-center text-sm md:text-base">
                      {problem}
                    </div>
                  ))}
                </div>
              </div>

              {/* After */}
              <div className="ck-hero-comparison bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-xl md:rounded-2xl p-4 md:p-8">
                <h3 className="text-lg md:text-2xl font-bold text-green-300 mb-4 md:mb-6 text-center">
                  {data.after.title}
                </h3>
                <div className="space-y-2 md:space-y-4">
                  {data.after.benefits.map((benefit, i) => (
                    <div key={i} className="text-green-200 flex items-center text-sm md:text-base">
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
