import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface SessionRecoveryProps {
  children: React.ReactNode;
}

export const SessionRecovery: React.FC<SessionRecoveryProps> = ({ children }) => {
  const [isRecovering, setIsRecovering] = useState(true);

  useEffect(() => {
    const recoverSession = async () => {
      try {
        // Vérifier si on a des tokens dans le localStorage
        const tokens = localStorage.getItem('clicktracker-auth-token');
        
        if (tokens) {
          console.log('Récupération de la session depuis le localStorage');
          
          // Essayer de récupérer la session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Erreur lors de la récupération de la session:', error);
            // Nettoyer le localStorage si la session est invalide
            localStorage.removeItem('clicktracker-auth-token');
          } else if (session) {
            console.log('Session récupérée avec succès');
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de session:', error);
      } finally {
        setIsRecovering(false);
      }
    };

    const timer = setTimeout(() => {
      recoverSession();
    }, 100); // Petit délai pour laisser le temps aux autres hooks de s'initialiser

    return () => clearTimeout(timer);
  }, []);

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Récupération de votre session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
