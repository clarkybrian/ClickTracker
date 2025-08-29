import { useState } from 'react'
import { X, AlertTriangle, CreditCard, User, Bell, Shield } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { useAuth } from '../../hooks/useAuth'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, isBusiness, isPro } = useSubscription()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  if (!isOpen) return null

  const handleCancelSubscription = async () => {
    setLoading(true)
    
    try {
      // Récupérer l'URL Supabase depuis la configuration
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      // Appel à la fonction Supabase Edge pour annuler l'abonnement
      const response = await fetch(`${supabaseUrl}/functions/v1/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de l\'annulation')
      }

      const result = await response.json()
      
      if (result.success) {
        alert('Votre abonnement a été annulé avec succès. Il restera actif jusqu\'à la fin de la période de facturation.')
        window.location.reload() // Recharger pour mettre à jour l'état
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(`Une erreur est survenue lors de l'annulation de votre abonnement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
      setShowCancelConfirm(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-billing-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création du portail')
      }

      const result = await response.json()
      
      if (result.success && result.url) {
        // Ouvrir le portail de facturation Stripe dans un nouvel onglet
        window.open(result.url, '_blank')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert(`Erreur lors de l'ouverture du portail de facturation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Paramètres du compte</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations du compte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Informations du compte
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Plan actuel</label>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isBusiness() ? 'bg-gradient-to-r from-purple-100 to-red-100 text-purple-800' :
                      isPro() ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {profile?.subscription_tier || 'Free'}
                    </span>
                    {(isBusiness() || isPro()) && (
                      <Shield className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gestion de l'abonnement */}
          {(isBusiness() || isPro()) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                Gestion de l'abonnement
              </h3>
              
              <div className="bg-gradient-to-r from-purple-50 to-red-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Plan {profile?.subscription_tier}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Profitez de toutes les fonctionnalités premium
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={handleManageBilling}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Gérer la facturation
                  </button>
                  
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Annuler l'abonnement
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Bell className="w-5 h-5 mr-2 text-purple-600" />
              Préférences de notification
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-purple-600 mr-3" defaultChecked />
                <span className="text-gray-700">Notifications par email</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-purple-600 mr-3" defaultChecked />
                <span className="text-gray-700">Rapports d'analyse hebdomadaires</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-purple-600 mr-3" />
                <span className="text-gray-700">Alertes de sécurité</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Confirmer l'annulation
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir annuler votre abonnement ? 
                Vous perdrez l'accès aux fonctionnalités premium à la fin de votre période de facturation.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Conserver mon abonnement
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'Annulation...' : 'Oui, annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
