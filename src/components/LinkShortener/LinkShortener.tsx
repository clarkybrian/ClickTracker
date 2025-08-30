import React, { useState } from 'react';
import { Link, Copy, Check, Zap, BarChart, Globe, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useTrackedLinksCount } from '../../hooks/useTrackedLinksCount';
import { supabase } from '../../lib/supabase';

export const LinkShortener: React.FC = () => {
  const { user } = useAuth();
  const { canEnableTracking, getLimits, getTrackingLimitsMessage } = useSubscription();
  const { trackedLinksCount, refetch: refetchTrackedCount } = useTrackedLinksCount(user?.id);
  
  // États pour le formulaire
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [enableTracking, setEnableTracking] = useState(false); // Commencer désactivé par défaut
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const limits = getLimits();
  const canTrack = canEnableTracking(trackedLinksCount);
  
  // Activer automatiquement le tracking si possible
  React.useEffect(() => {
    if (canTrack && !enableTracking) {
      setEnableTracking(true);
    }
  }, [canTrack, enableTracking]);

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Vous devez être connecté pour raccourcir un lien');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('LinkShortener - Début de la création du lien');
      console.log('URL:', url);
      console.log('Custom alias:', customAlias);
      console.log('User ID:', user?.id);
      
      // Validate URL
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error('Veuillez entrer une URL valide commençant par http:// ou https://');
      }

      // Normaliser l'URL
      const normalizedUrl = url.trim();
      const shortCode = customAlias || generateShortCode();

      // Vérifier que l'alias n'existe pas déjà (si fourni)
      if (customAlias) {
        const { data: existingLink } = await supabase
          .from('links')
          .select('id')
          .eq('short_code', shortCode)
          .single();

        if (existingLink) {
          setError('Cet alias est déjà utilisé');
          setLoading(false);
          return;
        }
      }

      // Déterminer si le tracking doit être activé
      const shouldEnableTracking = enableTracking && canTrack;

      // Créer le lien dans Supabase
      const { data: newLink, error: createError } = await supabase
        .from('links')
        .insert({
          user_id: user.id,
          original_url: normalizedUrl,
          short_code: shortCode,
          is_active: true,
          tracking_enabled: shouldEnableTracking
        })
        .select('*')
        .single();

      if (createError) {
        console.error('Erreur Supabase:', createError);
        throw new Error('Erreur lors de la création du lien: ' + createError.message);
      }

      if (!newLink) {
        throw new Error('Aucun lien créé');
      }

      // Construire l'URL complète
      const fullShortUrl = `${window.location.origin}/r/${shortCode}`;
      
      console.log('Lien créé avec succès:', fullShortUrl);
      setShortUrl(fullShortUrl);
      setUrl('');
      setCustomAlias('');
      setEnableTracking(true);
      
      // Actualiser le compteur de liens avec tracking si le tracking était activé
      if (shouldEnableTracking) {
        refetchTrackedCount();
      }
      
    } catch (err) {
      console.error('Erreur dans handleSubmit:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied('link-copied');
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="ck-shortener-container max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
          Raccourcir vos liens
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
          Transformez vos URLs longues en liens courts et élégants. 
          <span className="hidden sm:inline"> Suivez les performances en temps réel.</span>
        </p>
      </div>

      {/* Link Shortener Form */}
      <div className="ck-shortener-form bg-white rounded-xl md:rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 mb-8 md:mb-12">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL à raccourcir
            </label>
            <div className="relative">
              <Link className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="ck-url-input w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 md:py-4 border border-gray-300 rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base md:text-lg"
                placeholder="https://example.com/very/long/url"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias personnalisé (Optionnel)
            </label>
            <div className="flex flex-col sm:flex-row">
              <span className="ck-domain-prefix inline-flex items-center px-3 md:px-4 py-3 md:py-4 border border-b-0 sm:border-b sm:border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-t-lg sm:rounded-l-xl sm:rounded-tr-none text-sm md:text-lg">
                clt.kr/
              </span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="ck-alias-input flex-1 px-3 md:px-4 py-3 md:py-4 border border-gray-300 rounded-b-lg sm:rounded-r-xl sm:rounded-bl-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base md:text-lg"
                placeholder="mon-lien-personnalise"
                pattern="[a-zA-Z0-9-_]+"
                title="Seuls les lettres, chiffres, tirets et underscores sont autorisés"
              />
            </div>
          </div>

          {/* Contrôle du tracking */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="enableTracking"
                checked={enableTracking}
                onChange={(e) => setEnableTracking(e.target.checked)}
                disabled={!canTrack && enableTracking}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <label htmlFor="enableTracking" className="text-sm font-medium text-gray-700">
                  Activer le tracking et les analytics
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {canTrack 
                    ? `Vous pouvez tracker ${limits.clicks - trackedLinksCount} lien(s) supplémentaire(s)`
                    : `Limite atteinte : ${limits.clicks} lien(s) avec tracking maximum (plan gratuit)`
                  }
                </p>
                {!canTrack && (
                  <p className="text-xs text-orange-600 mt-1">
                    Désactivez le tracking sur un autre lien ou passez au plan Pro pour plus de limites.
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="ck-error-message p-3 md:p-4 bg-red-50 border border-red-200 rounded-lg md:rounded-xl text-red-700 text-sm md:text-base">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ck-submit-btn w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 md:py-4 rounded-lg md:rounded-xl font-semibold text-base md:text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {loading ? 'Création...' : 'Raccourcir le lien'}
          </button>
        </form>

        {shortUrl && (
          <div className="ck-result-section mt-6 md:mt-8 p-4 md:p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg md:rounded-xl">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Votre lien court est prêt !</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="ck-result-url flex-1 p-3 md:p-4 bg-white border rounded-lg">
                <p className="text-sm md:text-lg font-mono text-blue-600 break-all">{shortUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className="ck-copy-btn flex items-center justify-center space-x-2 px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 md:w-5 md:h-5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="ck-features-grid grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="ck-feature-card text-center p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Ultra Rapide</h3>
          <p className="text-sm md:text-base text-gray-600">Créez des liens courts instantanément avec notre infrastructure optimisée</p>
        </div>

        <div className="ck-feature-card text-center p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <BarChart className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Analytics Détaillées</h3>
          <p className="text-sm md:text-base text-gray-600">Suivez les clics, pays, appareils et plus en temps réel</p>
        </div>

        <div className="ck-feature-card text-center p-4 md:p-6 bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">Liens Personnalisés</h3>
          <p className="text-sm md:text-base text-gray-600">Créez des liens de marque avec des alias personnalisés</p>
        </div>
      </div>
    </div>
  );
};
