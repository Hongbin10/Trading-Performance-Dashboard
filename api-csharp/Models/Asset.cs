namespace TradingApi.Models;

public class Asset
{
    public int    Id         { get; set; }
    public string Symbol     { get; set; } = string.Empty;
    public string Name       { get; set; } = string.Empty;
    public string AssetClass { get; set; } = string.Empty;   // equity | futures | forex
    public double DailyMu    { get; set; }
    public double DailySigma { get; set; }

    // Navigation
    public ICollection<Trade> Trades { get; set; } = [];
}
