import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridReact } from 'ag-grid-react'
import { useMemo } from 'react'
import type { ColDef } from 'ag-grid-community'
import type { StrategyMetrics } from '../../types'

const pnlStyle  = (p: any) => ({ color: p.value > 0 ? '#3fb950' : p.value < 0 ? '#f85149' : '#8b949e', fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' })
const monoStyle = () => ({ fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' })
const fmt    = (d: number) => (p: any) => p.value == null ? '—' : Number(p.value).toFixed(d)
const fmtPct = (p: any) => p.value == null ? '—' : `${Number(p.value).toFixed(2)}%`
const fmtUsd = (p: any) => p.value == null ? '—' : `$${Number(p.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

interface Props { data: StrategyMetrics[]; loading?: boolean }

export default function StrategyMetricsGrid({ data, loading }: Props) {
  const colDefs: ColDef<StrategyMetrics>[] = useMemo(() => [
    { field: 'strategyName',   headerName: 'Strategy',     pinned: 'left', minWidth: 150, flex: 2, cellStyle: () => ({ fontWeight: 600, fontSize: '13px' }) },
    { field: 'totalPnl',       headerName: 'Total PnL',    minWidth: 130,  flex: 1.5, valueFormatter: fmtUsd,  cellStyle: pnlStyle, sort: 'desc' },
    { field: 'sharpeRatio',    headerName: 'Sharpe',       minWidth: 90,   flex: 1,   valueFormatter: fmt(4),  cellStyle: pnlStyle },
    { field: 'sortinoRatio',   headerName: 'Sortino',      minWidth: 90,   flex: 1,   valueFormatter: fmt(4),  cellStyle: pnlStyle },
    { field: 'maxDrawdownPct', headerName: 'Max DD%',      minWidth: 95,   flex: 1,   valueFormatter: fmtPct,  cellStyle: () => ({ color: '#f85149', fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' }) },
    { field: 'winRatePct',     headerName: 'Win Rate',     minWidth: 95,   flex: 1,   valueFormatter: fmtPct,  cellStyle: monoStyle },
    { field: 'profitFactor',   headerName: 'Prof. Factor', minWidth: 110,  flex: 1,   valueFormatter: fmt(4),  cellStyle: pnlStyle },
    { field: 'avgWin',         headerName: 'Avg Win',      minWidth: 110,  flex: 1.2, valueFormatter: fmtUsd,  cellStyle: () => ({ color: '#3fb950', fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' }) },
    { field: 'avgLoss',        headerName: 'Avg Loss',     minWidth: 110,  flex: 1.2, valueFormatter: fmtUsd,  cellStyle: () => ({ color: '#f85149', fontFamily: '"IBM Plex Mono", monospace', fontSize: '13px' }) },
    { field: 'totalTrades',    headerName: 'Trades',       minWidth: 85,   flex: 1,   cellStyle: monoStyle },
  ], [])

  const defaultColDef: ColDef = useMemo(() => ({
    resizable: true, sortable: true, filter: true, cellStyle: monoStyle,
  }), [])

  const height = 48 + data.length * 44 + 2

  return (
    <div className="ag-theme-alpine-dark" style={{ width: '100%', height }}>
      <AgGridReact
        rowData={data}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        loading={loading}
        animateRows
        suppressCellFocus
        rowHeight={44}
        headerHeight={48}
      />
    </div>
  )
}
