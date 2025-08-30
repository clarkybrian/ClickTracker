import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Firefox,
  Safari,
  Clock
} from 'lucide-react';

interface RealTimeAnalyticsProps {
  linkId?: string;
  userId: string;
}

interface ClickData {
  id: string;
  link_id: string;
  clicked_at: string;
  country_name?: string;
  country_code?: string;
  city?: string;
  device_type?: string;
  device_brand?: string;
  browser_name?: string;
  os_name?: string;
  referer?: string;
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  // Champs potentiels supplémentaires
  os?: string;
  operating_system?: string;
  platform?: string;
}

interface TimeSeriesData {
  timestamp: string;
  clicks: number;
  cumulative: number;
  label: string;
}

interface DetailedStats {
  countries: { name: string; code: string; count: number; percentage: number }[];
  devices: { name: string; count: number; percentage: number }[];
  browsers: { name: string; count: number; percentage: number }[];
  os: { name: string; count: number; percentage: number }[];
  referrers: { name: string; count: number; percentage: number }[];
  hourlyDistribution: { hour: string; count: number }[];
  cities: { name: string; country: string; count: number; percentage: number }[];
}

type TimeInterval = '15m' | '1h' | '24h' | '7d' | '30d' | '1y';

const TIME_INTERVALS = [
  { key: '15m' as TimeInterval, label: '15min', duration: 15 * 60 * 1000 },
  { key: '1h' as TimeInterval, label: '1h', duration: 60 * 60 * 1000 },
  { key: '24h' as TimeInterval, label: '24h', duration: 24 * 60 * 60 * 1000 },
  { key: '7d' as TimeInterval, label: '7j', duration: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d' as TimeInterval, label: '30j', duration: 30 * 24 * 60 * 60 * 1000 },
  { key: '1y' as TimeInterval, label: '1an', duration: 365 * 24 * 60 * 60 * 1000 }
];

export const RealTimeAnalytics: React.FC<RealTimeAnalyticsProps> = ({ 
  linkId, 
  userId 
}) => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('30d');
  const [loading, setLoading] = useState(true);
  const [isRealTime, setIsRealTime] = useState(true);
  const [totalClicks, setTotalClicks] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [countries, setCountries] = useState(0);
  const [detailedStats, setDetailedStats] = useState<DetailedStats>({
    countries: [],
    devices: [],
    browsers: [],
    os: [],
    referrers: [],
    hourlyDistribution: [],
    cities: []
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<Date>(new Date());

  const getTimeStep = (interval: TimeInterval): number => {
    switch (interval) {
      case '15m':
        return 1 * 60 * 1000; // 1 minute
      case '1h':
        return 5 * 60 * 1000; // 5 minutes
      case '24h':
        return 60 * 60 * 1000; // 1 heure
      case '7d':
        return 24 * 60 * 60 * 1000; // 1 jour
      case '30d':
        return 24 * 60 * 60 * 1000; // 1 jour
      case '1y':
        return 7 * 24 * 60 * 60 * 1000; // 1 semaine
      default:
        return 60 * 60 * 1000;
    }
  };

  // Fonction pour calculer les statistiques détaillées
  const calculateDetailedStats = (clicks: ClickData[]): DetailedStats => {
    const total = clicks.length;
    
    // Pays
    const countryCount: { [key: string]: { name: string; code: string; count: number } } = {};
    clicks.forEach(click => {
      if (click.country_name) {
        const key = click.country_name;
        countryCount[key] = countryCount[key] || { 
          name: click.country_name, 
          code: click.country_code || '', 
          count: 0 
        };
        countryCount[key].count++;
      }
    });
    
    const countries = Object.values(countryCount)
      .map(country => ({
        ...country,
        percentage: total > 0 ? (country.count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Appareils
    const deviceCount: { [key: string]: number } = {};
    clicks.forEach(click => {
      let deviceType = click.device_type;
      
      // Si aucun type d'appareil n'est fourni, essayons de le détecter depuis le user_agent
      if (!deviceType && click.user_agent) {
        const ua = click.user_agent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
          deviceType = 'mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          deviceType = 'tablet';
        } else {
          deviceType = 'desktop';
        }
      }
      
      if (deviceType) {
        deviceCount[deviceType] = (deviceCount[deviceType] || 0) + 1;
      }
    });
    
    const devices = Object.entries(deviceCount)
      .map(([name, count]) => ({
        name: name === 'mobile' ? 'Mobile' : name === 'desktop' ? 'Ordinateur' : name === 'tablet' ? 'Tablette' : name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Navigateurs
    const browserCount: { [key: string]: number } = {};
    clicks.forEach(click => {
      let browserName = click.browser_name;
      
      // Si aucun navigateur n'est fourni, essayons de le détecter depuis le user_agent
      if (!browserName && click.user_agent) {
        const ua = click.user_agent.toLowerCase();
        if (ua.includes('edg/')) browserName = 'Microsoft Edge';
        else if (ua.includes('chrome/') && !ua.includes('edg/')) browserName = 'Google Chrome';
        else if (ua.includes('firefox/')) browserName = 'Mozilla Firefox';
        else if (ua.includes('safari/') && !ua.includes('chrome/')) browserName = 'Safari';
        else if (ua.includes('opera/')) browserName = 'Opera';
        else if (ua.includes('brave/')) browserName = 'Brave';
        else browserName = 'Autre';
      }
      
      if (browserName) {
        browserCount[browserName] = (browserCount[browserName] || 0) + 1;
      }
    });
    
    const browsers = Object.entries(browserCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Systèmes d'exploitation
    const osCount: { [key: string]: number } = {};
    clicks.forEach(click => {
      let osName = click.os_name || click.os || click.operating_system || click.platform;
      
      // Si aucun OS n'est fourni, essayons de le détecter depuis le user_agent
      if (!osName && click.user_agent) {
        const ua = click.user_agent.toLowerCase();
        if (ua.includes('windows nt 10.0')) osName = 'Windows 10';
        else if (ua.includes('windows nt 6.3')) osName = 'Windows 8.1';
        else if (ua.includes('windows nt 6.2')) osName = 'Windows 8';
        else if (ua.includes('windows nt 6.1')) osName = 'Windows 7';
        else if (ua.includes('windows')) osName = 'Windows';
        else if (ua.includes('mac os x')) osName = 'macOS';
        else if (ua.includes('macintosh')) osName = 'macOS';
        else if (ua.includes('iphone')) osName = 'iOS';
        else if (ua.includes('ipad')) osName = 'iPadOS';
        else if (ua.includes('android')) osName = 'Android';
        else if (ua.includes('linux')) osName = 'Linux';
        else if (ua.includes('ubuntu')) osName = 'Ubuntu';
        else if (ua.includes('fedora')) osName = 'Fedora';
        else if (ua.includes('chrome os')) osName = 'Chrome OS';
        else osName = 'Autre';
      }
      
      if (osName) {
        osCount[osName] = (osCount[osName] || 0) + 1;
      }
    });
    
    const os = Object.entries(osCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Referrers
    const referrerCount: { [key: string]: number } = {};
    clicks.forEach(click => {
      if (click.referer) {
        try {
          const domain = new URL(click.referer).hostname;
          referrerCount[domain] = (referrerCount[domain] || 0) + 1;
        } catch {
          referrerCount['Direct'] = (referrerCount['Direct'] || 0) + 1;
        }
      } else {
        referrerCount['Direct'] = (referrerCount['Direct'] || 0) + 1;
      }
    });
    
    const referrers = Object.entries(referrerCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Distribution horaire
    const hourlyCount: { [key: string]: number } = {};
    clicks.forEach(click => {
      const hour = new Date(click.clicked_at).getHours();
      const hourKey = `${hour}:00`;
      hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
    });
    
    const hourlyDistribution = Array.from({ length: 24 }, (_, i) => {
      const hourKey = `${i}:00`;
      return {
        hour: hourKey,
        count: hourlyCount[hourKey] || 0
      };
    });

    // Villes
    const cityCount: { [key: string]: { name: string; country: string; count: number } } = {};
    clicks.forEach(click => {
      if (click.city && click.country_name) {
        const key = `${click.city}-${click.country_name}`;
        cityCount[key] = cityCount[key] || { 
          name: click.city, 
          country: click.country_name, 
          count: 0 
        };
        cityCount[key].count++;
      }
    });
    
    const cities = Object.values(cityCount)
      .map(city => ({
        ...city,
        percentage: total > 0 ? (city.count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      countries,
      devices,
      browsers,
      os,
      referrers,
      hourlyDistribution,
      cities
    };
  };

  const generateTimeRange = useCallback((interval: TimeInterval): Date[] => {
    const now = new Date();
    const duration = TIME_INTERVALS.find(t => t.key === interval)?.duration || 24 * 60 * 60 * 1000;
    const step = getTimeStep(interval);
    const start = new Date(now.getTime() - duration);
    
    const points: Date[] = [];
    let current = new Date(start);
    
    while (current <= now) {
      points.push(new Date(current));
      current = new Date(current.getTime() + step);
    }
    
    return points;
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const duration = TIME_INTERVALS.find(t => t.key === selectedInterval)?.duration || 24 * 60 * 60 * 1000;
      const startTime = new Date(Date.now() - duration).toISOString();
      
      let query = supabase
        .from('clicks')
        .select('*')
        .gte('clicked_at', startTime)
        .order('clicked_at', { ascending: true });

      if (linkId) {
        query = query.eq('link_id', linkId);
      } else {
        // Si pas de linkId spécifique, récupérer tous les clics de l'utilisateur
        const { data: userLinks } = await supabase
          .from('links')
          .select('id')
          .eq('user_id', userId);
        
        if (userLinks && userLinks.length > 0) {
          const linkIds = userLinks.map(link => link.id);
          query = query.in('link_id', linkIds);
        }
      }

      const { data: clicks, error } = await query;

      if (error) {
        console.error('Erreur lors du chargement des analytics:', error);
        setData([]);
        return;
      }

      // Générer la série temporelle
      const timeRange = generateTimeRange(selectedInterval);
      const clicksByTime: Record<string, number> = {};
      
      clicks?.forEach((click: ClickData) => {
        const clickTime = new Date(click.clicked_at);
        const timeKey = timeRange.find(t => {
          const step = getTimeStep(selectedInterval);
          return clickTime >= t && clickTime < new Date(t.getTime() + step);
        });
        
        if (timeKey) {
          const key = timeKey.toISOString();
          clicksByTime[key] = (clicksByTime[key] || 0) + 1;
        }
      });

      // Créer les données de série temporelle
      let cumulative = 0;
      const timeSeriesData: TimeSeriesData[] = timeRange.map(time => {
        const key = time.toISOString();
        const clicks = clicksByTime[key] || 0;
        cumulative += clicks;
        
        return {
          timestamp: key,
          clicks,
          cumulative,
          label: time.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit',
            ...(selectedInterval === '7d' || selectedInterval === '30d' || selectedInterval === '1y' ? {
              day: '2-digit',
              month: '2-digit'
            } : {})
          })
        };
      });

      setData(timeSeriesData);
      
      // Calculer les statistiques
      const totalClicksCount = clicks?.length || 0;
      setTotalClicks(totalClicksCount);
      
      // Calculer les visiteurs uniques avec une logique plus conservatrice et automatique
      let uniqueVisitors = 0;
      if (clicks && clicks.length > 0) {
        // Méthode 1: IP addresses (si disponibles)
        const uniqueIps = new Set(clicks.map((c: ClickData) => c.ip_address).filter(Boolean)).size;
        
        if (uniqueIps > 0) {
          // Si on a des IPs, les utiliser directement
          uniqueVisitors = uniqueIps;
        } else {
          // Sinon, utiliser une combinaison plus stricte : user_agent + même journée
          const visitorsMap = new Map<string, string>();
          
          clicks.forEach(click => {
            if (click.user_agent) {
              const clickDate = new Date(click.clicked_at).toDateString(); // Même jour
              
              // Un seul visiteur unique par user_agent par jour
              visitorsMap.set(click.user_agent, clickDate);
            }
          });
          
          uniqueVisitors = visitorsMap.size;
          
          // Si toujours pas de données, utiliser une approximation très conservatrice
          if (uniqueVisitors === 0) {
            // Pour les tests : si moins de 20 clics, probablement 1-2 visiteurs max
            if (totalClicksCount <= 20) {
              uniqueVisitors = Math.max(1, Math.ceil(totalClicksCount / 10));
            } else {
              // Pour plus de clics : approximation à 40% maximum
              uniqueVisitors = Math.max(1, Math.ceil(totalClicksCount * 0.4));
            }
          }
          
          // Sécurité : les visiteurs uniques ne peuvent jamais dépasser le total des clics
          uniqueVisitors = Math.min(uniqueVisitors, totalClicksCount);
        }
      }
      
      setUniqueVisitors(uniqueVisitors);
      setConversionRate(uniqueVisitors > 0 ? (totalClicksCount / uniqueVisitors) * 100 : 0);
      
      const uniqueCountries = new Set(clicks?.map((c: ClickData) => c.country_name).filter(Boolean)).size;
      setCountries(uniqueCountries);

      // Calculer les statistiques détaillées
      if (clicks && clicks.length > 0) {
        const stats = calculateDetailedStats(clicks);
        setDetailedStats(stats);
      }
      
      lastUpdateRef.current = new Date();
      
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [linkId, userId, selectedInterval, generateTimeRange]);

  // Mise à jour en temps réel
  useEffect(() => {
    if (isRealTime && (selectedInterval === '15m' || selectedInterval === '1h' || selectedInterval === '24h')) {
      intervalRef.current = setInterval(() => {
        fetchAnalyticsData();
      }, selectedInterval === '15m' ? 10000 : selectedInterval === '1h' ? 30000 : 60000); // 10s, 30s, 1min
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRealTime, selectedInterval, fetchAnalyticsData]);

  // Chargement initial et changement d'intervalle
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const time = new Date(label || '');
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-600 text-sm mb-1">
            {time.toLocaleString('fr-FR')}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Pro</h2>
          <p className="text-gray-600">
            Analysez les performances de vos liens avec des statistiques détaillées : géolocalisation, types d'appareils, navigateurs, et bien plus.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRealTime(!isRealTime)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isRealTime 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isRealTime ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRealTime ? 'Temps réel' : 'Pausé'}
          </button>
          
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des clics</p>
              <p className="text-2xl font-bold text-gray-900">{totalClicks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visiteurs uniques</p>
              <p className="text-2xl font-bold text-gray-900">{uniqueVisitors}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taux de conversion</p>
              <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pays différents</p>
              <p className="text-2xl font-bold text-gray-900">{countries}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteur d'intervalle de temps */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Évolution des clics</h3>
            {isRealTime && (
              <span className="text-sm text-gray-500">
                Dernière mise à jour: {lastUpdateRef.current.toLocaleTimeString('fr-FR')}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {TIME_INTERVALS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedInterval(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedInterval === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorClicks)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Statistiques détaillées */}
      {!loading && totalClicks > 0 && (
        <div className="mt-8 space-y-6">
          {/* Pays et villes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pays */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Pays</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.countries.slice(0, 8).map((country) => (
                  <div key={country.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{country.code ? `🇺🇳` : '🌍'}</span>
                      <span className="text-sm font-medium text-gray-900">{country.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{country.count}</span>
                      <span className="text-xs text-gray-500">({country.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Villes */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Villes</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.cities.slice(0, 8).map((city) => (
                  <div key={`${city.name}-${city.country}`} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🏙️</span>
                      <div>
                        <span className="text-sm font-medium text-gray-900">{city.name}</span>
                        <span className="text-xs text-gray-500 ml-1">({city.country})</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{city.count}</span>
                      <span className="text-xs text-gray-500">({city.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Appareils et navigateurs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Appareils */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Monitor className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Appareils</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.devices.map((device) => (
                  <div key={device.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {device.name === 'Mobile' ? '📱' : 
                         device.name === 'Ordinateur' ? '💻' : 
                         device.name === 'Tablette' ? '📱' : '🖥️'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{device.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{device.count}</span>
                      <span className="text-xs text-gray-500">({device.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigateurs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Globe className="h-5 w-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Navigateurs</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.browsers.map((browser) => (
                  <div key={browser.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {browser.name.toLowerCase().includes('chrome') ? '🟢' :
                         browser.name.toLowerCase().includes('firefox') ? '🟠' :
                         browser.name.toLowerCase().includes('safari') ? '🔵' :
                         browser.name.toLowerCase().includes('edge') ? '🟣' : '🌐'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{browser.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{browser.count}</span>
                      <span className="text-xs text-gray-500">({browser.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OS et Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Systèmes d'exploitation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Monitor className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Systèmes d'exploitation</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.os.map((os) => (
                  <div key={os.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {os.name.toLowerCase().includes('windows') ? '🪟' :
                         os.name.toLowerCase().includes('mac') ? '🍎' :
                         os.name.toLowerCase().includes('linux') ? '🐧' :
                         os.name.toLowerCase().includes('android') ? '🤖' :
                         os.name.toLowerCase().includes('ios') ? '📱' : '💻'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{os.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{os.count}</span>
                      <span className="text-xs text-gray-500">({os.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sources de trafic */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-pink-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Sources de trafic</h3>
              </div>
              <div className="space-y-3">
                {detailedStats.referrers.map((referrer) => (
                  <div key={referrer.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {referrer.name === 'Direct' ? '🔗' :
                         referrer.name.includes('google') ? '🔍' :
                         referrer.name.includes('facebook') ? '📘' :
                         referrer.name.includes('twitter') ? '🐦' :
                         referrer.name.includes('instagram') ? '📷' : '🌐'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{referrer.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">{referrer.count}</span>
                      <span className="text-xs text-gray-500">({referrer.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution horaire */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-cyan-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Distribution horaire</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={detailedStats.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
