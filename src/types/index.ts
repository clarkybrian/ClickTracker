export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  dailyLinksCount: number;
  lastLinkDate: string;
  createdAt: string;
}

export interface Link {
  id: string;
  userId: string;
  originalUrl: string;
  shortCode: string;
  customAlias?: string;
  title?: string;
  totalClicks: number;
  createdAt: string;
  isActive: boolean;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: string;
  country?: string;
  device?: string;
  browser?: string;
  referrer?: string;
  ipAddress: string;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksByCountry: Record<string, number>;
  clicksByDevice: Record<string, number>;
  clicksByDate: Record<string, number>;
}