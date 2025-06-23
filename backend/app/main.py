from fastapi import FastAPI, HTTPException
from app.core.database import init_db
from app.api import user
from fastapi.middleware.cors import CORSMiddleware
from app.api import feedback
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing_extensions import Annotated

app = FastAPI(title="feedback")

security=HTTPBasic()

def get_current_username(
    credentials: Annotated[HTTPBasicCredentials, Depends(security)],
):
    current_username_bytes = credentials.username.encode("utf8")
    correct_username_bytes = b"stanleyjobson"
    is_correct_username = secrets.compare_digest(
        current_username_bytes, correct_username_bytes
    )
    current_password_bytes = credentials.password.encode("utf8")
    correct_password_bytes = b"swordfish"
    is_correct_password = secrets.compare_digest(
        current_password_bytes, correct_password_bytes
    )
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    return credentials.username

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
   
app.include_router(user.router)
app.include_router(feedback.router)

@app.on_event("startup")
async def start_db():
    await init_db()



@app.get("/")
async def root():
    return {"message": "Backend environment is running"} 

# @app.get("*")
# async def notFound():
#     raise HTTPException(status_code=404, detail="URL not found")

