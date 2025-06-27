# FeedLoop

FeedLoop is a full-stack feedback management platform for teams, enabling managers and employees to exchange, request, and track feedback efficiently. It includes:

* FastAPI backend
* React frontend
* Dockerized setup for local development

---

## 1. Setup Instructions (Local Development)

### Backend (Local)

1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

2. Configure Environment Variables

Create a `.env` file inside the `backend/` directory:

```
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=feedback_db
SECRET_KEY=your_secret
```

3. Run the Backend Server

```bash
uvicorn app.main:app --reload
```

4. Initial Setup (Before Using Frontend)

Use Swagger UI or tools like Postman/Thunder Client:

* Open API Docs

  * Visit: [http://localhost:8000/docs](http://localhost:8000/docs)

* Register an Admin

  * Endpoint: POST /user/register
  * Sample Payload:

```json
{
  "name": "ADMIN",
  "email": "admin@example.com",
  "password": "admin123",
  "role": "admin"
}
```

* Bulk Register Users

  * Endpoint: POST /user/bulk-register?admin\_email=[admin@example.com](mailto:admin@example.com)
  * Sample Payload:

```json
[
  {
    "name": "Steve Rogers",
    "email": "steve@avengers.com",
    "password": "avengers123",
    "role": "manager"
  },
  {
    "name": "Tony Stark",
    "email": "tony@avengers.com",
    "password": "avengers123",
    "role": "manager"
  },
  {
    "name": "Natasha Romanoff",
    "email": "natasha@avengers.com",
    "password": "avengers123",
    "role": "employee"
  }
]
```

* Create a Team

  * Endpoint: POST /team/create?admin\_email=[admin@example.com](mailto:admin@example.com)
  * Sample Payload:

```json
{
  "manager_email": "tony@avengers.com",
  "member_emails": ["steve@avengers.com"]
}
```

### Frontend

1. Install Dependencies

```bash
cd frontend
npm install
```

2. Start the Frontend

```bash
npm start
```

App will run at: [http://localhost:3000](http://localhost:3000)

---

## 2. Optional: Docker Setup for Backend

### Run Backend in Docker

```bash
cd backend
docker build .
docker compose up
```

### Dockerfile (Backend)

```Dockerfile
FROM python:3

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY app /code/app
COPY .env /code/.env

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose Configuration

This project uses Docker Compose to manage:

#### 1. MongoDB

* Image: mongo
* Container Name: feedback\_mongo
* Ports: 27017:27017
* Command: mongod --noauth (for development only)
* Volumes: mongo\_data:/data/db

#### 2. Backend

* Builds the image from Dockerfile
* Container Name: feedback\_backend
* Ports: 8000:8000
* Environment Variables:

```
MONGO_URI=mongodb://mongo:27017
DATABASE_NAME=feedback_db
```

* Depends on: mongo (ensures MongoDB starts first)

#### Volumes Declaration

```yaml
volumes:
  mongo_data:
```

---

## 3. Tech Stack and Design Decisions

### Backend

* FastAPI
* MongoDB with Beanie ODM
* Pydantic
* Uvicorn
* CORS for cross-origin requests

### Frontend

* React (CRA)
* Tailwind CSS
* Context API
* Fetch API

### Design Decisions

* Roles: admin, manager, employee
* Supports anonymous and named feedback
* Managers get analytics and feedback dashboards
* Employees can request and acknowledge feedback
* Modular API structure: /user, /team, /feedback, /dashboard

---

## 4. Database Schema

### User (`users` collection)

```python
class UserDB(Document):
    name: str
    email: EmailStr
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
    sentiment: Optional[Literal["positive", "negative", "neutral"]]
    tags: Optional[List[str]]
    status: Literal["requested", "draft", "submitted", "acknowledged"]
    requested_at: Optional[datetime]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    acknowledged_at: Optional[datetime]
```

---

## 5. AI

Minimal use of AI tools (like ChatGPT) was made for:

* Refining documentation
* Clarifying code structure
* Improving naming consistency
