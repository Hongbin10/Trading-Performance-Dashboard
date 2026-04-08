-- ============================================================
-- queries.sql
-- Ready-to-use queries for the FastAPI / C# backend
-- ============================================================


-- ── 1. All strategies with their summary metrics ─────────────────────────────
-- Used by: Dashboard strategy list table (AG-Grid)

SELECT
    s.name                  AS strategy,
    sm.total_pnl,
    sm.sharpe_ratio,
    sm.sortino_ratio,
    ROUND(sm.max_drawdown * 100, 2)  AS max_drawdown_pct,
    ROUND(sm.win_rate * 100, 2)      AS win_rate_pct,
    sm.profit_factor,
    sm.total_trades
FROM strategies s
JOIN strategy_metrics sm ON sm.strategy_id = s.id
ORDER BY sm.sharpe_ratio DESC;


-- ── 2. Daily cumulative PnL per strategy (equity curve) ─────────────────────
-- Used by: ECharts equity curve line chart

SELECT
    s.name           AS strategy,
    dp.perf_date,
    dp.cumulative_pnl,
    dp.daily_return,
    ROUND(dp.drawdown * 100, 4) AS drawdown_pct
FROM daily_performance dp
JOIN strategies s ON s.id = dp.strategy_id
ORDER BY s.name, dp.perf_date;


-- ── 3. Daily PnL by asset class (for heatmap / bar chart) ───────────────────
-- Used by: ECharts heatmap, asset class breakdown bar

SELECT
    t.trade_date,
    a.asset_class,
    SUM(t.pnl)   AS total_pnl,
    COUNT(*)     AS trade_count,
    ROUND(AVG(t.return_pct) * 100, 4) AS avg_return_pct
FROM trades t
JOIN assets a ON a.id = t.asset_id
GROUP BY t.trade_date, a.asset_class
ORDER BY t.trade_date, a.asset_class;


-- ── 4. Individual trade detail (filterable, for AG-Grid) ────────────────────
-- Used by: AG-Grid trade log table with sort/filter/group

SELECT
    t.trade_date,
    s.name          AS strategy,
    a.symbol,
    a.asset_class,
    t.direction,
    t.entry_price,
    t.exit_price,
    t.quantity,
    ROUND(t.pnl, 2)         AS pnl,
    ROUND(t.return_pct * 100, 4) AS return_pct
FROM trades t
JOIN strategies s ON s.id = t.strategy_id
JOIN assets     a ON a.id = t.asset_id
-- WHERE s.name = 'MomentumAlpha'          -- optional: filter by strategy
-- AND   a.asset_class = 'equity'          -- optional: filter by class
-- AND   t.trade_date BETWEEN '2024-01-01' AND '2024-03-31'
ORDER BY t.trade_date DESC, t.pnl DESC;


-- ── 5. Rolling 30-day Sharpe per strategy ───────────────────────────────────
-- Used by: ECharts rolling metrics line chart

SELECT
    s.name      AS strategy,
    dp.perf_date,
    ROUND(
        SQRT(252) *
        AVG(dp.daily_return)  OVER w /
        NULLIF(STDDEV(dp.daily_return) OVER w, 0),
    4) AS rolling_sharpe_30d
FROM daily_performance dp
JOIN strategies s ON s.id = dp.strategy_id
WINDOW w AS (PARTITION BY dp.strategy_id ORDER BY dp.perf_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW)
ORDER BY s.name, dp.perf_date;


-- ── 6. Win/loss breakdown by asset class per strategy ───────────────────────
-- Used by: ECharts grouped bar chart

SELECT
    s.name          AS strategy,
    a.asset_class,
    COUNT(*)                                    AS total_trades,
    SUM(CASE WHEN t.pnl > 0 THEN 1 ELSE 0 END) AS wins,
    SUM(CASE WHEN t.pnl < 0 THEN 1 ELSE 0 END) AS losses,
    ROUND(SUM(CASE WHEN t.pnl > 0 THEN 1.0 ELSE 0 END) / COUNT(*) * 100, 2) AS win_rate_pct,
    ROUND(SUM(t.pnl), 2)                        AS total_pnl
FROM trades t
JOIN strategies s ON s.id = t.strategy_id
JOIN assets     a ON a.id = t.asset_id
GROUP BY s.name, a.asset_class
ORDER BY s.name, total_pnl DESC;


-- ── 7. Worst drawdown periods per strategy ──────────────────────────────────
-- Used by: Drawdown chart / risk analysis section

SELECT
    s.name      AS strategy,
    dp.perf_date,
    ROUND(dp.drawdown * 100, 2) AS drawdown_pct,
    dp.cumulative_pnl
FROM daily_performance dp
JOIN strategies s ON s.id = dp.strategy_id
ORDER BY s.name, dp.perf_date;


-- ── 8. Monthly PnL summary ──────────────────────────────────────────────────
-- Used by: Monthly calendar heatmap / summary table

SELECT
    s.name                              AS strategy,
    DATE_TRUNC('month', dp.perf_date)   AS month,
    ROUND(SUM(dp.daily_pnl), 2)         AS monthly_pnl,
    SUM(dp.trade_count)                 AS total_trades,
    ROUND(AVG(dp.daily_return) * 100 * 21, 4) AS approx_monthly_return_pct
FROM daily_performance dp
JOIN strategies s ON s.id = dp.strategy_id
GROUP BY s.name, DATE_TRUNC('month', dp.perf_date)
ORDER BY s.name, month;
