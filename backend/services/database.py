from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from datetime import datetime
import uuid
from config.settings import settings

class Database:
    """MongoDB database connection and operations"""
    
    _client = None
    _db = None
    
    @classmethod
    def connect(cls):
        """Establish MongoDB connection"""
        try:
            cls._client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=10000
            )
            cls._db = cls._client[settings.DATABASE_NAME]
            
            # Test connection
            cls._db.command('ping')
            print("✅ MongoDB connection successful")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            print(f"❌ MongoDB connection failed: {e}")
            return False
    
    @classmethod
    def close(cls):
        """Close MongoDB connection"""
        if cls._client:
            cls._client.close()
            print("MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        if cls._db is None:
            cls.connect()
        return cls._db
    
    # ==================== Resume Operations ====================
    
    @staticmethod
    def save_resume(filename: str, skills: list, parsed_text: str, contact: dict) -> str:
        """Save resume to database"""
        db = Database.get_db()
        resume_id = str(uuid.uuid4())
        
        resume_doc = {
            "_id": resume_id,
            "filename": filename,
            "skills": skills,
            "parsed_text": parsed_text,
            "contact": contact,
            "uploaded_at": datetime.utcnow(),
            "status": "analyzed"
        }
        
        db.resumes.insert_one(resume_doc)
        return resume_id
    
    @staticmethod
    def get_resume(resume_id: str) -> dict:
        """Get resume by ID"""
        db = Database.get_db()
        return db.resumes.find_one({"_id": resume_id})
    
    # ==================== Interview Operations ====================
    
    @staticmethod
    def create_interview(resume_id: str, questions: list, user_id: str = "user_default") -> str:
        """Create new interview session"""
        db = Database.get_db()
        interview_id = str(uuid.uuid4())
        
        interview_doc = {
            "_id": interview_id,
            "resume_id": resume_id,
            "user_id": user_id,
            "questions": questions,
            "answers": [],
            "current_question_index": 0,
            "status": "in_progress",
            "created_at": datetime.utcnow(),
            "started_at": datetime.utcnow(),
        }
        
        db.interviews.insert_one(interview_doc)
        return interview_id
    
    @staticmethod
    def get_interview(interview_id: str) -> dict:
        """Get interview by ID"""
        db = Database.get_db()
        return db.interviews.find_one({"_id": interview_id})
    
    @staticmethod
    def save_answer(interview_id: str, question_id: str, question_text: str, 
                   transcript: str, evaluation: dict) -> str:
        """Save interview answer and evaluation"""
        db = Database.get_db()
        answer_id = str(uuid.uuid4())
        
        answer_doc = {
            "_id": answer_id,
            "interview_id": interview_id,
            "question_id": question_id,
            "question_text": question_text,
            "transcript": transcript,
            "evaluation": evaluation,
            "saved_at": datetime.utcnow(),
        }
        
        db.answers.insert_one(answer_doc)
        
        # Update interview
        db.interviews.update_one(
            {"_id": interview_id},
            {"$push": {"answers": {"question_id": question_id, "score": evaluation.get("score", 0)}}}
        )
        
        return answer_id
    
    @staticmethod
    def complete_interview(interview_id: str, overall_score: float) -> bool:
        """Mark interview as completed"""
        db = Database.get_db()
        result = db.interviews.update_one(
            {"_id": interview_id},
            {
                "$set": {
                    "status": "completed",
                    "overall_score": overall_score,
                    "completed_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    @staticmethod
    def save_results(interview_id: str, results: dict) -> str:
        """Save interview results"""
        db = Database.get_db()
        results_id = str(uuid.uuid4())
        
        results_doc = {
            "_id": results_id,
            "interview_id": interview_id,
            "overall_score": results.get("overall_score", 0),
            "total_questions": results.get("total_questions", 0),
            "answers_breakdown": results.get("answers", []),
            "weak_areas": results.get("weak_areas", []),
            "weak_area_details": results.get("weak_area_details", {}),
            "created_at": datetime.utcnow(),
        }
        
        db.results.insert_one(results_doc)
        return results_id
    
    @staticmethod
    def save_improvement_plan(interview_id: str, results_id: str, plan: dict) -> str:
        """Save improvement plan"""
        db = Database.get_db()
        plan_id = str(uuid.uuid4())
        
        plan_doc = {
            "_id": plan_id,
            "interview_id": interview_id,
            "results_id": results_id,
            "weak_areas": plan.get("weak_areas", []),
            "recommendations": plan.get("recommendations", {}),
            "resources": plan.get("resources", {}),
            "timeline": plan.get("timeline", ""),
            "next_steps": plan.get("next_steps", []),
            "created_at": datetime.utcnow(),
        }
        
        db.improvement_plans.insert_one(plan_doc)
        return plan_id
    
    @staticmethod
    def get_results(interview_id: str) -> dict:
        """Get results for interview"""
        db = Database.get_db()
        return db.results.find_one({"interview_id": interview_id})
    
    @staticmethod
    def get_improvement_plan(interview_id: str) -> dict:
        """Get improvement plan for interview"""
        db = Database.get_db()
        return db.improvement_plans.find_one({"interview_id": interview_id})
    
    @staticmethod
    def get_interview_answers(interview_id: str) -> list:
        """Get all answers for interview"""
        db = Database.get_db()
        return list(db.answers.find({"interview_id": interview_id}))
