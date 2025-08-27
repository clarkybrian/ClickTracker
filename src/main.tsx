import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Update document title and meta tags for PWA
document.title = 'ClickTracker - URL Shortener & Analytics';

const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'Create short links and track clicks with detailed analytics. Perfect for marketers, businesses, and content creators.';
document.head.appendChild(metaDescription);

const metaViewport = document.createElement('meta');
metaViewport.name = 'viewport';
metaViewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
document.head.appendChild(metaViewport);

const linkManifest = document.createElement('link');
linkManifest.rel = 'manifest';
linkManifest.href = '/manifest.json';
document.head.appendChild(linkManifest);

const metaThemeColor = document.createElement('meta');
metaThemeColor.name = 'theme-color';
metaThemeColor.content = '#3B82F6';
document.head.appendChild(metaThemeColor);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);