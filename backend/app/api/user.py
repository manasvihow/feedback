from fastapi import Depends, APIRouter, HTTPException
from app.models.user import UserDB
from pydantic import BaseModel, EmailStr
from typing import List, Literal
import base64
import os
from app.utils.auth import hash_password, verify_password
from datetime import timedelta


router = APIRouter(prefix="/user", tags=["user"])

# Register User 
class UserCreateDTO(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["manager", "employee", "admin"]

@router.post("/register", response_model=UserPublicDTO)
async def register_user(user: UserCreateDTO):
    existing = await UserDB.find_one(UserDB.email == user.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user=UserDB(name=user.name.title(), email=user.email, password_hashed=hash_password(user.password), role= user.role)

    try:
        await new_user.insert()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    noPasswordUser = UserPublicDTO(name=new_user.name, email=new_user.email, role=new_user.role)
    return noPasswordUser


# Login User
class UserPublicDTO(BaseModel):
    name: str
    email: EmailStr
    role: str

class UserLoginDTO(BaseModel):
    email: EmailStr
    password: str

@router.post("/login", response_model=UserPublicDTO)
async def login(credentials: UserLoginDTO):
    existing = await UserDB.find_one(UserDB.email == credentials.email)
    if not existing:
        raise HTTPException(status_code=400, detail="User does not exist, please register first")
    if not verify_password(credentials.password, existing.password_hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"name": existing.name, "email": existing.email, "role": existing.role}



@router.post("/bulk-register", response_model=List[UserPublicDTO])
async def bulk_register(users: List[UserCreateDTO]):

    collated_response = []

    for user in users:
        collated_response.append(await register_user(user))
    
    return collated_response


@router.get("/all", response_model=List[UserPublicDTO])
async def getAllUsers():
    return await UserDB.find_all(projection_model=UserPublicDTO).to_list() 
