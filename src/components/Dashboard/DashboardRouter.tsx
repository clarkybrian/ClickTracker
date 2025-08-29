import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import DashboardFree from './DashboardFree'
import DashboardPro from './DashboardPro'
import DashboardBusiness from './DashboardBusiness'

export default function DashboardRouter() {
  const { profile, loading } = useSubscription()

  // Debug: Afficher les informations de subscription
  console.log('DashboardRouter - Profile:', profile)
  console.log('DashboardRouter - Loading:', loading)
  console.log('DashboardRouter - Subscription Tier:', profile?.subscription_tier)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Router vers le bon dashboard selon le plan
  switch (profile?.subscription_tier) {
    case 'pro':
      console.log('DashboardRouter - Rendering DashboardPro')
      return <DashboardPro />
    case 'business':
      console.log('DashboardRouter - Rendering DashboardBusiness')
      return <DashboardBusiness />
    default:
      console.log('DashboardRouter - Rendering DashboardFree (default)')
      return <DashboardFree />
  }
}
