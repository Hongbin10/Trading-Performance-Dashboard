import { useEffect, useState } from 'react'
import { tradesApi } from '../api/trades'
import type { PagedResult, Trade, TradeFilterParams } from '../types'

const EMPTY: PagedResult<Trade> = {
  items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0,
}

export function useTrades(filters: TradeFilterParams) {
  const [data, setData]       = useState<PagedResult<Trade>>(EMPTY)
  const [loading, setLoading] = useState(true)

  // Re-fetch whenever any filter changes
  const key = JSON.stringify(filters)

  useEffect(() => {
    setLoading(true)
    tradesApi
      .getTrades(filters)
      .then(setData)
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return { data, loading }
}
