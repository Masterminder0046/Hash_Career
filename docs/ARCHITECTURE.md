# System Architecture

## Overview

PlacementIQ follows a modern three-tier architecture:
- **Frontend** (React SPA) communicates with backend via REST APIs
- **Backend** (Express.js) handles business logic, auth, and database operations
- **ML Service** (Flask) serves placement predictions via a separate API

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (React SPA)                     │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Tailwind CSS  │  Framer Motion  │  Recharts          │  │
│  │  React Router  │  React Hook Form│  Lucide Icons      │  │
│  │  Context API   │  Axios          │  Web Speech API    │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express.js Backend                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │  Resume  │ │Company   │ │  Middleware   │  │
│  │  JWT     │ │  Parser  │ │ Matching │ │  Rate Limit   │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ │  Helmet       │  │
│  │Prediction│ │Skill Gap │ │ Roadmap  │ │  CORS         │  │
│  ├──────────┤ ├──────────┤ ├──────────┤ │  Validation   │  │
│  │Interview │ │ Chatbot  │ │Analytics │ │  Error Handler│  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
│                           │                                  │
│              ┌────────────┴────────────┐                     │
│              ▼                         ▼                     │
│     ┌──────────────┐        ┌──────────────┐                │
│     │   MongoDB    │        │   Gemini AI  │                │
│     └──────────────┘        └──────────────┘                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP
                           ▼
              ┌────────────────────────┐
              │  ML Service (Flask)    │
              │  Random Forest Model   │
              │  /predict endpoint     │
              └────────────────────────┘
```

## Data Flow

1. User interacts with React UI
2. Requests proxied via Vite to Express API
3. Express validates JWT, processes request
4. Business logic executed in controllers/services
5. Data persisted in MongoDB via Mongoose
6. Gemini AI calls made for analysis/chat
7. ML predictions via Flask service
8. Response returned to frontend

## Security

- JWT tokens with bcrypt password hashing
- Rate limiting (100 req/15min per IP)
- Helmet.js security headers
- CORS restricted to frontend origin
- Input validation via express-validator
- MongoDB injection sanitization
- XSS protection
