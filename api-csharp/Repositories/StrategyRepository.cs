using Microsoft.EntityFrameworkCore;
using TradingApi.Data;
using TradingApi.DTOs;

namespace TradingApi.Repositories;

public class StrategyRepository(TradingDbContext db) : IStrategyRepository
{
    public async Task<IEnumerable<StrategyDto>> GetAllAsync()
    {
        return await db.Strategies
            .OrderBy(s => s.Name)
            .Select(s => new StrategyDto(s.Id, s.Name, s.Description ?? ""))
            .ToListAsync();
    }

    public async Task<StrategyMetricsDto?> GetMetricsAsync(int strategyId)
    {
        return await db.StrategyMetrics
            .Where(m => m.StrategyId == strategyId)
            .Select(m => new StrategyMetricsDto(
                m.StrategyId,
                m.Strategy.Name,
                m.TotalPnl,
                Math.Round(m.SharpeRatio,  4),
                Math.Round(m.SortinoRatio, 4),
                Math.Round(m.MaxDrawdown * 100, 2),
                Math.Round(m.WinRate     * 100, 2),
                m.AvgWin,
                m.AvgLoss,
                m.ProfitFactor,
                m.TotalTrades,
                m.ComputedAt
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<IEnumerable<StrategyMetricsDto>> GetAllMetricsAsync()
    {
        return await db.StrategyMetrics
            .Include(m => m.Strategy)
            .OrderByDescending(m => m.SharpeRatio)
            .Select(m => new StrategyMetricsDto(
                m.StrategyId,
                m.Strategy.Name,
                m.TotalPnl,
                Math.Round(m.SharpeRatio,  4),
                Math.Round(m.SortinoRatio, 4),
                Math.Round(m.MaxDrawdown * 100, 2),
                Math.Round(m.WinRate     * 100, 2),
                m.AvgWin,
                m.AvgLoss,
                m.ProfitFactor,
                m.TotalTrades,
                m.ComputedAt
            ))
            .ToListAsync();
    }
}
