from beanie import Document
from typing import List
from pydantic import  EmailStr
from datetime import datetime

class TeamDB(Document):
    manager_email: EmailStr
    member_emails: List[EmailStr]
    
    created_at: datetime
    updated_at: datetime
    

    class Settings:
        name = "teams"