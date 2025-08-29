import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Globe, 
  Smartphone, 
  Monitor, 
  Tablet, 
  TrendingUp,
  Eye,
  Users,
  MapPin
} from 'lucide-react';

interface ClickAnalyticsProps {
  linkId?: string;
  userId: string;
  timeframe?: '7d' | '30d' | '90d' | 'all';
}

interface ClickData {
  id: string;
  link_id: string;
  ip_address?: string;
  clicked_at: string;
  country_name?: string;
  city?: string;
  device_type?: string;
  browser_name?: string;
}

interface AnalyticsData {
  totalClicks: number;
  uniqueVisitors: number;
  clicksByDate: Array<{ date: string; clicks: number }>;
  clicksByCountry: Array<{ country: string; clicks: number; percentage: number }>;
  clicksByDevice: Array<{ device: string; clicks: number; percentage: number }>;
  clicksByBrowser: Array<{ browser: string; clicks: number; percentage: number }>;
  recentClicks: Array<{
    id: string;
    country_name: string;
    city: string;
    device_type: string;
    browser_name: string;
    clicked_at: string;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ClickAnalytics: React.FC<ClickAnalyticsProps> = ({ 
  linkId, 
  userId, 
  timeframe = '30d' 
}) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processDateData = (clicks: ClickData[]) => {
    const dateGroups: Record<string, number> = {};
    
    clicks.forEach(click => {
      const date = new Date(click.clicked_at).toISOString().split('T')[0];
      dateGroups[date] = (dateGroups[date] || 0) + 1;
    });

    return Object.entries(dateGroups)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Derniers 30 jours max
  };

  const processCountryData = (clicks: ClickData[]) => {
    const countryGroups: Record<string, number> = {};
    
    clicks.forEach(click => {
      const country = click.country_name || 'Inconnu';
      countryGroups[country] = (countryGroups[country] || 0) + 1;
    });

    const total = clicks.length;
    return Object.entries(countryGroups)
      .map(([country, clicks]) => ({
        country,
        clicks,
        percentage: Math.round((clicks / total) * 100)
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);
  };

  const processDeviceData = (clicks: ClickData[]) => {
    const deviceGroups: Record<string, number> = {};
    
    clicks.forEach(click => {
      const device = click.device_type || 'desktop';
      deviceGroups[device] = (deviceGroups[device] || 0) + 1;
    });

    const total = clicks.length;
    return Object.entries(deviceGroups)
      .map(([device, clicks]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        clicks,
        percentage: Math.round((clicks / total) * 100)
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };

  const processBrowserData = (clicks: ClickData[]) => {
    const browserGroups: Record<string, number> = {};
    
    clicks.forEach(click => {
      const browser = click.browser_name || 'Inconnu';
      browserGroups[browser] = (browserGroups[browser] || 0) + 1;
    });

    const total = clicks.length;
    return Object.entries(browserGroups)
      .map(([browser, clicks]) => ({
        browser,
        clicks,
        percentage: Math.round((clicks / total) * 100)
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);
  };

  const processClicksData = useCallback((clicks: ClickData[]): AnalyticsData => {
    const totalClicks = clicks.length;
    const uniqueIPs = new Set(clicks.map(c => c.ip_address || 'unknown'));
    const uniqueVisitors = uniqueIPs.size;

    // Clics par date
    const clicksByDate = processDateData(clicks);
    
    // Clics par pays
    const clicksByCountry = processCountryData(clicks);
    
    // Clics par type d'appareil
    const clicksByDevice = processDeviceData(clicks);
    
    // Clics par navigateur
    const clicksByBrowser = processBrowserData(clicks);

    // Clics récents (top 10)
    const recentClicks = clicks.slice(0, 10).map(click => ({
      id: click.id,
      country_name: click.country_name || 'Inconnu',
      city: click.city || 'Inconnu',
      device_type: click.device_type || 'desktop',
      browser_name: click.browser_name || 'Inconnu',
      clicked_at: click.clicked_at
    }));

    return {
      totalClicks,
      uniqueVisitors,
      clicksByDate,
      clicksByCountry,
      clicksByDevice,
      clicksByBrowser,
      recentClicks
    };
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      
      // Calculer la date de début selon le timeframe
      const now = new Date();
      let startDate: Date;
      
      switch (timeframe) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date('2000-01-01');
      }

      // Construire la requête de base
      let query = supabase.from('clicks')
        .select(`
          *,
          links!inner(user_id)
        `)
        .eq('links.user_id', userId)
        .gte('clicked_at', startDate.toISOString());

      // Si un linkId spécifique est demandé
      if (linkId) {
        query = query.eq('link_id', linkId);
      }

      const { data: clicks, error: fetchError } = await query.order('clicked_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Traiter les données pour les analytics
      const processedData = processClicksData(clicks || []);
      setData(processedData);
      setError(null);
      
    } catch (err) {
      console.error('Erreur lors du chargement des analytics:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [linkId, userId, timeframe, processClicksData]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(dateString));
  };

  const getDeviceIcon = (device: string) => {
    const deviceLower = device.toLowerCase();
    if (deviceLower.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (deviceLower.includes('tablet')) return <Tablet className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total des clics</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalClicks.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Visiteurs uniques</p>
              <p className="text-2xl font-bold text-gray-900">{data.uniqueVisitors.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Taux de conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.totalClicks > 0 ? ((data.uniqueVisitors / data.totalClicks) * 100).toFixed(1) : '0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pays différents</p>
              <p className="text-2xl font-bold text-gray-900">{data.clicksByCountry.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique des clics par date */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des clics</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.clicksByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(value) => [value, 'Clics']}
              />
              <Line 
                type="monotone" 
                dataKey="clicks" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Répartition par pays et appareils */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clics par pays */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top pays</h3>
          <div className="space-y-3">
            {data.clicksByCountry.slice(0, 6).map((item, index) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm text-gray-900">{item.country}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.clicks}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clics par appareil */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Types d'appareils</h3>
          <div className="space-y-3">
            {data.clicksByDevice.map((item) => (
              <div key={item.device} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getDeviceIcon(item.device)}
                  <span className="text-sm text-gray-900">{item.device}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.clicks}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {data.recentClicks.length > 0 ? (
            data.recentClicks.map((click) => (
              <div key={click.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {click.country_name}{click.city !== 'Inconnu' && `, ${click.city}`}
                  </span>
                  {getDeviceIcon(click.device_type)}
                  <span className="text-xs text-gray-500">{click.browser_name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Intl.DateTimeFormat('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }).format(new Date(click.clicked_at))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          )}
        </div>
      </div>
    </div>
  );
};
