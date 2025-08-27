import { supabase } from './supabase';

export interface DashboardStats {
  total_links: number;
  total_clicks: number;
  unique_visitors: number;
  clicks_today: number;
  clicks_this_week: number;
  clicks_this_month: number;
}

export interface LinkWithStats {
  id: string;
  original_url: string;
  short_code: string;
  full_short_url: string;
  title?: string;
  total_clicks: number;
  unique_clicks: number;
  last_clicked_at?: string;
  created_at: string;
  is_active: boolean;
  campaign_id?: string;
  campaign_name?: string;
}

export interface RecentActivity {
  id: string;
  link_code: string;
  country_name: string;
  clicked_at: string;
  browser_name?: string;
  device_type?: string;
}

export class AnalyticsService {
  /**
   * Récupère les statistiques globales de l'utilisateur
   */
  static async getUserStats(userId: string): Promise<DashboardStats> {
    try {
      // Requête pour les statistiques globales
      const { data, error } = await supabase.rpc('get_user_dashboard_stats', {
        user_id: userId
      });

      if (error) {
        console.error('Erreur lors de la récupération des stats:', error);
        // Retourner des valeurs par défaut en cas d'erreur
        return {
          total_links: 0,
          total_clicks: 0,
          unique_visitors: 0,
          clicks_today: 0,
          clicks_this_week: 0,
          clicks_this_month: 0
        };
      }

      return data || {
        total_links: 0,
        total_clicks: 0,
        unique_visitors: 0,
        clicks_today: 0,
        clicks_this_week: 0,
        clicks_this_month: 0
      };
    } catch (error) {
      console.error('Erreur service analytics:', error);
      return {
        total_links: 0,
        total_clicks: 0,
        unique_visitors: 0,
        clicks_today: 0,
        clicks_this_week: 0,
        clicks_this_month: 0
      };
    }
  }

