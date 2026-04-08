# Trade Data Pipeline

Generates simulated multi-asset trading data and writes it to PostgreSQL.
This is **Project ③** in the Trading Dashboard ecosystem — it feeds the database
that both the FastAPI backend and C# API read from.

## What it generates

| Table | Contents |
|---|---|
| `assets` | 18 instruments across equity, futures, forex |
| `strategies` | 5 strategies with distinct return profiles |
| `trades` | ~50,000 individual trade records over 2 years |
| `daily_performance` | Daily PnL, cumulative PnL, drawdown per strategy |
| `strategy_metrics` | Sharpe, Sortino, max drawdown, win rate, profit factor |

## Metrics calculated

- **PnL** — realised profit/loss per trade and daily aggregate
- **Sharpe Ratio** — annualised: `√252 × mean(excess_return) / std(excess_return)`
- **Sortino Ratio** — like Sharpe but uses downside deviation only
- **Max Drawdown** — peak-to-trough decline as a percentage
- **Win Rate** — fraction of trades with positive PnL
- **Profit Factor** — gross profit / gross loss

## Setup

```bash
# 1. Create PostgreSQL database
createdb trading_db

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure connection
cp .env.example .env
# edit .env with your DB credentials

# 4. Run
python generate_data.py
```

## Re-running

The script drops and recreates all tables on each run (clean slate).
To add new data without wiping, comment out `create_schema(conn)` in `main()`.

## queries.sql

Pre-written SQL queries ready to be used by the FastAPI / C# backend:
- Strategy metrics list (AG-Grid table)
- Daily equity curves (ECharts line chart)
- Asset class breakdown (ECharts heatmap/bar)
- Trade detail log (AG-Grid with filter/sort)
- Rolling 30-day Sharpe (ECharts)
- Monthly PnL summary (calendar heatmap)
