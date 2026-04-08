namespace TradingApi.Models;

public class Strategy
{
    public int     Id          { get; set; }
    public string  Name        { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Trade>            Trades           { get; set; } = [];
    public ICollection<DailyPerformance> DailyPerformance { get; set; } = [];
    public StrategyMetrics?              Metrics          { get; set; }
}
