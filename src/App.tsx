import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { ScrollToTop } from './components/ScrollToTop/ScrollToTop';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { SessionRecovery } from './components/Auth/SessionRecovery';
import { HomePage } from './pages/HomePage';
import DashboardRouter from './components/Dashboard/DashboardRouter';
import { AuthPage } from './pages/AuthPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { PricingPage } from './pages/PricingPage';
import { ContactPage } from './pages/ContactPage';
import { ShortenPage } from './pages/ShortenPage';
import { RedirectPage } from './pages/RedirectPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Timeout pour éviter les chargements infinis
  const [showTimeout, setShowTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setShowTimeout(true);
      }
    }, 10000); // 10 secondes max de chargement
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  if (loading && !showTimeout) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }
  
  if (showTimeout && loading) {
    // En cas de timeout, on redirige vers la page de connexion
    return <Navigate to="/auth" replace />;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
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

  return (
    <ErrorBoundary>
      <SessionRecovery>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Route de redirection - sans layout */}
            <Route path="/r/:shortCode" element={<RedirectPage />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="shorten" element={<ShortenPage />} />
              <Route path="features" element={<FeaturesPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="auth" element={<AuthPage />} />
              <Route 
                path="payment-success" 
                element={
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="pro" 
                element={
                  <Navigate to="/dashboard" replace />
                } 
              />
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Router>
      </SessionRecovery>
    </ErrorBoundary>
  );
}

export default App;