"""
Question management models and services for CSV handling and dice functionality.
"""
import csv
import io
import random
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, validator


class QuestionData(BaseModel):
    """Individual question data from CSV."""
    question: str
    answer: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    
    @validator('question')
    def validate_question(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError('Question must be at least 10 characters long')
        if len(v) > 500:
            raise ValueError('Question must be less than 500 characters')
        return v.strip()
    
    @validator('answer')
    def validate_answer(cls, v):
        if not v or len(v.strip()) < 1:
            raise ValueError('Answer cannot be empty')
        if len(v) > 200:
            raise ValueError('Answer must be less than 200 characters')
        return v.strip()


class QuestionSet(BaseModel):
    """Collection of questions from a CSV file."""
    set_id: str
    name: str
    category: str
    questions: List[QuestionData]
    created_at: datetime
    file_path: str
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class QuestionManager:
    """Manages CSV question files and random selection."""
    
    def __init__(self):
        self.question_sets: Dict[str, QuestionSet] = {}
        self._load_default_questions()
    
    def parse_csv(self, file_content: str, filename: str) -> QuestionSet:
        """Parse CSV content and create a QuestionSet."""
        try:
            # Parse CSV content
            csv_reader = csv.DictReader(io.StringIO(file_content))
            questions = []
            
            # Validate headers
            required_headers = {'question', 'answer'}
            headers = set(csv_reader.fieldnames or [])
            if not required_headers.issubset(headers):
                missing = required_headers - headers
                raise ValueError(f"Missing required CSV headers: {', '.join(missing)}")
            
            # Parse questions
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    question_data = QuestionData(
                        question=row.get('question', ''),
                        answer=row.get('answer', ''),
                        category=row.get('category', '').strip() or None,
                        difficulty=row.get('difficulty', '').strip() or None
                    )
                    questions.append(question_data)
                except ValueError as e:
                    raise ValueError(f"Row {row_num}: {str(e)}")
            
            if not questions:
                raise ValueError("CSV file contains no valid questions")
            
            if len(questions) > 1000:
                raise ValueError("CSV file contains too many questions (max 1000)")
            
            # Create question set
            set_id = str(uuid.uuid4())
            question_set = QuestionSet(
                set_id=set_id,
                name=filename.replace('.csv', ''),
                category=self._determine_category(questions),
                questions=questions,
                created_at=datetime.now(),
                file_path=f"/uploads/{set_id}.csv"
            )
            
            self.question_sets[set_id] = question_set
            return question_set
            
        except Exception as e:
            raise ValueError(f"Failed to parse CSV: {str(e)}")
    
    def validate_csv_format(self, file_content: str) -> bool:
        """Validate CSV format without creating a question set."""
        try:
            self.parse_csv(file_content, "validation.csv")
            return True
        except ValueError:
            return False
    
    def get_random_question(self, set_id: str, exclude_indices: Set[int]) -> Tuple[QuestionData, int]:
        """Get random question ensuring no repeats within session."""
        if set_id not in self.question_sets:
            raise ValueError(f"Question set {set_id} not found")
        
        questions = self.question_sets[set_id].questions
        available_indices = [i for i in range(len(questions)) if i not in exclude_indices]
        
        # If all questions used, reset (allow repeats after full cycle)
        if not available_indices:
            available_indices = list(range(len(questions)))
        
        selected_index = random.choice(available_indices)
        return questions[selected_index], selected_index
    
    def get_question_set(self, set_id: str) -> Optional[QuestionSet]:
        """Get question set by ID."""
        return self.question_sets.get(set_id)
    
    def list_question_sets(self) -> List[QuestionSet]:
        """List all available question sets."""
        return list(self.question_sets.values())
    
    def delete_question_set(self, set_id: str) -> bool:
        """Delete a question set."""
        if set_id in self.question_sets:
            del self.question_sets[set_id]
            return True
        return False
    
    def _determine_category(self, questions: List[QuestionData]) -> str:
        """Determine category based on question content."""
        categories = [q.category for q in questions if q.category]
        if categories:
            # Return most common category
            return max(set(categories), key=categories.count)
        return "Mixed"
    
    def _load_default_questions(self):
        """Load default question set from bundled CSV."""
        try:
            import os
            default_csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'default_questions.csv')
            
            if os.path.exists(default_csv_path):
                with open(default_csv_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create default question set with fixed ID
                default_set = self.parse_csv(content, "Default Questions")
                default_set.set_id = "default"
                default_set.name = "Default Questions"
                default_set.category = "Mixed"
                self.question_sets["default"] = default_set
        except Exception as e:
            print(f"Warning: Could not load default questions: {e}")


# Global question manager instance
question_manager = QuestionManager()