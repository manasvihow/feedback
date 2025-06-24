from fastapi import Depends, APIRouter, HTTPException
from app.models.user import UserDB
from pydantic import BaseModel, EmailStr
from typing import List, Literal
import base64
import os
from app.utils.auth import hash_password, verify_password
from datetime import timedelta
from app.core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/user", tags=["user"])

class UserCreateDTO(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["manager", "employee", "admin"]


class UserPublicDTO(BaseModel):
    name: str
    email: EmailStr
    role: str


@router.post("/register", response_model=UserPublicDTO)
async def register_user(user: UserCreateDTO):
    existing = await UserDB.find_one(UserDB.email == user.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    
    new_user=UserDB(name=user.name, email=user.email, password_hashed=hash_password(user.password), role= user.role)

    try:
        await new_user.insert()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


    noPasswordUser = UserPublicDTO(name=new_user.name, email=new_user.email, role=new_user.role)
    return noPasswordUser

@router.get("/all", response_model=List[UserPublicDTO])
async def getAllUsers():
    return await UserDB.find_all(projection_model=UserPublicDTO).to_list() 


class TokenDTO(BaseModel):
    access_token: str
    token_type: str

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

# @router.get("/show-token")
# async def token_data(current_user: UserDB = Depends(get_current_token)):
#     return {"message": f"Hello {current_user.name}, your role is {current_user.role}"}
