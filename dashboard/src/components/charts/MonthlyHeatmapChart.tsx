import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, VisualMapComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { MonthlyPnl } from '../../types'
import { useThemeMode } from '../../context/ThemeContext'

echarts.use([HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, CanvasRenderer])

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface Props {
  data: MonthlyPnl[]
  height?: number
}

export default function MonthlyHeatmapChart({ data, height = 280 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const chart = useRef<echarts.ECharts | null>(null)
  const { mode } = useThemeMode()   

  useEffect(() => {
    if (!ref.current || !data.length) return

    chart.current?.dispose()
    chart.current = echarts.init(ref.current)

    const years = [...new Set(data.map(d => d.month.slice(0, 4)))].sort()

    const lookup: Record<string, number> = {}
    for (const d of data) {
      lookup[d.month.slice(0, 7)] = Math.round(d.monthlyPnl)
    }

    const matrix: [number, number, number | null][] = []
    for (let yi = 0; yi < years.length; yi++) {
      for (let mi = 0; mi < 12; mi++) {
        const key = `${years[yi]}-${String(mi + 1).padStart(2, '0')}`
        const val = key in lookup ? lookup[key] : null
        matrix.push([mi, yi, val])
      }
    }

    const realVals = data.map(d => Math.abs(d.monthlyPnl))
    const maxAbs = Math.max(...realVals, 1)

    // 根据主题动态设置颜色
    const isDark = mode === 'dark'
    const labelColor = isDark ? '#ffffff' : '#1f2328'
    const textShadowColor = isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.7)'
    const bg = isDark ? '#161b22' : '#ffffff'
    const nullBg = isDark ? '#1c2128' : '#f0f2f5'
    const axisClr = isDark ? '#8b949e' : '#6e7781'
    const tooltipBg = isDark ? '#22272e' : '#ffffff'
    const tooltipBorder = isDark ? '#444c56' : '#d0d7de'

    chart.current.setOption({
      backgroundColor: 'transparent',

      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: { 
          color: labelColor, 
          fontSize: 13, 
          fontFamily: '"IBM Plex Mono", monospace' 
        },
        formatter: (p: any) => {
          const [mi, yi, val] = p.value
          if (val === null) return `${years[yi]} ${MONTHS[mi]}<br/>No data`
          const fmt = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD', 
            maximumFractionDigits: 0 
          })
          return `<b>${years[yi]} ${MONTHS[mi]}</b><br/>${val >= 0 ? '+' : ''}${fmt.format(val)}`
        },
      },

      grid: { top: 8, bottom: 28, left: 44, right: 8 },

      xAxis: {
        type: 'category',
        data: MONTHS,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: axisClr, 
          fontSize: 12, 
          fontFamily: '"IBM Plex Mono", monospace' 
        },
      },

      yAxis: {
        type: 'category',
        data: years,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { 
          color: axisClr, 
          fontSize: 12, 
          fontFamily: '"IBM Plex Mono", monospace' 
        },
      },

      visualMap: {
        show: false,
        min: -maxAbs,
        max: maxAbs,
        inRange: {
          color: isDark 
            ? ['#7f1d1d', '#991b1b', '#dc2626', bg, '#16a34a', '#15803d', '#14532d']
            : ['#fee2e2', '#fca5a5', '#ef4444', '#ffffff', '#4ade80', '#22c55e', '#15803d'],
        },
      },

      series: [{
        type: 'heatmap',
        data: matrix,
        itemStyle: {
          borderColor: bg,
          borderWidth: 3,
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            borderColor: '#58a6ff',
            borderWidth: 2,
          },
        },
        label: {
          show: true,
          fontFamily: '"IBM Plex Mono", monospace',
          fontSize: 14,
          fontWeight: 500,
          color: labelColor,                   
          textShadowBlur: isDark ? 2 : 0,
          textShadowColor: textShadowColor,    
          formatter: (p: any) => {
            const v = p.value[2]
            if (v === null || v === 0) return ''
            if (Math.abs(v) >= 100000) return `${v >= 0 ? '+' : ''}${(v / 1000).toFixed(0)}k`
            if (Math.abs(v) >= 1000)   return `${v >= 0 ? '+' : ''}${(v / 1000).toFixed(0)}k`
            return `${v >= 0 ? '+' : ''}${v}`
          },
        },
      },
      // null cells overlay
      {
        type: 'heatmap',
        data: matrix.filter(m => m[2] === null).map(m => [m[0], m[1], 0]),
        itemStyle: {
          color: nullBg,
          borderColor: bg,
          borderWidth: 3,
          borderRadius: 4,
        },
        emphasis: { disabled: true },
        label: { show: false },
        silent: true,
        z: 0,
      }],
    })

    const ro = new ResizeObserver(() => chart.current?.resize())
    ro.observe(ref.current)

    return () => {
      ro.disconnect()
      chart.current?.dispose()
      chart.current = null
    }
  }, [data, mode])   

  if (!data.length) return null

  return <div ref={ref} style={{ width: '100%', height }} />
}