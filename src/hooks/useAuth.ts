import { useState, useEffect } from 'react';
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
  const fetchUserTier = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Par défaut, on considère que l'utilisateur est 'pro' pour tester
      // À ajuster selon votre structure de données
      return (data?.subscription_tier as 'free' | 'pro' | 'business') || 'pro';
    } catch (error) {
      console.error("Erreur lors de la récupération du niveau d'abonnement:", error);
      return 'free';
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const tier = await fetchUserTier(session.user.id);
        setUserTier(tier);
        setUser({ ...session.user, userTier: tier });
      } else {
        setUser(null);
      }
      
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const tier = await fetchUserTier(session.user.id);
          setUserTier(tier);
          setUser({ ...session.user, userTier: tier });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    getSession();

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
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