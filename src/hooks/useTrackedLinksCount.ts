import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useTrackedLinksCount = (userId: string | undefined) => {
  const [trackedLinksCount, setTrackedLinksCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchTrackedLinksCount = async () => {
    if (!userId) {
      setTrackedLinksCount(0)
      setLoading(false)
      return
    }

    try {
      const { count, error } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('tracking_enabled', true)

      if (error) {
        console.error('Error fetching tracked links count:', error)
        return
      }

      setTrackedLinksCount(count || 0)
    } catch (error) {
      console.error('Error in fetchTrackedLinksCount:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrackedLinksCount()
  }, [userId])

  return {
    trackedLinksCount,
    loading,
    refetch: fetchTrackedLinksCount
  }
}
