import { useEffect, useState } from 'react'
import { performanceApi } from '../api/performance'
import type { DailyPerformance, MonthlyPnl } from '../types'

export function useEquityCurves(strategy?: string) {
  const [data, setData]       = useState<DailyPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    performanceApi
      .getEquityCurves(strategy)
      .then(setData)
      .finally(() => setLoading(false))
  }, [strategy])

  return { data, loading }
}

export function useMonthlyPnl(strategy?: string) {
  const [data, setData]       = useState<MonthlyPnl[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    performanceApi.getMonthly(strategy).then(setData).finally(() => setLoading(false))
  }, [strategy])

  return { data, loading }
}
