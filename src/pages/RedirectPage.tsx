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
        if (userAgent.includes('Edg/')) browser = 'Microsoft Edge';
        else if (userAgent.includes('Chrome') && !userAgent.includes('Edg/')) browser = 'Google Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Mozilla Firefox';
        else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
        else if (userAgent.includes('Opera')) browser = 'Opera';
        else if (userAgent.includes('Brave')) browser = 'Brave';

        // Détecter l'OS
        let osName = 'Unknown';
        let osVersion = null;
        
        if (userAgent.includes('Windows NT 10.0')) {
          osName = 'Windows 10';
          osVersion = '10.0';
        } else if (userAgent.includes('Windows NT 6.3')) {
          osName = 'Windows 8.1';
          osVersion = '8.1';
        } else if (userAgent.includes('Windows NT 6.2')) {
          osName = 'Windows 8';
          osVersion = '8.0';
        } else if (userAgent.includes('Windows NT 6.1')) {
          osName = 'Windows 7';
          osVersion = '7.0';
        } else if (userAgent.includes('Windows')) {
          osName = 'Windows';
        } else if (userAgent.includes('Mac OS X')) {
          osName = 'macOS';
          const macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
          if (macMatch) {
            osVersion = macMatch[1].replace(/_/g, '.');
          }
        } else if (userAgent.includes('iPhone')) {
          osName = 'iOS';
          const iosMatch = userAgent.match(/OS ([\d_]+)/);
          if (iosMatch) {
            osVersion = iosMatch[1].replace(/_/g, '.');
          }
        } else if (userAgent.includes('iPad')) {
          osName = 'iPadOS';
          const iosMatch = userAgent.match(/OS ([\d_]+)/);
          if (iosMatch) {
            osVersion = iosMatch[1].replace(/_/g, '.');
          }
        } else if (userAgent.includes('Android')) {
          osName = 'Android';
          const androidMatch = userAgent.match(/Android ([\d.]+)/);
          if (androidMatch) {
            osVersion = androidMatch[1];
          }
        } else if (userAgent.includes('Linux')) {
          osName = 'Linux';
        } else if (userAgent.includes('Ubuntu')) {
          osName = 'Ubuntu';
        } else if (userAgent.includes('CrOS')) {
          osName = 'Chrome OS';
        }

        // Détecter le type d'appareil
        let device = 'desktop';
        if (/Mobile|Android|iPhone/.test(userAgent)) {
          device = 'mobile';
        } else if (/Tablet|iPad/.test(userAgent)) {
          device = 'tablet';
        }

        // Obtenir l'IP et la géolocalisation (via une API externe)
        let geoData = {
          country_code: null,
          country_name: 'Unknown',
          region: null,
          city: null,
          latitude: null,
          longitude: null,
          timezone: null
        };
        let userIp = null;

        try {
          const ipResponse = await fetch('https://ipapi.co/json/');
          const ipData = await ipResponse.json();
          geoData = {
            country_code: ipData.country_code || null,
            country_name: ipData.country_name || 'Unknown',
            region: ipData.region || null,
            city: ipData.city || null,
            latitude: ipData.latitude || null,
            longitude: ipData.longitude || null,
            timezone: ipData.timezone || null
          };
          userIp = ipData.ip || null; // Récupérer l'IP
        } catch (err) {
          console.warn('Impossible de récupérer la géolocalisation:', err);
        }

        // Générer ou récupérer un session_id persistant pour ce visiteur
        let sessionId = localStorage.getItem('clicktracker_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('clicktracker_session_id', sessionId);
          // Expire après 30 minutes d'inactivité
          localStorage.setItem('clicktracker_session_expires', (Date.now() + 30 * 60 * 1000).toString());
        } else {
          // Vérifier si la session a expiré
          const expiresTime = parseInt(localStorage.getItem('clicktracker_session_expires') || '0');
          if (Date.now() > expiresTime) {
            // Session expirée, en créer une nouvelle
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('clicktracker_session_id', sessionId);
          }
          // Étendre l'expiration de 30 minutes
          localStorage.setItem('clicktracker_session_expires', (Date.now() + 30 * 60 * 1000).toString());
        }

        // Enregistrer le clic avec la structure complète de votre BD
        const clickData = {
          link_id: link.id,
          ip_address: userIp, // IP récupérée via l'API
          user_agent: userAgent,
          referer: referrer,
          
          // Géolocalisation
          country_code: geoData.country_code,
          country_name: geoData.country_name,
          region: geoData.region,
          city: geoData.city,
          latitude: geoData.latitude,
          longitude: geoData.longitude,
          timezone: geoData.timezone,
          
          // Informations appareil/navigateur
          browser_name: browser,
          browser_version: null, // Peut être extrait plus tard si besoin
          os_name: osName,
          os_version: osVersion,
          device_type: device,
          device_brand: null,
          device_model: null,
          
          // Session et bot detection
          session_id: sessionId,
          is_unique_visitor: true, // Sera calculé plus tard
          is_bot: /bot|crawler|spider|crawling/i.test(userAgent),
          
          // UTM (à extraire des paramètres URL si présents)
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          utm_term: null,
          utm_content: null,
          
          // Timestamp
          clicked_at: new Date().toISOString(),
          
          // Données brutes pour analyses futures
          raw_data: {
            full_user_agent: userAgent,
            referrer_full: referrer,
            timestamp: Date.now()
          }
        };

        console.log('📊 Enregistrement du clic:', clickData);

        // Insérer dans la table clicks
        const { error: clickError } = await supabase.from('clicks').insert([clickData]);
        
        if (clickError) {
          console.error('Erreur enregistrement clic:', clickError);
        } else {
          console.log('✅ Clic enregistré avec succès');
        }

        // Rediriger immédiatement vers l'URL originale
        // Les stats seront mises à jour en temps réel via Realtime
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
