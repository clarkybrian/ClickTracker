import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { PlanType } from '../types';

interface UserSubscription {
  id: string;
  email: string;
  planType: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'inactive';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

export const useSubscription = (authUser: User | null) => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchUserSubscription = async () => {
      try {
        setLoading(true);

        // D'abord, créer ou récupérer l'utilisateur
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Erreur récupération utilisateur:', fetchError);
          setLoading(false);
          return;
        }

        let userData = existingUser;

        // Si l'utilisateur n'existe pas, le créer
        if (!existingUser) {
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              email: authUser.email!,
              auth_user_id: authUser.id,
              plan_type: 'starter',
              subscription_status: 'inactive'
            })
            .select()
            .single();

          if (createError) {
            console.error('Erreur création utilisateur:', createError);
            setLoading(false);
            return;
          }

          userData = newUser;
        }

        if (userData) {
          setSubscription({
            id: userData.id,
            email: userData.email,
            planType: userData.plan_type as PlanType,
            stripeCustomerId: userData.stripe_customer_id,
            stripeSubscriptionId: userData.stripe_subscription_id,
            subscriptionStatus: userData.subscription_status,
            subscriptionStartDate: userData.subscription_start_date,
            subscriptionEndDate: userData.subscription_end_date
          });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubscription();
    
    // Écouter les changements en temps réel
    const subscription_listener = supabase
      .channel('user_subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `auth_user_id=eq.${authUser.id}`
        },
        (payload) => {
          console.log('Changement d\'abonnement détecté:', payload);
          fetchUserSubscription();
        }
      )
      .subscribe();

    return () => {
      subscription_listener.unsubscribe();
    };
  }, [authUser]);

  const updateSubscription = async (updates: Partial<UserSubscription>) => {
    if (!authUser || !subscription) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          plan_type: updates.planType,
          stripe_customer_id: updates.stripeCustomerId,
          stripe_subscription_id: updates.stripeSubscriptionId,
          subscription_status: updates.subscriptionStatus,
          subscription_start_date: updates.subscriptionStartDate,
          subscription_end_date: updates.subscriptionEndDate
        })
        .eq('auth_user_id', authUser.id);

      if (error) {
        console.error('Erreur mise à jour abonnement:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      return false;
    }
  };

  const isProUser = () => {
    return subscription?.subscriptionStatus === 'active' && 
           ['pro', 'business', 'enterprise'].includes(subscription.planType);
  };

  const hasFeatureAccess = (feature: string) => {
    if (!subscription) return false;
    
    const plan = subscription.planType;
    const isActive = subscription.subscriptionStatus === 'active';
    
    // Plan gratuit - fonctionnalités limitées
    if (plan === 'starter') {
      return ['linkTracking'].includes(feature);
    }
    
    // Plans payants - vérifier si actif
    if (!isActive) return false;
    
    // Pro
    if (plan === 'pro') {
      return ['linkTracking', 'advancedAnalytics', 'geolocation', 'customDomains', 'apiAccess'].includes(feature);
    }
    
    // Business et Enterprise ont accès à tout
    return true;
  };

  return {
    subscription,
    loading,
    updateSubscription,
    isProUser: isProUser(),
    hasFeatureAccess
  };
};
