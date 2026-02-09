# CodeHunt-2026 🏆

A comprehensive, interactive multi-phase AI competition website for NextGenAI Club at Vishwakarma University. The platform handles all 6 phases of the competition internally with a sleek black, yellow, and white cyberpunk/tech noir design.

![CodeHunt-2026](https://img.shields.io/badge/Event-CodeHunt--2026-FFD700?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iI0ZGRDcwMCIgZD0iTTEyIDJMMy41IDExLjVMMTIgMjFsMy41LTMuNUw3IDE0bDUuNS01LjVMMTIgMnoiLz48L3N2Zz4=)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-22c55e?style=for-the-badge)

## 🎯 Features

### Competition Phases
1. **Phase 1: AI Image Generation** - Create futuristic VU 2050 images using AI tools
2. **Phase 2: AI Quiz Challenge** - 10 MCQ questions about AI fundamentals (10 min timer)
3. **Phase 3: Code Output Prediction** - 5 C programming output questions (8 min timer)
4. **Phase 4: Debug the Room** - Fix bugs in C code to find a room number
5. **Phase 5: Logic Riddles** - 5 AI-themed riddles and puzzles
6. **Phase 6: Campus Treasure Hunt** - Find location and upload team photo

### Technical Features
- 🎨 **Black, Yellow, White Theme** - Sleek cyberpunk design
- 📱 **Fully Responsive** - Works on all devices
- ⏱️ **Real-time Timers** - For quiz phases
- 📊 **Progress Tracking** - Session persistence with localStorage
- 🏆 **Live Leaderboard** - Auto-refreshing rankings
- 👤 **Admin Dashboard** - Complete team management
- 📤 **CSV Export** - Download all team data
- ✨ **Confetti Celebration** - On completion

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally (or MongoDB Atlas connection string)

### Installation

1. **Clone/Navigate to the project**
```bash
cd CodeHunt2026
```

2. **Install Frontend Dependencies**
```bash
npm install
```

3. **Install Backend Dependencies**
```bash
cd backend
npm install
```

4. **Configure Environment**
```bash
# Edit backend/.env
MONGODB_URI=mongodb://localhost:27017/codehunt2026
PORT=5000
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 📁 Project Structure

```
CodeHunt2026/
├── src/
│   ├── components/
│   │   └── Layout.jsx        # Main layout with nav & phase indicator
│   ├── pages/
│   │   ├── LandingPage.jsx   # Home page
│   │   ├── Phase1.jsx        # AI Generation submission
│   │   ├── Phase2.jsx        # AI Quiz (10 questions)
│   │   ├── Phase3.jsx        # Code Output Prediction
│   │   ├── Phase4.jsx        # Debug Challenge
│   │   ├── Phase5.jsx        # Logic Riddles
│   │   ├── Phase6.jsx        # Treasure Hunt & Upload
│   │   ├── Leaderboard.jsx   # Public leaderboard
│   │   └── Admin.jsx         # Admin dashboard
│   ├── App.jsx               # Main app with routing
│   ├── main.jsx              # Entry point
│   └── index.css             # Complete styling
├── backend/
│   ├── server.js             # Express server with all APIs
│   ├── .env                  # Environment variables
│   └── uploads/              # Team photo uploads
├── public/
│   └── favicon.svg
├── index.html
└── package.json
```

## 🔐 Admin Access

- URL: `/admin`
- Password: `nextgenai2026`

### Admin Features:
- View all team submissions
- Filter by phase or completion status
- Real-time statistics
- Expand team details
- Export data to CSV
- View uploaded photos

## 🎨 Design Theme

| Element | Color |
|---------|-------|
| Primary Background | #0a0a0a (Black) |
| Accent | #FFD700 (Yellow/Gold) |
| Text | #FFFFFF (White) |
| Muted Text | #b3b3b3 |
| Success | #22c55e (Green) |
| Error | #ef4444 (Red) |

## 📝 Phase Details

### Phase 2 Quiz Questions
- AI basics, Machine Learning, NLP, Ethics
- 10 minutes time limit
- Minimum 6/10 to pass
- 2 attempts allowed

### Phase 3 Code Questions
- C programming output prediction
- Loops, conditionals, arrays, operators
- 8 minutes time limit
- Minimum 3/5 to pass

### Phase 4 Bugs
1. Missing semicolon after variable declaration
2. Assignment (=) instead of comparison (==) in if condition
3. Missing semicolon after printf

**Correct Room Number: 305**

### Phase 5 Riddles
- Machine Learning riddle (MCQ)
- Neural Network decode (Text)
- Number sequence (MCQ)
- Language Model riddle (Text)
- VU Campus location (MCQ)

## 🗄️ Database Schema

```javascript
{
  teamId: String,
  teamName: String,
  teamLeader: String,
  teamMembers: [String],
  email: String,
  phase1: { driveLink, aiPrompt, timestamp, completed },
  phase2: { attempts, scores, answers, timestamp, completed },
  phase3: { score, answers, timestamp, completed },
  phase4: { attempts, roomNumber, timestamp, completed },
  phase5: { score, answers, timestamp, completed },
  phase6: { photoPath, locationAnswer, timestamp, completed },
  totalTimeSeconds: Number,
  finalCompletionTime: Date,
  currentPhase: Number
}
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/teams/register | Register new team |
| GET | /api/teams/:teamName | Get team data |
| GET | /api/phase2/questions | Get quiz questions |
| POST | /api/phase2/submit | Submit quiz answers |
| GET | /api/phase3/questions | Get code questions |
| POST | /api/phase3/submit | Submit code answers |
| GET | /api/phase4/code | Get buggy code |
| POST | /api/phase4/submit | Submit room number |
| GET | /api/phase5/riddles | Get riddles |
| POST | /api/phase5/answer | Check riddle answer |
| POST | /api/phase5/complete | Complete phase 5 |
| POST | /api/phase6/submit | Submit final phase |
| GET | /api/leaderboard | Get top 10 teams |
| GET | /api/admin/teams | Get all teams (admin) |
| GET | /api/admin/stats | Get statistics (admin) |

## 🎉 Customization

### To change quiz questions:
Edit `phase2Questions` array in `backend/server.js`

### To change riddles:
Edit `phase5Riddles` array in `backend/server.js`

### To change the final riddle:
Edit the riddle text in `src/pages/Phase6.jsx`

### To change admin password:
Edit `ADMIN_PASSWORD` in `src/pages/Admin.jsx`

## 📜 License

Created for NextGenAI Club, Vishwakarma University © 2026

---

**Organized by NextGenAI Club, Vishwakarma University** 🎓
