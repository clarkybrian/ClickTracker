import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from '../types';

export const useLinks = (userId: string | undefined) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLinks = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLinks(data);
    }
    setLoading(false);
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
        custom_alias: customAlias,
      }])
      .select()
      .single();

    if (!error && data) {
      setLinks(prev => [data, ...prev]);
      return data;
    }
    return null;
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
      setLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, is_active: isActive } : link
      ));
    }
  };

  return {
    links,
    loading,
    createLink,
    deleteLink,
    toggleLinkStatus,
    refetch: fetchLinks,
  };
};