# from fastapi import Depends, HTTPException
# from app.models.user import UserDB
# from app.utils.auth import verify_password

# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="user/login")

# async def get_current_token(token: str = Depends(oauth2_scheme)) -> UserDB:
#     try:
#         payload = decode_token(token)
#         user_id = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail = "Invalid token")
#         user = await UserDB.get(user_id)
#         if user is None:
#             raise HTTPException(status_code=401, detail="User not found")
#         return user
#     except JWTError:
#         raise HTTPException(status_code=403, detail="Token decode error")