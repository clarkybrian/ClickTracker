import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type UserWithTier = User & {
  userTier?: 'free' | 'pro' | 'business';
};

export const useAuth = () => {
  const [user, setUser] = useState<UserWithTier | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business'>('free');

  // Fonction pour récupérer le niveau d'abonnement de l'utilisateur
  const fetchUserTier = useCallback(async (userId: string): Promise<'free' | 'pro' | 'business'> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération du niveau d'abonnement:", error);
        return 'pro'; // Par défaut 'pro' pour les tests
      }
      
      return (data?.subscription_tier as 'free' | 'pro' | 'business') || 'pro';
    } catch (error) {
      console.error("Erreur lors de la récupération du niveau d'abonnement:", error);
      return 'pro';
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let isAuthInitialized = false;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur de session:', error);
          if (isMounted) {
            setUser(null);
            setUserTier('free');
            setLoading(false);
          }
          return;
        }

        if (session?.user && isMounted) {
          const tier = await fetchUserTier(session.user.id);
          setUserTier(tier);
          setUser({ ...session.user, userTier: tier });
        } else if (isMounted) {
          setUser(null);
          setUserTier('free');
        }

        if (isMounted) {
          setLoading(false);
          isAuthInitialized = true;
        }
      } catch (error) {
        console.error('Erreur d\'initialisation de l\'auth:', error);
        if (isMounted) {
          setUser(null);
          setUserTier('free');
          setLoading(false);
          isAuthInitialized = true;
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Auth state change:', event);

        // Si l'auth n'est pas encore initialisée, on attend
        if (!isAuthInitialized && event !== 'INITIAL_SESSION') {
          return;
        }

        try {
          if (event === 'SIGNED_OUT') {
            setUser(null);
            setUserTier('free');
            setLoading(false);
          } else if (session?.user) {
            const tier = await fetchUserTier(session.user.id);
            setUserTier(tier);
            setUser({ ...session.user, userTier: tier });
            setLoading(false);
          } else {
            setUser(null);
            setUserTier('free');
            setLoading(false);
          }
        } catch (error) {
          console.error('Erreur lors du changement d\'état:', error);
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    );

    initAuth();

    // Timeout de sécurité pour éviter les chargements infinis
    const timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Timeout de chargement de l\'authentification');
        setLoading(false);
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserTier]);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    loading,
    userTier,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};
