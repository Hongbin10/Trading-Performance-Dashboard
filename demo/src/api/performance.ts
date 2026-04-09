import client from './client'
import type { AssetClassBreakdown, DailyPerformance, MonthlyPnl } from '../types'

function withParams(base: string, params: Record<string, string | undefined>): string {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => [k, v as string])
  ).toString()
  return qs ? `${base}?${qs}` : base
}

export const performanceApi = {
  getEquityCurves: (strategy?: string) =>
    client
      .get<DailyPerformance[]>(withParams('/api/performance/equity-curve', { strategy }))
      .then((r) => r.data),

  getAssetBreakdown: (strategy?: string, dateFrom?: string, dateTo?: string) =>
    client
      .get<AssetClassBreakdown[]>(withParams('/api/performance/asset-breakdown', { strategy, dateFrom, dateTo }))
      .then((r) => r.data),

  getMonthly: (strategy?: string) =>
    client
      .get<MonthlyPnl[]>(withParams('/api/performance/monthly', { strategy }))
      .then((r) => r.data),
}
