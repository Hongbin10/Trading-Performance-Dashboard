using Microsoft.AspNetCore.Mvc;
using TradingApi.Repositories;

namespace TradingApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PerformanceController(IPerformanceRepository repo) : ControllerBase
{
    /// <summary>
    /// Daily cumulative PnL for all (or one) strategy — feeds ECharts equity curve.
    /// Example: GET /api/performance/equity-curve?strategy=MomentumAlpha
    /// </summary>
    [HttpGet("equity-curve")]
    public async Task<IActionResult> GetEquityCurves([FromQuery] string? strategy) =>
        Ok(await repo.GetEquityCurvesAsync(strategy));

    /// <summary>
    /// Daily PnL by asset class — feeds ECharts heatmap and grouped bar chart.
    /// Example: GET /api/performance/asset-breakdown?dateFrom=2024-01-01&dateTo=2024-06-30
    /// </summary>
    [HttpGet("asset-breakdown")]
    public async Task<IActionResult> GetAssetBreakdown(
        [FromQuery] string? dateFrom,
        [FromQuery] string? dateTo) =>
        Ok(await repo.GetAssetClassBreakdownAsync(dateFrom, dateTo));

    /// <summary>
    /// Monthly PnL summary — feeds the monthly calendar heatmap.
    /// Example: GET /api/performance/monthly?strategy=StatArb
    /// </summary>
    [HttpGet("monthly")]
    public async Task<IActionResult> GetMonthly([FromQuery] string? strategy) =>
        Ok(await repo.GetMonthlyPnlAsync(strategy));
}
