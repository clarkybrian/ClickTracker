import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLinks } from '../hooks/useLinksRealtime';
import { Dashboard } from '../components/Dashboard/Dashboard';

export const DashboardPageRealtime: React.FC = () => {
  const { user } = useAuth();
  const { links, loading, error, hasReachedLimit } = useLinks(user?.id);

  console.log('🔄 Dashboard Realtime - Links:', links.length, 'Loading:', loading);

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Indicateur Realtime */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 border-l-4 border-green-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Realtime actif</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {links.length} lien(s) • Stats en temps réel
          </div>
        </div>
      </div>

      {/* Background avec vagues et formes géométriques */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grille subtile */}
        <div className="absolute inset-0 opacity-[0.125]">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.24) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.24) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Vagues fluides */}
        <div className="absolute top-0 left-0 w-[150%] h-32 opacity-[0.03]">
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 animate-pulse" style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 85%)'
          }}></div>
        </div>

        <div className="absolute top-16 right-0 w-[120%] h-24 opacity-[0.02]">
          <div className="w-full h-full bg-gradient-to-l from-green-400 via-blue-400 to-purple-400 animate-wave-flow" style={{
            clipPath: 'polygon(15% 0, 100% 0, 100% 75%, 0 100%)'
          }}></div>
        </div>

        {/* Vagues verticales */}
        <div className="absolute top-0 left-0 w-32 h-[150%] opacity-[0.02]">
          <div className="w-full h-full bg-gradient-to-b from-cyan-400 via-blue-400 to-indigo-400 animate-wave-vertical" style={{
            clipPath: 'polygon(0 0, 75% 0, 100% 100%, 0 85%)'
          }}></div>
        </div>

        <div className="absolute top-0 right-0 w-24 h-[120%] opacity-[0.03]">
          <div className="w-full h-full bg-gradient-to-b from-purple-400 via-pink-400 to-red-400 animate-pulse" style={{
            clipPath: 'polygon(25% 0, 100% 0, 100% 85%, 0 100%)'
          }}></div>
        </div>

        {/* Formes géométriques flottantes */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className={`absolute opacity-[0.015] pointer-events-none`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 60}px`,
              height: `${20 + Math.random() * 60}px`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          >
            {i % 6 === 0 && (
              <div className="w-full h-full bg-blue-500 rounded-full animate-float-complex"></div>
            )}
            {i % 6 === 1 && (
              <div className="w-full h-full bg-purple-500 animate-spin" style={{
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
              }}></div>
            )}
            {i % 6 === 2 && (
              <div className="w-full h-full bg-green-500 animate-bounce-soft" style={{
                clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
              }}></div>
            )}
            {i % 6 === 3 && (
              <div className="w-full h-full bg-yellow-500 rounded-lg animate-wiggle"></div>
            )}
            {i % 6 === 4 && (
              <div className="w-full h-full bg-pink-500 animate-scale-pulse" style={{
                clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
              }}></div>
            )}
            {i % 6 === 5 && (
              <div className="w-full h-full bg-indigo-500 animate-spiral" style={{
                clipPath: 'polygon(20% 0%, 80% 0%, 100% 60%, 40% 100%, 0% 40%)'
              }}></div>
            )}
          </div>
        ))}
      </div>

      {/* Contenu principal */}
      <div className="relative z-10">
        <Dashboard />
      </div>
    </div>
  );
};
