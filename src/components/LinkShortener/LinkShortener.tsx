import React, { useState } from 'react';
import { Link, Copy, Check, Zap, BarChart, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const LinkShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate URL
      const urlPattern = /^https?:\/\/.+/;
      if (!urlPattern.test(url)) {
        throw new Error('Veuillez entrer une URL valide commençant par http:// ou https://');
      }

      // Generate short code
      const shortCode = customAlias || generateShortCode();
      
      // Check if custom alias already exists
      if (customAlias) {
        const { data: existing } = await supabase
          .from('links')
          .select('id')
          .eq('short_code', customAlias)
          .single();

        if (existing) {
          throw new Error('Cet alias personnalisé est déjà pris. Veuillez en choisir un autre.');
        }
      }

      // Save to database
      const { error: dbError } = await supabase
        .from('links')
        .insert([
          {
            original_url: url,
            short_code: shortCode,
            user_id: null, // For now, we'll allow anonymous links
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setShortUrl(`https://clt.kr/${shortCode}`);
      setUrl('');
      setCustomAlias('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Raccourcir vos liens
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Transformez vos URLs longues en liens courts et élégants. Suivez les performances en temps réel.
        </p>
      </div>

      {/* Link Shortener Form */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL à raccourcir
            </label>
            <div className="relative">
              <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="https://example.com/very/long/url"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias personnalisé (Optionnel)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 py-4 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-xl text-lg">
                clt.kr/
              </span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                className="flex-1 px-4 py-4 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
                placeholder="mon-lien-personnalise"
                pattern="[a-zA-Z0-9-_]+"
                title="Seuls les lettres, chiffres, tirets et underscores sont autorisés"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {loading ? 'Création...' : 'Raccourcir le lien'}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Votre lien court est prêt !</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-4 bg-white border rounded-lg">
                <p className="text-lg font-mono text-blue-600">{shortUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Copié!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ultra Rapide</h3>
          <p className="text-gray-600">Créez des liens courts instantanément avec notre infrastructure optimisée</p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Détaillées</h3>
          <p className="text-gray-600">Suivez les clics, pays, appareils et plus en temps réel</p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Liens Personnalisés</h3>
          <p className="text-gray-600">Créez des liens de marque avec des alias personnalisés</p>
        </div>
      </div>
    </div>
  );
};
