const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only .jpg, .jpeg, and .png files are allowed'));
    }
});

// ============================================
// FIREBASE INITIALIZATION
// ============================================
let db;
let useFirebase = false;

// Check if Firebase credentials file exists
const serviceAccountPath = path.join(__dirname, 'firebase-credentials.json');
if (fs.existsSync(serviceAccountPath)) {
    try {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        db = admin.firestore();
        useFirebase = true;
        console.log('✅ Firebase Firestore connected successfully!');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error.message);
        console.log('⚠️  Falling back to in-memory database');
    }
} else {
    console.log('⚠️  firebase-credentials.json not found');
    console.log('📝 To use Firebase:');
    console.log('   1. Go to Firebase Console → Project Settings → Service Accounts');
    console.log('   2. Generate new private key');
    console.log('   3. Save as backend/firebase-credentials.json');
    console.log('');
    console.log('📦 Using in-memory database for now...\n');
}

// ============================================
// IN-MEMORY DATABASE (Fallback)
// ============================================
const teamsDB = new Map();

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

// Get team by name
async function getTeamByName(teamName) {
    const normalizedName = teamName.toLowerCase();

    if (useFirebase) {
        const snapshot = await db.collection('teams')
            .where('teamName', '==', normalizedName)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } else {
        for (const [id, team] of teamsDB) {
            if (team.teamName === normalizedName) {
                return team;
            }
        }
        return null;
    }
}

// Get team by ID
async function getTeamById(teamId) {
    if (useFirebase) {
        const doc = await db.collection('teams').doc(teamId).get();
        if (!doc.exists) return null;
        return { id: doc.id, ...doc.data() };
    } else {
        return teamsDB.get(teamId) || null;
    }
}

// Save team - handles both flat and nested updates
async function saveTeam(teamId, teamData) {
    if (useFirebase) {
        try {
            // Flatten nested objects to dot notation for Firebase update()
            const flattenObject = (obj, prefix = '') => {
                return Object.keys(obj).reduce((acc, key) => {
                    const newKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
                        Object.assign(acc, flattenObject(obj[key], newKey));
                    } else {
                        acc[newKey] = obj[key];
                    }
                    return acc;
                }, {});
            };

            const flatData = flattenObject(teamData);

            // Use update() for partial updates - this properly handles nested fields
            await db.collection('teams').doc(teamId).update(flatData);
        } catch (error) {
            console.error('Firebase saveTeam error:', error.message);
            throw error;
        }
    } else {
        // For in-memory, deep merge the updates
        const existingTeam = teamsDB.get(teamId) || {};

        const deepMerge = (target, source) => {
            for (const key in source) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!target[key]) target[key] = {};
                    deepMerge(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
            return target;
        };

        deepMerge(existingTeam, teamData);
        teamsDB.set(teamId, existingTeam);
    }
}

// Create team
async function createTeam(teamId, teamData) {
    if (useFirebase) {
        await db.collection('teams').doc(teamId).set(teamData);
    } else {
        teamsDB.set(teamId, teamData);
    }
}

// Get all teams
async function getAllTeams() {
    if (useFirebase) {
        const snapshot = await db.collection('teams')
            .orderBy('createdAt', 'desc')
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
        return Array.from(teamsDB.values()).sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
}

// Get completed teams for leaderboard
async function getCompletedTeams() {
    if (useFirebase) {
        const snapshot = await db.collection('teams')
            .where('phase6.completed', '==', true)
            .orderBy('totalTimeSeconds', 'asc')
            .limit(10)
            .get();
        return snapshot.docs.map(doc => ({
            teamId: doc.id,
            teamName: doc.data().teamName,
            teamLeader: doc.data().teamLeader,
            totalTimeSeconds: doc.data().totalTimeSeconds,
            finalCompletionTime: doc.data().finalCompletionTime
        }));
    } else {
        const completedTeams = [];
        for (const [id, team] of teamsDB) {
            if (team.phase6?.completed) {
                completedTeams.push({
                    teamId: team.teamId,
                    teamName: team.teamName,
                    teamLeader: team.teamLeader,
                    totalTimeSeconds: team.totalTimeSeconds,
                    finalCompletionTime: team.finalCompletionTime
                });
            }
        }
        return completedTeams.sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds).slice(0, 10);
    }
}

