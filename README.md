# VocaVision AI

AI-powered intelligent mock interview and candidate performance analysis system using NLP, computer vision, OpenRouter AI, Neon Postgres, React, Express, Node, TypeScript, Tailwind CSS, and Python.

## Structure

- `frontend` - React + TypeScript + Tailwind dashboard and landing experience
- `backend` - Express + TypeScript API, Neon Postgres schema, OpenRouter integration
- `backend/python-ai-service` - FastAPI service placeholder for OpenCV/MediaPipe analysis

## Run locally

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5188
```

```bash
cd backend
npm install
copy .env.example .env
npm run db:schema
npm run dev
```

```bash
cd backend/python-ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

## Functional flow

1. Sign up or login.
2. Open Interview and create a role-specific session.
3. The backend stores the session in Neon Postgres and generates questions through OpenRouter.
4. Answer each question in the interview room.
5. The backend scores the answer, stores NLP/CV feedback, and updates session progress.
6. Complete the interview to generate and save a final report.
