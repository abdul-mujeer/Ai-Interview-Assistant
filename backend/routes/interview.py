from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.schemas import (
    InterviewStartRequest, InterviewSession, InterviewQuestion,
    AnswerEvaluationRequest, AnswerEvaluation, InterviewResults,
    ImprovementPlan
)
from services.database import Database
from services.gemini_service import GeminiService
from datetime import datetime
from typing import List

router = APIRouter(prefix="/api/interview", tags=["interview"])

class GenerateQuestionsRequest(BaseModel):
    """Request to generate questions"""
    resume_id: str
    skill_focus: List[str] = []

@router.post("/start", response_model=InterviewSession)
async def start_interview(request: InterviewStartRequest):
    """Start new interview session"""
    try:
        # Verify resume exists
        resume = Database.get_resume(request.resume_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        # Generate questions based on skills
        skills = [s.get('name') if isinstance(s, dict) else s.name for s in resume.get('skills', [])]
        
        if not skills:
            skills = ["General Technical Knowledge", "Problem Solving", "Communication"]
        
        questions_data = GeminiService.generate_questions(skills, count=5)
        
        # Create question objects
        questions = [
            InterviewQuestion(
                id=f"q_{i+1}",
                question_number=i + 1,
                text=q.get('question', ''),
                category=q.get('category', 'General'),
                difficulty=q.get('difficulty', 'medium'),
                estimated_time=60
            )
            for i, q in enumerate(questions_data)
        ]
        
        # Save to database
        interview_id = Database.create_interview(
            resume_id=request.resume_id,
            questions=[q.dict() for q in questions],
            user_id=request.user_id or "user_default"
        )
        
        return InterviewSession(
            interview_id=interview_id,
            resume_id=request.resume_id,
            questions=questions,
            current_question_index=0,
            status="in_progress",
            created_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error starting interview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error starting interview: {str(e)}"
        )

@router.get("/{interview_id}", response_model=InterviewSession)
async def get_interview(interview_id: str):
    """Get interview details"""
    try:
        interview = Database.get_interview(interview_id)
        
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        questions = [
            InterviewQuestion(**q) if isinstance(q, dict) else q
            for q in interview.get('questions', [])
        ]
        
        return InterviewSession(
            interview_id=interview['_id'],
            resume_id=interview['resume_id'],
            questions=questions,
            current_question_index=interview.get('current_question_index', 0),
            status=interview.get('status', 'in_progress'),
            created_at=interview['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{interview_id}/submit-answer")
async def submit_answer(interview_id: str, request: AnswerEvaluationRequest):
    """Submit answer and get evaluation"""
    try:
        # Verify interview exists
        interview = Database.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Evaluate answer
        evaluation_data = GeminiService.evaluate_answer(
            question=request.question_text,
            answer=request.answer_transcript
        )
        
        # Save answer
        answer_id = Database.save_answer(
            interview_id=interview_id,
            question_id=request.question_id,
            question_text=request.question_text,
            transcript=request.answer_transcript,
            evaluation=evaluation_data
        )
        
        return AnswerEvaluation(
            question_id=request.question_id,
            score=evaluation_data.get('score', 0),
            feedback=evaluation_data.get('feedback', ''),
            strengths=evaluation_data.get('strengths', []),
            weaknesses=evaluation_data.get('weaknesses', []),
            suggestions=evaluation_data.get('suggestions', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error evaluating answer: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error evaluating answer: {str(e)}"
        )

@router.post("/{interview_id}/complete", response_model=InterviewResults)
async def complete_interview(interview_id: str):
    """Complete interview and calculate results"""
    try:
        interview = Database.get_interview(interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        # Get all answers
        answers = Database.get_interview_answers(interview_id)
        
        if not answers:
            raise HTTPException(status_code=400, detail="No answers submitted")
        
        # Calculate overall score
        scores = [a.get('evaluation', {}).get('score', 0) for a in answers]
        overall_score = sum(scores) / len(scores) if scores else 0
        
        # Identify weak areas (score < 60)
        weak_areas = []
        weak_area_details = {}
        
        for answer in answers:
            eval_data = answer.get('evaluation', {})
            if eval_data.get('score', 0) < 60:
                question = answer.get('question_text', 'Unknown')
                weak_areas.append(question)
                weak_area_details[question] = {
                    'score': eval_data.get('score', 0),
                    'weaknesses': eval_data.get('weaknesses', [])
                }
        
        # Create results
        results = {
            'interview_id': interview_id,
            'overall_score': round(overall_score, 1),
            'total_questions': len(answers),
            'answers': [
                {
                    'question_id': a.get('question_id'),
                    'score': a.get('evaluation', {}).get('score', 0),
                    'feedback': a.get('evaluation', {}).get('feedback', '')
                }
                for a in answers
            ],
            'weak_areas': list(set(weak_areas)),
            'weak_area_details': weak_area_details
        }
        
        # Save results
        results_id = Database.save_results(interview_id, results)
        
        # Mark interview as completed
        Database.complete_interview(interview_id, overall_score)
        
        return InterviewResults(
            interview_id=interview_id,
            overall_score=results['overall_score'],
            total_questions=results['total_questions'],
            answers=[
                AnswerEvaluation(
                    question_id=a['question_id'],
                    score=a['score'],
                    feedback=a['feedback'],
                    strengths=[],
                    weaknesses=[],
                    suggestions=[]
                )
                for a in results['answers']
            ],
            weak_areas=results['weak_areas'],
            weak_area_details=results['weak_area_details'],
            created_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error completing interview: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error completing interview: {str(e)}"
        )

@router.post("/{interview_id}/improvement-plan", response_model=ImprovementPlan)
async def generate_improvement_plan(interview_id: str):
    """Generate improvement plan based on interview results"""
    try:
        results = Database.get_results(interview_id)
        if not results:
            raise HTTPException(status_code=404, detail="Results not found")
        
        weak_areas = results.get('weak_areas', [])
        answers = Database.get_interview_answers(interview_id)
        
        # Prepare evaluations summary
        evaluations = [
            a.get('evaluation', {})
            for a in answers[-3:]  # Last 3 answers
        ]
        
        # Generate improvement plan
        plan_data = GeminiService.generate_improvement_plan(weak_areas, evaluations)
        
        # Save improvement plan
        plan_id = Database.save_improvement_plan(
            interview_id=interview_id,
            results_id=results.get('_id'),
            plan=plan_data
        )
        
        return ImprovementPlan(
            weak_areas=plan_data.get('weak_areas', weak_areas),
            recommendations=plan_data.get('recommendations', {}),
            resources=plan_data.get('resources', {}),
            timeline=plan_data.get('timeline', '1 month'),
            next_steps=plan_data.get('next_steps', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating improvement plan: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating improvement plan: {str(e)}"
        )

@router.get("/{interview_id}/results", response_model=InterviewResults)
async def get_results(interview_id: str):
    """Get interview results"""
    try:
        results = Database.get_results(interview_id)
        if not results:
            raise HTTPException(status_code=404, detail="Results not found")
        
        return InterviewResults(
            interview_id=results['interview_id'],
            overall_score=results['overall_score'],
            total_questions=results['total_questions'],
            answers=[
                AnswerEvaluation(
                    question_id=a.get('question_id'),
                    score=a.get('score', 0),
                    feedback=a.get('feedback', ''),
                    strengths=[],
                    weaknesses=[],
                    suggestions=[]
                )
                for a in results.get('answers_breakdown', [])
            ],
            weak_areas=results.get('weak_areas', []),
            weak_area_details=results.get('weak_area_details', {}),
            created_at=results['created_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
