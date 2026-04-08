from datetime import datetime
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")

def to_camel(s: str) -> str:
    parts = s.split('_')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )

class StrategySchema(CamelModel):
    id:          int
    name:        str
    description: Optional[str] = None

class StrategyMetricsSchema(CamelModel):
    strategy_id:      int
    strategy_name:    str
    total_pnl:        float
    sharpe_ratio:     float
    sortino_ratio:    float
    max_drawdown_pct: float
    win_rate_pct:     float
    avg_win:          float
    avg_loss:         float
    profit_factor:    float
    total_trades:     int
    computed_at:      datetime

class TradeSchema(CamelModel):
    id:          int
    strategy:    str
    symbol:      str
    asset_class: str
    trade_date:  str
    direction:   str
    entry_price: float
    exit_price:  float
    quantity:    int
    pnl:         float
    return_pct:  float

class PagedResult(CamelModel, Generic[T]):
    items:       List[T]
    total_count: int
    page:        int
    page_size:   int
    total_pages: int

class DailyPerformanceSchema(CamelModel):
    strategy:         str
    perf_date:        str
    daily_pnl:        float
    daily_return_pct: float
    cumulative_pnl:   float
    drawdown_pct:     float
    trade_count:      int
    win_count:        int

class AssetClassBreakdownSchema(CamelModel):
    trade_date:     str
    asset_class:    str
    total_pnl:      float
    trade_count:    int
    avg_return_pct: float

class MonthlyPnlSchema(CamelModel):
    strategy:                  str
    month:                     str
    monthly_pnl:               float
    total_trades:              int
    approx_monthly_return_pct: float

class DateRangeSchema(CamelModel):
    min_date: str
    max_date: str
