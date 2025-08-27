import React from 'react';
import { LinkShortener } from '../components/LinkShortener/LinkShortener';

export const ShortenPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <LinkShortener />
      </div>
    </div>
  );
};
