import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, BarChart3 } from 'lucide-react';
import { Link } from '../../types';

interface LinkSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  link: Link;
}

export const LinkSuccessModal: React.FC<LinkSuccessModalProps> = ({
  isOpen,
  onClose,
  link
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(link.full_short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const openLink = () => {
    window.open(link.full_short_url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Lien créé avec succès !</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Lien créé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre lien raccourci
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between space-x-3">
                <div className="flex-1 min-w-0">
                  <p className="text-blue-600 font-medium truncate">
                    {link.full_short_url}
                  </p>
                  {link.title && (
                    <p className="text-sm text-gray-500 mt-1">{link.title}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className={`p-2 rounded-lg transition-colors ${
                      copied
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                    title={copied ? 'Copié !' : 'Copier le lien'}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={openLink}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* URL originale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL originale
            </label>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-600 text-sm truncate">{link.original_url}</p>
            </div>
          </div>

          {/* Statistiques initiales */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h4 className="text-sm font-medium text-blue-900">Statistiques</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-blue-900">{link.total_clicks}</div>
                <div className="text-xs text-blue-600">Clics totaux</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-900">{link.unique_clicks}</div>
                <div className="text-xs text-blue-600">Visiteurs uniques</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Fermer
            </button>
            <button
              onClick={copyToClipboard}
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                copied
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {copied ? (
                <div className="flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Copié !</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Copy className="w-4 h-4" />
                  <span>Copier</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
