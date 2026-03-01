# AI Career Planning and Interview Preparation Portal

## Stack
- Frontend: React + Vite (`client/`)
- Backend: Node.js + Express + MongoDB (`server/`)
- AI: OpenRouter Chat Completions API

## Backend Setup
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

## Frontend Setup
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

## Required Environment Variables
Backend (`server/.env`):
- `MONGO_URI`
- `JWT_SECRET`
- `OPENROUTER_API_KEY`
- `CLIENT_URL`
- optional: `JWT_REFRESH_SECRET`, `OPENROUTER_MODEL`

Frontend (`client/.env`):
- `VITE_API_URL`

## API Modules
- Auth: `/api/auth/*`
- Career: `/api/career/recommend`
- Resume: `/api/resume/analyze`
- Interview: `/api/interview/session`, `/api/interview/submit`
- Roadmap: `/api/roadmap/generate`
- Chatbot: `/api/chat`
- Resources: `/api/resources/generate`
- Profile: `GET /api/auth/me`, `PUT /api/auth/profile`

## Deployment
- Frontend: deploy `client/` to Vercel
- Backend: deploy `server/` to Render or Railway
- Set backend `CLIENT_URL` to frontend domain
- Set frontend `VITE_API_URL` to backend `/api` base URL
