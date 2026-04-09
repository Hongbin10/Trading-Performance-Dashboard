"""
Export pipeline data to static JSON for GitHub Pages demo deployment.
Run from data-pipeline/ directory:
    python export_demo_data.py
Output: ../demo/public/data/*.json
"""

import json
import os
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", 5432)),
    "dbname":   os.getenv("DB_NAME", "trading_db"),
    "user":     os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
}

OUTPUT_DIR = Path(__file__).parent.parent / "demo" / "public" / "data"


def get_conn():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


def dump(path: Path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, default=str, separators=(",", ":"))
    size = path.stat().st_size / 1024
    count = len(data) if isinstance(data, list) else "—"
    print(f"  ✓  {path.name}  ({size:.1f} KB,  {count} records)")


def to_float(v):
    return float(v) if v is not None else None


def export_strategies(conn):
    with conn.cursor() as cur:
        cur.execute("SELECT id, name, description FROM strategies ORDER BY name")
        return [dict(r) for r in cur.fetchall()]


def export_metrics(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                sm.strategy_id    AS "strategyId",
                s.name            AS "strategyName",
                ROUND(sm.total_pnl::numeric, 2)            AS "totalPnl",
                ROUND(sm.sharpe_ratio::numeric, 4)         AS "sharpeRatio",
                ROUND(sm.sortino_ratio::numeric, 4)        AS "sortinoRatio",
                ROUND((sm.max_drawdown * 100)::numeric, 2) AS "maxDrawdownPct",
                ROUND((sm.win_rate * 100)::numeric, 2)     AS "winRatePct",
                ROUND(sm.avg_win::numeric, 2)              AS "avgWin",
                ROUND(sm.avg_loss::numeric, 2)             AS "avgLoss",
                ROUND(sm.profit_factor::numeric, 4)        AS "profitFactor",
                sm.total_trades                            AS "totalTrades"
            FROM strategy_metrics sm
            JOIN strategies s ON s.id = sm.strategy_id
            ORDER BY sm.total_pnl DESC
        """)
        metrics = [dict(r) for r in cur.fetchall()]

    # Attach equity history for sparklines
    with conn.cursor() as cur:
        for m in metrics:
            cur.execute("""
                SELECT ROUND(cumulative_pnl::numeric, 2) AS v
                FROM daily_performance
                WHERE strategy_id = %s
                ORDER BY perf_date
            """, (m["strategyId"],))
            m["equityHistory"] = [float(r["v"]) for r in cur.fetchall()]

    # ── Convert Decimal → float, ensure int types ──────────────────────────
    float_keys = ["totalPnl", "sharpeRatio", "sortinoRatio",
                  "maxDrawdownPct", "winRatePct", "avgWin", "avgLoss", "profitFactor"]
    for m in metrics:
        for k in float_keys:
            if k in m and m[k] is not None:
                m[k] = float(m[k])
        m["totalTrades"] = int(m["totalTrades"])
        m["strategyId"]  = int(m["strategyId"])

    return metrics


def export_equity_curves(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                s.name                                     AS "strategy",
                dp.perf_date::text                         AS "perfDate",
                ROUND(dp.daily_pnl::numeric, 2)            AS "dailyPnl",
                ROUND((dp.daily_return * 100)::numeric, 4) AS "dailyReturnPct",
                ROUND(dp.cumulative_pnl::numeric, 2)       AS "cumulativePnl",
                ROUND((dp.drawdown * 100)::numeric, 4)     AS "drawdownPct",
                dp.trade_count AS "tradeCount",
                dp.win_count   AS "winCount"
            FROM daily_performance dp
            JOIN strategies s ON s.id = dp.strategy_id
            ORDER BY s.name, dp.perf_date
        """)
        rows = [dict(r) for r in cur.fetchall()]

    for r in rows:
        for k in ["dailyPnl", "dailyReturnPct", "cumulativePnl", "drawdownPct"]:
            r[k] = to_float(r[k])
        r["tradeCount"] = int(r["tradeCount"])
        r["winCount"]   = int(r["winCount"])

    return rows


