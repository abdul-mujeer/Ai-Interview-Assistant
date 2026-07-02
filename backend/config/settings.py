import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # API Configuration
    API_TITLE = "AI Interview Assistant API"
    API_VERSION = "1.0.0"
    
    # Database
    MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME = "interview_assistant"
    
    # Gemini
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")  # free-tier friendly model
    
    # CORS
    ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]
    
    # Interview Configuration
    DEFAULT_QUESTIONS_COUNT = 5
    QUESTION_DIFFICULTY = ["easy", "medium", "hard"]
    ANSWER_TIME_LIMIT = 300  # 5 minutes per answer
    
    @classmethod
    def validate(cls):
        """Validate required environment variables"""
        if not cls.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        if not cls.MONGODB_URI:
            raise ValueError("MONGODB_URI environment variable not set")

settings = Settings()
