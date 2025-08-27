import React, { useState } from 'react';
import { Link, Copy, Check, Zap, BarChart } from 'lucide-react';
import { validateUrl, generateShortCode, copyToClipboard } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useLinks } from '../../hooks/useLinks';

interface LinkShortenerProps {
  onLinkCreated: () => void;
}

export const LinkShortener: React.FC<LinkShortenerProps> = ({ onLinkCreated }) => {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const { user } = useAuth();
  const { createLink } = useLinks(user?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      if (user) {
        const link = await createLink(url, customAlias || undefined);
        if (link) {
          const shortCode = customAlias || generateShortCode();
          setShortUrl(`https://clt.kr/${shortCode}`);
          onLinkCreated();
          setUrl('');
          setCustomAlias('');
        } else {
          setError('Failed to create short link');
        }
      } else {
        // Demo mode for non-authenticated users
        const shortCode = customAlias || generateShortCode();
        setShortUrl(`https://clt.kr/${shortCode}`);
        setUrl('');
        setCustomAlias('');
      }
    } catch {
      setError('An error occurred while creating the short link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(shortUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Raccourcissez vos liens,
          <span className="block gradient-text">Trackez tout</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Créez des liens courts, suivez les clics et analysez votre audience avec des analytics détaillés.
          Parfait pour les marketeurs, entreprises et créateurs de contenu.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original URL
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
              Custom Alias (Optional)
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
                placeholder="my-custom-link"
                pattern="[a-zA-Z0-9-_]+"
                title="Only letters, numbers, hyphens, and underscores allowed"
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
            {loading ? 'Creating...' : 'Shorten Link'}
          </button>
        </form>

        {shortUrl && (
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Short Link is Ready!</h3>
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
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
          <p className="text-gray-600">Create short links instantly with our optimized infrastructure</p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Analytics</h3>
          <p className="text-gray-600">Track clicks, countries, devices and more with real-time data</p>
        </div>

        <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Links</h3>
          <p className="text-gray-600">Create branded short links with custom aliases</p>
        </div>
      </div>
    </div>
  );
};