import { useState } from 'react'
import { ToastType } from '../components/Toast/Toast'

export function useToast() {
  const [toast, setToast] = useState<{
    message: string
    type: ToastType
    isVisible: boolean
  }>({
    message: '',
    type: 'info',
    isVisible: false
  })

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    })
  }

  const hideToast = () => {
    setToast(prev => ({
      ...prev,
      isVisible: false
    }))
  }

  return {
    toast,
    showToast,
    hideToast
  }
}
