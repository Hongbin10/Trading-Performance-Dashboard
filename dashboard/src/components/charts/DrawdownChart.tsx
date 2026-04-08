import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import type { DailyPerformance } from '../../types'
import { CHART_COLORS } from '../../theme'

interface Props {
  data:    DailyPerformance[]
  height?: number
}

export default function DrawdownChart({ data, height = 240 }: Props) {
  const option = useMemo(() => {
    const strategies = [...new Set(data.map((d) => d.strategy))]
    const byStrategy = Object.fromEntries(
      strategies.map((s) => [s, data.filter((d) => d.strategy === s)])
    )

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#161b22',
        borderColor: '#21262d',
        textStyle: { color: '#e6edf3', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 },
        formatter: (params: any[]) => {
          const lines = params.map(
            (p: any) => `<span style="color:${p.color}">● ${p.seriesName}</span>: -${Number(p.value).toFixed(2)}%`
          )
          return `<div style="font-size:11px">${params[0]?.axisValue}<br/>${lines.join('<br/>')}</div>`
        },
      },
      legend: { data: strategies, textStyle: { color: '#8b949e', fontSize: 12 }, bottom: 0 },
      grid: { top: 8, left: 16, right: 16, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category',
        data: byStrategy[strategies[0]]?.map((d) => d.perfDate) ?? [],
        axisLabel: { color: '#8b949e', fontSize: 11, fontFamily: '"IBM Plex Mono", monospace' },
        axisLine: { lineStyle: { color: '#21262d' } },
        splitLine: { show: false },
      },
      yAxis: {
        type: 'value',
        // No inverse — data is already positive, flip visually via negation below
        axisLabel: {
          color: '#8b949e', fontSize: 11, fontFamily: '"IBM Plex Mono", monospace',
          formatter: (v: number) => `-${Math.abs(v).toFixed(0)}%`,
        },
        splitLine: { lineStyle: { color: '#21262d', type: 'dashed' } },
      },
      series: strategies.map((s, i) => ({
        name: s,
        type: 'line',
        // Negate so downward movement looks like a valley
        data: byStrategy[s].map((d) => -Math.abs(d.drawdownPct)),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: CHART_COLORS[i % CHART_COLORS.length] },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'transparent' },
              { offset: 1, color: CHART_COLORS[i % CHART_COLORS.length] + '44' },
            ],
          },
        },
      })),
    }
  }, [data])

  return <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
}
