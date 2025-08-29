import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import SettingsModal from './SettingsModal'
import { LinkShortenerPro } from '../../components/LinkShortener/LinkShortenerPro'
import { ClickAnalytics } from '../../components/Analytics/ClickAnalytics'
import { 
  Plus,
  Settings,
  BarChart3, 
  Globe, 
  Smartphone,
  Monitor,
  Users,
  TrendingUp,
  Download,
  Eye,
  Clock,
  MapPin,
  Activity,
  Link as LinkIcon
} from 'lucide-react'

interface Link {
  id: string
  title: string
  short_code: string
  original_url: string
  created_at: string
  user_id: string
  updated_at: string
  click_count: number
}

interface AnalyticsData {
  geographic: Array<{ country: string; city: string; click_count: number }>
  devices: Array<{ device_type: string; browser: string; os: string; click_count: number }>
  traffic: Array<{ referrer: string; source_type: string; click_count: number }>
}

export default function DashboardPro() {
  const { user } = useAuth()
  const { getLimits, isPremium, isEnterprise, isPro, isBusiness } = useSubscription()
  const navigate = useNavigate()
  const [links, setLinks] = useState<Link[]>([])
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const limits = getLimits()
  const hasAccess = isPremium() || isEnterprise() || isPro() || isBusiness()
  
  // État pour la gestion des onglets
  const [activeTab, setActiveTab] = useState<'links' | 'analytics' | 'settings'>('links')

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLinks(data || [])
      if (data && data.length > 0) {
        setSelectedLink(data[0])
      }
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async (linkId: string) => {
    try {
      // Fetch geographic data
      const { data: geoData, error: geoError } = await supabase
        .rpc('get_geographic_stats', { link_uuid: linkId, user_uuid: user?.id })

      // Fetch device data
      const { data: deviceData, error: deviceError } = await supabase
        .rpc('get_device_stats', { link_uuid: linkId, user_uuid: user?.id })

      // Fetch traffic source data
      const { data: trafficData, error: trafficError } = await supabase
        .rpc('get_traffic_sources', { link_uuid: linkId, user_uuid: user?.id })

      if (geoError || deviceError || trafficError) {
        console.error('Analytics error:', { geoError, deviceError, trafficError })
        return
      }

      setAnalytics({
        geographic: geoData || [],
        devices: deviceData || [],
        traffic: trafficData || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    if (user) {
      fetchLinks()
    }
  }, [user])

  useEffect(() => {
    if (selectedLink) {
      fetchAnalytics(selectedLink.id)
    }
  }, [selectedLink, user])

  // Vérifier si l'utilisateur a accès aux fonctionnalités Pro
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Accès Premium requis</h1>
          <p className="text-gray-600">Cette fonctionnalité nécessite un abonnement Pro ou Business.</p>
          <button 
            onClick={() => navigate('/pricing')}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Voir les plans
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0)
  const deviceStats = analytics?.devices || []
  const geoStats = analytics?.geographic || []
  const trafficStats = analytics?.traffic || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Pro */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Pro</h1>
                <p className="text-gray-600">Analyse avancée et fonctionnalités premium</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Plan Pro
              </div>
              <div className="text-sm text-gray-500">
                {user?.email}
              </div>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
              <span className="font-medium">Mes liens</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Analytics</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Paramètres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'links' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestionnaire de liens Pro</h2>
              <p className="text-gray-600">
                Créez des liens avec des fonctionnalités avancées : alias personnalisés, protection par mot de passe, 
                dates d'expiration, tracking UTM et analytics détaillés.
              </p>
            </div>
            <LinkShortenerPro />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Pro</h2>
              <p className="text-gray-600">
                Analysez les performances de vos liens avec des statistiques détaillées : 
                géolocalisation, types d'appareils, navigateurs, et bien plus.
              </p>
            </div>
            <ClickAnalytics userId={user?.id || ''} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Paramètres</h2>
              <p className="text-gray-600">
                Configurez vos préférences et gérez votre compte Pro.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4">Préférences</h3>
              <button
                onClick={() => setShowSettingsModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
              >
                Modifier mes paramètres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de paramètres */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  )
}
