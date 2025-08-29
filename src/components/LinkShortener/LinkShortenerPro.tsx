import React, { useState } from 'react';
import { Link, Copy, Check, Plus, BarChart, Globe } from 'lucide-react';
import { CreateLinkModal } from './CreateLinkModal';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { useLinks } from '../../hooks/useLinks';
import { Link as LinkType } from '../../types';

export const LinkShortenerPro: React.FC = () => {
  const { user } = useAuth();
  const subscription = useSubscription();
  const { links, hasReachedFreeLimit } = useLinks(user?.id);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Debug logs
  console.log('LinkShortenerPro - subscription:', subscription.profile);
  console.log('LinkShortenerPro - showCreateModal:', showCreateModal);

  const handleLinkCreated = (newLink: LinkType) => {
    console.log('Nouveau lien créé:', newLink);
    setShowCreateModal(false);
  };

  const handleUpgradeRequired = () => {
    // Redirection vers la page pricing
    window.location.href = '/pricing';
  };

  const handleCreateClick = () => {
    console.log('handleCreateClick - hasReachedFreeLimit:', hasReachedFreeLimit);
    console.log('handleCreateClick - subscription.profile:', subscription.profile);
    setShowCreateModal(true);
  };

  const copyToClipboard = async (text: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(linkId);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gestionnaire de liens</h2>
            <p className="text-gray-600">Créez et gérez vos liens raccourcis avec des analytics détaillés</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un lien</span>
          </button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Link className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Liens actifs</p>
                <p className="text-2xl font-bold text-blue-900">{links.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <BarChart className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Total des clics</p>
                <p className="text-2xl font-bold text-green-900">
                  {links.reduce((total, link) => total + (link.total_clicks || 0), 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Plan actuel</p>
                <p className="text-2xl font-bold text-purple-900 capitalize">
                  {subscription.profile?.subscription_tier || 'Free'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des liens */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Vos liens raccourcis</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {links.length > 0 ? (
            links.map((link) => (
              <div key={link.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {link.title || 'Lien sans titre'}
                      </h4>
                      {subscription.isPro() && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Pro
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-blue-600 font-medium">{link.full_short_url}</p>
                      <p className="text-sm text-gray-500 truncate">{link.original_url}</p>
                      {link.description && (
                        <p className="text-sm text-gray-600">{link.description}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>{link.total_clicks || 0} clics</span>
                      <span>{link.unique_clicks || 0} uniques</span>
                      <span>Créé le {new Date(link.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(link.full_short_url, link.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copier le lien"
                    >
                      {copied === link.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <BarChart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Link className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun lien créé</h3>
              <p className="text-gray-500 mb-4">Commencez par créer votre premier lien raccourci</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Créer mon premier lien
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création */}
      <CreateLinkModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onLinkCreated={handleLinkCreated}
        hasReachedLimit={hasReachedFreeLimit}
        onUpgradeRequired={handleUpgradeRequired}
        userTier={subscription.profile?.subscription_tier || 'free'}
      />
    </div>
  );
};
