import ReactECharts from 'echarts-for-react'
import type { AssetClassBreakdown } from '../../types'

interface Props { data: AssetClassBreakdown[] }

const CLASS_COLORS: Record<string, string> = {
  equity:  '#f0a500',
  futures: '#4fc3f7',
  forex:   '#4caf82',
}

export default function AssetBreakdownChart({ data }: Props) {
  // Aggregate total PnL per asset class
  const totals = data.reduce<Record<string, number>>((acc, row) => {
    acc[row.assetClass] = (acc[row.assetClass] ?? 0) + row.totalPnl
    return acc
  }, {})

  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1])

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0e1420',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e8eaf0', fontFamily: 'IBM Plex Mono', fontSize: 12 },
    },
    grid: { top: 16, right: 16, bottom: 40, left: 80 },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#7b8499', fontFamily: 'IBM Plex Mono', fontSize: 11,
                   formatter: (v: number) => `$${(v/1000).toFixed(0)}k` },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
    },
    yAxis: {
      type: 'category',
      data: entries.map(([k]) => k),
      axisLabel: { color: '#e8eaf0', fontFamily: 'IBM Plex Mono', fontSize: 12 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    series: [{
      type: 'bar',
      barMaxWidth: 28,
      data: entries.map(([k, v]) => ({
        value: v.toFixed(2),
        itemStyle: { color: CLASS_COLORS[k] ?? '#888', borderRadius: [0, 3, 3, 0] },
      })),
      label: {
        show: true, position: 'right',
        formatter: (p: any) => `$${(Number(p.value)/1000).toFixed(1)}k`,
        textStyle: { fontFamily: 'IBM Plex Mono', fontSize: 11, color: '#7b8499' },
      },
    }],
  }

  return <ReactECharts option={option} style={{ height: 180 }} notMerge />
}
