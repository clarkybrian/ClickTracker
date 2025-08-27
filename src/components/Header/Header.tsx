import React, { useState, useEffect } from 'react';
import { Link, User, LogOut, Crown, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Effet pour empêcher le scrolling quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }

    // Nettoyage au démontage du composant
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  // Effet pour fermer le menu mobile sur redimensionnement
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Effet pour fermer le menu mobile avec la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const navigationLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/shorten', label: 'Raccourcir' },
    { to: '/features', label: 'Fonctionnalités' },
    { to: '/pricing', label: 'Tarifs' },
    { to: '/contact', label: 'Contact' },
    ...(user ? [{ to: '/dashboard', label: 'Dashboard' }] : [])
  ];

  return (
    <>
      <header className="ck-header bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="ck-logo p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Link className="w-6 h-6 text-white" />
              </div>
              <NavLink to="/" className="ck-brand text-2xl font-bold gradient-text">
                ClickTracker
              </NavLink>
            </div>

            {/* Navigation Desktop */}
            <nav className="ck-nav-desktop hidden lg:flex items-center space-x-2">
              {navigationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `ck-nav-link font-semibold px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions Desktop */}
            <div className="ck-actions hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <div className="ck-premium-badge flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-bold">Premium</span>
                  </div>
                  <div className="ck-user-info flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ck-signout-btn flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </>
              ) : (
                <div className="ck-auth-section flex items-center space-x-3">
                  <span className="ck-auth-text hidden lg:block text-sm text-gray-600">Connectez-vous pour tracker vos liens</span>
                  <NavLink
                    to="/auth"
                    className="btn-primary"
                  >
                    Se connecter
                  </NavLink>
                </div>
              )}
            </div>

            {/* Menu Hamburger Mobile */}
            <div className="ck-mobile-actions md:hidden flex items-center space-x-3">
              {user ? (
                <div className="ck-mobile-user flex items-center space-x-2">
                  <div className="ck-premium-badge-mobile flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full">
                    <Crown className="w-3 h-3" />
                    <span className="text-xs font-bold">Premium</span>
                  </div>
                </div>
              ) : (
                <NavLink
                  to="/auth"
                  className="ck-mobile-auth-btn text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Connexion
                </NavLink>
              )}
              <button
                onClick={toggleMobileMenu}
                className="ck-hamburger p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Menu de navigation"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="ck-mobile-overlay md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" 
          onClick={closeMobileMenu}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              closeMobileMenu();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Fermer le menu"
        >
          <div 
            className="ck-mobile-menu fixed top-16 right-0 w-80 max-w-[85vw] h-[calc(100vh-4rem)] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ck-mobile-menu-content flex flex-col h-full">
              {/* Navigation Links */}
              <nav className="ck-mobile-nav flex-1 px-6 py-4 space-y-2">
                {navigationLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className={({ isActive }) =>
                      `ck-mobile-nav-link block font-semibold px-4 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'bg-blue-100 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {/* User Section Mobile */}
              {user && (
                <div className="ck-mobile-user-section border-t border-gray-200 px-6 py-4 space-y-3">
                  <div className="ck-mobile-user-info flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">{user.email?.split('@')[0]}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleSignOut();
                      closeMobileMenu();
                    }}
                    className="ck-mobile-signout w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 transition-colors p-3 rounded-lg hover:bg-red-50 border border-red-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};