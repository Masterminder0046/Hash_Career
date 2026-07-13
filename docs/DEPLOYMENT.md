# Deployment Guide

## Deploying to Vercel (Frontend)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set framework to Vite
4. Set root directory to `frontend/`
5. Add environment variables (none required for frontend)
6. Deploy

## Deploying to Render (Backend)

1. Create a Web Service on Render
2. Connect GitHub repo
3. Set:
   - Root Directory: `backend/`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variables:
   - `MONGODB_URI` - MongoDB connection string
   - `JWT_SECRET` - Your JWT secret
   - `GEMINI_API_KEY` - Google Gemini API key
   - `FRONTEND_URL` - Your Vercel URL
5. Deploy

## Deploying ML Service (Render/Heroku)

1. Create a Web Service
2. Set root directory to `ml/`
3. Build: `pip install -r requirements.txt`
4. Start: `gunicorn app:app`
5. Deploy

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
GEMINI_API_KEY=your-gemini-key
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### ML Service
```
PORT=5001
```

## Docker (Optional)

```bash
# Build backend
docker build -t placement-backend ./backend

# Build frontend
docker build -t placement-frontend ./frontend

# Run with docker-compose
docker-compose up
```
