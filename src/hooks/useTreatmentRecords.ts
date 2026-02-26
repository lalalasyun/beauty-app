import { useState, useEffect, useCallback } from 'react'
import type { TreatmentRecord } from '@/types'
import * as api from '@/lib/api'

export function useTreatmentRecords(customerId: string | undefined) {
  const [records, setRecords] = useState<TreatmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!customerId) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchRecords(customerId)
      setRecords(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    load()
  }, [load])

  return { records, loading, error, reload: load }
}

export function useTreatmentRecord(id: string | undefined) {
  const [record, setRecord] = useState<TreatmentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchRecord(id)
      setRecord(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { record, loading, error, reload: load }
}
