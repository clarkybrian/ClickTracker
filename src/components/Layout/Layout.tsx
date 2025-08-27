import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { ScrollToTopButton } from '../ScrollToTop/ScrollToTopButton';
import { Link2, Users, Globe, TrendingUp } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="ck-layout min-h-screen bg-gray-50">
      <Header />
      
      <main className="ck-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="ck-footer bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="ck-footer-brand col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">ClickTracker</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm md:text-base">
                La plateforme de raccourcissement d'URLs avec analytics avancés. 
                <span className="block mt-1">Transformez vos liens en données précieuses et optimisez votre stratégie digitale.</span>
              </p>
              <div className="ck-social-links flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold">T</span>
                </div>
                <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <span className="text-white font-bold">F</span>
                </div>
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors cursor-pointer">
                  <span className="text-white font-bold">L</span>
                </div>
              </div>
            </div>
            
            <div className="ck-footer-section">
              <h4 className="font-semibold mb-4 text-lg">Produit</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors text-sm md:text-base">Fonctionnalités</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors text-sm md:text-base">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Intégrations</a></li>
              </ul>
            </div>
            
            <div className="ck-footer-section">
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Guides</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors text-sm md:text-base">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-sm md:text-base">Status</a></li>
              </ul>
            </div>
          </div>
          
          {/* Stats */}
          <div className="ck-footer-stats border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center mb-6 md:mb-8">
              <div className="ck-stat-item flex flex-col items-center">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-blue-400 mb-2" />
                <div className="text-xl md:text-2xl font-bold text-white">10M+</div>
                <div className="text-gray-400 text-xs md:text-sm">Liens créés</div>
              </div>
              <div className="ck-stat-item flex flex-col items-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-400 mb-2" />
                <div className="text-xl md:text-2xl font-bold text-white">500K+</div>
                <div className="text-gray-400 text-xs md:text-sm">Utilisateurs</div>
              </div>
              <div className="ck-stat-item flex flex-col items-center">
                <Globe className="h-5 w-5 md:h-6 md:w-6 text-green-400 mb-2" />
                <div className="text-xl md:text-2xl font-bold text-white">195</div>
                <div className="text-gray-400 text-xs md:text-sm">Pays</div>
              </div>
              <div className="ck-stat-item flex flex-col items-center">
                <Link2 className="h-5 w-5 md:h-6 md:w-6 text-orange-400 mb-2" />
                <div className="text-xl md:text-2xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 text-xs md:text-sm">Uptime</div>
              </div>
            </div>
            
            <div className="ck-footer-copyright text-center text-gray-400 border-t border-gray-800 pt-6 md:pt-8 text-sm md:text-base">
              <p>&copy; 2025 ClickTracker. Tous droits réservés. 
                <span className="block sm:inline sm:ml-1">Fait avec ❤️ en France.</span>
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      <ScrollToTopButton />
    </div>
  );
};
