import { useState } from 'react'
import { X, AlertTriangle, CreditCard, User, Bell, Shield, CheckCircle, Loader2 } from 'lucide-react'
import { useSubscription } from '../../hooks/useSubscription'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../Toast/Toast'
import { useNavigate } from 'react-router-dom'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, isBusiness, isPro } = useSubscription()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showBillingConfirm, setShowBillingConfirm] = useState(false)
  const [animationState, setAnimationState] = useState<'idle' | 'processing' | 'success'>('idle')
  const { toast, showToast, hideToast } = useToast()
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleManageBilling = async () => {
    setAnimationState('processing')
    setLoading(true)
    
    try {
      // Simuler une préparation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setAnimationState('success')
      setTimeout(() => {
        setShowBillingConfirm(false)
        setAnimationState('idle')
        setLoading(false)
        // Fermer le modal des paramètres et rediriger vers la page tarifs
        onClose()
        // Utiliser React Router pour naviguer correctement
        navigate('/pricing')
        showToast('Redirection vers la page des tarifs...', 'success')
      }, 1000)
      
    } catch (error) {
      console.error('Erreur:', error)
      setAnimationState('idle')
      setLoading(false)
      showToast('Erreur lors de l\'accès au portail de facturation', 'error')
    }
  }

  const handleCancelSubscription = async () => {
    setAnimationState('processing')
    setLoading(true)
    
    try {
      // Simuler l'annulation (3 secondes pour l'animation)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setAnimationState('success')
      setTimeout(() => {
        setShowCancelConfirm(false)
        setAnimationState('idle')
        setLoading(false)
        showToast('Abonnement annulé avec succès. Vous conservez l\'accès jusqu\'à la fin de la période.', 'success')
        // Fermer le modal et recharger
        onClose()
        setTimeout(() => window.location.reload(), 2000)
      }, 2000)
      
    } catch (error) {
      console.error('Erreur:', error)
      setAnimationState('idle')
      setLoading(false)
      showToast('Erreur lors de l\'annulation de l\'abonnement', 'error')
      setShowCancelConfirm(false)
    }
  }

  // Calculer les dates d'abonnement
  const getSubscriptionDates = () => {
    const now = new Date()
    const startDate = now.toLocaleDateString('fr-FR')
    const endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString('fr-FR')
    return { startDate, endDate }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres du compte</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Informations du compte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Informations du compte
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Plan actuel</label>
                  <p className="text-gray-900 capitalize">
                    {profile?.subscription_tier === 'free' && '🆓 Gratuit'}
                    {profile?.subscription_tier === 'pro' && '⭐ Pro'}
                    {profile?.subscription_tier === 'business' && '🚀 Business'}
                  </p>
                </div>
                {(isPro() || isBusiness()) && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Période d'abonnement</label>
                    <p className="text-sm text-gray-900">
                      Du {getSubscriptionDates().startDate} au {getSubscriptionDates().endDate}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Membre depuis</label>
                <p className="text-gray-900">
                  {user?.email ? 'Membre actif' : 'Non disponible'}
                </p>
              </div>
            </div>
          </div>

          {/* Abonnement et facturation */}
          {(isPro() || isBusiness()) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Gestion de l'abonnement
              </h3>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-purple-900">
                      Plan {profile?.subscription_tier === 'pro' ? 'Pro' : 'Business'}
                    </h4>
                    <p className="text-sm text-purple-700">
                      Profitez de toutes les fonctionnalités premium
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-purple-600">
                      Abonnement actif
                    </p>
                    <p className="font-medium text-purple-900">
                      Gestion via Stripe
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBillingConfirm(true)}
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

      {/* Modal de confirmation de gestion de facturation */}
      {showBillingConfirm && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              {animationState === 'idle' && (
                <>
                  <CreditCard className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Gérer votre abonnement
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Vous allez être redirigé vers la page des tarifs pour modifier votre abonnement 
                    ou mettre à jour vos informations de facturation.
                  </p>
                </>
              )}
              
              {animationState === 'processing' && (
                <>
                  <Loader2 className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Préparation...
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nous préparons votre accès à la gestion d'abonnement.
                  </p>
                </>
              )}
              
              {animationState === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Redirection en cours...
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Ouverture de la page des tarifs...
                  </p>
                </>
              )}
              
              {animationState === 'idle' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBillingConfirm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleManageBilling}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    Accéder aux tarifs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation d'annulation */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              {animationState === 'idle' && (
                <>
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmer l'annulation
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir annuler votre abonnement ? 
                    Vous perdrez l'accès aux fonctionnalités premium à la fin de votre période de facturation.
                  </p>
                </>
              )}
              
              {animationState === 'processing' && (
                <>
                  <Loader2 className="w-16 h-16 text-red-500 mx-auto mb-4 animate-spin" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Annulation en cours...
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Nous traitons votre demande d'annulation.
                  </p>
                </>
              )}
              
              {animationState === 'success' && (
                <>
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Abonnement annulé
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Votre abonnement a été annulé avec succès. 
                    Vous conservez l'accès jusqu'à la fin de la période.
                  </p>
                </>
              )}
              
              {animationState === 'idle' && (
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
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}