// Get stats
async function getStats() {
    if (useFirebase) {
        const snapshot = await db.collection('teams').get();
        let stats = {
            totalTeams: 0,
            phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0, phase6: 0
        };

        snapshot.forEach(doc => {
            const team = doc.data();
            stats.totalTeams++;
            if (team.phase1?.completed) stats.phase1++;
            if (team.phase2?.completed) stats.phase2++;
            if (team.phase3?.completed) stats.phase3++;
            if (team.phase4?.completed) stats.phase4++;
            if (team.phase5?.completed) stats.phase5++;
            if (team.phase6?.completed) stats.phase6++;
        });

        return stats;
    } else {
        let stats = {
            totalTeams: 0,
            phase1: 0, phase2: 0, phase3: 0, phase4: 0, phase5: 0, phase6: 0
        };

        for (const [id, team] of teamsDB) {
            stats.totalTeams++;
            if (team.phase1?.completed) stats.phase1++;
            if (team.phase2?.completed) stats.phase2++;
            if (team.phase3?.completed) stats.phase3++;
            if (team.phase4?.completed) stats.phase4++;
            if (team.phase5?.completed) stats.phase5++;
            if (team.phase6?.completed) stats.phase6++;
        }

        return stats;
    }
}

// ============================================
// QUESTIONS DATA
// ============================================

// Quiz Questions for Phase 2
const phase2Questions = [
    {
        id: 1,
        question: "What is Artificial Intelligence?",
        options: [
            "Only robots that look like humans",
            "Computer systems that can perform tasks requiring human intelligence",
            "A programming language",
            "A type of hardware"
        ],
        correctAnswer: 1
    },
    {
        id: 2,
        question: "What is the main difference between AI and Machine Learning?",
        options: [
            "They are exactly the same",
            "ML is a subset of AI that learns from data",
            "AI is newer than ML",
            "ML only works with images"
        ],
        correctAnswer: 1
    },
    {
        id: 3,
        question: "Which type of AI can perform only specific tasks?",
        options: ["General AI", "Super AI", "Narrow AI", "Broad AI"],
        correctAnswer: 2
    },
    {
        id: 4,
        question: "Which is a real-world application of AI?",
        options: ["Netflix recommendations", "Manual data entry", "Traditional calculators", "Pen and paper"],
        correctAnswer: 0
    },
    {
        id: 5,
        question: "What is Machine Learning?",
        options: [
            "Robots learning to walk",
            "Systems that improve through experience and data",
            "Teaching machines manually",
            "A type of computer hardware"
        ],
        correctAnswer: 1
    },
    {
        id: 6,
        question: "In Supervised Learning, what do we provide to the algorithm?",
        options: ["No data at all", "Labeled data with correct answers", "Only images", "Random numbers"],
        correctAnswer: 1
    },
    {
        id: 7,
        question: "Which AI technology powers voice assistants like Alexa and Siri?",
        options: ["Image Recognition", "Natural Language Processing", "Game Theory", "Robotics only"],
        correctAnswer: 1
    },
    {
        id: 8,
        question: "What is a 'dataset' in AI/ML?",
        options: [
            "A collection of data used for training models",
            "A type of computer",
            "A programming error",
            "A database software"
        ],
        correctAnswer: 0
    },
    {
        id: 9,
        question: "ChatGPT is an example of which AI application?",
        options: ["Image generation", "Language model / Conversational AI", "Self-driving cars", "Weather prediction"],
        correctAnswer: 1
    },
    {
        id: 10,
        question: "What is an ethical concern with AI?",
        options: ["AI is too colorful", "Bias and fairness in AI decisions", "AI uses electricity", "AI requires computers"],
        correctAnswer: 1
    }
];

