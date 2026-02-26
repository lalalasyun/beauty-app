import { useState, useEffect, useCallback } from 'react'
import type { CustomerWithStats } from '@/types'
import * as api from '@/lib/api'
import { useDebounce } from './useDebounce'

export function useCustomers(initialSearch = '') {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [search, setSearch] = useState(initialSearch)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search)

  const load = useCallback(async (query?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchCustomers(query)
      setCustomers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(debouncedSearch || undefined)
  }, [debouncedSearch, load])

  return { customers, search, setSearch, loading, error, reload: load }
}

export function useCustomer(id: string | undefined) {
  const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchCustomer(id)
      setCustomer(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  return { customer, loading, error, reload: load }
}
