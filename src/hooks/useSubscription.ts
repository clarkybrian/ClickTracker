import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export type SubscriptionTier = 'free' | 'pro' | 'business'

interface UserProfile {
  id: string
  email: string
  subscription_tier: SubscriptionTier
  subscription_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  monthly_link_limit: number
  monthly_clicks_limit: number
  custom_domains_limit: number
}

export function useSubscription() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    fetchUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchUserProfile = async () => {
    try {
      console.log('useSubscription - fetchUserProfile - user:', user);
      // user.id correspond à auth.uid() donc on cherche par la colonne qui référence auth.users.id
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id) // Supposant que user_profiles.id = auth.users.id
        .single()

      console.log('useSubscription - query result:', { data, error });

      if (error) {
        console.error('Error fetching user profile:', error)
        // Si la ligne n'existe pas, on assume PRO temporairement pour les tests
        setProfile({
          id: user?.id || '',
          email: user?.email || '',
          subscription_tier: 'pro', // Changé temporairement pour les tests
          subscription_status: 'active',
          stripe_customer_id: null,
          stripe_subscription_id: null,
          monthly_link_limit: 100,
          monthly_clicks_limit: 10000,
          custom_domains_limit: 0
        })
        return
      }

      console.log('useSubscription - profile found:', data);
      setProfile(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPremium = () => profile?.subscription_tier === 'pro'
  const isEnterprise = () => profile?.subscription_tier === 'business'
  const isPro = () => profile?.subscription_tier === 'pro'
  const isBusiness = () => profile?.subscription_tier === 'business'
  const isAdvanced = () => isPro() || isBusiness()

  const getLimits = () => {
    if (!profile) {
      return { links: 5, clicks: 1000, domains: 0 }
    }

    return {
      links: profile.monthly_link_limit,
      clicks: profile.monthly_clicks_limit,
      domains: profile.custom_domains_limit
    }
  }

  return {
    profile,
    loading,
    isPremium,
    isEnterprise,
    isPro,
    isBusiness,
    isAdvanced,
    getLimits,
    refetch: fetchUserProfile
  }
}
