import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle, Crown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState<'checking' | 'success' | 'pending' | 'error'>('checking');
  const [userPlan, setUserPlan] = useState<string>('free');

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!user) {
        navigate('/auth');
        return;
      }

      // Attendre quelques secondes pour que le webhook Stripe traite la souscription
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        // Vérifier le statut de l'abonnement dans la base de données
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('subscription_tier, subscription_status, stripe_subscription_id')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erreur lors de la vérification:', error);
          setSubscriptionStatus('error');
          return;
        }

        if (profile?.subscription_status === 'active' && profile?.subscription_tier !== 'free') {
          setSubscriptionStatus('success');
          setUserPlan(profile.subscription_tier);
        } else if (profile?.stripe_subscription_id) {
          setSubscriptionStatus('pending');
        } else {
          setSubscriptionStatus('error');
        }
      } catch (error) {
        console.error('Erreur:', error);
        setSubscriptionStatus('error');
      }
    };

    checkSubscriptionStatus();
  }, [user, navigate]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const getStatusContent = () => {
    switch (subscriptionStatus) {
      case 'checking':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Vérification du paiement...
            </h1>
            <p className="text-gray-600 mb-8">
              Nous vérifions votre souscription. Cela peut prendre quelques instants.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🎉 Paiement réussi !
            </h1>
            <p className="text-gray-600 mb-6">
              Félicitations ! Votre abonnement <span className="font-semibold text-blue-600 capitalize">{userPlan}</span> est maintenant actif.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-800 font-medium">
                  Toutes les fonctionnalités de votre plan sont disponibles !
                </span>
              </div>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Traitement en cours...
            </h1>
            <p className="text-gray-600 mb-8">
              Votre paiement a été reçu et est en cours de traitement. 
              Votre abonnement sera activé dans quelques minutes.
            </p>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Problème détecté
            </h1>
            <p className="text-gray-600 mb-8">
              Il y a eu un problème avec l'activation de votre abonnement. 
              Contactez-nous si le problème persiste.
            </p>
            <button
              onClick={() => window.location.href = 'mailto:support@clicktracker.com'}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Contacter le support
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8">
        {getStatusContent()}
        
        {(subscriptionStatus === 'success' || subscriptionStatus === 'pending') && (
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Accéder au Dashboard
          </button>
        )}

        {subscriptionStatus === 'error' && (
          <div className="flex space-x-3">
            <button
              onClick={handleGoToDashboard}
              className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Retour au Dashboard
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir les tarifs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
