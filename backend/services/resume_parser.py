import io
import re
from typing import Tuple
from PyPDF2 import PdfReader
import pdfplumber

class ResumeParser:
    """Service for parsing PDF resumes"""
    
    @staticmethod
    def extract_text_from_pdf(pdf_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            # Try using pdfplumber first (better quality)
            pdf_file = io.BytesIO(pdf_content)
            with pdfplumber.open(pdf_file) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        except Exception as e:
            print(f"pdfplumber error: {e}, trying PyPDF2...")
            
            # Fallback to PyPDF2
            try:
                pdf_file = io.BytesIO(pdf_content)
                reader = PdfReader(pdf_file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
            except Exception as e:
                print(f"PyPDF2 error: {e}")
                return ""
    
    @staticmethod
    def extract_contact_info(text: str) -> dict:
        """Extract contact information from resume text"""
        contact = {}
        
        # Email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
        if email_match:
            contact['email'] = email_match.group()
        
        # Phone
        phone_match = re.search(r'\+?1?\s?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}', text)
        if phone_match:
            contact['phone'] = phone_match.group()
        
        # LinkedIn
        linkedin_match = re.search(r'linkedin\.com/in/[\w\-]+', text)
        if linkedin_match:
            contact['linkedin'] = linkedin_match.group()
        
        return contact
    
    @staticmethod
    def extract_skills(text: str) -> list:
        """Extract common technical skills from resume"""
        # Comprehensive skill keywords
        common_skills = {
            # Languages
            'Python': r'\bPython\b',
            'JavaScript': r'\b(?:JavaScript|JS)\b',
            'TypeScript': r'\bTypeScript\b',
            'Java': r'\bJava\b',
            'C++': r'\bC\+\+\b',
            'C#': r'\bC#\b',
            'Go': r'\bGo\b',
            'Rust': r'\bRust\b',
            'Ruby': r'\bRuby\b',
            'PHP': r'\bPHP\b',
            'Swift': r'\bSwift\b',
            'Kotlin': r'\bKotlin\b',
            
            # Web Frameworks
            'React': r'\bReact\b',
            'Vue': r'\bVue\b',
            'Angular': r'\bAngular\b',
            'Node.js': r'\bNode\.?js\b',
            'Express': r'\bExpress\b',
            'Django': r'\bDjango\b',
            'Flask': r'\bFlask\b',
            'Spring': r'\bSpring\b',
            'FastAPI': r'\bFastAPI\b',
            'Next.js': r'\bNext\.?js\b',
            
            # Databases
            'SQL': r'\bSQL\b',
            'MongoDB': r'\bMongoDB\b',
            'PostgreSQL': r'\bPostgreSQL\b',
            'MySQL': r'\bMySQL\b',
            'Redis': r'\bRedis\b',
            'Firebase': r'\bFirebase\b',
            'DynamoDB': r'\bDynamoDB\b',
            
            # Cloud & DevOps
            'AWS': r'\bAWS\b',
            'Azure': r'\bAzure\b',
            'GCP': r'\bGCP\b',
            'Docker': r'\bDocker\b',
            'Kubernetes': r'\bKubernetes\b',
            'CI/CD': r'\b(?:CI/CD|Jenkins|GitLab|GitHub Actions)\b',
            'Terraform': r'\bTerraform\b',
            
            # Data & AI
            'Machine Learning': r'\b(?:Machine Learning|ML)\b',
            'Deep Learning': r'\bDeep Learning\b',
            'TensorFlow': r'\bTensorFlow\b',
            'PyTorch': r'\bPyTorch\b',
            'Pandas': r'\bPandas\b',
            'NumPy': r'\bNumPy\b',
            'Scikit-learn': r'\bScikit-learn\b',
            
            # Other Tools
            'Git': r'\bGit\b',
            'REST API': r'\b(?:REST|RESTful)\b',
            'GraphQL': r'\bGraphQL\b',
            'Agile': r'\bAgile\b',
            'Scrum': r'\bScrum\b',
        }
        
        found_skills = []
        for skill, pattern in common_skills.items():
            if re.search(pattern, text, re.IGNORECASE):
                found_skills.append(skill)
        
        return found_skills
    
    @staticmethod
    def parse_resume(pdf_content: bytes, filename: str) -> Tuple[str, dict]:
        """
        Complete resume parsing
        Returns: (extracted_text, metadata)
        """
        # Extract text
        text = ResumeParser.extract_text_from_pdf(pdf_content)
        
        # Extract metadata
        metadata = {
            'contact': ResumeParser.extract_contact_info(text),
            'skills': ResumeParser.extract_skills(text),
            'filename': filename,
            'text_length': len(text),
        }
        
        return text, metadata
