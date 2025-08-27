import React from 'react';
import { Link, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Link className="w-6 h-6 text-white" />
            </div>
            <NavLink to="/" className="text-2xl font-bold gradient-text">
              ClickTracker
            </NavLink>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`
              }
            >
              Accueil
            </NavLink>
            
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`
              }
            >
              Fonctionnalités
            </NavLink>
            
            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                `font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`
              }
            >
              Tarifs
            </NavLink>
            
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`
              }
            >
              Contact
            </NavLink>

            {user && (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-bold">Premium</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700 font-medium">{user.email?.split('@')[0]}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">Connectez-vous pour tracker vos liens</span>
                <NavLink
                  to="/auth"
                  className="btn-primary"
                >
                  Se connecter
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};