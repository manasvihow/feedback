from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from app.models.user import UserDB
from app.models.team import TeamDB
from app.models.feedback import FeedbackDB

import os
from dotenv import load_dotenv

load_dotenv()

async def init_db():
    client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
    db = client[os.getenv("DATABASE_NAME")]

    await init_beanie(
        database = db,
        document_models = [
            UserDB,
            FeedbackDB,
            TeamDB
        ]
    )
