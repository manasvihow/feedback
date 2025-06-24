from fastapi import APIRouter, HTTPException, Query, Path, Body
from app.models.feedback import FeedbackDB
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import datetime
from app.models.user import UserDB

router = APIRouter(prefix="/feedback", tags=["feedback"])



#creating feedbacks 
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


    existing = await FeedbackDB.find_one(
        (FeedbackDB.created_by_email == creator.email),
        (FeedbackDB.employee_email == employee.email),
        (FeedbackDB.status == "requested")
    )

    if existing:
        existing.strengths = data.strengths
        existing.areas_to_improve = data.areas_to_improve
        existing.sentiment = data.sentiment
        existing.tags = data.tags
        existing.status = data.status
        existing.is_anon = data.is_anon
        existing.created_at = datetime.utcnow()
        existing.updated_at = datetime.utcnow()
        await existing.save()
        return {"message": "requested feedback submitted successfully", "id": str(existing.id)}

    feedback = FeedbackDB(
        created_by_email=creator.email,
        created_by_role=creator.role,
        is_anon=data.is_anon,
        employee_email=employee.email,
        strengths=data.strengths,
        areas_to_improve=data.areas_to_improve,
        sentiment=data.sentiment,
        tags=data.tags,
        status=data.status,
        requested_at=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        acknowledged_at=None
    )
    await feedback.insert()
    return {"message": "feedback submitted successfully", "id": str(feedback.id)}



#getting feedback list
class FeedbackListDTO(BaseModel):
    id: str
    employee_name: str
    creator_name: str
    sentiment: Optional[Literal["positive", "negative", "neutral"]]
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    preview: str  

@router.get("/get-all", response_model=List[FeedbackListDTO])
async def get_all(email: str = Query(...)):
    user = await UserDB.find_one(UserDB.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    raw_feedbacks = []

    if user.role == "manager":
        raw_feedbacks = await FeedbackDB.find(FeedbackDB.created_by_email == user.email).to_list()
    elif user.role == "employee":
        raw_feedbacks = await FeedbackDB.find(FeedbackDB.employee_email == user.email).to_list()
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
    name_feedbacks = []

    for fb in raw_feedbacks:
        employee_name = "Unknown"
        creator_name = "Anonymous" if fb.is_anon else "Unknown"

        if user.role == "manager":
            employee_email = fb.employee_email
            employee = await UserDB.find_one(UserDB.email == employee_email)
            employee_name = employee.name if employee else "Invalid"
        if user.role == "employee":
            creator_email = fb.created_by_email
            creator = await UserDB.find_one(UserDB.email == creator_email)
            creator_name = creator.name if creator else "Invalid"

        status = fb.status 
        if status == "requested":
            preview = "Create Feedback"
        else: 
            strengths = fb.strengths or ""
            preview = strengths[:60] + ("..." if len(strengths) > 60 else "")

        dto = FeedbackListDTO(
            id = str(fb.id),
            employee_name = employee_name,
            creator_name = creator_name,
            sentiment = fb.sentiment,
            status = fb.status,
            preview = preview,
        )
        name_feedbacks.append(dto)
    return name_feedbacks
    
        
#getting a single feedback for detailed view
class FeedbackPublicDTO(BaseModel):
    created_by_email: str
    created_by_role: str
    is_anon: bool = False
    employee_email: str
    strengths: str
    areas_to_improve: str
    sentiment: Optional[Literal["positive", "negative", "neutral"]]
    tags: Optional[List[str]] = []
    status: Literal["requested", "draft", "submitted", "acknowledged"]

    requested_at: Optional[datetime]
    created_at: datetime=Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]

@router.get("/{feedback_id}", response_model=FeedbackPublicDTO)
async def get_feedback(feedback_id: str = Path(...), requestor_email: str = Query(...)):
    requestor = await UserDB.find_one(UserDB.email == requestor_email)
    if not requestor:
        raise HTTPException(status_code=404, detail="user not found")
    
    feedback = await FeedbackDB.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="feedback not found")

    is_creator = requestor_email == feedback.created_by_email
    is_recipient = requestor.email == feedback.employee_email


    if not (is_creator or is_recipient):
        raise HTTPException(status_code=403, detail="access denied")
    
    feedback_data = feedback.dict()

    if feedback.is_anon and is_recipient:
        feedback_data["created_by_email"] = "Anonymous"

    return feedback_data


