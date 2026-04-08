"""
/api/strategies
Mirrors C# StrategiesController exactly.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from db.session import get_db
from models.schemas import StrategyMetricsSchema, StrategySchema

router = APIRouter(prefix="/api/strategies", tags=["strategies"])


@router.get("", response_model=List[StrategySchema])
async def get_all_strategies(db: AsyncSession = Depends(get_db)):
    rows = await db.execute(
        text("SELECT id, name, description FROM strategies ORDER BY name")
    )
    return [dict(r._mapping) for r in rows]


@router.get("/metrics", response_model=List[StrategyMetricsSchema])
async def get_all_metrics(db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            sm.strategy_id,
            s.name                             AS strategy_name,
            sm.total_pnl,
            ROUND(sm.sharpe_ratio::numeric,  4) AS sharpe_ratio,
            ROUND(sm.sortino_ratio::numeric, 4) AS sortino_ratio,
            ROUND((sm.max_drawdown * 100)::numeric, 2) AS max_drawdown_pct,
            ROUND((sm.win_rate     * 100)::numeric, 2) AS win_rate_pct,
            sm.avg_win,
            sm.avg_loss,
            sm.profit_factor,
            sm.total_trades,
            sm.computed_at
        FROM strategy_metrics sm
        JOIN strategies s ON s.id = sm.strategy_id
        ORDER BY sm.sharpe_ratio DESC
    """)
    rows = await db.execute(sql)
    return [dict(r._mapping) for r in rows]


@router.get("/{strategy_id}/metrics", response_model=StrategyMetricsSchema)
async def get_metrics(strategy_id: int, db: AsyncSession = Depends(get_db)):
    sql = text("""
        SELECT
            sm.strategy_id,
            s.name                             AS strategy_name,
            sm.total_pnl,
            ROUND(sm.sharpe_ratio::numeric,  4) AS sharpe_ratio,
            ROUND(sm.sortino_ratio::numeric, 4) AS sortino_ratio,
            ROUND((sm.max_drawdown * 100)::numeric, 2) AS max_drawdown_pct,
            ROUND((sm.win_rate     * 100)::numeric, 2) AS win_rate_pct,
            sm.avg_win,
            sm.avg_loss,
            sm.profit_factor,
            sm.total_trades,
            sm.computed_at
        FROM strategy_metrics sm
        JOIN strategies s ON s.id = sm.strategy_id
        WHERE sm.strategy_id = :id
    """)
    row = (await db.execute(sql, {"id": strategy_id})).first()
    if not row:
        raise HTTPException(status_code=404, detail=f"Strategy {strategy_id} not found")
    return dict(row._mapping)
