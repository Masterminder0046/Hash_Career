# Folder Structure

```
placement-platform/
├── frontend/                      # React + TypeScript + Vite
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/              # Login, Signup components
│   │   │   ├── common/            # Shared UI components
│   │   │   ├── layout/            # App shell components
│   │   │   ├── dashboard/         # Dashboard widgets
│   │   │   ├── student/           # Student-specific components
│   │   │   ├── resume/            # Resume analyzer components
│   │   │   ├── companies/         # Company listing components
│   │   │   ├── matching/          # Company matching components
│   │   │   ├── prediction/        # Prediction components
│   │   │   ├── skillgap/          # Skill gap components
│   │   │   ├── roadmap/           # Roadmap components
│   │   │   ├── interview/         # Mock interview components
│   │   │   ├── faceanalysis/      # Face analysis components
│   │   │   ├── chatbot/           # Chatbot components
│   │   │   ├── officer/           # Officer dashboard components
│   │   │   ├── admin/             # Admin panel components
│   │   │   ├── notifications/     # Notification components
│   │   │   ├── reports/           # Report components
│   │   │   ├── analytics/         # Analytics components
│   │   │   └── bonus/             # Bonus feature components
│   │   ├── contexts/              # React contexts
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── lib/                   # Utility libraries
│   │   ├── pages/                 # Page components
│   │   │   ├── student/           # Student pages
│   │   │   ├── officer/           # Officer pages
│   │   │   └── admin/             # Admin pages
│   │   ├── services/              # API service layer
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── backend/                       # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route handlers
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # Mongoose models
│   │   ├── routes/                # Express routes
│   │   ├── services/              # Business logic
│   │   ├── utils/                 # Utility functions
│   │   ├── validators/            # Request validation
│   │   ├── types/                 # TypeScript types
│   │   ├── seeds/                 # Database seed data
│   │   └── index.ts               # Entry point
│   ├── uploads/                   # File uploads
│   ├── package.json
│   └── tsconfig.json
├── ml/                            # Python ML service
│   ├── data/                      # Training data
│   ├── models/                    # Saved models
│   ├── notebooks/                 # Jupyter notebooks
│   ├── app.py                     # Flask API
│   ├── train_model.py             # Model training script
│   └── requirements.txt           # Python dependencies
├── docs/                          # Documentation
│   ├── api/                       # API documentation
│   ├── diagrams/                  # Architecture diagrams
│   └── deployment/                # Deployment guides
├── database/                      # Database scripts
├── public/                        # Shared public assets
├── docker-compose.yml
├── vercel.json
└── README.md
```
