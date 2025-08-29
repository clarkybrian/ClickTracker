import React, { createContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
  error: null,
});

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erreur de session:', error);
          setError(error.message);
        }
        
        if (isMounted) {
          setSession(session);
          setLoading(false);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération de la session:', err);
        if (isMounted) {
          setError('Erreur de connexion');
          setLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        console.log('Session state change:', event);
        
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setError(null);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setSession(session);
          setError(null);
        } else if (event === 'USER_UPDATED') {
          setSession(session);
        }
        
        setLoading(false);
      }
    );

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, loading, error }}>
      {children}
    </SessionContext.Provider>
  );
};
