# Trading Dashboard — React + MUI Frontend

**Project ①** — the main Dashboard UI.
Consumes the Python FastAPI (port 8000) or C# API (port 5000) interchangeably.

## Tech stack

| Concern       | Library              | Version  |
|---------------|----------------------|----------|
| UI framework  | React + TypeScript   | 18 / 5   |
| Component lib | MUI v5               | 5.16     |
| Data tables   | AG-Grid Community    | 31       |
| Charts        | ECharts + echarts-for-react | 5.5 |
| HTTP client   | Axios                | 1.7      |
| Routing       | React Router v6      | 6.26     |
| Build tool    | Vite                 | 5.4      |

## Project structure

```
src/
├── main.tsx              # Entry: fonts, ThemeProvider, CssBaseline
├── App.tsx               # BrowserRouter + Routes
├── theme/index.ts        # MUI dark theme, pnlColor helper, CHART_COLORS
├── types/index.ts        # TypeScript interfaces (mirrors C# DTOs)
├── api/
│   ├── client.ts         # Axios instance
│   ├── strategies.ts     # /api/strategies
│   ├── trades.ts         # /api/trades
│   └── performance.ts    # /api/performance
├── hooks/
│   ├── useStrategies.ts  # data-fetching hook
│   ├── useTrades.ts      # paginated + filterable
│   └── usePerformance.ts # equity curves, monthly PnL
├── components/
│   ├── layout/           # AppShell, Sidebar, TopBar
│   ├── charts/           # EquityCurveChart, DrawdownChart (ECharts)
│   ├── tables/           # StrategyMetricsGrid, TradeLogGrid (AG-Grid)
│   └── common/           # MetricCard, SectionHeader
└── pages/
    ├── Overview.tsx       # KPIs + equity curve + metrics table
    ├── Strategies.tsx     # per-strategy drilldown
    ├── TradeLog.tsx       # filterable trade log (AG-Grid)
    └── Performance.tsx    # equity curve + drawdown charts
```

## Getting started

```bash
npm install
npm run dev
# → http://localhost:5173
```

## Switching between backends

In `vite.config.ts`, change the proxy target:
```ts
// Python FastAPI
target: 'http://localhost:8000'

// C# ASP.NET Core
target: 'http://localhost:5000'
```

## Pages

| Route          | Description |
|----------------|-------------|
| `/`            | Overview: 6 KPI cards, equity curve, strategy metrics table |
| `/strategies`  | Per-strategy drilldown with selector, equity + drawdown |
| `/trades`      | Filterable trade log — strategy / class / direction / date |
| `/performance` | Full-size equity curve and drawdown charts |
