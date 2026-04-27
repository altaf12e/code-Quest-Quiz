# CodeQuest - Gamified Online Programming Examination System

A full-stack gamified programming examination platform with Node.js backend, MongoDB database, and vanilla JavaScript frontend.

## 🎮 Features

- **Gamification Elements**
  - XP and leveling system
  - Streak tracking
  - Daily quests
  - Avatar customization
  - Level-up animations
  - Achievement system

- **Interactive UI**
  - Smooth animations and transitions
  - Floating background elements
  - Real-time timer
  - Sound effects for actions
  - Responsive design for all devices

- **Exam System**
  - Multiple subjects (Java, C++, Python, JavaScript, Data Structures, Algorithms)
  - Three difficulty levels (Easy, Medium, Hard)
  - Timed questions (30 seconds per question)
  - Hint system
  - Instant feedback
  - Progress tracking

## 📁 Project Structure

```
client/
├── index.html          # Homepage with welcome screen
├── login.html          # Authentication page
├── dashboard.html      # User dashboard and subject selection
├── exam.html           # Examination interface
├── css/
│   └── styles.css      # Complete styling with animations
└── js/
    ├── main.js         # Homepage logic
    ├── auth.js         # Login/signup with validation
    ├── dashboard.js    # Dashboard and subject selection
    ├── exam.js         # Quiz logic and timer
    └── game.js         # XP system, animations, and sounds
```

## 🚀 Quick Start

### Backend Setup

1. **Install MongoDB** (if not installed)
2. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```
3. **Seed database:**
   ```bash
   npm run seed
   ```
4. **Start server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Serve the client folder** on port 5500:
   - Use VS Code Live Server, OR
   - Python: `python -m http.server 5500`, OR
   - Node: `npx http-server -p 5500`

2. **Open browser:**
   ```
   http://localhost:5500
   ```

**See [SETUP.md](SETUP.md) for detailed instructions**

## 🎯 How to Play

1. **Dashboard**
   - View your profile, XP, level, and streak
   - Check daily quest progress
   - Select a subject to start

2. **Choose Difficulty**
   - Easy: +10 XP per question
   - Medium: +25 XP per question
   - Hard: +50 XP per question

3. **Take the Exam**
   - Answer questions within 30 seconds
   - Use hints (3 available per exam)
   - Build streaks for consecutive correct answers
   - Level up by earning XP

## 🎨 Design Highlights

- **Color Scheme**: Modern gradient-based design with purple/blue theme
- **Animations**: Smooth transitions, floating elements, pulse effects
- **Responsive**: Works on desktop, tablet, and mobile devices
- **Accessibility**: Clear typography and high contrast

## 🔧 Technical Stack

**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT authentication
- bcrypt password hashing

**Frontend:**
- Pure vanilla JavaScript (no frameworks)
- HTML5 & CSS3
- Web Audio API
- Fetch API for HTTP requests

**Security:**
- JWT tokens
- Password hashing with bcrypt
- Protected routes with middleware
- CORS configuration

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## 🎵 Sound Effects

- ✅ Correct answer chime
- ❌ Wrong answer buzz
- 🎉 Level up celebration
- 🔔 Success notifications
- 🎯 UI interactions

## 💾 Database Schema

**User Model:**
- Authentication (username, email, password)
- Profile (avatar, level, XP, streak, rank)
- Exam history
- Daily quest progress

**Question Model:**
- Subject & difficulty
- Question text & options
- Correct answer & hint
- XP value

## 🎮 Game Mechanics

- **XP System**: Earn XP by answering questions correctly
- **Leveling**: 100 XP per level
- **Streaks**: Consecutive correct answers
- **Hints**: Limited to 3 per exam
- **Timer**: 30 seconds per question
- **Daily Quests**: Complete challenges for bonus XP

## 🏆 Leaderboard

The homepage displays top performers with their:
- Username and avatar
- Total XP earned
- Current level
- Rank position

## 🎨 Customization

Users can customize:
- Avatar selection (8 options)
- Theme toggle (light/dark)
- Profile information

## 📝 Question Bank

The system includes sample questions for:
- Java (OOP, Collections, Design Patterns)
- Python (Syntax, Data Structures)
- C++ (Pointers, Memory Management)
- JavaScript, Data Structures, Algorithms

## 🔐 API Endpoints

**Auth:**
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Login user

**User:**
- `GET /api/user/profile` - Get user data
- `POST /api/user/exam-complete` - Save results
- `GET /api/user/leaderboard` - Top players

**Exam:**
- `GET /api/exam/questions` - Fetch questions
- `POST /api/exam/check-answer` - Validate answer
- `GET /api/exam/hint/:id` - Get hint

## 🎉 Enjoy CodeQuest!

Start your coding journey, earn XP, level up, and become a code master! 🚀
