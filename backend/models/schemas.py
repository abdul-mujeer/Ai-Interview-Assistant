from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# ==================== Resume Models ====================

class ResumeAnalyzeRequest(BaseModel):
    """Request to analyze uploaded resume"""
    filename: str
    file_content: str  # Base64 encoded PDF content
    
class SkillExtracted(BaseModel):
    """Extracted skill from resume"""
    name: str
    level: Optional[str] = "intermediate"  # beginner, intermediate, expert
    category: Optional[str] = None  # programming, soft, domain, etc.

class ResumeResponse(BaseModel):
    """Response after resume analysis"""
    resume_id: str
    filename: str
    skills: List[SkillExtracted]
    parsed_text: str
    uploaded_at: datetime

# ==================== Interview Models ====================

class InterviewStartRequest(BaseModel):
    """Request to start new interview"""
    resume_id: str
    user_id: Optional[str] = "user_default"

class InterviewQuestion(BaseModel):
    """Interview question"""
    id: str
    question_number: int
    text: str
    category: str
    difficulty: str
    estimated_time: int = 60  # seconds

class InterviewSession(BaseModel):
    """Interview session data"""
    interview_id: str
    resume_id: str
    questions: List[InterviewQuestion]
    current_question_index: int = 0
    status: str = "in_progress"  # in_progress, completed
    created_at: datetime

class AnswerEvaluationRequest(BaseModel):
    """Request to evaluate answer"""
    interview_id: str
    question_id: str
    question_text: str
    answer_transcript: str

class AnswerEvaluation(BaseModel):
    """Evaluation of answer"""
    question_id: str
    score: float  # 0-100
    feedback: str
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]

class InterviewResults(BaseModel):
    """Final interview results"""
    interview_id: str
    overall_score: float  # 0-100
    total_questions: int
    answers: List[AnswerEvaluation]
    weak_areas: List[str]
    weak_area_details: dict  # Maps weak area to feedback
    created_at: datetime

class ImprovementPlan(BaseModel):
    """Personalized improvement plan"""
    weak_areas: List[str]
    recommendations: dict  # Maps each weak area to list of recommendations
    resources: dict  # Maps weak area to learning resources
    timeline: str  # Suggested practice timeline
    next_steps: List[str]

# ==================== Health Check ====================

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    message: str
    timestamp: datetime
    backend_version: str = "1.0.0"
