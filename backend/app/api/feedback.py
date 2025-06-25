from fastapi import APIRouter, HTTPException, Query, Path, Body
from app.models.feedback import FeedbackDB
from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import datetime
from app.models.user import UserDB
from app.models.team import TeamDB

router = APIRouter(prefix="/feedback", tags=["feedback"])



#creating feedbacks 
class FeedbackCreate(BaseModel):
    feedbackId: Optional[str]
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
    
    creator_team = await TeamDB.find_one({ "$or" : [{"member_emails": creator.email}, {"manager_email": creator.email}]})
    
    employee = await UserDB.find_one(UserDB.email == data.employee_email)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    employee_team = await TeamDB.find_one(TeamDB.member_emails == employee.email)

    if employee_team != creator_team:
        raise HTTPException(status_code=400, detail="You can only send feedbacks to your team members")
    if creator.role == "manager" and data.is_anon:
        raise HTTPException(status_code=400, detail="Managers can't send anonymous feedback")
    if creator.role == "employee" and data.created_by_email == data.employee_email:
        raise HTTPException(status_code=400, detail="Cannot send feedback to yourself")


    if data.feedbackId != "":
        existing = await FeedbackDB.get(data.feedbackId)

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
    creator_email: str
    employee_email: str
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
        raw_feedbacks = await FeedbackDB.find({ "$or": [{ FeedbackDB.employee_email: user.email}, { FeedbackDB.created_by_email: user.email}]}).to_list()
    else:
        raise HTTPException(status_code=404, detail="User not found")
    
    name_feedbacks = []

    for fb in raw_feedbacks:
        # skip draft feedbacks for employee
        if user.email == fb.employee_email and fb.status == "draft":
            continue

        # determine names
        employee_name = ""
        creator_name = "Anonymous" if fb.is_anon else fb.created_by_email
        creator_email = ""
        employee_email = fb.employee_email

        if user.role == "manager":
            employee = await UserDB.find_one(UserDB.email == fb.employee_email)
            employee_name = employee.name if employee else "Invalid"
            creator_name = user.name
            creator_email = user.email
        elif user.role == "employee":
            creator = await UserDB.find_one(UserDB.email == fb.created_by_email)
            creator_name = creator.name if creator else "Invalid"
            creator_email = fb.created_by_email

        # prepare preview
        if fb.status == "requested":
            preview = ""
        else:
            strengths = fb.strengths or ""
            preview = strengths[:60] + ("..." if len(strengths) > 60 else "")
        
        dto = FeedbackListDTO(
            id=str(fb.id),
            employee_name=employee_name,
            employee_email=employee_email,
            creator_name=creator_name,
            creator_email=creator_email,
            sentiment=fb.sentiment,
            status=fb.status,
            preview=preview,
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
    created_at: Optional[datetime]
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
    
    requestor_team = await TeamDB.find_one(TeamDB.member_emails == requestor.email)
    giver_team = await TeamDB.find_one(TeamDB.manager_email == giver.email)
    if not giver_team:
        giver_team = await TeamDB.find_one(TeamDB.member_emails == giver.email)

    if requestor_team != giver_team:
        raise HTTPException(status_code=400, detail="You can only request feedback from your team members")

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
    if data.feedbackId != "":
        existing_draft = await FeedbackDB.get(data.feedbackId)

        if existing_draft:
            await existing_draft.set({
                FeedbackDB.strengths : data.strengths,
                FeedbackDB.areas_to_improve : data.areas_to_improve,
                FeedbackDB.sentiment : data.sentiment,
                FeedbackDB.tags : data.tags,
                FeedbackDB.is_anon : data.is_anon,
                FeedbackDB.updated_at : datetime.utcnow(),
                FeedbackDB.status: "draft"
            })

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
