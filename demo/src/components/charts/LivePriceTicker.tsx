import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

const MARKET_OVERVIEW = [
  'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT', 'OANDA:USD_JPY',
  'OANDA:BCO_USD',   'OANDA:XAU_USD',   'OANDA:EUR_USD',
]
const EQUITIES = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'META', 'GOOGL']
const ALL_SYMBOLS = [...MARKET_OVERVIEW, ...EQUITIES]

const DISPLAY_NAMES: Record<string, string> = {
  'BINANCE:BTCUSDT': 'BTC/USD',
  'BINANCE:ETHUSDT': 'ETH/USD',
  'OANDA:USD_JPY':   'USD/JPY',
  'OANDA:BCO_USD':   'Brent Oil',
  'OANDA:XAU_USD':   'Gold',
  'OANDA:EUR_USD':   'EUR/USD',
  'AAPL': 'AAPL', 'MSFT': 'MSFT', 'NVDA': 'NVDA',
  'AMZN': 'AMZN', 'META': 'META', 'GOOGL': 'GOOGL',
}

const MOCK_PRICES: Record<string, number> = {
  'BINANCE:BTCUSDT': 82450,
  'BINANCE:ETHUSDT': 1820.4,
  'OANDA:USD_JPY':   149.82,
  'OANDA:BCO_USD':    74.61,
  'OANDA:XAU_USD':  3050.9,
  'OANDA:EUR_USD':    1.0842,
  'AAPL':  172.34, 'MSFT':  378.92, 'NVDA':  108.46,
  'AMZN':  185.23, 'META':  512.18, 'GOOGL': 155.74,
}

const DECIMALS: Record<string, number> = {
  'BINANCE:BTCUSDT': 0, 'BINANCE:ETHUSDT': 1,
  'OANDA:XAU_USD': 1,   'OANDA:EUR_USD': 4,
  'OANDA:USD_JPY': 2,   'OANDA:BCO_USD': 2,
}
const getDec = (s: string) => DECIMALS[s] ?? 2

// ── Price card ─────────────────────────────────────────────────────────────────
function PriceCard({ symbol, price }: { symbol: string; price: number | undefined }) {
  const prevRef = useRef<number | undefined>(undefined)
  const openRef = useRef<number | undefined>(undefined)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (price === undefined) return
    if (openRef.current === undefined) openRef.current = price
    if (prevRef.current !== undefined && price !== prevRef.current) {
      setFlash(price > prevRef.current ? 'up' : 'down')
      const t = setTimeout(() => setFlash(null), 500)
      prevRef.current = price
      return () => clearTimeout(t)
    }
    prevRef.current = price
  }, [price])

  const open   = openRef.current
  const dec    = getDec(symbol)
  const change = price != null && open != null ? price - open : undefined
  const pct    = change != null && open ? (change / open) * 100 : undefined
  const isUp   = change != null && change >= 0
  const clr    = change == null ? '#8b949e' : isUp ? '#3fb950' : '#f85149'
  const bg     = flash === 'up' ? 'rgba(63,185,80,0.12)' : flash === 'down' ? 'rgba(248,81,73,0.12)' : 'background.paper'

  return (
    <Card sx={{ height: '100%', transition: 'background 0.25s', bgcolor: bg }}>
      <CardContent sx={{ p: '10px 14px !important' }}>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px', color: 'text.secondary', mb: 0.5 }}>
          {DISPLAY_NAMES[symbol] ?? symbol}
        </Typography>
        <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '1.05rem', fontWeight: 600, color: flash ? clr : 'text.primary', transition: 'color 0.25s', lineHeight: 1.2 }}>
          {price != null ? price.toFixed(dec) : '—'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {change != null ? (
            <>
              <Typography sx={{ fontSize: '12px', color: clr, lineHeight: 1 }}>{isUp ? '▲' : '▼'}</Typography>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: clr, fontWeight: 500 }}>
                {Math.abs(pct!).toFixed(2)}%
              </Typography>
              <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '12px', color: 'text.secondary' }}>
                ({isUp ? '+' : ''}{change.toFixed(dec)})
              </Typography>
            </>
          ) : (
            <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>awaiting tick</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

function GroupLabel({ text }: { text: string }) {
  return (
    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
      {text}
    </Typography>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function LivePriceTicker() {
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [isLive, setIsLive] = useState(false)

  const KEY = import.meta.env.VITE_FINNHUB_KEY as string | undefined

  // Live mode — Finnhub REST polling
  useEffect(() => {
    if (!KEY) return

    setIsLive(true)

    const fetchAll = async () => {
      await Promise.allSettled(
        ALL_SYMBOLS.map(async (sym) => {
          try {
            const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${KEY}`)
            const d = await r.json()
            if (d.c) setPrices(prev => ({ ...prev, [sym]: d.c }))
          } catch {}
        })
      )
    }

    fetchAll()
    const t = setInterval(fetchAll, 15_000)   // every 15s — stays within free tier
    return () => clearInterval(t)
  }, [KEY])

  // Demo mode — mock prices with slight random walk
  useEffect(() => {
    if (KEY) return

    setPrices({ ...MOCK_PRICES })

    const t = setInterval(() => {
      setPrices(prev => {
        const next = { ...prev }
        for (const sym of ALL_SYMBOLS) {
          next[sym] = parseFloat((next[sym] * (1 + (Math.random() - 0.5) * 0.0015)).toFixed(getDec(sym)))
        }
        return next
      })
    }, 1500)

    return () => clearInterval(t)
  }, [KEY])

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Typography variant="h3">Live Prices</Typography>
        <Chip
          size="small"
          label={isLive ? 'Live · Finnhub' : 'Demo mode'}
          sx={{
            fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.7rem',
            bgcolor: isLive ? 'rgba(63,185,80,0.12)' : 'rgba(139,148,158,0.12)',
            color:   isLive ? '#3fb950' : '#8b949e',
            border:  `1px solid ${isLive ? 'rgba(63,185,80,0.3)' : 'rgba(139,148,158,0.3)'}`,
          }}
        />
        {isLive && (
          <Typography sx={{ ml: 'auto', fontSize: '12px', fontFamily: '"IBM Plex Mono", monospace', color: 'text.secondary' }}>
            Finnhub • Equities: 15 min delay • FX & Crypto: real-time
          </Typography>
        )}
        {!isLive && (
          <Typography sx={{ ml: 'auto', fontSize: '12px', fontFamily: '"IBM Plex Mono", monospace', color: 'text.secondary' }}>
            Simulated prices · real-time data via Finnhub WebSocket in full version
          </Typography>
        )}
      </Box>

      <GroupLabel text="Market overview" />
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {MARKET_OVERVIEW.map(sym => (
          <Grid item xs={6} sm={4} md={2} key={sym}>
            <PriceCard symbol={sym} price={prices[sym]} />
          </Grid>
        ))}
      </Grid>

      <GroupLabel text="Key equities" />
      <Grid container spacing={1.5}>
        {EQUITIES.map(sym => (
          <Grid item xs={6} sm={4} md={2} key={sym}>
            <PriceCard symbol={sym} price={prices[sym]} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
