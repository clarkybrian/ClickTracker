import { PlanType } from '../types';
import { planConfigs } from '../config/plans';

export const hasFeature = (planType: PlanType, featureKey: string): boolean => {
  const plan = planConfigs[planType];
  if (!plan) return false;
  
  const features = plan.features as Record<string, boolean>;
  return features[featureKey] === true;
};

export const getPlanConfig = (planType: PlanType) => {
  return planConfigs[planType];
};

export const getFeatureLabel = (featureKey: string): string => {
  const labels: Record<string, string> = {
    linkTracking: 'Tracking des liens',
    customDomains: 'Domaines personnalisés',
    advancedAnalytics: 'Analytics avancés',
    geolocation: 'Géolocalisation',
    apiAccess: 'Accès API',
    bulkOperations: 'Opérations en masse',
    customBranding: 'Personnalisation marque',
    prioritySupport: 'Support prioritaire',
    exportData: 'Export de données',
    teamManagement: 'Gestion d\'équipe',
    ssoIntegration: 'Intégration SSO',
    advancedSecurity: 'Sécurité avancée',
    whiteLabel: 'White label',
    dedicatedAccount: 'Gestionnaire dédié',
    customIntegrations: 'Intégrations personnalisées',
    advancedReporting: 'Rapports avancés',
    realTimeNotifications: 'Notifications temps réel',
    customAlerts: 'Alertes personnalisées',
    dataRetention: 'Rétention données étendue',
    enterpriseSecurity: 'Sécurité entreprise'
  };
  
  return labels[featureKey] || featureKey;
};
