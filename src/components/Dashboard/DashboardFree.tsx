import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useSubscription } from '../../hooks/useSubscription'
import { supabase } from '../../lib/supabase'
import { 
  ChartBarIcon, 
  EyeIcon,
  LinkIcon,
  StarIcon
} from '@heroicons/react/24/outline'

interface Link {
  id: string
  title: string
  short_code: string
  original_url: string
  created_at: string
  click_count: number
}

export default function DashboardFree() {
  const { user } = useAuth()
  const { getLimits } = useSubscription()
  const [links, setLinks] = useState<Link[]>([])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500 p-3 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Gérez vos liens raccourcis</p>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <span className="text-sm text-gray-600">Plan Gratuit</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Liens créés</p>
                <p className="text-2xl font-bold text-gray-900">{links.length}</p>
                <p className="text-xs text-gray-500">sur {limits.links} autorisés</p>
              </div>
              <LinkIcon className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Clics totaux</p>
                <p className="text-2xl font-bold text-gray-900">
                  {links.reduce((acc, link) => acc + (link.click_count || 0), 0)}
                </p>
                <p className="text-xs text-gray-500">sur {limits.clicks.toLocaleString()} par mois</p>
              </div>
              <EyeIcon className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Passez au Pro</p>
                <p className="text-xl font-bold">Analytics avancées</p>
              </div>
              <StarIcon className="h-8 w-8 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Mes liens</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lien court
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL originale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{link.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">/{link.short_code}</code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-xs" title={link.original_url}>
                        {link.original_url}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                        {link.click_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {links.length === 0 && (
            <div className="text-center py-12">
              <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun lien</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer votre premier lien raccourci.
              </p>
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        <div className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Débloquez plus de fonctionnalités</h3>
              <p className="text-purple-100 mb-4">
                Accédez aux analytics détaillées, géolocalisation, export de données et bien plus.
              </p>
              <ul className="space-y-2 text-sm text-purple-100">
                <li>• Analytics géographiques détaillées</li>
                <li>• Suivi des appareils et navigateurs</li>
                <li>• Sources de trafic</li>
                <li>• Export des données</li>
                <li>• Plus de liens et de clics</li>
              </ul>
            </div>
            <div className="ml-8">
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Passer au Pro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
