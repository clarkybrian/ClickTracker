import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Globe, Clock, Zap, BarChart3 } from 'lucide-react';

const demoData = {
  clicks: [
    { name: 'Lun', clicks: 120, unique: 89 },
    { name: 'Mar', clicks: 190, unique: 142 },
    { name: 'Mer', clicks: 300, unique: 201 },
    { name: 'Jeu', clicks: 280, unique: 189 },
    { name: 'Ven', clicks: 450, unique: 320 },
    { name: 'Sam', clicks: 380, unique: 267 },
    { name: 'Dim', clicks: 290, unique: 198 }
  ],
  countries: [
    { name: 'France', value: 35, color: '#3B82F6' },
    { name: 'Canada', value: 25, color: '#8B5CF6' },
    { name: 'USA', value: 20, color: '#10B981' },
    { name: 'Allemagne', value: 15, color: '#F59E0B' },
    { name: 'Autres', value: 5, color: '#EF4444' }
  ],
  devices: [
    { name: 'Mobile', value: 60, color: '#3B82F6' },
    { name: 'Desktop', value: 35, color: '#8B5CF6' },
    { name: 'Tablet', value: 5, color: '#10B981' }
  ]
};

const metrics = [
  { label: 'Total Clics', value: '2,847', change: '+12%', icon: TrendingUp, color: 'text-green-600' },
  { label: 'Visiteurs Uniques', value: '1,923', change: '+8%', icon: Users, color: 'text-blue-600' },
  { label: 'Pays', value: '45', change: '+3', icon: Globe, color: 'text-purple-600' },
  { label: 'Temps Moyen', value: '2.4s', change: '-0.2s', icon: Clock, color: 'text-orange-600' }
];

export const AnalyticsDemo: React.FC = () => {
  const [activeChart, setActiveChart] = useState<'clicks' | 'countries' | 'devices'>('clicks');
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationClass('animate-pulse');
      setTimeout(() => setAnimationClass(''), 1000);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Analytics en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Temps Réel</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez la puissance de nos analytics avec cette démonstration interactive
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${animationClass}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gray-100`}>
                    <IconComponent className={`h-6 w-6 ${metric.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${metric.color.includes('green') ? 'text-green-600' : 'text-gray-600'}`}>
                    {metric.change}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-gray-600 text-sm">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Interactive Charts */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Chart Navigation */}
          <div className="flex flex-wrap gap-4 mb-8">
            {[
              { key: 'clicks', label: 'Évolution des Clics', icon: BarChart3 },
              { key: 'countries', label: 'Répartition par Pays', icon: Globe },
              { key: 'devices', label: 'Types d\'Appareils', icon: Zap }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveChart(tab.key as 'clicks' | 'countries' | 'devices')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeChart === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Chart Content */}
          <div className="h-96">
            {activeChart === 'clicks' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demoData.clicks}>
                  <defs>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUnique" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Area type="monotone" dataKey="clicks" stroke="#3B82F6" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={3} />
                  <Area type="monotone" dataKey="unique" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUnique)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'countries' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoData.countries}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {demoData.countries.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {activeChart === 'devices' && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={demoData.devices}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {demoData.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap justify-center gap-6">
            {activeChart === 'clicks' && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Total Clics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-gray-600">Visiteurs Uniques</span>
                </div>
              </>
            )}
            {(activeChart === 'countries' || activeChart === 'devices') && (
              <>
                {(activeChart === 'countries' ? demoData.countries : demoData.devices).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-600">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
