import client from './client'
import type { PagedResult, Trade, TradeFilterParams } from '../types'

export interface DateRange {
  minDate: string
  maxDate: string
}

export const tradesApi = {
  getTrades: (params: TradeFilterParams) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v != null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString()
    const url = qs ? `/api/trades?${qs}` : '/api/trades'
    return client.get<PagedResult<Trade>>(url).then((r) => r.data)
  },

  getSymbols: () =>
    client.get<string[]>('/api/trades/symbols').then((r) => r.data),

  getDateRange: () =>
    client.get<DateRange>('/api/trades/date-range').then((r) => r.data),
}
