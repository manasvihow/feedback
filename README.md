# FeedLoop

FeedLoop is a full-stack feedback management platform for teams, enabling managers and employees to exchange, request, and track feedback efficiently. The project consists of a FastAPI backend and a React frontend.

---

## 1. Setup Instructions

### Backend

1. **Install dependencies**  
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
2. **Set up environment variables**  
   Create a `.env` file in `backend/` with your MongoDB connection details:
   ```
   MONGO_URI=mongodb://localhost:27017
   DATABASE_NAME=feedback_db
   SECRET_KEY=your_secret
   ```
3. **Run the backend server**  
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. **Install dependencies**  
   ```bash
   cd frontend
   npm install
   ```
2. **Start the frontend**  
   ```bash
   npm start
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

### Docker (Backend)

To run the backend in Docker:
```bash
cd backend
docker build -t feedback-backend .
docker run -p 8000:8000 --env-file .env feedback-backend
```

---

## 2. Stack and Design Decisions

- **Backend:**  
  - FastAPI for REST APIs.
  - MongoDB (via Beanie ODM) for flexible, document-based storage.
  - Pydantic for data validation.
  - Uvicorn as the ASGI server.
  - CORS enabled for frontend-backend communication.

- **Frontend:**  
  - React (bootstrapped with Create React App).
  - Tailwind CSS for styling.
  - Context API for user/session management.
  - Fetch API for backend communication.

- **Design Decisions:**  
  - Role-based access: `admin`, `manager`, `employee`.
  - Feedback can be anonymous or attributed.
  - Managers can view analytics and team feedback.
  - Employees can request and acknowledge feedback.
  - Modular API structure: `/user`, `/team`, `/feedback`, `/dashboard`.

---

## 3. Dockerfile Explanation (Backend)

```
FROM python:3

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY app /code/app
COPY .env /code/.env

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```
- Uses the official Python 3 image.
- Sets `/code` as the working directory.
- Installs dependencies from `requirements.txt`.
- Copies the application code and environment file.
- Exposes port 8000 for FastAPI.
- Starts the server with Uvicorn.

---

## 4. DB Schema Details

### User (`users` collection)
```python
class UserDB(Document):
    name: str
    email: EmailStr (unique)
    password_hashed: str
    role: Literal["manager", "employee", "admin"]
```

### Team (`teams` collection)
```python
class TeamDB(Document):
    manager_email: EmailStr
    member_emails: List[EmailStr]
    created_at: datetime
    updated_at: datetime
```

### Feedback (`feedback` collection)
```python
class FeedbackDB(Document):
    created_by_email: str
    created_by_role: str
    is_anon: bool
    employee_email: str
    strengths: str
    areas_to_improve: str
    sentiment: Optional["positive", "negative", "neutral"]
    tags: Optional[List[str]]
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    requested_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
```

## 5. AI
Minimal use of AI tools (like ChatGPT) was made for refining documentation and clarifying code structure decisions.
