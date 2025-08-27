import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../types';

export const useLinks = (userId: string | undefined) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limite gratuite : 1 lien
  const FREE_LINK_LIMIT = 1;

  const fetchLinks = async () => {
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
          total_clicks,
          unique_clicks,
          is_active,
          is_private,
          created_at,
          updated_at,
          last_clicked_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Ajouter l'URL complète à chaque lien
      const linksWithFullUrl = (data || []).map(link => ({
        ...link,
        full_short_url: `${window.location.origin}/r/${link.short_code}`
      }));

      setLinks(linksWithFullUrl);
      setError(null);
    } catch (err: unknown) {
      console.error('Erreur lors du chargement des liens:', err);
      setError('Erreur lors du chargement des liens');
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

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
  }, [userId]);

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

  // Vérifier si l'utilisateur a atteint la limite gratuite
  const hasReachedFreeLimit = () => {
    return links.length >= FREE_LINK_LIMIT;
  };

  // Obtenir le nombre de liens restants
  const getRemainingLinks = () => {
    return Math.max(0, FREE_LINK_LIMIT - links.length);
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
    hasReachedFreeLimit: hasReachedFreeLimit(),
    remainingLinks: getRemainingLinks(),
    freeLimit: FREE_LINK_LIMIT
  };
};