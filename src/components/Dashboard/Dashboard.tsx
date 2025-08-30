import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import SettingsModal from './SettingsModal'
import { LinkShortener } from '../../components/LinkShortener/LinkShortener'
import { 
  Settings,
  BarChart3, 
  Link as LinkIcon,
  Zap
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

export default function Dashboard() {
  const { user } = useAuth()
  const { getLimits } = useSubscription()
  const navigate = useNavigate()
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const limits = getLimits()
  
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
    } catch (error) {
      console.error('Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchLinks()
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalClicks = links.reduce((sum, link) => sum + (link.click_count || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 w-full dashboard-container">
      {/* Header Dashboard */}
      <div className="bg-white border-b border-gray-200 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full content-centered">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Raccourcisseur de liens intelligent</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Plan Standard
              </div>
              <div className="text-sm text-gray-500">
                {user?.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col md:flex-row max-w-7xl mx-auto w-full content-centered overflow-safe">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('links')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'links'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <LinkIcon className="w-5 h-5" />
                <span className="font-medium">Mes liens</span>
              </button>
              
              <div className="relative">
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span className="font-medium">Analytics</span>
                  <div className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded">PRO</div>
                </button>
              </div>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Paramètres</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden w-full bg-white border-b border-gray-200">
          <div className="px-4 py-3 w-full">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('links')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'links'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Liens</span>
              </button>
              
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md text-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
                <div className="ml-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">PRO</div>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Paramètres</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 px-4 sm:px-6 lg:px-8 w-full max-w-full content-centered overflow-safe">
        {activeTab === 'links' && (
          <div className="w-full max-w-full content-centered overflow-safe">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestionnaire de liens</h2>
              <p className="text-gray-600">
                Plan standard : créez jusqu'à {limits.links} liens raccourcis avec le tracking de seulement {limits.clicks} lien. Passez au plan Pro pour plus de fonctionnalités.
              </p>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Liens créés</p>
                    <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                    <p className="text-xs text-gray-500">sur {limits.links} maximum</p>
                  </div>
                  <LinkIcon className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Clics totaux</p>
                    <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
                    <p className="text-xs text-gray-500">depuis le début</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Plan actuel</p>
                    <p className="text-xl font-bold text-blue-600">Standard</p>
                    <button 
                      onClick={() => navigate('/pricing')}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Passer au Pro
                    </button>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            <LinkShortener />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="w-full max-w-full content-centered overflow-safe">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics disponibles en Pro</h3>
              <p className="text-gray-600 mb-6">
                Accédez à des analytics détaillés avec géolocalisation, types d'appareils et sources de trafic.
              </p>
              <button 
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Passer au plan Pro
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="w-full max-w-full content-centered overflow-safe">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Paramètres</h2>
              <p className="text-gray-600">
                Configurez vos préférences de base.
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
      </div>

      {/* Modal de paramètres */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </div>
  )
}