// Phase 3 Questions
const phase3Questions = [
    {
        id: 1,
        code: `int i, sum = 0;
for(i = 1; i <= 5; i++) {
    sum = sum + i;
}
printf("%d", sum);`,
        options: ["10", "15", "20", "5"],
        correctAnswer: 1
    },
    {
        id: 2,
        code: `int x = 10, y = 20;
if(x > y) {
    printf("A");
} else {
    printf("B");
}`,
        options: ["A", "B", "AB", "Error"],
        correctAnswer: 1
    },
    {
        id: 3,
        code: `int arr[] = {2, 4, 6, 8, 10};
printf("%d", arr[3]);`,
        options: ["6", "8", "10", "4"],
        correctAnswer: 1
    },
    {
        id: 4,
        code: `int a = 5;
printf("%d ", a++);
printf("%d", a);`,
        options: ["5 6", "6 6", "5 5", "6 7"],
        correctAnswer: 0
    },
    {
        id: 5,
        code: `int i, j;
for(i = 1; i <= 3; i++) {
    for(j = 1; j <= i; j++) {
        printf("*");
    }
    printf("\\n");
}`,
        question: "Count total stars printed:",
        options: ["3 stars", "6 stars", "9 stars", "Error"],
        correctAnswer: 1
    }
];

// Phase 4 Buggy Code
const phase4Code = `#include <stdio.h>

int main() {
    int a = 10, b = 5, result
    
    result = a * b - 15;
    
    if(result = 30) {
        printf("Room Number: 305");
    } else {
        printf("Room Number: 404")
    }
    
    return 0;
}`;

const phase4Hints = [
    "Check for missing semicolons",
    "Look at the if condition - is it comparing or assigning?",
    "Count all semicolons needed"
];

// Phase 5 Riddles
const phase5Riddles = [
    {
        id: 1,
        type: "mcq",
        riddle: "I learn from examples but never forget. I find patterns in data you haven't seen yet. What am I?",
        options: ["A teacher", "Machine Learning Algorithm", "A database", "A calculator"],
        correctAnswer: 1
    },
    {
        id: 2,
        type: "text",
        riddle: "Decode: AI = Artificial Intelligence, ML = Machine Learning, NN = ?",
        acceptedAnswers: ["neural network", "neural networks", "neuralnetwork", "neuralnetworks"]
    },
    {
        id: 3,
        type: "mcq",
        riddle: "Complete the sequence: 2, 4, 8, 16, __",
        options: ["20", "24", "32", "64"],
        correctAnswer: 2
    },
    {
        id: 4,
        type: "text",
        riddle: "I have no consciousness but can chat like a human. I was trained on text from the internet. What type of AI am I?",
        acceptedAnswers: ["language model", "llm", "chatbot", "conversational ai", "languagemodel", "large language model"]
    },
    {
        id: 5,
        type: "mcq",
        riddle: "In VU's campus, where does innovation meet collaboration, and NextGen minds code the future?",
        options: ["Library", "Computer Lab", "Cafeteria", "Sports Ground"],
        correctAnswer: 1
    }
];

// ============================================
// API ROUTES
// ============================================

