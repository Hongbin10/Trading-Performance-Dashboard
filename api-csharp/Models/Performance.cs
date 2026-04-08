namespace TradingApi.Models;

public class DailyPerformance
{
    public int      Id            { get; set; }
    public int      StrategyId    { get; set; }
    public DateOnly PerfDate      { get; set; }
    public double   DailyPnl      { get; set; }
    public double   DailyReturn   { get; set; }
    public double   CumulativePnl { get; set; }
    public double   Drawdown      { get; set; }
    public int      TradeCount    { get; set; }
    public int      WinCount      { get; set; }

    // Navigation
    public Strategy Strategy { get; set; } = null!;
}

public class StrategyMetrics
{
    public int      StrategyId    { get; set; }
    public double   TotalPnl      { get; set; }
    public double   SharpeRatio   { get; set; }
    public double   SortinoRatio  { get; set; }
    public double   MaxDrawdown   { get; set; }
    public double   WinRate       { get; set; }
    public double   AvgWin        { get; set; }
    public double   AvgLoss       { get; set; }
    public double   ProfitFactor  { get; set; }
    public int      TotalTrades   { get; set; }
    public DateTime ComputedAt    { get; set; }

    // Navigation
    public Strategy Strategy { get; set; } = null!;
}