  /**
   * Récupère les liens de l'utilisateur avec leurs statistiques
   */
  static async getUserLinks(userId: string, limit = 10): Promise<LinkWithStats[]> {
    try {
      const { data, error } = await supabase
        .from('link_stats')
        .select(`
          id,
          short_code,
          original_url,
          title,
          is_active,
          created_at,
          total_clicks,
          unique_clicks,
          last_clicked_at,
          campaign_id,
          campaigns!inner(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération des liens:', error);
        return [];
      }

      return (data || []).map(link => ({
        ...link,
        full_short_url: `https://clicktracker.app/${link.short_code}`, // À adapter selon votre domaine
        campaign_name: 'Campagne par défaut' // Simplifié pour l'instant
      }));
    } catch (error) {
      console.error('Erreur service liens:', error);
      return [];
    }
  }

  /**
   * Récupère l'activité récente
   */
  static async getRecentActivity(userId: string, limit = 10): Promise<RecentActivity[]> {
    try {
      const { data, error } = await supabase
        .from('clicks')
        .select(`
          id,
          clicked_at,
          country_name,
          browser_name,
          device_type,
          links!inner(
            short_code,
            user_id
          )
        `)
        .eq('links.user_id', userId)
        .order('clicked_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erreur lors de la récupération de l\'activité:', error);
        return [];
      }

      return (data || []).map(activity => ({
        id: activity.id,
        link_code: 'code-link', // Simplifié pour l'instant
        country_name: activity.country_name || 'Inconnu',
        clicked_at: activity.clicked_at,
        browser_name: activity.browser_name,
        device_type: activity.device_type
      }));
    } catch (error) {
      console.error('Erreur service activité:', error);
      return [];
    }
  }

  /**
   * Crée un nouveau lien raccourci
   */
  static async createLink(userId: string, originalUrl: string, customCode?: string, title?: string): Promise<LinkWithStats> {
    try {
      // Générer un code court si pas fourni
      const shortCode = customCode || this.generateShortCode();

      // Vérifier si le code est disponible
      if (customCode) {
        const { data: existing } = await supabase
          .from('links')
          .select('id')
          .eq('short_code', customCode)
          .single();

        if (existing) {
          throw new Error('Ce code court est déjà utilisé');
        }
      }

      // Créer le lien
      const { data, error } = await supabase
        .from('links')
        .insert({
          user_id: userId,
          original_url: originalUrl,
          short_code: shortCode,
          title: title || null
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        full_short_url: `https://clicktracker.app/${data.short_code}`,
        total_clicks: 0,
        unique_clicks: 0
      };
    } catch (error) {
      console.error('Erreur lors de la création du lien:', error);
      throw error;
    }
  }

  /**
   * Supprime un lien
   */
  static async deleteLink(linkId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du lien:', error);
      throw error;
    }
  }

  /**
   * Active/désactive un lien
   */
  static async toggleLinkStatus(linkId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('links')
        .update({ is_active: isActive })
        .eq('id', linkId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }

  /**
   * Génère un code court aléatoire
   */
  private static generateShortCode(length = 6): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  /**
   * Récupère les données pour les graphiques analytics
   */
  static async getAnalyticsData(userId: string, period = '30d') {
    try {
      const { data, error } = await supabase.rpc('get_analytics_chart_data', {
        user_id: userId,
        period_days: parseInt(period.replace('d', ''))
      });

      if (error) {
        console.error('Erreur analytics:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur service analytics data:', error);
      return null;
    }
  }

  /**
   * Récupère les top referers
   */
  static async getTopReferers(userId: string, limit = 5) {
    try {
      const { data } = await supabase
        .from('top_referers')
        .select('*')
        .eq('user_id', userId)
        .order('clicks', { ascending: false })
        .limit(limit);

      return data || [];
    } catch (error) {
      console.error('Erreur top referers:', error);
      return [];
    }
  }

  /**
   * Exporte les données en CSV
   */
  static async exportData(userId: string, format = 'csv') {
    try {
      const links = await this.getUserLinks(userId, 1000);
      
      if (format === 'csv') {
        const csvContent = this.convertToCSV(links);
        this.downloadCSV(csvContent, 'clicktracker-export.csv');
      }
    } catch (error) {
      console.error('Erreur export:', error);
      throw error;
    }
  }

  private static convertToCSV(data: LinkWithStats[]): string {
    const headers = ['Code Court', 'URL Originale', 'Titre', 'Clics Totaux', 'Clics Uniques', 'Créé le', 'Statut'];
    const rows = data.map(link => [
      link.short_code,
      link.original_url,
      link.title || '',
      link.total_clicks,
      link.unique_clicks,
      new Date(link.created_at).toLocaleDateString('fr-FR'),
      link.is_active ? 'Actif' : 'Inactif'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private static downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  }
}

// Fonctions SQL à ajouter dans Supabase pour supporter ce service
export const SQL_FUNCTIONS = `
-- Fonction pour récupérer les stats du dashboard
CREATE OR REPLACE FUNCTION get_user_dashboard_stats(user_id UUID)
RETURNS TABLE (
  total_links BIGINT,
  total_clicks BIGINT,
  unique_visitors BIGINT,
  clicks_today BIGINT,
  clicks_this_week BIGINT,
  clicks_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total des liens
    (SELECT COUNT(*) FROM links WHERE links.user_id = get_user_dashboard_stats.user_id) as total_links,
    
    -- Total des clics
    (SELECT COUNT(*) 
     FROM clicks c JOIN links l ON c.link_id = l.id 
     WHERE l.user_id = get_user_dashboard_stats.user_id) as total_clicks,
    
    -- Visiteurs uniques
    (SELECT COUNT(DISTINCT c.session_id) 
     FROM clicks c JOIN links l ON c.link_id = l.id 
     WHERE l.user_id = get_user_dashboard_stats.user_id) as unique_visitors,
    
    -- Clics aujourd'hui
    (SELECT COUNT(*) 
     FROM clicks c JOIN links l ON c.link_id = l.id 
     WHERE l.user_id = get_user_dashboard_stats.user_id 
     AND DATE(c.clicked_at) = CURRENT_DATE) as clicks_today,
    
    -- Clics cette semaine
    (SELECT COUNT(*) 
     FROM clicks c JOIN links l ON c.link_id = l.id 
     WHERE l.user_id = get_user_dashboard_stats.user_id 
     AND c.clicked_at >= DATE_TRUNC('week', CURRENT_DATE)) as clicks_this_week,
    
    -- Clics ce mois
    (SELECT COUNT(*) 
     FROM clicks c JOIN links l ON c.link_id = l.id 
     WHERE l.user_id = get_user_dashboard_stats.user_id 
     AND c.clicked_at >= DATE_TRUNC('month', CURRENT_DATE)) as clicks_this_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour les données de graphiques
CREATE OR REPLACE FUNCTION get_analytics_chart_data(user_id UUID, period_days INTEGER DEFAULT 30)
RETURNS TABLE (
  date DATE,
  clicks BIGINT,
  unique_visitors BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(c.clicked_at) as date,
    COUNT(*) as clicks,
    COUNT(DISTINCT c.session_id) as unique_visitors
  FROM clicks c 
  JOIN links l ON c.link_id = l.id 
  WHERE l.user_id = get_analytics_chart_data.user_id
  AND c.clicked_at >= CURRENT_DATE - INTERVAL '%s days'
  GROUP BY DATE(c.clicked_at)
  ORDER BY date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
