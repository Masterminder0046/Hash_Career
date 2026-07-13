# Hash Career - AI Placement Intelligence Platform

An AI-powered placement preparation platform that helps students become placement-ready through AI analysis, company matching, resume analysis, interview evaluation, skill-gap detection, and personalized preparation roadmaps.

## 🚀 Features

- **AI Resume Analyzer** - Upload resume (PDF/DOCX), get ATS score, missing keywords, weak sections, and AI suggestions
- **Company Database** - 100+ companies with requirements (CGPA, skills, salary, selection process)
- **Company Matching Engine** - Match student profiles with company requirements, eligibility %
- **Placement Prediction** - ML model (Random Forest) predicting placement probability
- **Skill Gap Analyzer** - Identify missing skills with priority and learning order
- **AI Roadmap Generator** - Personalized 30/60/90 day study plans
- **AI Mock Interview** - Technical, HR, aptitude interviews with speech recognition
- **Face & Attention Analysis** - Real-time attention monitoring via MediaPipe
- **Career Chatbot** - AI-powered career advisor
- **Role-based Dashboards** - Student, Placement Officer, Admin panels
- **Analytics & Reports** - Charts, CSV export, PDF reports
- **Dark/Light Mode** - Modern glassmorphism UI

## 🛠 Tech Stack

### Frontend
- React + TypeScript + Vite
- Tailwind CSS + Framer Motion
- React Router + React Hook Form
- Recharts + Lucide Icons
- Axios

### Backend
- Node.js + Express.js + TypeScript
- MongoDB + Mongoose
- JWT Authentication + bcrypt
- Google Gemini AI API

### Machine Learning
- Python + Scikit-learn
- Random Forest Classifier
- Flask API

## 📁 Project Structure

```
placement-platform/
├── frontend/          # React frontend (Vite)
├── backend/           # Node.js + Express API
├── ml/                # ML model training + serving
├── docs/              # Documentation
├── database/          # Database scripts
└── public/            # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.9
- MongoDB
- Google Gemini API Key

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and Gemini API key
npm install
npm run seed    # Seeds database with sample data
npm run dev     # Starts on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev     # Starts on port 5173
```

### ML Model Setup

```bash
cd ml
pip install -r requirements.txt
python train_model.py   # Trains and saves model
python app.py           # Starts ML API on port 5001
```

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@placement.edu.in | admin123 |
| Officer | officer@placement.edu.in | officer123 |
| Student | student1@college.edu.in | student123 |

## 📧 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Resume
- `POST /api/resume/upload` - Upload resume (PDF/DOCX)
- `POST /api/resume/analyze` - AI analyze resume
- `GET /api/resume` - Get resume info

### Companies
- `GET /api/companies` - List companies (with filters)
- `GET /api/companies/:id` - Company details

### Matching
- `GET /api/matching` - Get company matches for student
- `GET /api/matching/:companyId` - Match with specific company

### Prediction
- `POST /api/prediction` - Get placement prediction
- `GET /api/prediction/history` - Prediction history

### Skill Gap
- `GET /api/skill-gap` - Analyze skill gaps

### Roadmap
- `POST /api/roadmap` - Generate roadmap
- `GET /api/roadmap` - Get roadmaps
- `PUT /api/roadmap/:id/week` - Update week progress

### Interview
- `POST /api/interview/start` - Start mock interview
- `POST /api/interview/submit` - Submit answer
- `GET /api/interview/history` - Interview history

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot
- `GET /api/chatbot/quick-replies` - Get quick reply suggestions

### Officer
- `GET /api/officer/dashboard` - Officer dashboard stats
- `GET /api/officer/students` - List students
- `GET /api/officer/export/csv` - Export student data as CSV

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/analytics` - System analytics
- `PUT /api/admin/users/:id` - Manage user
- `DELETE /api/admin/users/:id` - Delete user

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📄 License

MIT

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.
