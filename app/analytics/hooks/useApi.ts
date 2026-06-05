'use client'

import { useCallback, useState } from 'react'
import { ApiEnvelope } from '../lib/types'

export function useApi<T>(fetcher: () => Promise<ApiEnvelope<T>>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetcher()

      if (res.ok && res.data !== undefined) {
        setData(res.data)
      } else {
        setError(res.error ?? 'Failed to load')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  return { data, loading, error, run }
}
