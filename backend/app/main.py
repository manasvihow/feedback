from fastapi import FastAPI, HTTPException
from app.core.database import init_db
from app.api import user
from fastapi.middleware.cors import CORSMiddleware
from app.api import feedback

app = FastAPI(title="feedback")
app.include_router(user.router)
app.include_router(feedback.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
    


@app.on_event("startup")
async def start_db():
    await init_db()



@app.get("/")
async def root():
    return {"message": "Backend environment is running"} 

# @app.get("*")
# async def notFound():
#     raise HTTPException(status_code=404, detail="URL not found")

