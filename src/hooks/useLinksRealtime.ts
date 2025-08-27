import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../types';

export const useLinks = (userId: string | undefined) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limite gratuite : 1 lien
  const FREE_LINK_LIMIT = 1;

  // Fonction pour calculer les statistiques de clics en temps réel
  const getClickStats = async (linkId: string) => {
    try {
      // Compter le total des clics
      const { count: totalClicks } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('link_id', linkId);

      // Compter les visiteurs uniques par IP
      const { data: uniqueClicksData } = await supabase
        .from('clicks')
        .select('ip_address')
        .eq('link_id', linkId);

      const uniqueIPs = new Set(
        uniqueClicksData?.map(click => click.ip_address).filter(Boolean) || []
      );

      // Obtenir le dernier clic
      const { data: lastClickData } = await supabase
        .from('clicks')
        .select('clicked_at')
        .eq('link_id', linkId)
        .order('clicked_at', { ascending: false })
        .limit(1)
        .single();

      return {
        total_clicks: totalClicks || 0,
        unique_clicks: uniqueIPs.size,
        last_clicked_at: lastClickData?.clicked_at || null
      };
    } catch (err) {
      console.error('Erreur calcul statistiques:', err);
      return { total_clicks: 0, unique_clicks: 0, last_clicked_at: null };
    }
  };

  const fetchLinks = useCallback(async () => {
    if (!userId) {
      setLinks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 1. Récupérer tous les liens de l'utilisateur
      const { data: linksData, error: fetchError } = await supabase
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
          updated_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // 2. Pour chaque lien, calculer les statistiques en parallèle
      const linksWithStats = await Promise.all(
        (linksData || []).map(async (link) => {
          const stats = await getClickStats(link.id);
          
          return {
            ...link,
            full_short_url: `${window.location.origin}/r/${link.short_code}`,
            ...stats,
            is_private: false // Valeur par défaut
          };
        })
      );

      setLinks(linksWithStats);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des liens:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fonction pour mettre à jour les stats d'un lien spécifique
  const updateLinkStats = useCallback(async (linkId: string) => {
    const stats = await getClickStats(linkId);
    setLinks(prevLinks =>
      prevLinks.map(link =>
        link.id === linkId ? { ...link, ...stats } : link
      )
    );
  }, []);

  // Configuration du Realtime pour écouter les nouveaux clics
  useEffect(() => {
    if (!userId) return;

    console.log('🔄 Configuration Realtime pour userId:', userId);

    // Channel pour écouter les insertions dans la table clicks
    const clicksChannel = supabase
      .channel('clicks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clicks'
        },
        async (payload) => {
          console.log('🎯 Nouveau clic détecté!', payload);
          
          // Vérifier si le clic concerne un lien de cet utilisateur
          if (payload.new && payload.new.link_id) {
            // Vérifier si le lien appartient à l'utilisateur actuel
            const linkExists = links.find(link => link.id === payload.new.link_id);
            if (linkExists) {
              console.log('🔄 Mise à jour des stats pour le lien:', payload.new.link_id);
              await updateLinkStats(payload.new.link_id);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut Realtime clicks:', status);
      });

    // Nettoyage lors du démontage
    return () => {
      console.log('🧹 Nettoyage channel Realtime');
      supabase.removeChannel(clicksChannel);
    };
  }, [userId, updateLinkStats, links]);

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
  }, [fetchLinks]);

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
    updateLink,
    updateLinkStats // Exposer pour usage externe si nécessaire
  };
};
