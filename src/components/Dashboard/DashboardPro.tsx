import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import SettingsModal from './SettingsModal'
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
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const limits = getLimits()
  const hasAccess = isPremium() || isEnterprise() || isPro() || isBusiness()

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
    <div className="bg-white min-h-screen">
      {/* Background identique à HomePage */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grille subtile */}
        <div className="absolute inset-0 opacity-[0.09]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.24) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.24) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Formes géométriques flottantes */}
        <div className="absolute top-10 left-1/4 w-32 h-32 opacity-[0.12]">
          <div className="w-full h-full bg-red-400 rounded-full animate-pulse"></div>
        </div>
        
        <div className="absolute top-1/3 right-1/4 w-24 h-24 opacity-[0.12]">
          <div className="w-full h-full bg-purple-400 animate-bounce" style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }}></div>
        </div>

        <div className="absolute bottom-1/3 left-1/6 w-20 h-20 opacity-[0.12]">
          <div className="w-full h-full bg-violet-400 rounded-lg animate-pulse transform rotate-45"></div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-red-600 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <span>Dashboard Pro</span>
                </h1>
                <p className="text-gray-600 mt-1">Analyse avancée et fonctionnalités premium</p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3 mr-8 md:mr-16 lg:mr-20">
                <div className="bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-700 text-sm font-medium">Plan Pro</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-red-700 transition-all duration-300 flex items-center space-x-2 shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Créer un lien</span>
                  </button>
                  
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="px-4 py-3 bg-white/80 backdrop-blur-sm border border-purple-200 text-purple-700 rounded-lg font-semibold hover:bg-white hover:border-purple-300 transition-all duration-300 flex items-center shadow-lg"
                    title="Paramètres"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Liens actifs */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Liens actifs</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{links.length}</p>
                  <p className="text-purple-600 text-sm mt-1">sur {limits.links} autorisés</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <LinkIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Clics totaux */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Clics totaux</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalClicks}</p>
                  <p className="text-red-600 text-sm mt-1">sur {limits.clicks.toLocaleString()} par mois</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <Eye className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            {/* Domaines personnalisés */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Domaines personnalisés</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">0</p>
                  <p className="text-purple-600 text-sm mt-1">sur {limits.domains} autorisés</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Taux de clic moyen */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Taux de clic moyen</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {links.length > 0 ? (totalClicks / links.length).toFixed(1) : '0'}%
                  </p>
                  <p className="text-red-600 text-sm mt-1">+0.3% ce mois</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics avancées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
            {/* Géolocalisation */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <span>Géolocalisation</span>
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {geoStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{stat.country} - {stat.city}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.click_count}</span>
                  </div>
                ))}
                {geoStats.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">Aucune donnée géographique</p>
                )}
              </div>
            </div>

            {/* Types d'appareils */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-red-600" />
                  <span>Appareils</span>
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {deviceStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {stat.device_type === 'mobile' ? 
                        <Smartphone className="w-4 h-4 text-red-600" /> : 
                        <Monitor className="w-4 h-4 text-red-600" />
                      }
                      <span className="text-sm text-gray-700">{stat.device_type} - {stat.browser}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.click_count}</span>
                  </div>
                ))}
                {deviceStats.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">Aucune donnée d'appareil</p>
                )}
              </div>
            </div>

            {/* Sources de trafic */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span>Sources de trafic</span>
                </h3>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="space-y-3">
                {trafficStats.slice(0, 5).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">{stat.source_type}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{stat.click_count}</span>
                  </div>
                ))}
                {trafficStats.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">Aucune donnée de trafic</p>
                )}
              </div>
            </div>
          </div>

          {/* Analyser un lien */}
          {links.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyser un lien</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner un lien
                  </label>
                  <select 
                    value={selectedLink?.id || ''}
                    onChange={(e) => {
                      const link = links.find(l => l.id === e.target.value)
                      setSelectedLink(link || null)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  >
                    {links.map(link => (
                      <option key={link.id} value={link.id}>
                        {link.title || link.short_code} - {link.click_count || 0} clics
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={() => selectedLink && fetchAnalytics(selectedLink.id)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-red-600 text-white rounded-lg hover:from-purple-700 hover:to-red-700 transition-all duration-300"
                  >
                    Analyser
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal créer un lien */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un nouveau lien</h3>
            <button 
              onClick={() => setShowCreateModal(false)}
              className="mb-4 text-gray-500 hover:text-gray-700"
            >
              Fermer pour l'instant
            </button>
            <p className="text-gray-600">
              Fonctionnalité de création de liens en cours d'implémentation...
            </p>
          </div>
        </div>
      )}

      {/* Modal de paramètres */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  )
}
