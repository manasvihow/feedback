from fastapi import APIRouter, HTTPException, Query
from app.models.user import UserDB
from app.models.team import TeamDB
from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import List

router = APIRouter(prefix="/team", tags=["teams"])

class TeamCreateDTO(BaseModel):
    manager_email: EmailStr
    member_emails: List[EmailStr] 

@router.post("/create", response_model=dict)
async def create_team(
    data: TeamCreateDTO,
    admin_email: str = Query(...)
):
    
    
    admin = await UserDB.find_one(UserDB.email == admin_email)
    if not admin or admin.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create teams")

    
    manager = await UserDB.find_one(UserDB.email == data.manager_email)
    if not manager or manager.role != "manager":
        raise HTTPException(status_code=400, detail="Invalid manager email")

    
    for email in data.member_emails:
        user = await UserDB.find_one(UserDB.email == email)
        if not user or user.role != "employee":
            raise HTTPException(status_code=400, detail=f"Invalid member: {email}")

    
    team = TeamDB(
        manager_email=data.manager_email,
        member_emails=data.member_emails,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    await team.insert()

    return {"message": "Team created", "id": str(team.id)}
