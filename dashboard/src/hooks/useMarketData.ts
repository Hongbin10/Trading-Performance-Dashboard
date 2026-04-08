import { useEffect, useRef, useState } from 'react'

export interface PriceUpdate {
  symbol:    string
  price:     number
  timestamp: number
}

// Map of symbol -> latest price
export type PriceMap = Record<string, PriceUpdate>

const WS_URL = `ws://${window.location.host}/api/market/ws`

export function useMarketData(symbols: string[]) {
  const [prices, setPrices] = useState<PriceMap>({})
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (symbols.length === 0) return

    const connect = () => {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
      }

      ws.onmessage = (e) => {
        try {
          const update: PriceUpdate = JSON.parse(e.data)
          // Only update if we care about this symbol
          if (symbols.includes(update.symbol)) {
            setPrices((prev) => ({ ...prev, [update.symbol]: update }))
          }
        } catch { /* ignore parse errors */ }
      }

      ws.onclose = () => {
        setConnected(false)
        // Reconnect after 3 seconds
        setTimeout(connect, 3_000)
      }

      ws.onerror = () => ws.close()
    }

    connect()

    return () => {
      wsRef.current?.close()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(',')])

  return { prices, connected }
}
