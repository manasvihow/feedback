from fastapi import APIRouter, HTTPException, Query
from app.models.user import UserDB
from app.models.feedback import FeedbackDB
from collections import defaultdict
from datetime import datetime, timedelta
from typing import List, Literal, Optional
from app.models.team import TeamDB
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# feedback-count given/recieved
@router.get("/feedback-count", response_model=dict)
async def get_feedback_count(email: str = Query(...)):
    user = await UserDB.find_one(UserDB.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == "manager":
        count = await FeedbackDB.find(FeedbackDB.created_by_email == user.email).count()
        label = "Feedbacks Given"
    elif user.role == "employee":
        count = await FeedbackDB.find(FeedbackDB.employee_email == user.email).count()
        label = "Feedbacks Received"
    else:
        raise HTTPException(status_code=400, detail="Invalid role")

    return {"count": count, "label": label}

# sentiment-trends for manager only
@router.get("/sentiment-trends", response_model=dict)
async def sentiment_trends(email: str = Query(...)):
    user = await UserDB.find_one(UserDB.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can access sentiment trends")

    feedbacks = await FeedbackDB.find(FeedbackDB.created_by_email == email).to_list()

    # Group sentiment by month (last 6 months)
    trends = defaultdict(lambda: {"positive": 0, "neutral": 0, "negative": 0})

    now = datetime.utcnow()
    start_date = now.replace(day=1) - timedelta(days=150)  # 5 months + current month

    for fb in feedbacks:
        if fb.created_at is None:
            continue

        if fb.created_at < start_date:
            continue

        month_str = fb.created_at.strftime("%Y-%m")  # e.g., '2025-06'
        sentiment = fb.sentiment or "neutral"  # fallback
        trends[month_str][sentiment] += 1

    # Sort by month
    sorted_data = sorted(trends.items())
    labels = [month for month, _ in sorted_data]
    positive = [counts["positive"] for _, counts in sorted_data]
    neutral = [counts["neutral"] for _, counts in sorted_data]
    negative = [counts["negative"] for _, counts in sorted_data]

    return {
        "labels": labels,
        "positive": positive,
        "neutral": neutral,
        "negative": negative,
    }

#team members list

class TeamMemberDTO(BaseModel):
    name: str
    email: str
    role: str

@router.get("/team-members", response_model=List[TeamMemberDTO])
async def get_team_members(user_email: str = Query(...)):
    user = await UserDB.find_one(UserDB.email == user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # find the team this user belongs to
    team = await TeamDB.find_one({ "$or" : [{"member_emails": user.email}, {"manager_email": user.email}]})
    if not team:
        raise HTTPException(status_code=404, detail="User is not part of any team")

    # get all member and manager emails
    all_emails = list(set(team.member_emails + [team.manager_email]))
    all_emails = filter(lambda email: email != user_email, all_emails)
    users = await UserDB.find({"email": {"$in": all_emails}}).to_list()

    return [
        TeamMemberDTO(
            name=member.name,
            email=member.email,
            role=member.role
        )
        for member in users
    ]

class FeedbackTimelineDTO(BaseModel):
    id: str
    creator: str  
    updated_at: datetime
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    preview: str
@router.get("/feedback-timeline", response_model=List[FeedbackTimelineDTO])
async def get_feedback_timeline(email: str = Query(...)):
    user = await UserDB.find_one(UserDB.email == email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "manager":
        raise HTTPException(status_code=400, detail="Manager's can't access feedback timeline")

    feedbacks = await FeedbackDB.find({
        "employee_email": email,
        "status": {"$in": ["submitted", "acknowledged"]}
    }).sort("-created_at").to_list()

    timeline = []
    for fb in feedbacks:
        creator_name = "Anonymous"
        if not fb.is_anon:
            creator = await UserDB.find_one(UserDB.email == fb.created_by_email)
            creator_name = creator.name if creator else "Unknown"

        preview = (fb.strengths or "")[:60]
        if len(preview) == 60:
            preview += "..."

        timeline.append(FeedbackTimelineDTO(
            id=str(fb.id),
            creator=creator_name,
            updated_at=fb.updated_at,
            sentiment=fb.sentiment,
            preview=preview
        ))

    return timeline

class FeedBackAllAnalyticsDTO(BaseModel):
    id: str
    employee_name: str
    sentiment: Optional[Literal["positive", "neutral", "negative"]] = None
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    tags: Optional[List[str]]
    created_at: Optional[datetime]

@router.get("/all-analytics", response_model=List[FeedBackAllAnalyticsDTO])
async def get_all_analytics(user_email: str):
    user = await UserDB.find_one(UserDB.email == user_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role != "manager":
        raise HTTPException(status_code=403, detail="User is not a manager")

    team = await get_team_members(user_email)

    team_map = {}

    for t in team:
        team_map[t.email] = t

    print(team_map)
    
    raw_feedbacks = await FeedbackDB.find(FeedbackDB.created_by_email == user.email).to_list()

    dto_list = []

    for fb in raw_feedbacks:
        dto = FeedBackAllAnalyticsDTO(
            id=str(fb.id),
            employee_name=team_map[fb.employee_email].name,
            sentiment=fb.sentiment,
            status=fb.status,
            tags=fb.tags,
            created_at=fb.created_at
        )

        dto_list.append(dto)

    return dto_list

