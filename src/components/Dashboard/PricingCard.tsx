import React, { useState } from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { redirectToStripeCheckout } from '../../lib/stripe';

export const PricingCard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.email) {
      alert('Vous devez être connecté pour effectuer un upgrade');
      return;
    }

    setLoading(true);
    try {
      await redirectToStripeCheckout('business', user.email);
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la redirection vers Stripe');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Plan</h3>
        <p className="text-gray-600">Upgrade to Premium for unlimited links and advanced analytics</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="text-xl font-semibold text-gray-900">Free</h4>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold text-gray-900">$0</span>
            <span className="text-gray-600 ml-2">/month</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">5 links per day</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Basic click tracking</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">24-hour analytics</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-gray-700">Custom aliases</span>
            </li>
          </ul>

          <button className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-blue-600 rounded-xl p-8 text-white relative">
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold">
              Popular
            </span>
          </div>

          <div className="flex items-center space-x-3 mb-6">
            <Crown className="w-8 h-8 text-yellow-400" />
            <div>
              <h4 className="text-xl font-semibold">Premium</h4>
              <p className="text-blue-100">For power users and businesses</p>
            </div>
          </div>

          <div className="mb-6">
            <span className="text-4xl font-bold">$9.99</span>
            <span className="text-blue-100 ml-2">/month</span>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Unlimited links</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Country & device tracking</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>CSV/Excel export</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Custom domains</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>API access</span>
            </li>
            <li className="flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400" />
              <span>Priority support</span>
            </li>
          </ul>

          <button 
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 px-6 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Chargement...' : 'Upgrade to Premium'}
          </button>
        </div>
      </div>
    </div>
  );
};