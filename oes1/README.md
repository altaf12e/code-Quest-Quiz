# ⚔️ CodeQuest - Gamified Online Programming Examination System

A modern full-stack gamified examination and learning platform featuring interactive coding quizzes, progressive chapter learning paths, real-time multiplayer contests, and a comprehensive admin management panel.

---

## 🚀 Quick Start (Easiest Method)

If you are on Windows, simply double-click the **1-Click Launcher** script located in the project directory:

```text
▶ Double-click: run-project.bat
```

This automated launcher will:
1. Start the **Backend Server** on `http://localhost:5000`
2. Start the **Frontend Client** on `http://localhost:5500`
3. Automatically launch your default browser to `http://localhost:5500`

---

## 📋 Prerequisites

Before running manually, ensure you have the following installed:

1. **Node.js** (v16.x or newer, recommended v18/v20/v22) — [Download Node.js](https://nodejs.org/)
2. **MongoDB** (v5.0+ Community Server or MongoDB Atlas cloud URI) — [Download MongoDB](https://www.mongodb.com/try/download/community)
3. **Python 3.x** *(Optional, alternative way to serve frontend)* or **VS Code Live Server**

---

## 🛠️ Manual Installation & Run Guide

### Step 1: Verify MongoDB is Running

If you are using local MongoDB on Windows:
```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it:
net start MongoDB
```

*(MongoDB connection string is configured in `server/.env`. By default it connects to `mongodb://127.0.0.1:27017/codequest`)*

---

### Step 2: Backend Setup & Seeding

Open a terminal in the project root:

```powershell
# 1. Navigate to server folder
cd oes1/server

# 2. Install dependencies
npm install

# 3. Seed Database (Populates 1,216+ Questions & 27 Chapters & Default Admin)
npm run seed

# 4. Start Backend Server
npm start
```

You should see:
```text
🚀 Server running on port 5000
🎮 Multiplayer support enabled
✅ MongoDB Connected: 127.0.0.1
```

---

### Step 3: Frontend Client Setup

> [!IMPORTANT]
> The backend server CORS policy is pre-configured for port **5500** (`http://localhost:5500` and `http://127.0.0.1:5500`). Always run the frontend on port 5500.

Open a **new terminal window** and run one of the following:

#### Option A: Using Python (Recommended)
```powershell
cd oes1/client
python -m http.server 5500
```

#### Option B: Using Node (`npx serve`)
```powershell
npx serve -l 5500 oes1/client
```

#### Option C: Using VS Code Live Server
* Open `oes1/client/index.html` in VS Code.
* Right-click and choose **"Open with Live Server"** (ensure Live Server runs on port `5500`).

---

### Step 4: Open in Browser

Navigate to:
👉 **[http://localhost:5500](http://localhost:5500)**

---

## 🔑 Login & Credentials

### 👑 Admin Account (Full Access)
* **Username**: `admin`
* **Password**: `admin123`
* **Admin Panel**: `http://localhost:5500/admin.html`
* **Admin Features**:
  - View user accounts and statistics
  - Browse questions bank with pagination
  - **➕ Add Single Question** via form
  - **⚡ Bulk Import Multiple Questions** at once by pasting JSON or uploading a `.json` file!

### 👤 Student / Candidate Account
* Go to `http://localhost:5500/login.html` and click **"Sign Up"** to create a student account.

---

## 🎯 How to Use CodeQuest

### 1. ⚔️ Take Exam / Quiz Mode
* Go to the **Dashboard** (`dashboard.html`).
* On any subject card (Java, C++, Python, JavaScript, DSA, Algorithms, React, Node.js, SQL), click **`⚔️ Take Exam`**.
* Select your difficulty level:
  - 🟢 **Easy**: +10 XP per question
  - 🟡 **Medium**: +25 XP per question
  - 🔴 **Hard**: +50 XP per question
  - 🏆 **Marathon Quest**: 30 questions • +100 XP each
* Select sub-level (Level I, II, III) and start the timed examination.

### 2. 📚 Learning Path / Chapters Mode
* On any subject card, click **`📚 Chapters`**.
* Experience progressive learning:
  - **Chapter 1: Fundamentals & Basics** (Unlocked by default)
  - **Chapter 2: Core Concepts & Operations** (Unlocks after passing Chapter 1 with 70%+)
  - **Chapter 3: Advanced Applications** (Unlocks after passing Chapter 2)

### 3. 🎮 Real-Time Multiplayer Mode
* Head over to **Multiplayer** (`multiplayer.html`).
* Create a room, share the **Room Code**, and challenge friends/peers in a live coding contest powered by Socket.io!

### 4. ➕ Adding Multiple Questions to the Database
You can add questions in two ways:
* **Via Admin Panel**: Go to `admin.html` -> Questions -> Click `Add Question` -> Choose **Bulk JSON Import** -> Paste an array of questions -> Click **Import All Questions**.
* **Via Question Files**: Add your questions to the JSON files inside `questeasy/`, `questmed/`, or `questhard/` and run `npm run seed` in the `server` directory.

---

## 📁 Project Structure

```text
oes1/
├── client/                     # Frontend (HTML5, CSS3, Vanilla JS)
│   ├── index.html              # Landing page & leaderboard
│   ├── login.html              # Authentication (Sign in / Sign up)
│   ├── dashboard.html          # Subject selection & profile stats
│   ├── exam.html               # Timed quiz examination engine
│   ├── chapters.html           # Chapter-based learning roadmap
│   ├── chapter-quiz.html       # Chapter quiz runner
│   ├── multiplayer.html        # Real-time room multiplayer quiz
│   ├── profile.html            # User statistics & avatar customize
│   ├── admin.html              # Admin management dashboard
│   ├── css/                    # Stylesheets & animations
│   └── js/                     # Client scripts, config & socket handlers
│
├── server/                     # Backend (Node.js & Express)
│   ├── config/db.js            # MongoDB Mongoose connection
│   ├── models/                 # Mongoose schemas (User, Question, Chapter, QuizRoom)
│   ├── routes/                 # API endpoints (auth, user, exam, chapters, admin, quizRoom)
│   ├── middleware/             # JWT auth & admin protection
│   ├── seedDatabase.js         # Master database seeder
│   ├── server.js               # Main Express & Socket.io server
│   └── .env                    # Environment variables & DB URI
│
├── questeasy/                  # Easy question banks (JSON)
├── questmed/                   # Medium question banks (JSON)
├── questhard/                  # Hard question banks (JSON)
├── run-project.bat             # 1-Click launcher (Windows)
└── README.md                   # Documentation
```

---

## ⚙️ Environment Configuration (`server/.env`)

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/codequest
JWT_SECRET=484e905f46e4321169759094094b8890e3d99173f9a2c0af15cb06d19ac12852c9f576771bfd16f323cb4f7faf051a7efe6f0232ac1bfe57eb798cca718a648c
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## ❓ Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **CORS Error** | Frontend is not on port 5500 | Serve frontend specifically on `http://localhost:5500`. |
| **MongoDB ECONNREFUSED** | MongoDB service is not started | Run `net start MongoDB` in Administrator PowerShell. |
| **Port 5000 in use** | An existing node process is running | Kill port: `npx kill-port 5000` or change `PORT` in `.env`. |
| **Browser showing old UI** | Browser caching old `.js`/`.css` | Perform a hard refresh: Press **`Ctrl + Shift + R`** or **`Ctrl + F5`**. |

---

## 📜 License & Credits

Developed with ❤️ for interactive computer science education and skill assessment.

---

## 📜 License & Credits

Developed with ❤️ for interactive computer science education and skill assessment.

