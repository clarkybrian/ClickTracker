import React from 'react';
import { AuthForm } from '../components/Auth/AuthForm';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link2, TrendingUp, Users, Shield } from 'lucide-react';

const benefits = [
  {
    icon: TrendingUp,
    title: "Analytics Avancés",
    description: "Suivez vos performances en temps réel"
  },
  {
    icon: Users,
    title: "Audience Insights",
    description: "Comprenez qui clique sur vos liens"
  },
  {
    icon: Shield,
    title: "Sécurité Garantie",
    description: "Vos données sont protégées"
  }
];

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Récupérer les paramètres d'URL
  const planFromUrl = searchParams.get('plan');
  const intentFromUrl = searchParams.get('intent');

  const handleAuthSuccess = () => {
    // Si l'utilisateur venait pour upgrader, le rediriger vers la page d'upgrade
    if (intentFromUrl === 'upgrade' && planFromUrl) {
      navigate(`/upgrade?selectedPlan=${planFromUrl}`);
    } else {
      navigate('/dashboard');
    }
  };

  // Fonction pour obtenir le nom du plan en français
  const getPlanDisplayName = (plan: string) => {
    switch (plan) {
      case 'pro': return 'Pro (19€/mois)';
      case 'business': return 'Business (25€/mois)';
      case 'enterprise': return 'Enterprise (49€/mois)';
      default: return plan;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Branding & Benefits */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
              <Link2 className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-white">ClickTracker</span>
          </div>

          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            {intentFromUrl === 'upgrade' && planFromUrl ? (
              <>
                Créez votre compte
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-2xl lg:text-3xl mt-2">
                  Pour accéder au plan {getPlanDisplayName(planFromUrl)}
                </span>
              </>
            ) : (
              <>
                Connexion / Inscription
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 text-2xl lg:text-3xl mt-2">
                  Accédez à votre dashboard personnalisé
                </span>
              </>
            )}
          </h1>

          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            {intentFromUrl === 'upgrade' && planFromUrl ? (
              <>
                Créez d'abord votre compte gratuit, puis vous pourrez souscrire au plan {getPlanDisplayName(planFromUrl)} en toute sécurité.
              </>
            ) : (
              <>
                Créez un compte gratuit et accédez immédiatement à tous vos analytics.
                Aucune carte de crédit requise pour commencer.
              </>
            )}
          </p>

          {/* Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <IconComponent className="h-6 w-6 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{benefit.title}</h3>
                    <p className="text-blue-200">{benefit.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-white">10M+</div>
                <div className="text-blue-200 text-sm">Liens créés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">500K+</div>
                <div className="text-blue-200 text-sm">Utilisateurs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Connexion / Inscription
              </h2>
              <p className="text-blue-100">
                Accédez à votre dashboard personnalisé
              </p>
            </div>
            
            <AuthForm onSuccess={handleAuthSuccess} />
            
            <div className="mt-8 text-center">
              <p className="text-blue-200 text-sm">
                En vous inscrivant, vous acceptez nos{' '}
                <a href="#" className="text-blue-300 hover:text-white underline">
                  Conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="#" className="text-blue-300 hover:text-white underline">
                  Politique de confidentialité
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
