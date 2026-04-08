using Microsoft.EntityFrameworkCore;
using TradingApi.Models;

namespace TradingApi.Data;

public class TradingDbContext(DbContextOptions<TradingDbContext> options) : DbContext(options)
{
    public DbSet<Asset>            Assets           { get; set; }
    public DbSet<Strategy>         Strategies       { get; set; }
    public DbSet<Trade>            Trades           { get; set; }
    public DbSet<DailyPerformance> DailyPerformance { get; set; }
    public DbSet<StrategyMetrics>  StrategyMetrics  { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── Asset ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Asset>(e =>
        {
            e.ToTable("assets");
            e.HasKey(a => a.Id);
            e.Property(a => a.Id).HasColumnName("id");
            e.Property(a => a.Symbol).HasColumnName("symbol").HasMaxLength(16).IsRequired();
            e.Property(a => a.Name).HasColumnName("name").HasMaxLength(128).IsRequired();
            e.Property(a => a.AssetClass).HasColumnName("asset_class").HasMaxLength(16).IsRequired();
            e.Property(a => a.DailyMu).HasColumnName("daily_mu");
            e.Property(a => a.DailySigma).HasColumnName("daily_sigma");
            e.HasIndex(a => a.Symbol).IsUnique();
        });

        // ── Strategy ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Strategy>(e =>
        {
            e.ToTable("strategies");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.Name).HasColumnName("name").HasMaxLength(64).IsRequired();
            e.Property(s => s.Description).HasColumnName("description");
            e.HasIndex(s => s.Name).IsUnique();
        });

        // ── Trade ─────────────────────────────────────────────────────────────
        modelBuilder.Entity<Trade>(e =>
        {
            e.ToTable("trades");
            e.HasKey(t => t.Id);
            e.Property(t => t.Id).HasColumnName("id");
            e.Property(t => t.StrategyId).HasColumnName("strategy_id");
            e.Property(t => t.AssetId).HasColumnName("asset_id");
            e.Property(t => t.TradeDate).HasColumnName("trade_date");
            e.Property(t => t.Direction).HasColumnName("direction").HasMaxLength(1);
            e.Property(t => t.EntryPrice).HasColumnName("entry_price");
            e.Property(t => t.ExitPrice).HasColumnName("exit_price");
            e.Property(t => t.Quantity).HasColumnName("quantity");
            e.Property(t => t.Pnl).HasColumnName("pnl");
            e.Property(t => t.ReturnPct).HasColumnName("return_pct");

            e.HasOne(t => t.Strategy)
             .WithMany(s => s.Trades)
             .HasForeignKey(t => t.StrategyId);

            e.HasOne(t => t.Asset)
             .WithMany(a => a.Trades)
             .HasForeignKey(t => t.AssetId);
        });

        // ── DailyPerformance ──────────────────────────────────────────────────
        modelBuilder.Entity<DailyPerformance>(e =>
        {
            e.ToTable("daily_performance");
            e.HasKey(d => d.Id);
            e.Property(d => d.Id).HasColumnName("id");
            e.Property(d => d.StrategyId).HasColumnName("strategy_id");
            e.Property(d => d.PerfDate).HasColumnName("perf_date");
            e.Property(d => d.DailyPnl).HasColumnName("daily_pnl");
            e.Property(d => d.DailyReturn).HasColumnName("daily_return");
            e.Property(d => d.CumulativePnl).HasColumnName("cumulative_pnl");
            e.Property(d => d.Drawdown).HasColumnName("drawdown");
            e.Property(d => d.TradeCount).HasColumnName("trade_count");
            e.Property(d => d.WinCount).HasColumnName("win_count");

            e.HasOne(d => d.Strategy)
             .WithMany(s => s.DailyPerformance)
             .HasForeignKey(d => d.StrategyId);

            e.HasIndex(d => new { d.StrategyId, d.PerfDate }).IsUnique();
        });

        // ── StrategyMetrics ───────────────────────────────────────────────────
        modelBuilder.Entity<StrategyMetrics>(e =>
        {
            e.ToTable("strategy_metrics");
            e.HasKey(m => m.StrategyId);
            e.Property(m => m.StrategyId).HasColumnName("strategy_id");
            e.Property(m => m.TotalPnl).HasColumnName("total_pnl");
            e.Property(m => m.SharpeRatio).HasColumnName("sharpe_ratio");
            e.Property(m => m.SortinoRatio).HasColumnName("sortino_ratio");
            e.Property(m => m.MaxDrawdown).HasColumnName("max_drawdown");
            e.Property(m => m.WinRate).HasColumnName("win_rate");
            e.Property(m => m.AvgWin).HasColumnName("avg_win");
            e.Property(m => m.AvgLoss).HasColumnName("avg_loss");
            e.Property(m => m.ProfitFactor).HasColumnName("profit_factor");
            e.Property(m => m.TotalTrades).HasColumnName("total_trades");
            e.Property(m => m.ComputedAt).HasColumnName("computed_at");

            e.HasOne(m => m.Strategy)
             .WithOne(s => s.Metrics)
             .HasForeignKey<StrategyMetrics>(m => m.StrategyId);
        });
    }
}
