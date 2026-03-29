# CasaMed Patient Recovery Companion

A full-stack physiotherapy platform with AI-powered exercise coaching, WhatsApp reminders, and therapist dashboard.

## Live URLs
- Frontend: https://casamed-recovery-companion.vercel.app
- Backend: https://casamed-recovery-companion.onrender.com
- AWS Backend: http://casamed-server-env.eba-gxybpcw2.ap-south-1.elasticbeanstalk.com

## Architecture
```
React (Vercel) → Node.js/Express (Render/AWS) → MongoDB Atlas
                                              → Firebase Firestore
                                              → Groq AI API
                                              → WhatsApp Cloud API
Java Spring Boot → Cron Scheduler → WhatsApp Reminders
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Java Service | Spring Boot (Reminder Scheduler) |
| Database | MongoDB Atlas |
| Realtime/Auth | Firebase Firestore + Auth |
| AI Model | Groq (Llama 3.3) |
| Messaging | WhatsApp Cloud API |
| Hosting | Vercel (frontend) + Render/AWS (backend) |

## Project Structure
```
casamed-recovery-companion/
├── client/          # React frontend
├── server/          # Node.js backend
└── java-service/    # Spring Boot scheduler
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Java 17+
- MongoDB Atlas account
- Firebase project
- Meta Developer account (WhatsApp)
- Groq API key

### Client Setup
```bash
cd client
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### Server Setup
```bash
cd server
npm install
cp .env.example .env
# Fill in .env values
npm run dev
```

### Java Service Setup
```bash
cd java-service
./mvnw.cmd spring-boot:run
```

## Environment Variables

### server/.env.example
```
PORT=5000
MONGO_URI=
GROQ_API_KEY=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### client/.env.example
```
VITE_API_URL=
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/sessions | Create session |
| GET | /api/sessions | List all sessions |
| GET | /api/sessions/:id | Get session by ID |
| POST | /api/chat | Send message to AI |
| GET | /api/chat/:sessionId | Get chat history |
| POST | /api/pain-score | Log pain score |
| GET | /api/pain-score/:patientId | Get pain scores |
| POST | /api/reminders/trigger | Trigger WhatsApp reminder |

## Features

### Pillar A — WhatsApp Reminder Engine
- Session booking via form or API
- Automated 24hr and 1hr reminders
- Reminder status tracking
- Java Spring Boot cron scheduler

### Pillar B — AI Exercise Coach
- Chat interface for patients
- Groq Llama 3.3 AI model
- Personalized exercise recommendations
- Multi-turn conversation with context
- Structured JSON responses

### Pillar C — Therapist Dashboard
- Firebase Auth login
- Patient session list
- Reminder status tracking
- Real-time pain score log via Firestore

## Known Limitations
- WhatsApp template requires Meta approval
- Render free tier sleeps after 15 min inactivity
- Firebase private key requires careful formatting in env vars

## Design Decisions
- Groq used instead of OpenAI due to free tier availability
- Render used for HTTPS support (required by Vercel)
- Firebase Firestore used for real-time pain score sync
- Each patient gets unique session ID via localStorage
