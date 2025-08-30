import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import { 
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Crown
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

interface Click {
  id: string
  link_id: string
  created_at: string
  country: string
  city: string
  link: {
    short_code: string
  }
}

export default function DashboardFree() {
  const { user } = useAuth()
  const { getLimits } = useSubscription()
  const navigate = useNavigate()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<Click[]>([])
  const [totalClicks, setTotalClicks] = useState(0)
  const [uniqueVisitors, setUniqueVisitors] = useState(0)
  const [activeCountries, setActiveCountries] = useState(0)

  const limits = getLimits()
  const remainingLinks = Math.max(0, limits.links - links.length)

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Récupérer les liens
      const { data: linksData, error: linksError } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (linksError) throw linksError
      setLinks(linksData || [])

      // Récupérer les clics avec les informations des liens
      const { data: clicksData, error: clicksError } = await supabase
        .from('clicks')
        .select(`
          *,
          link:links(short_code)
        `)
        .in('link_id', (linksData || []).map(link => link.id))
        .order('created_at', { ascending: false })

      if (clicksError) throw clicksError

      // Calculer les statistiques
      const clicks = clicksData || []
      const totalClicksCount = clicks.length
      const uniqueCountriesCount = new Set(clicks.map(click => click.country).filter(Boolean)).size
      const uniqueVisitorsCount = clicks.length // Simplification pour l'exemple

      setTotalClicks(totalClicksCount)
      setUniqueVisitors(uniqueVisitorsCount)
      setActiveCountries(uniqueCountriesCount)

      // Activité récente (derniers clics)
      setRecentActivity(clicks.slice(0, 5))

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'il y a 1 minute'
    if (diffInMinutes < 60) return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header avec salutation */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Bonjour, {user?.email?.split('@')[0]?.toUpperCase()} 👋
            </h1>
            <p className="text-gray-600">
              Voici un aperçu de vos performances aujourd'hui
            </p>
          </div>
          <button
            onClick={() => navigate('/shorten')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer un lien
          </button>
        </div>

        {/* Bannière du plan gratuit */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <p className="font-medium text-blue-900">
                Version gratuite - {remainingLinks} lien{remainingLinks !== 1 ? 's' : ''} restant{remainingLinks !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-blue-700">
                Créez des liens illimités avec le plan Premium
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Voir les tarifs
          </button>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total des liens */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des liens</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                <p className="text-sm text-green-600">+2 ce mois</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Total des clics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des clics</p>
                <p className="text-2xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
                <p className="text-sm text-green-600">+12% vs la semaine dernière</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Visiteurs uniques */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visiteurs uniques</p>
                <p className="text-2xl font-bold text-gray-900">{uniqueVisitors}</p>
                <p className="text-sm text-green-600">+8% vs la semaine dernière</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Pays actifs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pays actifs</p>
                <p className="text-2xl font-bold text-gray-900">{activeCountries}</p>
                <p className="text-sm text-green-600">+3 nouveaux pays</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Graphique et activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Graphique des clics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Clics (7 derniers jours)</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            
            {/* Graphique simplifié */}
            <div className="relative h-48">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-2 h-full">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => {
                  const height = Math.random() * 80 + 20 // Hauteur aléatoire pour l'exemple
                  return (
                    <div key={day} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-sm"
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2">{day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Activité récente</h3>
            
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((click) => (
                  <div key={click.id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Nouveau clic sur{' '}
                        <span className="font-medium">{click.link?.short_code || 'lien'}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {click.country || 'Pays inconnu'} • {getTimeAgo(click.created_at)}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(click.created_at)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aucune activité récente</p>
                  <p className="text-xs text-gray-400">Les clics apparaîtront ici</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section mes liens si l'utilisateur en a */}
        {links.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Mes liens</h3>
            
            <div className="space-y-4">
              {links.map((link) => (
                <div key={link.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <LinkIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{link.title}</p>
                      <p className="text-sm text-gray-500">
                        {window.location.origin}/{link.short_code}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {link.click_count} clics
                    </span>
                    <button
                      onClick={() => window.open(link.original_url, '_blank')}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