def export_trades(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                t.id,
                s.name          AS "strategy",
                a.symbol        AS "symbol",
                a.asset_class   AS "assetClass",
                t.trade_date::text AS "tradeDate",
                CASE WHEN t.direction = 'L' THEN 'Long' ELSE 'Short' END AS "direction",
                ROUND(t.entry_price::numeric, 4) AS "entryPrice",
                ROUND(t.exit_price::numeric, 4)  AS "exitPrice",
                t.quantity,
                ROUND(t.pnl::numeric, 2)         AS "pnl",
                ROUND((t.return_pct * 100)::numeric, 3) AS "returnPct"
            FROM trades t
            JOIN strategies s ON s.id = t.strategy_id
            JOIN assets     a ON a.id = t.asset_id
            ORDER BY t.trade_date DESC, t.pnl DESC
        """)
        rows = [dict(r) for r in cur.fetchall()]

    for r in rows:
        for k in ["entryPrice", "exitPrice", "pnl", "returnPct"]:
            r[k] = to_float(r[k])
        r["quantity"] = int(r["quantity"])
        r["id"]       = int(r["id"])

    return rows


def export_monthly_pnl(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                s.name                                                AS "strategy",
                DATE_TRUNC('month', dp.perf_date)::text               AS "month",
                ROUND(SUM(dp.daily_pnl)::numeric, 2)                  AS "monthlyPnl",
                SUM(dp.trade_count)::int                              AS "totalTrades",
                ROUND((AVG(dp.daily_return) * 100 * 21)::numeric, 4)  AS "approxMonthlyReturnPct"
            FROM daily_performance dp
            JOIN strategies s ON s.id = dp.strategy_id
            GROUP BY s.name, DATE_TRUNC('month', dp.perf_date)
            ORDER BY s.name, "month"
        """)
        rows = [dict(r) for r in cur.fetchall()]

    for r in rows:
        r["monthlyPnl"]             = to_float(r["monthlyPnl"])
        r["approxMonthlyReturnPct"] = to_float(r["approxMonthlyReturnPct"])
        r["totalTrades"]            = int(r["totalTrades"])

    return rows


def export_asset_breakdown(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                s.name             AS "strategy",
                t.trade_date::text AS "tradeDate",
                a.asset_class      AS "assetClass",
                ROUND(SUM(t.pnl)::numeric, 2)               AS "totalPnl",
                COUNT(*)::int                                AS "tradeCount",
                ROUND((AVG(t.return_pct) * 100)::numeric, 4) AS "avgReturnPct"
            FROM trades t
            JOIN assets     a ON a.id = t.asset_id
            JOIN strategies s ON s.id = t.strategy_id
            GROUP BY s.name, t.trade_date, a.asset_class
            ORDER BY s.name, t.trade_date, a.asset_class
        """)
        rows = [dict(r) for r in cur.fetchall()]

    for r in rows:
        r["totalPnl"]    = to_float(r["totalPnl"])
        r["avgReturnPct"] = to_float(r["avgReturnPct"])
        r["tradeCount"]  = int(r["tradeCount"])

    return rows


def export_date_range(conn):
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                MIN(trade_date)::text AS "minDate",
                MAX(trade_date)::text AS "maxDate"
            FROM trades
        """)
        return dict(cur.fetchone())


def main():
    print(f"\nConnecting to {DB_CONFIG['dbname']} @ {DB_CONFIG['host']}...")
    conn = get_conn()
    print(f"Exporting to {OUTPUT_DIR}\n")

    try:
        dump(OUTPUT_DIR / "strategies.json",      export_strategies(conn))
        dump(OUTPUT_DIR / "metrics.json",         export_metrics(conn))
        dump(OUTPUT_DIR / "equity-curves.json",   export_equity_curves(conn))
        dump(OUTPUT_DIR / "trades.json",          export_trades(conn))
        dump(OUTPUT_DIR / "monthly-pnl.json",     export_monthly_pnl(conn))
        dump(OUTPUT_DIR / "asset-breakdown.json", export_asset_breakdown(conn))
        dump(OUTPUT_DIR / "date-range.json",      export_date_range(conn))
    finally:
        conn.close()

    print("\nAll done. Commit demo/public/data/ to GitHub.")


if __name__ == "__main__":
    main()