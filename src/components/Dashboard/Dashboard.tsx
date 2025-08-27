import React, { useState } from 'react';
import { LinksTable } from './LinksTable';
import { Analytics } from './Analytics';
import { PricingCard } from './PricingCard';
import { useAuth } from '../../hooks/useAuth';
import { useLinks } from '../../hooks/useLinks';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'links' | 'analytics' | 'upgrade'>('links');
  const { user } = useAuth();
  const { links, loading, deleteLink, toggleLinkStatus } = useLinks(user?.id);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
        <p className="text-gray-600">Please sign in to access your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your links and view analytics</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('links')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'links'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Links ({links.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upgrade'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Upgrade
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'links' && (
            <LinksTable
              links={links}
              loading={loading}
              onDelete={deleteLink}
              onToggleStatus={toggleLinkStatus}
            />
          )}
          {activeTab === 'analytics' && <Analytics links={links} />}
          {activeTab === 'upgrade' && <PricingCard />}
        </div>
      </div>
    </div>
  );
};