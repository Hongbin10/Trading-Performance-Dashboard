using Microsoft.EntityFrameworkCore;
using TradingApi.Data;
using TradingApi.Repositories;
using TradingApi.Services;

var builder = WebApplication.CreateBuilder(args);

// ── Database ───────────────────────────────────────────────────────────────────
builder.Services.AddDbContext<TradingDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
);

// ── Repositories ───────────────────────────────────────────────────────────────
builder.Services.AddScoped<IStrategyRepository,   StrategyRepository>();
builder.Services.AddScoped<ITradeRepository,       TradeRepository>();
builder.Services.AddScoped<IPerformanceRepository, PerformanceRepository>();

// ── Market data (Finnhub WebSocket) ───────────────────────────────────────────
builder.Services.AddSingleton<MarketDataBroadcaster>();
builder.Services.AddHostedService<FinnhubWebSocketService>();

// ── Controllers + JSON ────────────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// ── Swagger ────────────────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Trading API", Version = "v1" });
});

// ── CORS ───────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
    options.AddPolicy("DevFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
    )
);

var app = builder.Build();

// ── Middleware ─────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Trading API v1"));
}

app.UseCors("DevFrontend");

app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromSeconds(30),
});

app.UseAuthorization();
app.MapControllers();

app.Run();