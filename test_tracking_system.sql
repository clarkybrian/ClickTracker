-- Test Script pour validation du système de tracking
-- À exécuter dans Supabase SQL Editor

-- 1. Créer un utilisateur de test avec plan Pro
INSERT INTO user_profiles (
    id,
    email,
    subscription_tier,
    subscription_status,
    monthly_link_limit,
    monthly_clicks_limit,
    custom_domains_limit
) VALUES (
    'test-user-pro-123',
    'test@clicktracker.pro',
    'pro',
    'active',
    999999,
    999999,
    5
) ON CONFLICT (id) DO UPDATE SET
    subscription_tier = EXCLUDED.subscription_tier,
    subscription_status = EXCLUDED.subscription_status;

-- 2. Créer un lien de test avec fonctionnalités Pro
INSERT INTO links (
    id,
    user_id,
    original_url,
    short_code,
    title,
    description,
    is_active,
    password_protected,
    utm_source,
    utm_medium,
    utm_campaign,
    created_at
) VALUES (
    'test-link-123',
    'test-user-pro-123',
    'https://www.example.com/test-page',
    'test123',
    'Lien de test Pro',
    'Test des fonctionnalités de tracking avancé',
    true,
    false,
    'newsletter',
    'email',
    'test_campaign',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- 3. Simuler des clics avec données variées
INSERT INTO clicks (
    link_id,
    ip_address,
    user_agent,
    referer,
    country_code,
    country_name,
    region,
    city,
    latitude,
    longitude,
    timezone,
    browser_name,
    browser_version,
    os_name,
    device_type,
    session_id,
    is_unique_visitor,
    is_bot,
    utm_source,
    utm_medium,
    utm_campaign,
    clicked_at,
    raw_data
) VALUES 
-- Clic depuis la France
(
    'test-link-123',
    '192.168.1.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'https://google.com',
    'FR',
    'France',
    'Île-de-France',
    'Paris',
    48.8566,
    2.3522,
    'Europe/Paris',
    'Chrome',
    '91.0.4472.124',
    'Windows',
    'desktop',
    'session_001',
    true,
    false,
    'newsletter',
    'email',
    'test_campaign',
    NOW() - INTERVAL '2 hours',
    '{"test": true, "simulation": "desktop_chrome_france"}'
),
-- Clic depuis mobile au Canada
(
    'test-link-123',
    '192.168.1.2',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'https://facebook.com',
    'CA',
    'Canada',
    'Quebec',
    'Montreal',
    45.5017,
    -73.5673,
    'America/Toronto',
    'Safari',
    '14.0',
    'iOS',
    'mobile',
    'session_002',
    true,
    false,
    'social',
    'facebook',
    'test_campaign',
    NOW() - INTERVAL '1 hour',
    '{"test": true, "simulation": "mobile_safari_canada"}'
),
-- Clic depuis tablet en Allemagne
(
    'test-link-123',
    '192.168.1.3',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'https://twitter.com',
    'DE',
    'Germany',
    'Bayern',
    'Munich',
    48.1351,
    11.5820,
    'Europe/Berlin',
    'Safari',
    '14.0',
    'iOS',
    'tablet',
    'session_003',
    true,
    false,
    'social',
    'twitter',
    'test_campaign',
    NOW() - INTERVAL '30 minutes',
    '{"test": true, "simulation": "tablet_safari_germany"}'
),
-- Clic depuis Firefox aux USA
(
    'test-link-123',
    '192.168.1.4',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'https://reddit.com',
    'US',
    'United States',
    'California',
    'San Francisco',
    37.7749,
    -122.4194,
    'America/Los_Angeles',
    'Firefox',
    '89.0',
    'Windows',
    'desktop',
    'session_004',
    true,
    false,
    'organic',
    'search',
    'test_campaign',
    NOW() - INTERVAL '15 minutes',
    '{"test": true, "simulation": "desktop_firefox_usa"}'
),
-- Clic suspect (bot)
(
    'test-link-123',
    '192.168.1.5',
    'Googlebot/2.1 (+http://www.google.com/bot.html)',
    '',
    'US',
    'United States',
    'California',
    'Mountain View',
    37.4419,
    -122.1430,
    'America/Los_Angeles',
    'Googlebot',
    '2.1',
    'Linux',
    'desktop',
    'session_005',
    false,
    true,
    null,
    null,
    null,
    NOW() - INTERVAL '5 minutes',
    '{"test": true, "simulation": "bot_google"}'
);

-- 4. Vérifier les données insérées
SELECT 
    'Test Results' as status,
    (SELECT COUNT(*) FROM user_profiles WHERE email = 'test@clicktracker.pro') as users_created,
    (SELECT COUNT(*) FROM links WHERE short_code = 'test123') as links_created,
    (SELECT COUNT(*) FROM clicks WHERE link_id = 'test-link-123') as clicks_recorded,
    (SELECT COUNT(*) FROM clicks WHERE link_id = 'test-link-123' AND is_bot = false) as human_clicks,
    (SELECT COUNT(DISTINCT country_code) FROM clicks WHERE link_id = 'test-link-123') as countries_count,
    (SELECT COUNT(DISTINCT device_type) FROM clicks WHERE link_id = 'test-link-123') as device_types_count;

-- 5. Afficher les analytics de test
SELECT 
    l.title,
    l.short_code,
    l.original_url,
    COUNT(c.id) as total_clicks,
    COUNT(DISTINCT c.session_id) as unique_visitors,
    COUNT(DISTINCT c.country_code) as countries,
    COUNT(CASE WHEN c.is_bot = false THEN 1 END) as human_clicks,
    COUNT(CASE WHEN c.device_type = 'mobile' THEN 1 END) as mobile_clicks,
    COUNT(CASE WHEN c.device_type = 'desktop' THEN 1 END) as desktop_clicks,
    COUNT(CASE WHEN c.device_type = 'tablet' THEN 1 END) as tablet_clicks
FROM links l
LEFT JOIN clicks c ON l.id = c.link_id
WHERE l.short_code = 'test123'
GROUP BY l.id, l.title, l.short_code, l.original_url;

-- 6. Nettoyer les données de test (optionnel)
-- DELETE FROM clicks WHERE link_id = 'test-link-123';
-- DELETE FROM links WHERE id = 'test-link-123';
-- DELETE FROM user_profiles WHERE id = 'test-user-pro-123';
