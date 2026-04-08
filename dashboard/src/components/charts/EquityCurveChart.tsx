import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import type { DailyPerformance } from '../../types'

interface Props { data: DailyPerformance[]; loading: boolean }

const STRATEGY_COLORS = [
  '#00d4ff', '#00c896', '#ffb020', '#ff4d6a', '#a78bfa',
]

export default function EquityCurveChart({ data, loading }: Props) {
  const option = useMemo(() => {
    // Group data by strategy
    const byStrategy: Record<string, DailyPerformance[]> = {}
    data.forEach(d => {
      if (!byStrategy[d.strategy]) byStrategy[d.strategy] = []
      byStrategy[d.strategy].push(d)
    })

    const strategies = Object.keys(byStrategy)
    const dates = byStrategy[strategies[0]]?.map(d => d.perfDate) ?? []

    const series = strategies.map((name, i) => ({
      name,
      type: 'line',
      data: byStrategy[name].map(d => d.cumulativePnl),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: STRATEGY_COLORS[i % STRATEGY_COLORS.length] },
      itemStyle: { color: STRATEGY_COLORS[i % STRATEGY_COLORS.length] },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: STRATEGY_COLORS[i % STRATEGY_COLORS.length] + '22' },
            { offset: 1, color: STRATEGY_COLORS[i % STRATEGY_COLORS.length] + '00' },
          ],
        },
      },
    }))

    return {
      backgroundColor: 'transparent',
      animation: true,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#141b24',
        borderColor: '#1e2d3d',
        textStyle: { color: '#e2e8f0', fontFamily: 'IBM Plex Sans', fontSize: 12 },
        formatter: (params: any[]) =>
          `<div style="margin-bottom:4px;color:#7c8fa6;font-size:11px">${params[0]?.axisValue}</div>` +
          params.map(p =>
            `<div>${p.marker} ${p.seriesName}: <b style="font-family:IBM Plex Mono">
             $${Number(p.value).toLocaleString('en-GB', { maximumFractionDigits: 0 })}</b></div>`
          ).join(''),
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#7c8fa6', fontFamily: 'IBM Plex Sans', fontSize: 12 },
        inactiveColor: '#3d4f61',
      },
      grid: { top: 16, right: 16, bottom: 48, left: 72, containLabel: false },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#1e2d3d' } },
        axisLabel: {
          color: '#7c8fa6', fontFamily: 'IBM Plex Sans', fontSize: 11,
          formatter: (v: string) => v.slice(0, 7),
          interval: Math.floor(dates.length / 8),
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#7c8fa6', fontFamily: 'IBM Plex Mono', fontSize: 11,
          formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
        },
        splitLine: { lineStyle: { color: '#1e2d3d', type: 'dashed' } },
      },
      series,
    }
  }, [data])

  return (
    <ReactECharts
      option={option}
      showLoading={loading}
      loadingOption={{ color: '#00d4ff', maskColor: 'transparent', text: '' }}
      style={{ height: 320, width: '100%' }}
      notMerge
    />
  )
}