// Register new team (Phase 1)
app.post('/api/teams/register', async (req, res) => {
    try {
        const { teamName, teamLeader, teamMembers, email, driveLink, aiPrompt } = req.body;

        // Validate required fields
        if (!teamName || !teamLeader || !teamMembers || !email || !driveLink || !aiPrompt) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate drive link
        if (!driveLink.includes('drive.google.com')) {
            return res.status(400).json({ error: 'Please provide a valid Google Drive link' });
        }

        // Validate AI prompt contains VU2050
        if (!aiPrompt.toUpperCase().includes('VU2050')) {
            return res.status(400).json({ error: 'AI Prompt must contain keyword "VU2050"' });
        }

        // Validate team members (2-4)
        const members = teamMembers.split(',').map(m => m.trim()).filter(m => m);
        if (members.length < 2 || members.length > 4) {
            return res.status(400).json({ error: 'Team must have 2-4 members' });
        }

        // Check if team name already exists
        const existingTeam = await getTeamByName(teamName);
        if (existingTeam) {
            return res.status(400).json({ error: 'Team name already exists' });
        }

        const teamId = 'TEAM_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const now = new Date().toISOString();

        const team = {
            teamId,
            teamName: teamName.toLowerCase(),
            teamLeader,
            teamMembers: members,
            email,
            phase1: {
                driveLink,
                aiPrompt,
                timestamp: now,
                completed: true
            },
            phase2: { attempts: 0, lastScore: 0, completed: false },
            phase3: { completed: false },
            phase4: { attempts: 0, completed: false },
            phase5: { completed: false },
            phase6: { completed: false },
            startTime: now,
            currentPhase: 2,
            createdAt: now
        };

        await createTeam(teamId, team);

        console.log(`✅ Team registered: ${teamName} ${useFirebase ? '(Firebase)' : '(Memory)'}`);

        res.json({
            success: true,
            message: 'Registration successful!',
            teamId,
            teamName: team.teamName,
            currentPhase: 2
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Get team by name (for resume)
app.get('/api/teams/:teamName', async (req, res) => {
    try {
        const team = await getTeamByName(req.params.teamName);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Get Phase 2 questions
app.get('/api/phase2/questions', (req, res) => {
    const questionsWithoutAnswers = phase2Questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options
    }));
    res.json(questionsWithoutAnswers);
});

// Submit Phase 2 answers
app.post('/api/phase2/submit', async (req, res) => {
    try {
        const { teamId, answers } = req.body;

        console.log(`Phase 2 submit request - TeamId: ${teamId}`);

        const team = await getTeamById(teamId);
        if (!team) {
            console.log('Team not found:', teamId);
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.phase2?.completed) {
            return res.status(400).json({ error: 'Phase 2 already completed' });
        }

        if ((team.phase2?.attempts || 0) >= 2) {
            return res.status(400).json({ error: 'Maximum attempts reached' });
        }

        // Calculate score
        let score = 0;
        const results = phase2Questions.map((q, index) => {
            const isCorrect = answers[index] === q.correctAnswer;
            if (isCorrect) score++;
            return {
                questionId: q.id,
                userAnswer: answers[index],
                correctAnswer: q.correctAnswer,
                isCorrect
            };
        });

        const passed = score >= 6;
        const newAttempts = (team.phase2?.attempts || 0) + 1;

        // Use nested object structure for Firebase compatibility (no arrays)
        const updateData = {
            phase2: {
                attempts: newAttempts,
                lastScore: score,
                timestamp: new Date().toISOString(),
                completed: passed
            }
        };

        if (passed) {
            updateData.currentPhase = 3;
        }

        await saveTeam(teamId, updateData);

        console.log(`📝 Phase 2 - Team: ${team.teamName}, Score: ${score}/10, Passed: ${passed}`);

        res.json({
            success: true,
            score,
            passed,
            results,
            attempts: newAttempts,
            canRetry: !passed && newAttempts < 2,
            questions: phase2Questions
        });
    } catch (error) {
        console.error('Phase 2 submit error:', error.message, error.stack);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get Phase 3 questions
app.get('/api/phase3/questions', (req, res) => {
    const questionsWithoutAnswers = phase3Questions.map(q => ({
        id: q.id,
        code: q.code,
        question: q.question,
        options: q.options
    }));
    res.json(questionsWithoutAnswers);
});

// Submit Phase 3 answers
app.post('/api/phase3/submit', async (req, res) => {
    try {
        const { teamId, answers } = req.body;

        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.currentPhase !== 3) {
            return res.status(400).json({ error: 'Not on Phase 3' });
        }

        if (team.phase3?.completed) {
            return res.status(400).json({ error: 'Phase 3 already completed' });
        }

        // Calculate score
        let score = 0;
        const results = phase3Questions.map((q, index) => {
            const isCorrect = answers[index] === q.correctAnswer;
            if (isCorrect) score++;
            return {
                questionId: q.id,
                userAnswer: answers[index],
                correctAnswer: q.correctAnswer,
                isCorrect
            };
        });

        const passed = score >= 3;

        // Use nested object structure for Firebase
        const updateData = {
            phase3: {
                score: score,
                answers: answers,
                timestamp: new Date().toISOString(),
                completed: passed
            }
        };

        if (passed) {
            updateData.currentPhase = 4;
        }

        await saveTeam(teamId, updateData);

        console.log(`💻 Phase 3 - Team: ${team.teamName}, Score: ${score}/5, Passed: ${passed}`);

        res.json({
            success: true,
            score,
            passed,
            results,
            questions: phase3Questions
        });
    } catch (error) {
        console.error('Phase 3 submit error:', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get Phase 4 code
app.get('/api/phase4/code', (req, res) => {
    res.json({ code: phase4Code });
});

// Submit Phase 4 answer
app.post('/api/phase4/submit', async (req, res) => {
    try {
        const { teamId, roomNumber } = req.body;

        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.currentPhase !== 4) {
            return res.status(400).json({ error: 'Not on Phase 4' });
        }

        if (team.phase4?.completed) {
            return res.status(400).json({ error: 'Phase 4 already completed' });
        }

        const attempts = (team.phase4?.attempts || 0) + 1;
        const isCorrect = roomNumber.trim() === '305';

        if (isCorrect) {
            await saveTeam(teamId, {
                phase4: {
                    attempts: attempts,
                    roomNumber: roomNumber,
                    timestamp: new Date().toISOString(),
                    completed: true
                },
                currentPhase: 5
            });

            console.log(`🔓 Phase 4 - Team: ${team.teamName} found room 305!`);

            return res.json({
                success: true,
                correct: true,
                message: 'Correct! Room Number 305 unlocked!'
            });
        }

        await saveTeam(teamId, { phase4: { attempts: attempts, completed: false } });

        // Provide hints based on attempts
        let hint = null;
        if (attempts >= 2 && attempts <= 4) {
            hint = phase4Hints[Math.min(attempts - 2, phase4Hints.length - 1)];
        }

        res.json({
            success: false,
            correct: false,
            attempts,
            hint,
            message: 'Incorrect room number. Try again!'
        });
    } catch (error) {
        console.error('Phase 4 submit error:', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get Phase 5 riddles
app.get('/api/phase5/riddles', (req, res) => {
    const riddlesWithoutAnswers = phase5Riddles.map(r => ({
        id: r.id,
        type: r.type,
        riddle: r.riddle,
        options: r.options
    }));
    res.json(riddlesWithoutAnswers);
});

// Submit single Phase 5 riddle answer
app.post('/api/phase5/answer', async (req, res) => {
    try {
        const { teamId, riddleId, answer } = req.body;

        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.currentPhase !== 5) {
            return res.status(400).json({ error: 'Not on Phase 5' });
        }

        const riddle = phase5Riddles.find(r => r.id === riddleId);
        if (!riddle) {
            return res.status(400).json({ error: 'Invalid riddle' });
        }

        let isCorrect = false;
        if (riddle.type === 'mcq') {
            isCorrect = answer === riddle.correctAnswer;
        } else {
            isCorrect = riddle.acceptedAnswers.includes(answer.toLowerCase().trim());
        }

        res.json({
            success: true,
            correct: isCorrect
        });
    } catch (error) {
        console.error('Phase 5 answer error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit Phase 5 completion
app.post('/api/phase5/complete', async (req, res) => {
    try {
        const { teamId, answers, score } = req.body;

        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.currentPhase !== 5) {
            return res.status(400).json({ error: 'Not on Phase 5' });
        }

        if (score < 4) {
            return res.status(400).json({ error: 'Need at least 4/5 correct answers' });
        }

        await saveTeam(teamId, {
            phase5: {
                score: score,
                answers: answers,
                timestamp: new Date().toISOString(),
                completed: true
            },
            currentPhase: 6
        });

        console.log(`🧩 Phase 5 - Team: ${team.teamName} completed with ${score}/5!`);

        res.json({
            success: true,
            message: 'Phase 5 completed! Proceed to the final phase.'
        });
    } catch (error) {
        console.error('Phase 5 complete error:', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Submit Phase 6 (Final)
app.post('/api/phase6/submit', upload.single('photo'), async (req, res) => {
    try {
        const { teamId, locationAnswer } = req.body;

        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        if (team.currentPhase !== 6) {
            return res.status(400).json({ error: 'Not on Phase 6' });
        }

        if (team.phase6?.completed) {
            return res.status(400).json({ error: 'Already completed' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Photo is required' });
        }

        const now = new Date();
        const startTime = new Date(team.startTime);
        const totalTimeSeconds = Math.floor((now - startTime) / 1000);

        await saveTeam(teamId, {
            phase6: {
                photoPath: req.file.filename,
                locationAnswer: locationAnswer,
                timestamp: now.toISOString(),
                completed: true
            },
            totalTimeSeconds,
            finalCompletionTime: now.toISOString()
        });

        console.log(`🏆 COMPLETED - Team: ${team.teamName}, Total Time: ${totalTimeSeconds}s`);

        res.json({
            success: true,
            message: 'Congratulations! You have completed CodeHunt-2026!',
            totalTimeSeconds,
            teamName: team.teamName,
            teamLeader: team.teamLeader
        });
    } catch (error) {
        console.error('Phase 6 submit error:', error.message);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const teams = await getCompletedTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin routes
app.get('/api/admin/teams', async (req, res) => {
    try {
        const teams = await getAllTeams();
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = await getStats();
        res.json({
            totalTeams: stats.totalTeams,
            phaseStats: {
                phase1: stats.phase1,
                phase2: stats.phase2,
                phase3: stats.phase3,
                phase4: stats.phase4,
                phase5: stats.phase5,
                phase6: stats.phase6
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: useFirebase ? 'Firebase Firestore' : 'In-Memory',
        timestamp: new Date().toISOString()
    });
});

// Admin: Delete a specific team (for testing)
app.delete('/api/admin/teams/:teamId', async (req, res) => {
    try {
        const { teamId } = req.params;

        if (useFirebase) {
            await db.collection('teams').doc(teamId).delete();
        } else {
            teamsDB.delete(teamId);
        }

        console.log(`🗑️ Team deleted: ${teamId}`);
        res.json({ success: true, message: 'Team deleted' });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({ error: 'Failed to delete team' });
    }
});

// Admin: Clear all teams (for testing - BE CAREFUL!)
app.delete('/api/admin/clear-all', async (req, res) => {
    try {
        if (useFirebase) {
            const snapshot = await db.collection('teams').get();
            const batch = db.batch();
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
        } else {
            teamsDB.clear();
        }

        console.log('🗑️ All teams cleared!');
        res.json({ success: true, message: 'All teams cleared' });
    } catch (error) {
        console.error('Clear all error:', error);
        res.status(500).json({ error: 'Failed to clear teams' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 CodeHunt-2026 Server running on port ${PORT}`);
    console.log(`📦 Database: ${useFirebase ? 'Firebase Firestore ✓' : 'In-Memory (add firebase-credentials.json for Firebase)'}`);
    if (!useFirebase) {
        console.log(`⚠️  Data will be lost when server restarts`);
    }
    console.log('');
});
