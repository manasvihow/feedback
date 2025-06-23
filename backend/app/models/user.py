from beanie import Document
from pydantic import Field
from typing import Literal
from pydantic import  EmailStr
from bson import ObjectId

class UserDB(Document):
    name: str
    email: EmailStr = Field(..., unique=True)
    password_hashed: str  # stored securely if auth is implemented
    role: Literal["manager", "employee", "admin"]

    class Settings:
        name = "users"
        bson_encoders = {ObjectId: str}