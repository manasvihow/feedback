from beanie import Document
from pydantic import Field
from typing import Literal, Optional, List
from datetime import datetime

class FeedbackDB(Document):
    created_by_email: str
    created_by_role: str
    is_anon: bool = False
    employee_email: str
    strengths: str
    areas_to_improve: str
    sentiment: Optional[Literal["positive", "negative", "neutral"]] = None
    tags: Optional[List[str]] = []
    status: Literal["requested", "draft", "submitted", "acknowledged"]

    requested_at: Optional[datetime]
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]

class Settings:
    name="feedback"