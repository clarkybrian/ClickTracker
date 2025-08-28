import { PlanType } from '../types';

export interface PlanConfig {
  name: string;
  type: PlanType;
  price: number;
  stripePriceId?: string;
  maxLinks: number;
  features: {
    linkShortening: boolean;
    basicAnalytics: boolean;
    uniqueClicks: boolean;
    geolocation: boolean;
    deviceTracking: boolean;
    browserTracking: boolean;
    sourceTracking: boolean;
    realTimeTracking: boolean;
    peakHours: boolean;
    advancedExport: boolean;
    customLinks: boolean;
    customQRCodes: boolean;
    comparativeStats: boolean;
    automatedReports: boolean;
    apiAccess: boolean;
    webhooks: boolean;
    multiDomains: boolean;
    whiteLabel: boolean;
    predictiveAnalytics: boolean;
    dedicatedSupport: boolean;
    slaGuarantee: boolean;
    accountManager: boolean;
  };
}

export const planConfigs: Record<PlanType, PlanConfig> = {
  starter: {
    name: 'Starter',
    type: 'starter',
    price: 0,
    stripePriceId: undefined,
    maxLinks: 1,
    features: {
      linkShortening: true,
      basicAnalytics: true,
      uniqueClicks: false,
      geolocation: false,
      deviceTracking: false,
      browserTracking: false,
      sourceTracking: false,
      realTimeTracking: false,
      peakHours: false,
      advancedExport: false,
      customLinks: false,
      customQRCodes: false,
      comparativeStats: false,
      automatedReports: false,
      apiAccess: false,
      webhooks: false,
      multiDomains: false,
      whiteLabel: false,
      predictiveAnalytics: false,
      dedicatedSupport: false,
      slaGuarantee: false,
      accountManager: false,
    }
  },
  pro: {
    name: 'Pro',
    type: 'pro',
    price: 19,
    maxLinks: 5,
    features: {
      linkShortening: true,
      basicAnalytics: true,
      uniqueClicks: true,
      geolocation: true,
      deviceTracking: true,
      browserTracking: true,
      sourceTracking: true,
      realTimeTracking: false,
      peakHours: false,
      advancedExport: false,
      customLinks: false,
      customQRCodes: false,
      comparativeStats: false,
      automatedReports: false,
      apiAccess: false,
      webhooks: false,
      multiDomains: false,
      whiteLabel: false,
      predictiveAnalytics: false,
      dedicatedSupport: false,
      slaGuarantee: false,
      accountManager: false,
    }
  },
  business: {
    name: 'Business',
    type: 'business',
    price: 25,
    stripePriceId: 'price_business_monthly_test',
    maxLinks: 15,
    features: {
      linkShortening: true,
      basicAnalytics: true,
      uniqueClicks: true,
      geolocation: true,
      deviceTracking: true,
      browserTracking: true,
      sourceTracking: true,
      realTimeTracking: true,
      peakHours: true,
      advancedExport: true,
      customLinks: true,
      customQRCodes: true,
      comparativeStats: true,
      automatedReports: true,
      apiAccess: false,
      webhooks: false,
      multiDomains: false,
      whiteLabel: false,
      predictiveAnalytics: false,
      dedicatedSupport: false,
      slaGuarantee: false,
      accountManager: false,
    }
  },
  enterprise: {
    name: 'Enterprise',
    type: 'enterprise',
    price: 49,
    maxLinks: 25,
    features: {
      linkShortening: true,
      basicAnalytics: true,
      uniqueClicks: true,
      geolocation: true,
      deviceTracking: true,
      browserTracking: true,
      sourceTracking: true,
      realTimeTracking: true,
      peakHours: true,
      advancedExport: true,
      customLinks: true,
      customQRCodes: true,
      comparativeStats: true,
      automatedReports: true,
      apiAccess: true,
      webhooks: true,
      multiDomains: true,
      whiteLabel: true,
      predictiveAnalytics: true,
      dedicatedSupport: true,
      slaGuarantee: true,
      accountManager: true,
    }
  }
};

export const getPlanConfig = (planType: PlanType): PlanConfig => {
  return planConfigs[planType];
};

export const hasFeature = (planType: PlanType, feature: keyof PlanConfig['features']): boolean => {
  return planConfigs[planType].features[feature];
};
