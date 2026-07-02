import json
import re
from typing import List, Dict
from openai import OpenAI, APIError
from config.settings import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class OpenAIService:
    """Service for all OpenAI API interactions"""
    
    @staticmethod
    def extract_skills(resume_text: str) -> List[Dict]:
        """Extract skills from resume using GPT"""
        try:
            prompt = f"""
Analyze this resume and extract all technical and soft skills. 
Format response as JSON array with objects having: name, level (beginner/intermediate/expert), category (technical/soft/domain).

Resume:
{resume_text}

Return ONLY valid JSON array, no other text.
"""
            
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a resume analyzer. Extract skills from resumes."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1500
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Try to extract JSON from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                skills = json.loads(json_match.group())
                return skills
            return []
            
        except APIError as e:
            print(f"OpenAI API Error: {e}")
            return []
    
    @staticmethod
    def generate_questions(skills: List[str], count: int = 5) -> List[Dict]:
        """Generate interview questions based on skills"""
        try:
            skills_text = ", ".join(skills)
            prompt = f"""
Generate {count} technical interview questions for someone with these skills: {skills_text}

Requirements:
1. Mix difficulty levels: some easy, some medium, some hard
2. Focus on practical scenarios and problem-solving
3. Be specific to their skill set

Format as JSON array with objects: {{"question": "...", "category": "...", "difficulty": "..."}}
Only return valid JSON, no other text.
"""
            
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Extract JSON
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
                return questions
            return []
            
        except APIError as e:
            print(f"OpenAI API Error: {e}")
            return []
    
    @staticmethod
    def evaluate_answer(question: str, answer: str) -> Dict:
        """Evaluate interview answer using GPT"""
        try:
            prompt = f"""
Evaluate this interview answer on a scale of 0-100.

Question: {question}

Answer: {answer}

Provide evaluation as JSON with:
- score (0-100): numeric score
- feedback: brief overall feedback (1-2 sentences)
- strengths: list of 2-3 things done well
- weaknesses: list of 2-3 areas to improve
- suggestions: list of 2-3 specific improvement suggestions

Return ONLY valid JSON, no other text.
"""
            
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are an expert interviewer evaluating technical answers."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Extract JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                evaluation = json.loads(json_match.group())
                return evaluation
            
            return {
                "score": 50,
                "feedback": "Could not parse evaluation",
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            }
            
        except APIError as e:
            print(f"OpenAI API Error: {e}")
            return {
                "score": 0,
                "feedback": "Error evaluating answer",
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            }
    
    @staticmethod
    def generate_improvement_plan(weak_areas: List[str], evaluations: List[Dict]) -> Dict:
        """Generate personalized improvement plan"""
        try:
            weak_areas_text = ", ".join(weak_areas)
            evaluations_summary = json.dumps(evaluations[:3], indent=2)  # Last 3 evaluations
            
            prompt = f"""
Based on interview performance, create an improvement plan.

Weak Areas Identified: {weak_areas_text}

Recent Evaluations Summary:
{evaluations_summary}

Provide improvement plan as JSON with:
- weak_areas: list of areas to focus on
- recommendations: object mapping each weak_area to list of 3-4 specific recommendations
- resources: object mapping each weak_area to 2-3 learning resources (books, courses, practice sites)
- timeline: suggested timeline (e.g., "2 weeks", "1 month")
- next_steps: list of 3-4 immediate action items

Return ONLY valid JSON, no other text.
"""
            
            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a career coach creating improvement plans."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=1500
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Extract JSON
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                plan = json.loads(json_match.group())
                return plan
            
            return {
                "weak_areas": weak_areas,
                "recommendations": {},
                "resources": {},
                "timeline": "1 month",
                "next_steps": ["Review fundamentals", "Practice coding problems", "Do mock interviews"]
            }
            
        except APIError as e:
            print(f"OpenAI API Error: {e}")
            return {}
