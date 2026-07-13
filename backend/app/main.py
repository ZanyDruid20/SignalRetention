from fastapi import FastAPI
from sqlalchemy import text 
from app.db.database import engine

app = FastAPI(
    title="SignalRetention API",
    version="1.0.0",
)

@app.get("/health")
async def check_health() ->dict[str, str]:
    return {"status": "healthy"}

@app.get("/health/database")
async def database_health_check() -> dict[str, str]:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))

    return {"database": "connected"}