#acknowledging feedback
@router.post("/{feedback_id}/acknowledge")

async def acknowledge_feedback(feedback_id: str = Path(...), employee_email: str = Body(..., embed=True)):
    employee = await UserDB.find_one(UserDB.email == employee_email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
     
    feedback = await FeedbackDB.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    if str(employee.email) != feedback.employee_email:
        raise HTTPException(status_code=403, detail="Unauthorised")
    
    if feedback.status == "acknowledged":
        return {"message": "already acknowledged"}
    
    feedback.status = "acknowledged"
    feedback.acknowledged_at = datetime.utcnow()
    await feedback.save()

    return {"message": "feedback acknowledged successfully"}



#requesting feedback
class FeedbackRequestDTO(BaseModel):
    requestor_email: str  
    giver_email: str
    tags: Optional[List[str]] = []

@router.post("/request", response_model=dict)
async def request_feedback(data: FeedbackRequestDTO):
    requestor = await UserDB.find_one(UserDB.email == data.requestor_email)
    if not requestor:
        raise HTTPException(status_code=404, detail="User not found")

    if requestor.role == "manager":
        raise HTTPException(status_code=400, detail="Managers can't request feedback")

    giver = await UserDB.find_one(UserDB.email == data.giver_email)
    if not giver:
        raise HTTPException(status_code=404, detail="User not found")

    if giver.email == requestor.email:
        raise HTTPException(status_code=400, detail="Cannot request feedback from yourself")

    existing = await FeedbackDB.find_one(
        FeedbackDB.created_by_email == giver.email,
        FeedbackDB.employee_email == requestor.email,
        FeedbackDB.status == "requested"
    )


    if existing:
        raise HTTPException(status_code=409, detail="Request already exists")

    feedback = FeedbackDB(
        created_by_email=giver.email,
        created_by_role=giver.role,
        is_anon=False,
        employee_email=requestor.email,
        strengths="",
        areas_to_improve="",
        sentiment=None,
        tags=data.tags,
        status="requested",
        requested_at=datetime.utcnow(),
        created_at=None,
        updated_at=None,
        acknowledged_at=None,
    )
    await feedback.insert()
    return {"message": "feedback request created", "id": str(feedback.id)}

@router.post("/draft", response_model=dict)
async def save_feedback_draft(data: FeedbackCreate):
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

    # Save as draft (overwrite if a draft exists)
    existing_draft = await FeedbackDB.find_one(
        FeedbackDB.created_by_email == creator.email,
        FeedbackDB.employee_email == employee.email,
        FeedbackDB.status == "draft"
    )

    if existing_draft:
        existing_draft.strengths = data.strengths
        existing_draft.areas_to_improve = data.areas_to_improve
        existing_draft.sentiment = data.sentiment
        existing_draft.tags = data.tags
        existing_draft.is_anon = data.is_anon
        existing_draft.updated_at = datetime.utcnow()
        await existing_draft.save()
        return {"message": "draft updated", "id": str(existing_draft.id)}

    
    feedback = FeedbackDB(
        created_by_email=creator.email,
        created_by_role=creator.role,
        is_anon=data.is_anon,
        employee_email=employee.email,
        strengths=data.strengths,
        areas_to_improve=data.areas_to_improve,
        sentiment=data.sentiment,
        tags=data.tags,
        status="draft",
        requested_at=None,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        acknowledged_at=None
    )
    await feedback.insert()
    return {"message": "draft saved", "id": str(feedback.id)}


class FeedbackUpdateDTO(BaseModel):
    strengths: Optional[str]
    areas_to_improve: Optional[str]
    sentiment: Optional[Literal["positive", "negative", "neutral"]]
    tags: Optional[List[str]]
    is_anon: Optional[bool]
    status: Optional[Literal["draft", "submitted"]]

@router.put("/{feedback_id}/update", response_model=dict)
async def update_feedback(
    feedback_id: str = Path(...),
    data: FeedbackUpdateDTO = Body(...)
):
    feedback = await FeedbackDB.get(feedback_id)
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    if feedback.status == "acknowledged":
        raise HTTPException(status_code=400, detail="Cannot update acknowledged feedback")

    
    for field, value in data.dict(exclude_unset=True).items():
        setattr(feedback, field, value)

    feedback.updated_at = datetime.utcnow()
    await feedback.save()
    return {"message": "feedback updated", "id": str(feedback.id)}
