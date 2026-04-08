using Microsoft.EntityFrameworkCore;
using TradingApi.Data;
using TradingApi.DTOs;

namespace TradingApi.Repositories;

public class TradeRepository(TradingDbContext db) : ITradeRepository
{
    public async Task<PagedResult<TradeDto>> GetTradesAsync(TradeFilterParams f)
    {
        var query = db.Trades
            .Include(t => t.Strategy)
            .Include(t => t.Asset)
            .AsQueryable();

        if (!string.IsNullOrEmpty(f.Strategy))
            query = query.Where(t => t.Strategy.Name == f.Strategy);

        if (!string.IsNullOrEmpty(f.AssetClass))
            query = query.Where(t => t.Asset.AssetClass == f.AssetClass);

        if (!string.IsNullOrEmpty(f.Symbol))
            query = query.Where(t => t.Asset.Symbol == f.Symbol);

        if (!string.IsNullOrEmpty(f.Direction))
        {
            var dir = f.Direction.ToUpper() == "LONG" ? 'L' : 'S';
            query = query.Where(t => t.Direction == dir);
        }

        if (DateOnly.TryParse(f.DateFrom, out var from))
            query = query.Where(t => t.TradeDate >= from);

        if (DateOnly.TryParse(f.DateTo, out var to))
            query = query.Where(t => t.TradeDate <= to);

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(t => t.TradeDate)
            .ThenByDescending(t => t.Pnl)
            .Skip((f.Page - 1) * f.PageSize)
            .Take(f.PageSize)
            .Select(t => new TradeDto(
                t.Id,
                t.Strategy.Name,
                t.Asset.Symbol,
                t.Asset.AssetClass,
                t.TradeDate.ToString("yyyy-MM-dd"),
                t.Direction == 'L' ? "Long" : "Short",
                Math.Round(t.EntryPrice, 4),
                Math.Round(t.ExitPrice,  4),
                t.Quantity,
                Math.Round(t.Pnl,       2),
                Math.Round(t.ReturnPct * 100, 4)
            ))
            .ToListAsync();

        return new PagedResult<TradeDto>(
            items, totalCount, f.Page, f.PageSize,
            (int)Math.Ceiling(totalCount / (double)f.PageSize)
        );
    }

    public async Task<IEnumerable<string>> GetSymbolsAsync() =>
        await db.Assets
            .OrderBy(a => a.AssetClass).ThenBy(a => a.Symbol)
            .Select(a => a.Symbol)
            .ToListAsync();

    public async Task<DateRangeDto> GetDateRangeAsync()
    {
        var min = await db.Trades.MinAsync(t => t.TradeDate);
        var max = await db.Trades.MaxAsync(t => t.TradeDate);
        return new DateRangeDto(min.ToString("yyyy-MM-dd"), max.ToString("yyyy-MM-dd"));
    }
}
