using System.Net.WebSockets;
using Microsoft.AspNetCore.Mvc;
using TradingApi.Services;

namespace TradingApi.Controllers;

[ApiController]
[Route("api/market")]
public class MarketDataController : ControllerBase
{
    private readonly MarketDataBroadcaster _broadcaster;

    public MarketDataController(MarketDataBroadcaster broadcaster)
    {
        _broadcaster = broadcaster;
    }

    /// <summary>
    /// WebSocket endpoint — frontend connects here to receive live prices.
    /// ws://localhost:5000/api/market/ws
    /// </summary>
    [HttpGet("ws")]
    public async Task ConnectWebSocket()
    {
        if (!HttpContext.WebSockets.IsWebSocketRequest)
        {
            HttpContext.Response.StatusCode = 400;
            return;
        }
        
        // Check origin
        var origin = HttpContext.Request.Headers["Origin"].ToString();
        if (!string.IsNullOrEmpty(origin) &&
            !origin.StartsWith("http://localhost"))
        {
            HttpContext.Response.StatusCode = 403;
            return;
        }
        
        var ws       = await HttpContext.WebSockets.AcceptWebSocketAsync();
        var clientId = Guid.NewGuid().ToString();

        _broadcaster.AddClient(clientId, ws);

        // Keep the connection alive until the client disconnects
        var buffer = new byte[256];
        while (ws.State == WebSocketState.Open)
        {
            var result = await ws.ReceiveAsync(buffer, HttpContext.RequestAborted);
            if (result.MessageType == WebSocketMessageType.Close)
                await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Bye", CancellationToken.None);
        }

        _broadcaster.RemoveClient(clientId);
    }
}

