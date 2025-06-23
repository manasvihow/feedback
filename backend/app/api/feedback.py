from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body
from app.models.feedback import FeedbackDB
from pydantic import BaseModel
from typing import Literal, Optional, List
from datetime import datetime
from app.models.user import UserDB

router = APIRouter(prefix="/feedback", tags=["feedback"])

class FeedbackCreate(BaseModel):
    created_by_email: str
    employee_email: str
    strengths: str
    areas_to_improve: str
    sentiment: Literal["positive", "negative", "neutral"]
    tags: Optional[List[str]] = []
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    is_anon: Optional[bool] = False

@router.post("/create", response_model=dict)
async def create_feedback(data: FeedbackCreate):
    creator = await UserDB.find_one(UserDB.email == data.created_by_email)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    
    employee = await UserDB.find_one(UserDB.email == data.employee_email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    if creator.role == "manager" and data.is_anon:
        raise HTTPException(status_code=400, detail="Managers can't send anonymous feedback")
    if creator.role == "employee" and data.created_by_email == data.employee_email:
        raise HTTPException(status_code=400, detail="Cannot send feedback to yourself")
    
    feedback = FeedbackDB(
        created_by_email = creator.email,
        created_by_role = creator.role,
        is_anon = data.is_anon,
        employee_id = str(employee.id),
        strengths = data.strengths,
        areas_to_improve = data.areas_to_improve,
        sentiment = data.sentiment,
        tags = data.tags,
        status = data.status,

        requested_at = None,
        created_at = datetime.utcnow(),
        updated_at = datetime.utcnow(),
        acknowledged_at = None
    )
    await feedback.insert()

    return {"message": "feedback submitted successfully", "id": str(feedback.id)}


@router.get("/get-all")
async def get_all(email: str = Query (...)):
    user = await UserDB.find_one(UserDB.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == "manager":
        feedbacks = await FeedbackDB.find(FeedbackDB.created_by_email == user.email).to_list()
    
    elif user.role == "employee":
        feedbacks = await FeedbackDB.find(FeedbackDB.employee_id == str(user.id)).to_list()

        for fb in feedbacks:
            if fb.is_anon:
                fb.created_by_email = "Anonymous"
    else:
        raise HTTPException(status_code=403, details="Unknown role")
    return feedbacks

class FeedbackPublicDTO(BaseModel):
    created_by_email: str
    created_by_role: str
    is_anon: bool = False
    employee_id: str
    strengths: str
    areas_to_improve: str
    sentiment: Literal["positive", "negative", "neutral"]
    tags: Optional[List[str]] = []
    status: Literal["requested", "draft", "submitted", "acknowledged"]

    requested_at: Optional[datetime]
    created_at: datetime=Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]

@router.get("/{feedback_id}", response_model=List[FeedbackPublicDTO])
async def get_feedback(feedback_id: str = Path(...), requestor_email: str = Query(...)):
    requestor = await UserDB.find_one(UserDB.email == requestor_email)
    if not requestor:
        raise HTTPException(status_code=404, detail="user not found")
    
    feedback = await FeedbackDB.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="feedback not found")

    is_creator = requestor_email == feedback.created_by_email
    is_recipient = str(requestor.id) == feedback.employee_id

    if not (is_creator or is_recipient):
        raise HTTPException(status_code=403, detail="access denied")
    
    feedback_data = feedback.dict()

    if feedback.is_anon and is_recipient:
        feedback_data["created_by_email"] = "Anonymous"

    return feedback_data
    
@router.post("/{feedback_id}/acknowledge")
async def acknowledge_feedback(feedback_id: str = Path(...), employee_email: str = Body(..., embed=True)):
    employee = await UserDB.find_one(UserDB.email == employee_email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
     
    feedback = await FeedbackDB.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if str(employee.id) != feedback.employee_id:
        raise HTTPException(status_code=403, detail="Unauthorised")
    
    if feedback.status == "acknowledged":
        return {"message": "already acknowledged"}
    
    feedback.status = "acknowledged"
    feedback.acknowledged_at = datetime.utcnow()
    await feedback.save()

    return {"message": "feedback acknowledged successfully"}