import { useEffect, useState } from 'react'
import { strategiesApi } from '../api/strategies'
import type { StrategyMetrics } from '../types'

export function useStrategyMetrics() {
  const [data, setData]       = useState<StrategyMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    strategiesApi
      .getAllMetrics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}
