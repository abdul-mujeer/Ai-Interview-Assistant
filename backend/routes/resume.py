from fastapi import APIRouter, HTTPException, UploadFile, File
from models.schemas import ResumeResponse, SkillExtracted
from services.database import Database
from services.resume_parser import ResumeParser
from services.gemini_service import GeminiService
import base64
from datetime import datetime

router = APIRouter(prefix="/api/resume", tags=["resume"])

@router.post("/upload", response_model=ResumeResponse)
async def upload_resume(file: UploadFile = File(...)):
    """Upload and analyze resume PDF"""
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are accepted"
            )
        
        # Read file content
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Empty file uploaded"
            )
        
        if len(content) > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(
                status_code=400,
                detail="File size exceeds 5MB limit"
            )
        
        # Parse resume
        parsed_text, metadata = ResumeParser.parse_resume(content, file.filename)
        
        if not parsed_text:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from PDF"
            )
        
        # Extract skills using AI
        ai_skills = GeminiService.extract_skills(parsed_text)
        
        # Combine with manually extracted skills
        all_skills = list(set(metadata.get('skills', []) + [s['name'] for s in ai_skills]))
        
        # Create skill objects
        skills_objects = [
            SkillExtracted(
                name=skill,
                level="intermediate",
                category="technical" if skill in all_skills else "other"
            )
            for skill in all_skills
        ]
        
        # Save to database
        resume_id = Database.save_resume(
            filename=file.filename,
            skills=[s.dict() for s in skills_objects],
            parsed_text=parsed_text,
            contact=metadata.get('contact', {})
        )
        
        return ResumeResponse(
            resume_id=resume_id,
            filename=file.filename,
            skills=skills_objects,
            parsed_text=parsed_text,
            uploaded_at=datetime.utcnow()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error uploading resume: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing resume: {str(e)}"
        )

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str):
    """Get resume details"""
    try:
        resume = Database.get_resume(resume_id)
        
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found"
            )
        
        skills_objects = [
            SkillExtracted(**skill) if isinstance(skill, dict) else skill
            for skill in resume.get('skills', [])
        ]
        
        return ResumeResponse(
            resume_id=resume['_id'],
            filename=resume['filename'],
            skills=skills_objects,
            parsed_text=resume['parsed_text'],
            uploaded_at=resume['uploaded_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving resume: {str(e)}"
        )
