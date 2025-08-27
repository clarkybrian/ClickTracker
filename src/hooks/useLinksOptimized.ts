import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../types';

export const useLinksOptimized = (userId: string | undefined) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limite gratuite : 1 lien
  const FREE_LINK_LIMIT = 1;

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Utiliser la vue optimisée links_with_stats
      const { data, error: fetchError } = await supabase
        .from('links_with_stats')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Ajouter l'URL complète à chaque lien
      const linksWithFullUrl = (data || []).map(link => ({
        ...link,
        full_short_url: `${window.location.origin}/r/${link.short_code}`,
        is_private: false // Valeur par défaut
      }));

      setLinks(linksWithFullUrl);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des liens:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
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
        full_short_url: `${window.location.origin}/r/${data.short_code}`,
        total_clicks: 0,
        unique_clicks: 0
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
      setLinks(prevLinks => prevLinks.filter(link => link.id !== linkId));
    }

    return !error;
  };

  const toggleLinkStatus = async (linkId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: isActive })
      .eq('id', linkId);

    if (!error) {
      updateLink(linkId, { is_active: isActive });
    }

    return !error;
  };

  // Vérifier si l'utilisateur a atteint sa limite
  const hasReachedLimit = links.length >= FREE_LINK_LIMIT;

  return {
    links,
    loading,
    error,
    hasReachedLimit,
    createLink,
    deleteLink,
    toggleLinkStatus,
    refetch: fetchLinks,
    addLink,
    updateLink
  };
};
