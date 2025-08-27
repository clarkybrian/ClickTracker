import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header/Header';
import { Link2, Users, Globe, TrendingUp } from 'lucide-react';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Link2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">ClickTracker</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                La plateforme de raccourcissement d'URLs avec analytics avancés. 
                Transformez vos liens en données précieuses et optimisez votre stratégie digitale.
              </p>
              <div className="flex space-x-4">
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
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Produit</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          {/* Stats */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
              <div className="flex flex-col items-center">
                <TrendingUp className="h-6 w-6 text-blue-400 mb-2" />
                <div className="text-2xl font-bold text-white">10M+</div>
                <div className="text-gray-400 text-sm">Liens créés</div>
              </div>
              <div className="flex flex-col items-center">
                <Users className="h-6 w-6 text-purple-400 mb-2" />
                <div className="text-2xl font-bold text-white">500K+</div>
                <div className="text-gray-400 text-sm">Utilisateurs</div>
              </div>
              <div className="flex flex-col items-center">
                <Globe className="h-6 w-6 text-green-400 mb-2" />
                <div className="text-2xl font-bold text-white">195</div>
                <div className="text-gray-400 text-sm">Pays</div>
              </div>
              <div className="flex flex-col items-center">
                <Link2 className="h-6 w-6 text-orange-400 mb-2" />
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-gray-400 text-sm">Uptime</div>
              </div>
            </div>
            
            <div className="text-center text-gray-400 border-t border-gray-800 pt-8">
              <p>&copy; 2025 ClickTracker. Tous droits réservés. Fait avec ❤️ en France.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
