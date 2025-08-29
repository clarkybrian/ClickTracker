import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLinks } from '../../hooks/useLinks';
import { useNavigate } from 'react-router-dom';
import { CreateLinkModal } from '../LinkShortener/CreateLinkModal';
import { LinkSuccessModal } from '../LinkShortener/LinkSuccessModal';
import { Link } from '../../types';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Globe, 
  Plus, 
  Copy,
  Edit3,
  Trash2,
  Search,
  Eye,
  Crown
} from 'lucide-react';

interface DashboardStats {
  total_links: number;
  total_clicks: number;
  unique_visitors: number;
  clicks_today: number;
  clicks_this_week: number;
  clicks_this_month: number;
}

export const Dashboard: React.FC = () => {
  const { user, userTier } = useAuth();
  const navigate = useNavigate();
  
  const { 
    links, 
    loading: linksLoading, 
    hasReachedLimit, 
    remainingLinks,
    addLink 
  } = useLinks(user?.id, userTier);
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdLink, setCreatedLink] = useState<Link | null>(null);

  const handleCreateLink = () => {
    setShowCreateModal(true);
  };

  const handleLinkCreated = (newLink: Link) => {
    // Assurez-vous que le nouveau lien contient tous les champs nécessaires
    const completeLink: Link = {
      ...newLink,
      is_private: newLink.is_private || false,
      tracking_enabled: newLink.tracking_enabled !== undefined ? newLink.tracking_enabled : true
    };
    
    addLink(completeLink);
    setCreatedLink(completeLink);
    setShowCreateModal(false);
    setShowSuccessModal(true);
  };

  const handleUpgradeRequired = () => {
    setShowCreateModal(false);
    navigate('/pricing');
  };

  // Mock data - à remplacer par de vraies données depuis Supabase
  useEffect(() => {
    const mockStats: DashboardStats = {
      total_links: 23,
      total_clicks: 1847,
      unique_visitors: 892,
      clicks_today: 127,
      clicks_this_week: 645,
      clicks_this_month: 1847
    };

    const mockLinks: Link[] = [
      {
        id: '1',
        original_url: 'https://www.example.com/article-marketing-digital',
        short_code: 'mkt2024',
        full_short_url: 'https://clicktracker.app/mkt2024',
        title: 'Guide Marketing Digital 2024',
        total_clicks: 342,
        unique_clicks: 256,
        last_clicked_at: '2024-08-27T10:30:00Z',
        created_at: '2024-08-20T14:22:00Z',
        is_active: true
      },
      {
        id: '2',
        original_url: 'https://shop.example.com/promo-summer',
        short_code: 'summer24',
        full_short_url: 'https://clicktracker.app/summer24',
        title: 'Promotion Été 2024',
        total_clicks: 189,
        unique_clicks: 145,
        last_clicked_at: '2024-08-27T09:15:00Z',
        created_at: '2024-08-25T11:30:00Z',
        is_active: true
      },
      {
        id: '3',
        original_url: 'https://blog.example.com/tutoriel-seo',
        short_code: 'seo101',
        full_short_url: 'https://clicktracker.app/seo101',
        title: 'Tutoriel SEO pour débutants',
        total_clicks: 78,
        unique_clicks: 64,
        last_clicked_at: '2024-08-26T15:45:00Z',
        created_at: '2024-08-22T09:15:00Z',
        is_active: true
      }
    ];

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 500);
  }, [links]);

  const handleCopyLink = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    // TODO: Ajouter une notification toast
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLinks = links.filter(link =>
    link.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.short_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    link.original_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion requise</h2>
        <p className="text-gray-600">Veuillez vous connecter pour accéder à votre dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Bonjour, {user?.user_metadata?.full_name || user?.email?.split('@')[0]} 👋
              </h1>
              <p className="text-gray-600 mt-1">
                Voici un aperçu de vos performances aujourd'hui
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3 mr-8 md:mr-16 lg:mr-20">
              {hasReachedFreeLimit && (
                <div className="hidden sm:flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                  <Crown className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800 font-medium">
                    {remainingLinks} lien{remainingLinks > 1 ? 's' : ''} restant{remainingLinks > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              <button 
                onClick={handleCreateLink}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                  hasReachedFreeLimit
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {hasReachedFreeLimit ? <Crown className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{hasReachedFreeLimit ? 'Passer au Premium' : 'Créer un lien'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière d'information pour utilisateurs gratuits */}
      {!hasReachedFreeLimit && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-1 rounded">
                  <Crown className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Version gratuite - {remainingLinks} lien{remainingLinks > 1 ? 's' : ''} restant{remainingLinks > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-blue-700">
                    Créez des liens illimités avec le plan Premium
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/pricing')}
                className="text-sm font-medium text-blue-700 hover:text-blue-800 underline"
              >
                Voir les tarifs
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des liens</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_links}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+2 ce mois</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des clics</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_clicks.toLocaleString()}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+12% vs la semaine dernière</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Visiteurs uniques</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.unique_visitors.toLocaleString()}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+8% vs la semaine dernière</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pays actifs</p>
                <p className="text-2xl font-bold text-gray-900">47</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Globe className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+3 nouveaux pays</p>
          </div>
        </div>

        {/* Analytics Chart & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
          {/* Analytics Chart - Plus large */}
          <div className="lg:col-span-3">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Clics (7 derniers jours)</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              
              {/* Chart plus grand */}
              <div className="relative h-48 mb-4">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 0.3 }} />
                      <stop offset="100%" style={{ stopColor: '#3B82F6', stopOpacity: 0.05 }} />
                    </linearGradient>
                  </defs>
                  
                  {/* Chart area */}
                  <path
                    d="M 20 120 L 80 95 L 140 105 L 200 65 L 260 50 L 320 30 L 360 35 L 380 20"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Fill area */}
                  <path
                    d="M 20 120 L 80 95 L 140 105 L 200 65 L 260 50 L 320 30 L 360 35 L 380 20 L 380 140 L 20 140 Z"
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Data points */}
                  {[
                    { x: 20, y: 120, value: 12 },
                    { x: 80, y: 95, value: 18 },
                    { x: 140, y: 105, value: 15 },
                    { x: 200, y: 65, value: 28 },
                    { x: 260, y: 50, value: 35 },
                    { x: 320, y: 30, value: 45 },
                    { x: 360, y: 35, value: 42 }
                  ].map((point, index) => (
                    <g key={index}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#3B82F6"
                        className="hover:r-7 transition-all duration-200 cursor-pointer"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="10"
                        fill="transparent"
                        className="hover:fill-blue-100 transition-all duration-200 cursor-pointer"
                      />
                    </g>
                  ))}
                </svg>
              </div>
              
              {/* Chart Legend */}
              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>Lun</span>
                <span>Mar</span>
                <span>Mer</span>
                <span>Jeu</span>
                <span>Ven</span>
                <span>Sam</span>
                <span>Dim</span>
              </div>
              
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">195</div>
                  <div className="text-sm text-gray-500">Total des clics</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+23%</div>
                  <div className="text-sm text-gray-500">vs semaine précédente</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity - Plus compact */}
          <div className="lg:col-span-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
              <div className="space-y-4">
                {[
                  { link: 'summer24', country: 'France', time: '1 minute' },
                  { link: 'mkt2024', country: 'Canada', time: '3 minutes' },
                  { link: 'seo101', country: 'Belgique', time: '7 minutes' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Nouveau clic sur <span className="font-medium">{activity.link}</span>
                      </p>
                      <p className="text-xs text-gray-500">{activity.country} • Il y a {activity.time}</p>
                    </div>
                    <span className="text-xs text-gray-400">10:3{index}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes liens</h3>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">7 derniers jours</option>
                  <option value="30d">30 derniers jours</option>
                  <option value="90d">90 derniers jours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lien
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernier clic
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {link.title || 'Sans titre'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            link.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {link.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="text-sm text-blue-600 mt-1 font-mono">
                          {link.full_short_url}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {link.original_url}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {(link.total_clicks || 0).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {link.unique_clicks || 0} uniques
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {link.last_clicked_at ? formatDate(link.last_clicked_at) : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleCopyLink(link.full_short_url)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copier le lien"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLinks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun lien trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLinkCreated={handleLinkCreated}
        hasReachedLimit={hasReachedLimit}
        onUpgradeRequired={handleUpgradeRequired}
        userTier={userTier}
      />

      {createdLink && (
        <LinkSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          link={createdLink}
        />
      )}
    </div>
  );
};