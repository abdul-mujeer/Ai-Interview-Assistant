"""
AI Interview Assistant - FastAPI Backend
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from services.database import Database
from routes import health, resume, interview

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="AI-powered interview assistant API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("✓ CORS middleware configured")

# Include routers
app.include_router(health.router)
app.include_router(resume.router)
app.include_router(interview.router)

@app.on_event("startup")
async def startup():
    """Initialize database on startup"""
    print("\n" + "="*50)
    print("🚀 Starting AI Interview Assistant Backend")
    print("="*50)
    
    # Validate settings
    try:
        settings.validate()
        print("✓ Environment variables validated")
    except ValueError as e:
        print(f"✗ Configuration error: {e}")
        raise
    
    # Connect to MongoDB
    if Database.connect():
        print("✓ Database connected")
    else:
        print("✗ Failed to connect to database")
        raise Exception("MongoDB connection failed")
    
    print("\n" + "="*50)
    print("✓ Backend is ready!")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("="*50 + "\n")

@app.on_event("shutdown")
async def shutdown():
    """Close database connection on shutdown"""
    Database.close()

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Interview Assistant API",
        "version": settings.API_VERSION,
        "docs": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    print("\n📝 Loading environment from .env file...")
    
    # Run with uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
