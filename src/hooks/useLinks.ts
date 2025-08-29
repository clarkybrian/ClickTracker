import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../types';

export const useLinks = (userId: string | undefined, userTier: 'free' | 'pro' | 'business' = 'free') => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limites par niveau d'abonnement
  const FREE_LINK_LIMIT = 1;
  const PRO_LINK_LIMIT = 100;
  const BUSINESS_LINK_LIMIT = 1000;

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('links')
        .select(`
          id,
          user_id,
          original_url,
          short_code,
          title,
          description,
          is_active,
          created_at,
          updated_at,
          expires_at,
          password_protected,
          password_hash,
          utm_source,
          utm_medium,
          utm_campaign,
          is_private,
          tracking_enabled
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Pour chaque lien, récupérer les statistiques de clics depuis la table clicks
      const linksWithStats = await Promise.all((data || []).map(async (link) => {
        // Compter le nombre total de clics pour ce lien
        const { count: totalClicks } = await supabase
          .from('clicks')
          .select('*', { count: 'exact', head: true })
          .eq('link_id', link.id);

        // Compter les clics uniques (par session_id ou par IP si session_id n'existe pas)
        const { data: uniqueClicksData } = await supabase
          .from('clicks')
          .select('ip_address')
          .eq('link_id', link.id);

        // Calculer les visiteurs uniques basé sur l'IP
        const uniqueIPs = new Set(uniqueClicksData?.map(click => click.ip_address) || []);
        const uniqueClicks = uniqueIPs.size;

        return {
          ...link,
          full_short_url: `${window.location.origin}/r/${link.short_code}`,
          total_clicks: totalClicks || 0,
          unique_clicks: uniqueClicks,
          is_private: link.is_private || false, // Utiliser la valeur de la BD ou false par défaut
          tracking_enabled: link.tracking_enabled !== undefined ? link.tracking_enabled : true // Utiliser la valeur de la BD ou true par défaut
        };
      }));

      setLinks(linksWithStats);
      setError(null);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des liens:', err);
      setError('Erreur lors du chargement des liens');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const addLink = (newLink: Link) => {
    setLinks(prevLinks => [newLink, ...prevLinks]);
  };

  const updateLink = (linkId: string, updates: Partial<Link>) => {
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId ? { ...link, ...updates } : link
      )
    );
  };

  useEffect(() => {
    fetchLinks();
  }, [userId, fetchLinks]);

  const createLink = async (originalUrl: string, customAlias?: string) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('links')
      .insert([{
        user_id: userId,
        original_url: originalUrl,
        short_code: customAlias || generateShortCode(),
      }])
      .select()
      .single();

    if (!error && data) {
      const linkWithFullUrl = {
        ...data,
        full_short_url: `${window.location.origin}/r/${data.short_code}`
      };
      addLink(linkWithFullUrl);
      return linkWithFullUrl;
    }
    return null;
  };

  const generateShortCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const deleteLink = async (linkId: string) => {
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId);

    if (!error) {
      setLinks(prev => prev.filter(link => link.id !== linkId));
    }
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: isActive })
      .eq('id', linkId);

    if (!error) {
      updateLink(linkId, { is_active: isActive });
    }
  };

  // Vérifier si l'utilisateur a atteint la limite de son abonnement
  const hasReachedLimit = () => {
    if (userTier === 'pro') {
      return links.length >= PRO_LINK_LIMIT;
    } else if (userTier === 'business') {
      return links.length >= BUSINESS_LINK_LIMIT;
    } else {
      return links.length >= FREE_LINK_LIMIT;
    }
  };

  // Obtenir le nombre de liens restants selon l'abonnement
  const getRemainingLinks = () => {
    if (userTier === 'pro') {
      return Math.max(0, PRO_LINK_LIMIT - links.length);
    } else if (userTier === 'business') {
      return Math.max(0, BUSINESS_LINK_LIMIT - links.length);
    } else {
      return Math.max(0, FREE_LINK_LIMIT - links.length);
    }
  };

  return {
    links,
    loading,
    error,
    createLink,
    deleteLink,
    toggleLinkStatus,
    addLink,
    updateLink,
    refetch: fetchLinks,
    hasReachedLimit: hasReachedLimit(),
    remainingLinks: getRemainingLinks(),
    currentTier: userTier
  };
};