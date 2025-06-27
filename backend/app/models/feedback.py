from beanie import Document
from pydantic import Field
from typing import Literal, Optional, List
from datetime import datetime

class FeedbackDB(Document):
    created_by_email: str
    created_by_role: str
    employee_email: str
    sentiment: Optional[Literal["positive", "negative", "neutral"]] = None
    strengths: str
    areas_to_improve: str
    tags: Optional[List[str]] = []
    is_anon: bool = False
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    
    requested_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]

class Settings:
    name="feedback"