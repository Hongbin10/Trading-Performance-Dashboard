import client from './client'
import type { PagedResult, Trade, TradeFilterParams } from '../types'

export interface DateRange {
  minDate: string
  maxDate: string
}

export const tradesApi = {
  getTrades: (params: TradeFilterParams) =>
    client.get<PagedResult<Trade>>('/api/trades', { params }).then((r) => r.data),

  getSymbols: () =>
    client.get<string[]>('/api/trades/symbols').then((r) => r.data),

  getDateRange: () =>
    client.get<DateRange>('/api/trades/date-range').then((r) => r.data),
}
