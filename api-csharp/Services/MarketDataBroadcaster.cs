using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;

namespace TradingApi.Services;

/// <summary>
/// Singleton that:
///   1. Receives price updates from FinnhubWebSocketService
///   2. Forwards them to all connected frontend WebSocket clients
/// </summary>
public class MarketDataBroadcaster
{
    // Thread-safe set of active frontend connections
    private readonly ConcurrentDictionary<string, WebSocket> _clients = new();
    private readonly ILogger<MarketDataBroadcaster> _logger;

    public MarketDataBroadcaster(ILogger<MarketDataBroadcaster> logger)
    {
        _logger = logger;
    }

    public void AddClient(string id, WebSocket ws)
    {
        _clients[id] = ws;
        _logger.LogDebug("Client connected: {id}. Total: {n}", id, _clients.Count);
    }

    public void RemoveClient(string id)
    {
        _clients.TryRemove(id, out _);
        _logger.LogDebug("Client disconnected: {id}. Total: {n}", id, _clients.Count);
    }

    /// <summary>Called by FinnhubWebSocketService — broadcasts to all frontend clients.</summary>
    public void Publish(PriceUpdate update)
    {
        if (_clients.IsEmpty) return;

        var json  = JsonSerializer.Serialize(new
        {
            symbol    = update.Symbol,
            price     = update.Price,
            timestamp = update.TimestampMs,
        });
        var bytes = Encoding.UTF8.GetBytes(json);

        foreach (var (id, ws) in _clients)
        {
            if (ws.State != WebSocketState.Open)
            {
                RemoveClient(id);
                continue;
            }
            // Fire-and-forget — don't block the Finnhub listener
            _ = ws.SendAsync(bytes, WebSocketMessageType.Text, true, CancellationToken.None);
        }
    }
}
