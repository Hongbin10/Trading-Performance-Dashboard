import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useMarketData } from '../../hooks/useMarketData'

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN', 'META']

interface PriceCardProps {
  symbol: string
  price:  number | undefined
}

function PriceCard({ symbol, price }: PriceCardProps) {
  const prevRef   = useRef<number | undefined>(undefined)
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)

  useEffect(() => {
    if (price === undefined) return
    if (prevRef.current !== undefined) {
      setFlash(price > prevRef.current ? 'up' : 'down')
      const t = setTimeout(() => setFlash(null), 600)
      return () => clearTimeout(t)
    }
    prevRef.current = price
  }, [price])

  // Direction colour
  const colour = flash === 'up' ? '#3fb950' : flash === 'down' ? '#f85149' : 'text.primary'

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'background 0.3s',
        bgcolor: flash === 'up'
          ? 'rgba(63,185,80,0.08)'
          : flash === 'down'
          ? 'rgba(248,81,73,0.08)'
          : 'background.paper',
      }}
    >
      <CardContent sx={{ p: '12px 16px !important' }}>
        <Typography variant="h4" gutterBottom>{symbol}</Typography>
        <Typography
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colour,
            transition: 'color 0.3s',
          }}
        >
          {price !== undefined ? `$${price.toFixed(2)}` : '—'}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function LivePriceTicker() {
  const { prices, connected } = useMarketData(SYMBOLS)

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Typography variant="h3">Live Prices</Typography>
        <Chip
          size="small"
          label={connected ? 'Live' : 'Connecting…'}
          sx={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: '0.7rem',
            bgcolor: connected ? 'rgba(63,185,80,0.12)' : 'rgba(139,148,158,0.12)',
            color:   connected ? '#3fb950' : '#8b949e',
            border:  `1px solid ${connected ? 'rgba(63,185,80,0.3)' : 'rgba(139,148,158,0.3)'}`,
          }}
        />
      </Box>

      {/* Price cards */}
      <Grid container spacing={1.5}>
        {SYMBOLS.map((sym) => (
          <Grid item xs={6} sm={4} md={2} key={sym}>
            <PriceCard symbol={sym} price={prices[sym]?.price} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
