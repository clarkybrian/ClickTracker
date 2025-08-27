import React, { useState } from 'react';
import { X, Link, Globe, Tag, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Link as LinkType } from '../../types';

interface CreateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkCreated: (link: LinkType) => void;
  hasReachedLimit: boolean;
  onUpgradeRequired: () => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({
  isOpen,
  onClose,
  onLinkCreated,
  hasReachedLimit,
  onUpgradeRequired
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    originalUrl: '',
    customAlias: '',
    title: '',
    description: '',
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier la limitation gratuite
    if (hasReachedLimit) {
      onUpgradeRequired();
      return;
    }

    if (!formData.originalUrl.trim()) {
      setError('L\'URL est requise');
      return;
    }

    if (!isValidUrl(formData.originalUrl)) {
      setError('Veuillez entrer une URL valide');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Normaliser l'URL
      const normalizedUrl = formData.originalUrl.startsWith('http') 
        ? formData.originalUrl 
        : `https://${formData.originalUrl}`;

      // Générer le code court
      const shortCode = formData.customAlias || generateShortCode();

      // Vérifier que l'alias n'existe pas déjà
      if (formData.customAlias) {
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

      // Créer le lien dans Supabase
      const { data: newLink, error: createError } = await supabase
        .from('links')
        .insert({
          user_id: user?.id,
          original_url: normalizedUrl,
          short_code: shortCode,
          title: formData.title || null,
          description: formData.description || null,
          is_private: formData.isPrivate,
          is_active: true
        })
        .select('*')
        .single();

      if (createError) throw createError;

      // Construire l'URL complète
      const fullShortUrl = `${window.location.origin}/r/${shortCode}`;
      const linkWithFullUrl = {
        ...newLink,
        full_short_url: fullShortUrl,
        total_clicks: 0,
        unique_clicks: 0
      };

      onLinkCreated(linkWithFullUrl);
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        originalUrl: '',
        customAlias: '',
        title: '',
        description: '',
        isPrivate: false
      });

    } catch (err: unknown) {
      console.error('Erreur lors de la création du lien:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du lien');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Link className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Créer un nouveau lien</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Limitation gratuite warning */}
        {hasReachedLimit && (
          <div className="mx-6 mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <p className="text-sm text-orange-800 font-medium">
                Limite gratuite atteinte
              </p>
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Vous avez atteint la limite d'1 lien gratuit. Passez au plan Premium pour créer des liens illimités.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* URL originale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL à raccourcir *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.originalUrl}
                onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                placeholder="https://example.com/ma-page"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || hasReachedLimit}
              />
            </div>
          </div>

          {/* Alias personnalisé */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alias personnalisé (optionnel)
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                {window.location.origin}/r/
              </span>
              <input
                type="text"
                value={formData.customAlias}
                onChange={(e) => setFormData({ ...formData, customAlias: e.target.value.replace(/[^a-zA-Z0-9-_]/g, '') })}
                placeholder="mon-lien"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                maxLength={20}
                disabled={loading || hasReachedLimit}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Lettres, chiffres, tirets et underscores uniquement
            </p>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre (optionnel)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de votre lien"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
                disabled={loading || hasReachedLimit}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnelle)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de votre lien..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={250}
              disabled={loading || hasReachedLimit}
            />
          </div>

          {/* Visibilité */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {formData.isPrivate ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {formData.isPrivate ? 'Lien privé' : 'Lien public'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.isPrivate ? 'bg-blue-600' : 'bg-gray-200'
              }`}
              disabled={loading || hasReachedLimit}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.isPrivate ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Erreur */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                hasReachedLimit
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Création...</span>
                </div>
              ) : hasReachedLimit ? (
                'Passer au Premium'
              ) : (
                'Créer le lien'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
