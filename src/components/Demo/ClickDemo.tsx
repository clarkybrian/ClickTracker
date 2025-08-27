import React, { useState, useEffect } from 'react';
import { X, MousePointer, BarChart3, Globe, TrendingUp, Users, Clock, MapPin } from 'lucide-react';

interface ClickDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

const statsData = [
  { icon: BarChart3, label: 'Clics', value: '847', color: 'bg-blue-500', delay: 0 },
  { icon: Globe, label: 'Pays', value: '23', color: 'bg-green-500', delay: 0.15 },
  { icon: TrendingUp, label: 'CTR', value: '12.4%', color: 'bg-purple-500', delay: 0.3 },
  { icon: Users, label: 'Visiteurs', value: '632', color: 'bg-orange-500', delay: 0.45 },
  { icon: Clock, label: 'Temps', value: '2.3s', color: 'bg-pink-500', delay: 0.6 },
  { icon: MapPin, label: 'Top Ville', value: 'Paris', color: 'bg-indigo-500', delay: 0.75 },
];

export const ClickDemo: React.FC<ClickDemoProps> = ({ isOpen, onClose }) => {
  const [animationStage, setAnimationStage] = useState<'idle' | 'moving' | 'clicking' | 'stats' | 'complete'>('idle');
  const [showStats, setShowStats] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 10, y: 10 });

  useEffect(() => {
    if (isOpen) {
      // Reset animation
      setAnimationStage('idle');
      setShowStats(false);
      setMousePosition({ x: 10, y: 10 });
      
      // Start animation sequence with smooth timing
      const timer1 = setTimeout(() => {
        setAnimationStage('moving');
        setMousePosition({ x: 50, y: 50 });
      }, 800);
      
      const timer2 = setTimeout(() => setAnimationStage('clicking'), 3000);
      
      const timer3 = setTimeout(() => {
        setAnimationStage('stats');
        setShowStats(true);
      }, 3500);
      
      const timer4 = setTimeout(() => setAnimationStage('complete'), 5000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isOpen]);

  const resetAnimation = () => {
    setAnimationStage('idle');
    setShowStats(false);
    setMousePosition({ x: 10, y: 10 });
    
    setTimeout(() => {
      setAnimationStage('moving');
      setMousePosition({ x: 50, y: 50 });
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 relative overflow-hidden shadow-2xl transform animate-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">✨ Démonstration en direct</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Demo Area */}
        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 h-80 overflow-hidden border border-gray-200">
          {/* Subtle animated background */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          {/* Mock Link with enhanced styling */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className={`
              bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-2xl font-medium 
              cursor-pointer transition-all duration-300 shadow-lg border border-blue-500
              ${animationStage === 'clicking' 
                ? 'scale-95 shadow-2xl ring-4 ring-blue-300 ring-opacity-50' 
                : 'hover:from-blue-700 hover:to-blue-800 hover:scale-105 hover:shadow-xl'
              }
            `}>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>clicktracker.app/demo</span>
              </div>
            </div>
          </div>

          {/* Animated Mouse Cursor with smooth bezier movement */}
          <div 
            className={`absolute z-20 transition-all duration-[2500ms] ${
              animationStage === 'moving' ? 'animate-smooth-path' : ''
            }`}
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              transform: 'translate(-50%, -50%)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
          >
            <div className="relative">
              <MousePointer 
                className={`w-7 h-7 text-gray-800 drop-shadow-lg transition-all duration-500 ${
                  animationStage === 'clicking' 
                    ? 'scale-125 text-blue-600 animate-gentle-glow' 
                    : animationStage === 'moving'
                    ? 'animate-pulse'
                    : ''
                }`} 
              />
              
              {/* Enhanced Click Effect */}
              {animationStage === 'clicking' && (
                <>
                  <div className="absolute -top-1 -left-1 w-10 h-10 border-2 border-blue-500 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border border-blue-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.15s' }}></div>
                  <div className="absolute top-1 left-1 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-25" style={{ animationDelay: '0.3s' }}></div>
                  <div className="absolute top-2 left-2 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.45s' }}></div>
                </>
              )}

              {/* Mouse trail effect */}
              {animationStage === 'moving' && (
                <>
                  <div className="absolute top-0 left-0 w-3 h-3 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
                  <div className="absolute -top-1 -left-1 w-5 h-5 border border-blue-300 rounded-full opacity-20 animate-ping" style={{ animationDelay: '0.2s' }}></div>
                </>
              )}
            </div>
          </div>

          {/* Stats Cards with enhanced animations */}
          {showStats && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="grid grid-cols-3 gap-4">
                {statsData.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div
                      key={index}
                      className={`
                        bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20
                        transform transition-all duration-[1000ms] ease-out animate-elastic-bounce
                        ${showStats 
                          ? 'translate-y-0 opacity-100 scale-100 rotate-0' 
                          : 'translate-y-16 opacity-0 scale-50 rotate-12'
                        }
                        hover:scale-110 hover:shadow-2xl hover:-translate-y-2 hover:rotate-1
                        cursor-pointer group
                      `}
                      style={{
                        transitionDelay: `${stat.delay}s`,
                        transformOrigin: 'center',
                        transitionTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        animationDelay: `${stat.delay}s`
                      }}
                    >
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3 shadow-lg 
                                    transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:shadow-xl`}>
                        <IconComponent className="w-5 h-5 text-white transition-all duration-300 group-hover:scale-110" />
                      </div>
                      <div className="text-xl font-bold text-gray-900 mb-1 transition-all duration-300 group-hover:scale-105">
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 font-medium transition-all duration-300 group-hover:text-gray-800">
                        {stat.label}
                      </div>
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                           style={{ boxShadow: `0 0 30px ${stat.color.includes('blue') ? '#3B82F6' : 
                                                          stat.color.includes('green') ? '#10B981' : 
                                                          stat.color.includes('purple') ? '#8B5CF6' : 
                                                          stat.color.includes('orange') ? '#F59E0B' : 
                                                          stat.color.includes('pink') ? '#EC4899' : '#6366F1'}40` }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Enhanced Floating Particles Effect */}
          {animationStage === 'stats' && (
            <>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce opacity-40"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                    backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][Math.floor(Math.random() * 5)],
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1.5 + Math.random() * 2}s`,
                    transform: `scale(${0.5 + Math.random() * 0.5})`
                  }}
                />
              ))}
            </>
          )}

          {/* Ripple effect from click */}
          {animationStage === 'clicking' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <div className="w-32 h-32 border-2 border-blue-400 rounded-full animate-ping opacity-20"></div>
              <div className="absolute top-4 left-4 w-24 h-24 border border-blue-300 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.3s' }}></div>
            </div>
          )}
        </div>

        {/* Enhanced Description */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4 text-lg">
            ✨ Voici comment vos liens génèrent des analytics en temps réel
          </p>
          
          {animationStage === 'complete' && (
            <button
              onClick={resetAnimation}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl 
                         hover:from-blue-700 hover:to-purple-700 transition-all duration-300 
                         transform hover:scale-105 hover:shadow-lg font-medium"
            >
              🔄 Rejouer l'animation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
