namespace TradingApi.Models;

public class Trade
{
    public int      Id         { get; set; }
    public int      StrategyId { get; set; }
    public int      AssetId    { get; set; }
    public DateOnly TradeDate  { get; set; }
    public char     Direction  { get; set; }   // 'L' = Long, 'S' = Short
    public double   EntryPrice { get; set; }
    public double   ExitPrice  { get; set; }
    public int      Quantity   { get; set; }
    public double   Pnl        { get; set; }
    public double   ReturnPct  { get; set; }

    // Navigation
    public Strategy Strategy { get; set; } = null!;
    public Asset    Asset    { get; set; } = null!;
}
