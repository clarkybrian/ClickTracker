import React, { useState, useEffect } from 'react';
import { Header } from './components/Header/Header';
import { LinkShortener } from './components/LinkShortener/LinkShortener';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AuthForm } from './components/Auth/AuthForm';
import { useAuth } from './hooks/useAuth';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'auth'>('home');
  const { user, loading } = useAuth();

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  const handleAuthSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleLinkCreated = () => {
    if (user) {
      setCurrentView('dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ClickTracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        {currentView === 'home' && (
          <div className="space-y-8">
            <LinkShortener onLinkCreated={handleLinkCreated} />
            {!user && (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Sign in to track your links
                  </h2>
                  <p className="text-gray-600">
                    Get detailed analytics and manage all your short links in one place
                  </p>
                </div>
                <AuthForm onSuccess={handleAuthSuccess} />
              </div>
            )}
          </div>
        )}
        
        {currentView === 'dashboard' && <Dashboard />}
        
        {currentView === 'auth' && (
          <div className="max-w-md mx-auto">
            <AuthForm onSuccess={handleAuthSuccess} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;