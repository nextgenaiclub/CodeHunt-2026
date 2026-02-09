# Firebase Setup Guide for CodeHunt-2026

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Name it: `codehunt-2026`
4. Disable Google Analytics (optional for this project)
5. Click **"Create project"**

## Step 2: Enable Firestore Database

1. In Firebase Console, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll add rules later)
4. Select a Cloud Firestore location (choose nearest to you)
5. Click **"Enable"**

## Step 3: Get Service Account Credentials

1. Go to **Project Settings** (gear icon next to "Project Overview")
2. Click the **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** to download the JSON file
5. **Rename** the downloaded file to: `firebase-credentials.json`
6. **Move** this file to: `backend/firebase-credentials.json`

## Step 4: Firestore Security Rules (Optional but Recommended)

In Firebase Console → Firestore → Rules, add:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /teams/{teamId} {
      allow read, write: if true;  // For development
    }
  }
}
```

For production, you'd want stricter rules.

## Step 5: Create Firestore Index (Required for Leaderboard)

1. Go to Firebase Console → Firestore → Indexes
2. Click **"Add Index"**
3. Configure:
   - Collection ID: `teams`
   - Fields:
     - `phase6.completed` → Ascending
     - `totalTimeSeconds` → Ascending
4. Click **"Create"**

This index enables the leaderboard query.

## Step 6: Start the Server

```bash
cd backend
node server.js
```

You should see:
```
🚀 CodeHunt-2026 Server running on port 5000
📦 Database: Firebase Firestore ✓
```

## Troubleshooting

### "firebase-credentials.json not found"
- Make sure the file is in the `backend/` folder
- Make sure it's named exactly `firebase-credentials.json`

### "Invalid credential"
- The JSON file might be corrupted
- Re-download the service account key from Firebase Console

### "Permission denied"
- Check your Firestore security rules
- Make sure Firestore is enabled in your project

## File Structure

```
backend/
├── firebase-credentials.json  ← Your Firebase credentials
├── server.js
├── .env
├── package.json
└── uploads/
```

## Important Security Note

⚠️ **Never commit `firebase-credentials.json` to version control!**

Add this to your `.gitignore`:
```
firebase-credentials.json
```
