// pages/[shortCode].tsx ou app/[shortCode]/page.tsx
// Route de redirection principale pour Next.js

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../src/lib/supabase';

interface ClickData {
  link_id: string;
  ip_address: string;
  user_agent: string;
  referer?: string;
  session_id: string;
  country_code?: string;
  country_name?: string;
  city?: string;
  browser_name?: string;
  os_name?: string;
  device_type?: string;
  is_bot: boolean;
}

/**
 * Gère la redirection des liens courts
 * Cette fonction est appelée à chaque clic sur un lien raccourci
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { shortCode } = req.query;

  try {
    // 1. Récupérer le lien depuis la base de données
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('*')
      .eq('short_code', shortCode)
      .eq('is_active', true)
      .single();

    // Vérifier si le lien existe
    if (linkError || !link) {
      return res.status(404).json({ 
        error: 'Lien non trouvé',
        code: 'LINK_NOT_FOUND'
      });
    }

    // Vérifier si le lien a expiré
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return res.status(410).json({ 
        error: 'Lien expiré',
        code: 'LINK_EXPIRED'
      });
    }

    // 2. Collecter les données de tracking
    const clickData: ClickData = {
      link_id: link.id,
      ip_address: getClientIP(req),
      user_agent: req.headers['user-agent'] || '',
      referer: req.headers.referer,
      session_id: generateSessionId(req),
      is_bot: detectBot(req.headers['user-agent'] || '')
    };

    // 3. Enrichir les données si possible (géolocalisation, parsing user agent)
    try {
      const enrichedData = await enrichClickData(clickData);
      Object.assign(clickData, enrichedData);
    } catch (enrichError) {
      console.warn('Erreur enrichissement données:', enrichError);
      // Continue sans les données enrichies
    }

    // 4. Sauvegarder le clic en arrière-plan (fire and forget)
    supabase
      .from('clicks')
      .insert(clickData)
      .then(({ error }) => {
        if (error) {
          console.error('Erreur sauvegarde clic:', error);
        }
      });

    // 5. Redirection immédiate vers l'URL originale
    res.redirect(302, link.original_url);

  } catch (error) {
    console.error('Erreur lors de la redirection:', error);
    
    // En cas d'erreur, rediriger vers une page d'erreur ou l'accueil
    res.redirect(302, process.env.NEXT_PUBLIC_APP_DOMAIN || 'https://clicktracker.app');
  }
}

/**
 * Extrait l'adresse IP réelle du client
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  if (typeof realIP === 'string') {
    return realIP;
  }
  
  return req.socket.remoteAddress || '127.0.0.1';
}

/**
 * Génère un ID de session unique basé sur IP + User Agent
 */
function generateSessionId(req: NextApiRequest): string {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const today = new Date().toISOString().split('T')[0]; // Date du jour
  
  // Combiner IP + UA + Date pour créer un ID de session quotidien
  const sessionString = `${ip}-${userAgent}-${today}`;
  
  // Créer un hash simple (pour production, utilisez crypto.createHash)
  return Buffer.from(sessionString).toString('base64').slice(0, 16);
}

/**
 * Détecte si la requête vient d'un bot
 */
function detectBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /spider/i,
    /crawler/i,
    /curl/i,
    /wget/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegrambot/i
  ];
  
  return botPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Enrichit les données de clic avec géolocalisation et parsing UA
 */
async function enrichClickData(clickData: ClickData): Promise<Partial<ClickData>> {
  const enriched: Partial<ClickData> = {};
  
  try {
    // Géolocalisation (exemple avec ipapi.co)
    if (process.env.GEOIP_API_KEY && clickData.ip_address !== '127.0.0.1') {
      const geoResponse = await fetch(
        `https://ipapi.co/${clickData.ip_address}/json/?key=${process.env.GEOIP_API_KEY}`
      );
      
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        enriched.country_code = geoData.country_code;
        enriched.country_name = geoData.country_name;
        enriched.city = geoData.city;
      }
    }
    
    // Parsing User Agent simple
    const userAgent = clickData.user_agent.toLowerCase();
    
    // Détection navigateur
    if (userAgent.includes('chrome')) {
      enriched.browser_name = 'Chrome';
    } else if (userAgent.includes('firefox')) {
      enriched.browser_name = 'Firefox';
    } else if (userAgent.includes('safari')) {
      enriched.browser_name = 'Safari';
    } else if (userAgent.includes('edge')) {
      enriched.browser_name = 'Edge';
    }
    
    // Détection OS
    if (userAgent.includes('windows')) {
      enriched.os_name = 'Windows';
    } else if (userAgent.includes('mac')) {
      enriched.os_name = 'macOS';
    } else if (userAgent.includes('linux')) {
      enriched.os_name = 'Linux';
    } else if (userAgent.includes('android')) {
      enriched.os_name = 'Android';
    } else if (userAgent.includes('ios')) {
      enriched.os_name = 'iOS';
    }
    
    // Détection type d'appareil
    if (userAgent.includes('mobile')) {
      enriched.device_type = 'mobile';
    } else if (userAgent.includes('tablet')) {
      enriched.device_type = 'tablet';
    } else {
      enriched.device_type = 'desktop';
    }
    
  } catch (error) {
    console.warn('Erreur enrichissement:', error);
  }
  
  return enriched;
}

// Version Edge Function pour Vercel/Supabase
export const config = {
  runtime: 'edge',
};

/*
// Alternative avec Edge Function Supabase
// supabase/functions/redirect/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const url = new URL(req.url)
  const shortCode = url.pathname.split('/').pop()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Logique de redirection identique...
  
  return new Response('', {
    status: 302,
    headers: {
      'Location': originalUrl
    }
  })
})
*/
