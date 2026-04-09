import { Box, Card, CardContent, CircularProgress, MenuItem, Select, Typography } from '@mui/material'
import { useState } from 'react'
import SectionHeader from '../components/common/SectionHeader'
import EquityCurveChart from '../components/charts/EquityCurveChart'
import DrawdownChart from '../components/charts/DrawdownChart'
import { useEquityCurves } from '../hooks/usePerformance'
import { useStrategyMetrics } from '../hooks/useStrategies'

export default function Performance() {
  const [selected, setSelected] = useState<string>('all')
  const { data: metrics } = useStrategyMetrics()
  const { data: curves, loading } = useEquityCurves(selected === 'all' ? undefined : selected)

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Typography variant="h3" sx={{ flex: 1 }}>Performance</Typography>
        <Select size="small" value={selected} onChange={(e) => setSelected(e.target.value)} sx={{ minWidth: 180 }}>
          <MenuItem value="all">All strategies</MenuItem>
          {metrics.map((m) => <MenuItem key={m.strategyId} value={m.strategyName}>{m.strategyName}</MenuItem>)}
        </Select>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <SectionHeader title="Cumulative PnL" />
          {loading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>
            : <EquityCurveChart data={curves} height={360} />}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SectionHeader title="Drawdown" />
          {loading
            ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
            : <DrawdownChart data={curves} height={280} />}
        </CardContent>
      </Card>
    </Box>
  )
}
