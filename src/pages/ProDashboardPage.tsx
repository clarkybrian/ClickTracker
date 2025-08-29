import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { LinkShortenerPro } from '../components/LinkShortener/LinkShortenerPro';
import { ClickAnalytics } from '../components/Analytics/ClickAnalytics';
import { Layout } from '../components/Layout/Layout';
import { 
  Link,
  BarChart3,
  Plus,
  Settings,
  Globe,
  Crown
} from 'lucide-react';

export const ProDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const subscription = useSubscription();
  const [activeTab, setActiveTab] = useState<'links' | 'analytics' | 'settings'>('links');

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Connexion requise</h2>
          <p className="text-gray-600 mb-6">Vous devez être connecté pour accéder au dashboard Pro.</p>
          <a 
            href="/auth" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Se connecter
          </a>
        </div>
      </Layout>
    );
  }

  const isPro = subscription.isPro();

  if (!isPro) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Passez au plan Pro</h2>
          <p className="text-gray-600 mb-6">
            Accédez aux fonctionnalités avancées de tracking, analytics détaillés, et bien plus encore.
          </p>
          <div className="space-y-3 mb-8">
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Analytics détaillés en temps réel</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Liens illimités avec alias personnalisés</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Protection par mot de passe et expiration</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Tracking UTM et géolocalisation avancée</span>
            </div>
          </div>
          <a 
            href="/pricing" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Voir les tarifs
          </a>
        </div>
      </Layout>
    );
  }

  const tabs = [
    {
      id: 'links' as const,
      name: 'Gestionnaire de liens',
      icon: Link,
      description: 'Créez et gérez vos liens raccourcis'
    },
    {
      id: 'analytics' as const,
      name: 'Analytics Pro',
      icon: BarChart3,
      description: 'Statistiques détaillées et analyses'
    },
    {
      id: 'settings' as const,
      name: 'Paramètres Pro',
      icon: Settings,
      description: 'Configuration avancée'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header Pro */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Pro</h1>
                  <p className="text-gray-600">Outils avancés de gestion des liens</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  Plan {subscription.profile?.subscription_tier || 'Pro'}
                </div>
                <div className="text-sm text-gray-500">
                  {user.email}
                </div>
              </div>
            </div>
            
            {/* Tabs Navigation */}
            <div className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'links' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Gestionnaire de liens Pro</h2>
                <p className="text-gray-600">
                  Créez des liens avec des fonctionnalités avancées : alias personnalisés, protection par mot de passe, 
                  dates d'expiration, tracking UTM et analytics détaillés.
                </p>
              </div>
              <LinkShortenerPro />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Pro</h2>
                <p className="text-gray-600">
                  Analysez les performances de vos liens avec des statistiques détaillées : 
                  géolocalisation, types d'appareils, navigateurs, et bien plus.
                </p>
              </div>
              <ClickAnalytics userId={user.id} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Paramètres Pro</h2>
                <p className="text-gray-600">
                  Configurez vos préférences et gérez les fonctionnalités avancées de votre compte Pro.
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informations du compte */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du compte</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plan actuel</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-lg font-medium text-blue-600 capitalize">
                          {subscription.profile?.subscription_tier || 'Pro'}
                        </span>
                        <Crown className="w-5 h-5 text-yellow-500 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Limites et quotas */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Limites et quotas</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Liens créés ce mois</span>
                        <span className="font-medium">∞ (Illimité)</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Clics ce mois</span>
                        <span className="font-medium">∞ (Illimité)</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Domaines personnalisés</span>
                        <span className="font-medium">
                          {subscription.profile?.custom_domains_limit || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fonctionnalités disponibles */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Fonctionnalités Pro</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Analytics détaillés en temps réel</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Alias personnalisés illimités</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Protection par mot de passe</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Dates d'expiration</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Tracking UTM avancé</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Export des données</span>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <Globe className="w-4 h-4 mr-2" />
                      Configurer un domaine personnalisé
                    </button>
                    <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Exporter les analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
