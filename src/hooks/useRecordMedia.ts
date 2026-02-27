import { useState, useEffect, useCallback } from 'react'
import type { RecordMedia } from '@/types'
import * as api from '@/lib/api'

export function useRecordMedia(recordId: string | undefined) {
  const [media, setMedia] = useState<RecordMedia[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!recordId) return
    setLoading(true)
    try {
      const data = await api.fetchRecordMedia(recordId)
      setMedia(data)
    } catch {
      // silent fail - media list may just be empty
    } finally {
      setLoading(false)
    }
  }, [recordId])

  useEffect(() => {
    load()
  }, [load])

  return { media, loading, reload: load }
}
