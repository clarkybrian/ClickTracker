import React from 'react';
import { Crown, Zap, TrendingUp, Target, Check, X, ArrowUp } from 'lucide-react';
import { PlanType } from '../../types';
import { getPlanConfig, hasFeature, getFeatureLabel } from '../../lib/plans';

interface PlanStatusCardProps {
  currentPlan: PlanType;
}

const planIcons = {
  starter: Zap,
  pro: Crown,
  business: TrendingUp,
  enterprise: Target,
};

const planColors = {
  starter: 'from-gray-500 to-gray-600',
  pro: 'from-blue-500 to-purple-600',
  business: 'from-green-500 to-emerald-600',
  enterprise: 'from-purple-600 to-indigo-700',
};

export const PlanStatusCard: React.FC<PlanStatusCardProps> = ({ currentPlan }) => {
  const config = getPlanConfig(currentPlan);
  const IconComponent = planIcons[currentPlan];

  // Fonctionnalités clés à afficher pour chaque plan
  const keyFeatures = {
    starter: ['linkShortening', 'basicAnalytics'],
    pro: ['linkShortening', 'uniqueClicks', 'geolocation', 'deviceTracking', 'browserTracking', 'sourceTracking'],
    business: ['realTimeTracking', 'peakHours', 'advancedExport', 'customLinks', 'customQRCodes'],
    enterprise: ['apiAccess', 'webhooks', 'multiDomains', 'whiteLabel', 'dedicatedSupport']
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header avec gradient selon le plan */}
      <div className={`bg-gradient-to-r ${planColors[currentPlan]} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Plan {config.name}</h3>
              <p className="text-white/80">
                {config.price === 0 ? 'Gratuit' : `${config.price}€/mois`}
              </p>
            </div>
          </div>
          {currentPlan !== 'enterprise' && (
            <button
              onClick={() => window.location.href = '/upgrade'}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Limite de liens */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Liens actifs</span>
            <span className="text-sm font-bold text-gray-900">
              0 / {config.maxLinks}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${planColors[currentPlan]} h-2 rounded-full transition-all duration-300`}
              style={{ width: '0%' }}
            ></div>
          </div>
        </div>

        {/* Fonctionnalités du plan actuel */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Vos fonctionnalités</h4>
          <div className="space-y-2">
            {keyFeatures[currentPlan].map((featureKey) => {
              const hasThisFeature = hasFeature(currentPlan, featureKey);
              return (
                <div key={featureKey} className="flex items-center space-x-2">
                  {hasThisFeature ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-sm ${hasThisFeature ? 'text-gray-700' : 'text-gray-400'}`}>
                    {getFeatureLabel(featureKey)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message d'encouragement selon le plan */}
        {currentPlan === 'starter' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              🚀 <strong>Passez au Pro</strong> pour débloquer 5 liens et les analytics avancés !
            </p>
          </div>
        )}

        {currentPlan === 'pro' && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              💎 <strong>Excellent choix !</strong> Profitez de vos analytics avancés.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
