import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader } from 'lucide-react';

export const RedirectPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('Code de lien invalide');
        setLoading(false);
        return;
      }

      try {
        // Récupérer le lien depuis la base de données
        const { data: link, error: fetchError } = await supabase
          .from('links')
          .select('*')
          .eq('short_code', shortCode)
          .eq('is_active', true)
          .single();

        if (fetchError || !link) {
          setError('Lien non trouvé ou inactif');
          setLoading(false);
          return;
        }

        // Collecter les informations de géolocalisation et appareil
        const userAgent = navigator.userAgent;
        const referrer = document.referrer || 'Direct';
        
        // Détecter le navigateur
        let browser = 'Unknown';
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';

        // Détecter le type d'appareil
        let device = 'Desktop';
        if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
          device = 'Mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
          device = 'Tablet';
        }

        // Obtenir l'IP et le pays (via une API externe)
        let country = 'Unknown';
        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();
          country = ipData.country_name || 'Unknown';
        } catch (err) {
          console.warn('Impossible de récupérer la géolocalisation:', err);
        }

        // Enregistrer le clic
        const clickData = {
          link_id: link.id,
          country,
          device,
          browser,
          referrer,
          user_agent: userAgent,
          clicked_at: new Date().toISOString()
        };

        // Insérer dans la table clicks
        await supabase.from('clicks').insert([clickData]);

        // Mettre à jour les compteurs du lien
        const { data: updatedLink } = await supabase
          .from('links')
          .update({
            total_clicks: link.total_clicks + 1,
            last_clicked_at: new Date().toISOString()
          })
          .eq('id', link.id)
          .select()
          .single();

        // Rediriger vers l'URL originale
        window.location.href = link.original_url;

      } catch (err) {
        console.error('Erreur lors de la redirection:', err);
        setError('Erreur lors de la redirection');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Redirection en cours...</h2>
          <p className="text-gray-600">Vous allez être redirigé dans un instant</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lien introuvable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return null;
};
