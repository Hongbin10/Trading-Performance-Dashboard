from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from db.session import engine
from routers import strategies, trades, performance


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="Trading API",
    version="0.1.0",
    description="Quantitative trading performance dashboard API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(strategies.router)
app.include_router(trades.router)
app.include_router(performance.router)


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "backend": "Python FastAPI"}
