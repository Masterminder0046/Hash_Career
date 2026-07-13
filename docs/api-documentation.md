# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Signup
```http
POST /auth/signup
Content-Type: application/json

{ "name": "John Doe", "email": "john@college.edu", "password": "password123", "role": "student" }
```

### Login
```http
POST /auth/login
Content-Type: application/json

{ "email": "john@college.edu", "password": "password123" }
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{ "phone": "1234567890", "bio": "CS Student", "academic": { "cgpa": 8.5, "department": "CSE" } }
```

## Resume

### Upload Resume
```http
POST /resume/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <pdf_or_docx>
```

### Analyze Resume
```http
POST /resume/analyze
Authorization: Bearer <token>
```

## Companies

### List Companies
```http
GET /companies?search=google&industry=Technology&minSalary=100000
Authorization: Bearer <token>
```

### Get Company
```http
GET /companies/:id
Authorization: Bearer <token>
```

## Company Matching

### Get Matches
```http
GET /matching
Authorization: Bearer <token>
```

### Get Company Match Detail
```http
GET /matching/:companyId
Authorization: Bearer <token>
```

## Prediction

### Predict Placement
```http
POST /prediction
Authorization: Bearer <token>
```

### Prediction History
```http
GET /prediction/history
Authorization: Bearer <token>
```

## Skill Gap

### Analyze Skill Gap
```http
GET /skill-gap?company=Google
Authorization: Bearer <token>
```

## Roadmap

### Create Roadmap
```http
POST /roadmap
Authorization: Bearer <token>
Content-Type: application/json

{ "duration": 30, "targetCompany": "Google" }
```

### Get Roadmaps
```http
GET /roadmap
Authorization: Bearer <token>
```

### Update Week Progress
```http
PUT /roadmap/:id/week
Authorization: Bearer <token>
Content-Type: application/json

{ "week": 1 }
```

## Interview

### Start Interview
```http
POST /interview/start
Authorization: Bearer <token>
Content-Type: application/json

{ "type": "technical" }
```

### Submit Answer
```http
POST /interview/submit
Authorization: Bearer <token>
Content-Type: application/json

{ "interviewId": "...", "answer": "My answer...", "questionIndex": 0 }
```

### Interview History
```http
GET /interview/history
Authorization: Bearer <token>
```

## Chatbot

### Send Message
```http
POST /chatbot/chat
Authorization: Bearer <token>
Content-Type: application/json

{ "message": "How can I improve my resume?" }
```

### Get Quick Replies
```http
GET /chatbot/quick-replies
Authorization: Bearer <token>
```

## Officer

### Dashboard Stats
```http
GET /officer/dashboard
Authorization: Bearer <token>
```

### List Students
```http
GET /officer/students?department=CSE&search=name&page=1&limit=20
Authorization: Bearer <token>
```

### Student Detail
```http
GET /officer/students/:id
Authorization: Bearer <token>
```

### Export CSV
```http
GET /officer/export/csv
Authorization: Bearer <token>
```

## Admin

### Dashboard
```http
GET /admin/dashboard
Authorization: Bearer <token>
```

### Analytics
```http
GET /admin/analytics
Authorization: Bearer <token>
```

### System Logs
```http
GET /admin/logs
Authorization: Bearer <token>
```

### Manage User
```http
PUT /admin/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{ "isActive": false }
```

### Delete User
```http
DELETE /admin/users/:id
Authorization: Bearer <token>
```

## Notifications

### Get Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

### Mark as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

### Mark All Read
```http
PUT /notifications/all/read
Authorization: Bearer <token>
```

## ML Service

### Health Check
```http
GET http://localhost:5001/health
```

### Predict
```http
POST http://localhost:5001/predict
Content-Type: application/json

{
  "features": {
    "cgpa": 8.5,
    "skills_count": 8,
    "projects_count": 3,
    "internships_count": 2,
    "resume_score": 75,
    "coding_score": 80,
    "communication_score": 70,
    "attendance": 85,
    "certifications_count": 3
  }
}
```

### Batch Predict
```http
POST http://localhost:5001/predict/batch
Content-Type: application/json

{
  "features": [
    { "cgpa": 8.5, ... },
    { "cgpa": 6.2, ... }
  ]
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```
