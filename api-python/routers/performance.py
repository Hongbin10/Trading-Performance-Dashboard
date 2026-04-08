"""
/api/performance
Equity curves, asset class breakdown, monthly PnL.
Mirrors C# PerformanceController.
Window functions stay in SQL where they belong.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from db.session import get_db
from models.schemas import AssetClassBreakdownSchema, DailyPerformanceSchema, MonthlyPnlSchema

router = APIRouter(prefix="/api/performance", tags=["performance"])


@router.get("/equity-curve", response_model=List[DailyPerformanceSchema])
async def get_equity_curves(
    strategy: Optional[str] = Query(None),
    db: AsyncSession        = Depends(get_db),
):
    params: dict = {}
    where = ""
    if strategy:
        where = "WHERE s.name = :strategy"
        params["strategy"] = strategy

    sql = text(f"""
        SELECT
            s.name                                  AS strategy,
            dp.perf_date::text                      AS perf_date,
            ROUND(dp.daily_pnl::numeric,   2)       AS daily_pnl,
            ROUND((dp.daily_return * 100)::numeric, 4) AS daily_return_pct,
            ROUND(dp.cumulative_pnl::numeric, 2)    AS cumulative_pnl,
            ROUND((dp.drawdown * 100)::numeric, 4)  AS drawdown_pct,
            dp.trade_count,
            dp.win_count
        FROM daily_performance dp
        JOIN strategies s ON s.id = dp.strategy_id
        {where}
        ORDER BY s.name, dp.perf_date
    """)
    rows = await db.execute(sql, params)
    return [dict(r._mapping) for r in rows]


@router.get("/asset-breakdown", response_model=List[AssetClassBreakdownSchema])
async def get_asset_breakdown(
    date_from: Optional[str] = Query(None, alias="dateFrom"),
    date_to:   Optional[str] = Query(None, alias="dateTo"),
    db: AsyncSession          = Depends(get_db),
):
    sql = text("""
        SELECT
            t.trade_date::text                          AS trade_date,
            a.asset_class,
            ROUND(SUM(t.pnl)::numeric, 2)               AS total_pnl,
            COUNT(*)::int                               AS trade_count,
            ROUND((AVG(t.return_pct) * 100)::numeric, 4) AS avg_return_pct
        FROM trades t
        JOIN assets a ON a.id = t.asset_id
        WHERE (:date_from IS NULL OR t.trade_date >= :date_from::date)
          AND (:date_to   IS NULL OR t.trade_date <= :date_to::date)
        GROUP BY t.trade_date, a.asset_class
        ORDER BY t.trade_date, a.asset_class
    """)
    rows = await db.execute(sql, {"date_from": date_from, "date_to": date_to})
    return [dict(r._mapping) for r in rows]


@router.get("/monthly", response_model=List[MonthlyPnlSchema])
async def get_monthly(
    strategy: Optional[str] = Query(None),
    db: AsyncSession        = Depends(get_db),
):
    sql = text("""
        SELECT
            s.name                                           AS strategy,
            DATE_TRUNC('month', dp.perf_date)::text          AS month,
            ROUND(SUM(dp.daily_pnl)::numeric, 2)             AS monthly_pnl,
            SUM(dp.trade_count)::int                         AS total_trades,
            ROUND((AVG(dp.daily_return) * 100 * 21)::numeric, 4)
                                                             AS approx_monthly_return_pct
        FROM daily_performance dp
        JOIN strategies s ON s.id = dp.strategy_id
        WHERE (:strategy IS NULL OR s.name = :strategy)
        GROUP BY s.name, DATE_TRUNC('month', dp.perf_date)
        ORDER BY s.name, month
    """)
    rows = await db.execute(sql, {"strategy": strategy})
    return [dict(r._mapping) for r in rows]
