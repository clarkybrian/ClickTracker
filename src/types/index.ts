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
  user_id: string;
  original_url: string;
  short_code: string;
  full_short_url: string;
  title?: string;
  description?: string;
  total_clicks?: number;  // Optional car pas encore dans la DB
  unique_clicks?: number; // Optional car pas encore dans la DB
  is_active: boolean;
  is_private?: boolean;   // Optional car pas encore dans la DB
  created_at: string;
  updated_at: string;
  last_clicked_at?: string;
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