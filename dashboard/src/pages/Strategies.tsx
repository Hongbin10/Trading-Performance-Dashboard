import { Box, Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import MetricCard from '../components/common/MetricCard'
import SectionHeader from '../components/common/SectionHeader'
import StrategyMetricsGrid from '../components/tables/StrategyMetricsGrid'
import EquityCurveChart from '../components/charts/EquityCurveChart'
import DrawdownChart from '../components/charts/DrawdownChart'
import { useStrategyMetrics } from '../hooks/useStrategies'
import { useEquityCurves } from '../hooks/usePerformance'

export default function Strategies() {
  const [selected, setSelected] = useState<string>('all')
  const { data: metrics, loading: mLoading } = useStrategyMetrics()
  const { data: curves,  loading: cLoading  } = useEquityCurves(selected === 'all' ? undefined : selected)

  const active = selected === 'all' ? null : metrics.find((m) => m.strategyName === selected)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h3" sx={{ flex: 1 }}>Strategies</Typography>
        <Select
          size="small"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="all">All strategies</MenuItem>
          {metrics.map((m) => (
            <MenuItem key={m.strategyId} value={m.strategyName}>{m.strategyName}</MenuItem>
          ))}
        </Select>
      </Box>

      {/* Per-strategy KPI row (shown only when a strategy is selected) */}
      {active && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total PnL',    value: `$${active.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 0 })}`, isPnl: true },
            { label: 'Sharpe',       value: active.sharpeRatio.toFixed(4)   },
            { label: 'Sortino',      value: active.sortinoRatio.toFixed(4)  },
            { label: 'Max DD%',      value: `${active.maxDrawdownPct.toFixed(2)}%` },
            { label: 'Win Rate',     value: `${active.winRatePct.toFixed(2)}%`     },
            { label: 'Profit Factor',value: active.profitFactor.toFixed(4)  },
          ].map(({ label, value, isPnl }) => (
            <Grid item xs={6} sm={4} md={2} key={label}>
              <MetricCard label={label} value={value} isPnl={isPnl} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Equity curve */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader title="Equity curves" />
          {cLoading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
            : <EquityCurveChart data={curves} />}
        </CardContent>
      </Card>

      {/* Drawdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader title="Drawdown" />
          {cLoading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
            : <DrawdownChart data={curves} />}
        </CardContent>
      </Card>

      {/* Full metrics table */}
      <Card>
        <CardContent>
          <SectionHeader title="All strategy metrics" />
          <StrategyMetricsGrid data={metrics} loading={mLoading} />
        </CardContent>
      </Card>
    </Box>
  )
}
