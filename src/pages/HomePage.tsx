import React from 'react';
import { HeroSection } from '../components/Hero/HeroSection';
import { FeaturesCarousel } from '../components/Features/FeaturesCarousel';
import { ProcessAnimation } from '../components/Process/ProcessAnimation';
import { AnalyticsDemo } from '../components/Analytics/AnalyticsDemo';
import { PricingSection } from '../components/Pricing/PricingSection';
import { LinkShortener } from '../components/LinkShortener/LinkShortener';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLinkCreated = () => {
    if (user) {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      {/* Hero Section with impressive visuals */}
      <HeroSection />
      
      {/* Link Shortener Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Essayez <span className="gradient-text">Maintenant</span>
            </h2>
            <p className="text-xl text-gray-600">
              Raccourcissez votre premier lien et découvrez la puissance de nos analytics
            </p>
          </div>
          <LinkShortener onLinkCreated={handleLinkCreated} />
        </div>
      </div>

      {/* Process Animation */}
      <ProcessAnimation />

      {/* Features Carousel */}
      <FeaturesCarousel />

      {/* Analytics Demo */}
      <AnalyticsDemo />

      {/* Pricing Section */}
      <PricingSection />
    </div>
  );
};
