from fastapi import APIRouter
from sqlalchemy import text 
from app.db.database import engine

router = APIRouter()

@router.get("/health")
async def check_health() ->dict[str, str]:
    return {"status": "healthy"}

@router.get("/health/database")
async def database_health_check() -> dict[str, str]:
    async with engine.connect() as connection:
        await connection.execute(text("SELECT 1"))

    return {"database": "connected"}