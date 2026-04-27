# CodeQuest - Backend Setup Instructions

## Prerequisites

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)

## Installation Steps

### 1. Install MongoDB

**Windows:**
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Install with default settings
- MongoDB will run automatically as a service

**Verify MongoDB is running:**
```bash
mongod --version
```

### 2. Install Node.js Dependencies

```bash
cd server
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

Expected output:
```
✅ MongoDB Connected
🗑️  Cleared existing questions
✅ Added 23 questions to database!
```

### 4. Start the Backend Server

```bash
npm run dev
```

Expected output:
```
🚀 Server running on port 5000
✅ MongoDB Connected: localhost
```

### 5. Start the Frontend

Open a new terminal:

**Option A: VS Code Live Server**
- Install "Live Server" extension
- Right-click on `client/index.html`
- Click "Open with Live Server"

**Option B: Python**
```bash
cd client
python -m http.server 5500
```

### 6. Access Application

```
http://localhost:5500
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### User
- `GET /api/user/profile` - Get profile (requires token)
- `POST /api/user/exam-complete` - Save exam results

### Exam
- `GET /api/exam/questions?subject=java&difficulty=easy` - Get questions
- `POST /api/exam/check-answer` - Validate answer
- `GET /api/exam/hint/:questionId` - Get hint

## Troubleshooting

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Check if running
mongo --eval "db.version()"
```

### Port 5000 Already in Use
Change PORT in `.env` file

### CORS Error
Make sure frontend runs on port 5500

## Project Structure

```
oes1/
├── client/           # Frontend (HTML/CSS/JS)
├── server/           # Backend (Node.js/Express)
│   ├── config/       # Database config
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # JWT auth
│   └── server.js     # Main server
└── SETUP.md
```

## Security Notes

🔒 **For Production:**
1. Change JWT_SECRET in .env
2. Use MongoDB Atlas (cloud)
3. Enable HTTPS
4. Add rate limiting

## Features

✅ JWT authentication with bcrypt  
✅ MongoDB integration  
✅ RESTful API  
✅ XP & leveling system  
✅ Exam tracking  
✅ Leaderboard  

Happy coding! 🚀
