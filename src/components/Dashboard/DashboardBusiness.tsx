import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { 
  ChartBarIcon, 
  GlobeAltIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  EyeIcon,
  MapPinIcon,
  LinkIcon,
  UsersIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface Link {
  id: string
  title: string
  short_code: string
  original_url: string
  created_at: string
  click_count: number
}

interface AnalyticsData {
  geographic: Array<{ country: string; city: string; region: string; click_count: number }>
  devices: Array<{ device_type: string; browser: string; os: string; click_count: number }>
  traffic: Array<{ referrer_domain: string; utm_source: string; utm_medium?: string; click_count: number }>
}

interface DeviceStats {
  device_type: string
  click_count: number
}

interface BrowserStats {
  browser: string
  click_count: number
}

interface OSStats {
  os: string
  click_count: number
}

export default function DashboardBusiness() {
  const { user } = useAuth()
  const { getLimits } = useSubscription()
  const [links, setLinks] = useState<Link[]>([])
  const [selectedLink, setSelectedLink] = useState<Link | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  const limits = getLimits()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    if (selectedLink) {
      fetchAnalytics(selectedLink.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLink, user])

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const { error } = await supabase
        .from('data_exports')
        .insert({
          user_id: user?.id,
          link_id: selectedLink?.id,
          export_type: format,
          date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          date_range_end: new Date().toISOString()
        })

      if (error) throw error
      
      alert(`Export ${format.toUpperCase()} en cours de génération. Vous recevrez un email lorsqu'il sera prêt.`)
    } catch (error) {
      console.error('Error creating export:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
          <BuildingOfficeIcon className="absolute inset-0 h-8 w-8 m-auto text-emerald-500 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50">
      {/* Header Business */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-3 rounded-2xl">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Dashboard Business
                </h1>
                <p className="text-gray-600">Analytics professionnelles et gestion d'équipe</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-100 rounded-xl px-4 py-2 border border-emerald-200">
                <span className="text-sm text-emerald-700 font-medium">Plan Business</span>
              </div>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                <CogIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-emerald-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Liens actifs</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                <p className="text-xs text-emerald-600">sur {limits.links} autorisés</p>
              </div>
              <LinkIcon className="h-8 w-8 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clics totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {links.reduce((acc, link) => acc + (link.click_count || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">sur {limits.clicks.toLocaleString()} par mois</p>
              </div>
              <EyeIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Domaines</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-xs text-purple-600">sur {limits.domains} autorisés</p>
              </div>
              <GlobeAltIcon className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-orange-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Équipe</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
                <p className="text-xs text-orange-600">membres actifs</p>
              </div>
              <UsersIcon className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-green-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Conversion</p>
                <p className="text-2xl font-bold text-gray-900">4.2%</p>
                <p className="text-xs text-green-600">+0.8% ce mois</p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-lg transition-colors">
              <BuildingOfficeIcon className="h-6 w-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Gestion d'équipe</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors">
              <GlobeAltIcon className="h-6 w-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Domaines personnalisés</span>
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors">
              <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">Rapports avancés</span>
            </button>
            <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors">
              <CogIcon className="h-6 w-6 mx-auto mb-2" />
              <span className="block text-sm font-medium">API & Intégrations</span>
            </button>
          </div>
        </div>

        {/* Link Selector */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analyser un lien</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {links.slice(0, 6).map((link) => (
              <button
                key={link.id}
                onClick={() => setSelectedLink(link)}
                className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                  selectedLink?.id === link.id
                    ? 'border-emerald-400 bg-emerald-50'
                    : 'border-gray-200 bg-white hover:border-emerald-300'
                }`}
              >
                <h3 className="font-medium text-gray-900 truncate">{link.title}</h3>
                <p className="text-sm text-gray-500 truncate">/{link.short_code}</p>
                <p className="text-xs text-emerald-600 mt-2">{link.click_count || 0} clics</p>
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Dashboard */}
        {selectedLink && analytics && (
          <div className="space-y-8">
            {/* Export Section */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Export et partage</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => exportData('csv')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={() => exportData('json')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>JSON</span>
                  </button>
                  <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Partager rapport
                  </button>
                </div>
              </div>
            </div>

            {/* Geographic Analytics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-emerald-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <MapPinIcon className="h-6 w-6 text-emerald-500" />
                <h2 className="text-xl font-semibold text-gray-900">Analytics géographiques</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Localisation détaillée</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analytics.geographic.slice(0, 10).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div>
                          <span className="text-gray-900 font-medium">{item.city}, {item.country}</span>
                          {item.region && <span className="text-emerald-600 text-sm ml-2">({item.region})</span>}
                        </div>
                        <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                          {item.click_count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <h4 className="text-gray-900 font-medium mb-3">Vue d'ensemble mondiale</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pays couverts</span>
                      <span className="font-semibold">{new Set(analytics.geographic.map(item => item.country)).size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Villes visitées</span>
                      <span className="font-semibold">{analytics.geographic.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Device Analytics */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <DevicePhoneMobileIcon className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Analytics d'appareil</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Types d'appareils</h3>
                  <div className="space-y-2">
                    {analytics.devices
                      .reduce((acc: DeviceStats[], curr) => {
                        const existing = acc.find(item => item.device_type === curr.device_type)
                        if (existing) {
                          existing.click_count += curr.click_count
                        } else {
                          acc.push({ device_type: curr.device_type, click_count: curr.click_count })
                        }
                        return acc
                      }, [])
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {item.device_type === 'mobile' ? (
                              <DevicePhoneMobileIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <ComputerDesktopIcon className="h-4 w-4 text-blue-500" />
                            )}
                            <span className="text-gray-900 capitalize">{item.device_type}</span>
                          </div>
                          <span className="text-blue-600 font-semibold">{item.click_count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Navigateurs</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analytics.devices
                      .filter(item => item.browser)
                      .reduce((acc: BrowserStats[], curr) => {
                        const existing = acc.find(item => item.browser === curr.browser)
                        if (existing) {
                          existing.click_count += curr.click_count
                        } else {
                          acc.push({ browser: curr.browser, click_count: curr.click_count })
                        }
                        return acc
                      }, [])
                      .sort((a, b) => b.click_count - a.click_count)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-25 rounded-lg">
                          <span className="text-gray-900">{item.browser}</span>
                          <span className="text-blue-600 font-semibold">{item.click_count}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Systèmes</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {analytics.devices
                      .filter(item => item.os)
                      .reduce((acc: OSStats[], curr) => {
                        const existing = acc.find(item => item.os === curr.os)
                        if (existing) {
                          existing.click_count += curr.click_count
                        } else {
                          acc.push({ os: curr.os, click_count: curr.click_count })
                        }
                        return acc
                      }, [])
                      .sort((a, b) => b.click_count - a.click_count)
                      .slice(0, 5)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-25 rounded-lg">
                          <span className="text-gray-900">{item.os}</span>
                          <span className="text-blue-600 font-semibold">{item.click_count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-6">
                <ChartBarIcon className="h-6 w-6 text-purple-500" />
                <h2 className="text-xl font-semibold text-gray-900">Sources de trafic</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Domaines référents</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analytics.traffic
                      .filter(item => item.referrer_domain)
                      .slice(0, 8)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <span className="text-gray-900">{item.referrer_domain}</span>
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {item.click_count}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campagnes UTM</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {analytics.traffic
                      .filter(item => item.utm_source)
                      .slice(0, 8)
                      .map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-purple-25 rounded-lg">
                          <div>
                            <span className="text-gray-900 font-medium">{item.utm_source}</span>
                            {item.utm_medium && (
                              <span className="text-purple-600 text-sm ml-2">via {item.utm_medium}</span>
                            )}
                          </div>
                          <span className="text-purple-600 font-semibold">{item.click_count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
