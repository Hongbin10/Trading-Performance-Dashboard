# TradingApi — C# ASP.NET Core Web API

**Project ②** in the Trading Dashboard ecosystem.
Reads from the same PostgreSQL database populated by the Python pipeline (Project ③)
and exposes REST endpoints consumed by the React Dashboard (Project ①).

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | ASP.NET Core 8 | Current LTS, minimal hosting model |
| ORM | Entity Framework Core 8 + Npgsql | Full C# query composition, migrations support |
| Docs | Swagger / OpenAPI | Auto-generated from controller attributes |
| Pattern | Repository | Separates data access from controllers, easy to unit test |

## Project structure

```
TradingApi/
├── Models/               # Entity classes mirroring PostgreSQL tables
│   ├── Asset.cs
│   ├── Strategy.cs
│   ├── Trade.cs
│   └── Performance.cs    # DailyPerformance + StrategyMetrics
├── Data/
│   └── TradingDbContext.cs   # EF Core context + table/column mappings
├── DTOs/
│   └── Dtos.cs           # Response shapes (C# records) — never expose entities directly
├── Repositories/
│   ├── IRepositories.cs  # Interfaces (for DI + testability)
│   ├── StrategyRepository.cs
│   ├── TradeRepository.cs
│   └── PerformanceRepository.cs
├── Controllers/
│   ├── StrategiesController.cs
│   ├── TradesController.cs
│   └── PerformanceController.cs
└── Program.cs            # DI wiring, middleware, CORS, Swagger
```

## API endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/strategies` | All strategies |
| GET | `/api/strategies/metrics` | All strategy metrics — AG-Grid table |
| GET | `/api/strategies/{id}/metrics` | Single strategy metrics |
| GET | `/api/trades` | Paginated trade log with filters — AG-Grid |
| GET | `/api/trades/symbols` | Asset symbol list for dropdowns |
| GET | `/api/performance/equity-curve` | Daily cumulative PnL — ECharts line |
| GET | `/api/performance/asset-breakdown` | Daily PnL by asset class — ECharts heatmap |
| GET | `/api/performance/monthly` | Monthly PnL summary — calendar heatmap |

### Trade filter query params
```
GET /api/trades?strategy=MomentumAlpha
               &assetClass=equity
               &symbol=AAPL
               &dateFrom=2024-01-01
               &dateTo=2024-06-30
               &direction=Long
               &page=1
               &pageSize=100
```

## Setup

```bash
# 1. Set your DB password in appsettings.json
# 2. Restore and run
dotnet restore
dotnet run

# Swagger UI available at:
# http://localhost:5000/swagger
```

## Notes

- The Python pipeline (Project ③) must be run first to populate the database.
- CORS is configured for `localhost:5173` (Vite) and `localhost:3000` (CRA).
- Raw SQL is used in `PerformanceRepository` for window function queries
  where EF Core LINQ would be more complex than the SQL itself.
