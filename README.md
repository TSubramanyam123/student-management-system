
# Student Management System

A beginner-friendly microservices application using React, FastAPI,
SQLite, JWT authentication, and an API Gateway.

## Architecture

- Frontend: React + Vite
- API Gateway: FastAPI on port 8000
- Authentication Service: FastAPI + SQLite on port 8001
- Student Service: FastAPI + SQLite on port 8002
- Course Service: FastAPI + SQLite on port 8003

The frontend sends all backend requests through the API Gateway.
Each backend service owns its database.

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- Git
- Postman

## Configuration

Create a root `.env` file containing:

JWT_SECRET=replace_with_a_strong_random_secret
ACCESS_TOKEN_MINUTES=30
AUTH_SERVICE_URL=http://127.0.0.1:8001
STUDENT_SERVICE_URL=http://127.0.0.1:8002
COURSE_SERVICE_URL=http://127.0.0.1:8003
FRONTEND_ORIGIN=http://localhost:5173

Use the same JWT_SECRET for all backend services.
Never commit real secrets.

## Install Python dependencies

Run these commands from the project root:

```powershell
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1

pip install -r auth-service/requirements.txt
pip install -r student-service/requirements.txt
pip install -r course-service/requirements.txt
pip install -r api-gateway/requirements.txt
```

If PowerShell blocks activation, run the commands using
the Python executable inside `.venv\Scripts` instead.

## Start the authentication service

Open a terminal in the project root:

```powershell
.\.venv\Scripts\Activate.ps1
cd auth-service
python -m uvicorn app.main:app --reload --port 8001
```

## Start the student service

Open a second terminal:

```powershell
cd student-service
..\.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8002
```

## Start the course service

Open a third terminal:

```powershell
cd course-service
..\.\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app --reload --port 8003
```

## Start the API Gateway

Open a fourth terminal:

```powershell
cd api-gateway
..\.\.venv\Scripts\Activate.ps1
python -m uvicorn main:app --reload --port 8000
```

Ensure the root `.env` values are available to the services.
If necessary, set JWT_SECRET in each terminal before starting it.

## Start the React frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

## API documentation

- Gateway health: http://localhost:8000/health
- Authentication Swagger: http://localhost:8001/docs
- Student Swagger: http://localhost:8002/docs
- Course Swagger: http://localhost:8003/docs
- Gateway Swagger: http://localhost:8000/docs

The gateway's Swagger page documents its own endpoints.
Use each backend service's Swagger page to explore the
individual service schemas and responses.

## Main API endpoints

Authentication:
- POST /auth/register
- POST /auth/login
- GET /auth/me

Students:
- POST /students
- GET /students
- GET /students/{student_id}
- PUT /students/{student_id}
- DELETE /students/{student_id}

Courses:
- POST /courses
- GET /courses
- GET /courses/{course_id}
- PUT /courses/{course_id}
- DELETE /courses/{course_id}
- POST /courses/{course_id}/enrollments
- GET /courses/{course_id}/students
- DELETE /courses/{course_id}/enrollments/{student_id}

All student and course operations require a valid Bearer token.

## Postman testing

1. Import postman/collection.json.
2. Register a user.
3. Log in using that user.
4. Confirm that the login request saves the token.
5. Create and retrieve students and courses.
6. Use returned IDs for update, delete, and enrollment requests.

## Database files

The databases are created automatically on startup:

- auth-service/auth.db
- student-service/students.db
- course-service/courses.db

Back up the database files before making destructive changes.

## GitHub

Initialize version control:

```bash
git init
git add .
git commit -m "Initial student management microservices"
git branch -M main
```

Create an empty GitHub repository and connect it:

```bash
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

## Screenshots for submission

Capture:
1. Registration and login pages
2. Dashboard with student and course totals
3. Student creation and listing
4. Student edit and delete
5. Course listing and enrollment
6. Successful Postman login response
7. Student and course CRUD responses
8. Swagger documentation for each service

## Notes

This is an educational local-development implementation.
Before production deployment, add rate limiting, stricter
authorization, HTTPS, secret management, automated tests,
database migrations, and enrollment validation against the
Student service.
