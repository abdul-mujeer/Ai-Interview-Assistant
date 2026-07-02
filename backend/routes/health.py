from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.schemas import HealthCheckResponse
from services.database import Database

router = APIRouter(prefix="/api", tags=["health"])

@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = Database.get_db()
        db.command('ping')
        
        return HealthCheckResponse(
            status="healthy",
            message="Backend is running and database is connected",
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Service unavailable: {str(e)}"
        )
