# Trading API — Python FastAPI

**Project ②-Python** in the Trading Dashboard ecosystem.
Identical API contract to the C# ASP.NET Core API — the React frontend
switches between the two by changing one line in `vite.config.ts`.

## Tech stack

| Layer       | Choice                         |
|-------------|--------------------------------|
| Framework   | FastAPI 0.115                  |
| Server      | Uvicorn (async ASGI)           |
| DB driver   | asyncpg (async PostgreSQL)     |
| ORM         | SQLAlchemy 2.0 async           |
| Validation  | Pydantic v2                    |

## Structure

```
fastapi/
├── main.py               # App factory, CORS, router registration
├── db/
│   └── session.py        # Async engine + get_db() dependency
├── models/
│   └── schemas.py        # Pydantic response schemas (mirrors C# DTOs + TS types)
└── routers/
    ├── strategies.py     # GET /api/strategies, /api/strategies/metrics
    ├── trades.py         # GET /api/trades (paginated + filtered), /api/trades/symbols
    └── performance.py    # GET /api/performance/equity-curve, /asset-breakdown, /monthly
```

## Endpoints

| Method | Route                             | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/strategies`                 | All strategies                     |
| GET    | `/api/strategies/metrics`         | All metrics — AG-Grid table        |
| GET    | `/api/strategies/{id}/metrics`    | Single strategy metrics            |
| GET    | `/api/trades`                     | Paginated + filtered trade log     |
| GET    | `/api/trades/symbols`             | Symbol list for dropdowns          |
| GET    | `/api/performance/equity-curve`   | Daily cumulative PnL — ECharts     |
| GET    | `/api/performance/asset-breakdown`| PnL by asset class — heatmap       |
| GET    | `/api/performance/monthly`        | Monthly PnL summary                |
| GET    | `/health`                         | Health check                       |

## Setup & run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure DB
cp .env.example .env
# edit .env with your DB credentials

# 3. Run (requires the Python pipeline to have populated the DB first)
uvicorn main:app --reload --port 8000

# Interactive docs:
# http://localhost:8000/docs
```

## Switching the React frontend to this backend

In `trading-dashboard/vite.config.ts`:
```ts
proxy: { '/api': { target: 'http://localhost:8000' } }  // ← Python
proxy: { '/api': { target: 'http://localhost:5000' } }  // ← C#
```
