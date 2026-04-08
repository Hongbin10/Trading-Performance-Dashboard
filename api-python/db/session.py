"""
Async SQLAlchemy engine + session factory.
One connection pool shared across the whole app.
"""
import os
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from dotenv import load_dotenv

load_dotenv()

# asyncpg driver — fast async PostgreSQL
DATABASE_URL = (
    "postgresql+asyncpg://"
    f"{os.getenv('DB_USER','postgres')}:{os.getenv('DB_PASSWORD','password')}"
    f"@{os.getenv('DB_HOST','localhost')}:{os.getenv('DB_PORT','5432')}"
    f"/{os.getenv('DB_NAME','trading_db')}"
)

engine = create_async_engine(DATABASE_URL, pool_size=10, max_overflow=20, echo=False)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

async def get_db():
    """FastAPI dependency — yields a session, closes after the request."""
    async with AsyncSessionLocal() as session:
        yield session
