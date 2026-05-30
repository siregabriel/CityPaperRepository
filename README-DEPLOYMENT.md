# Deployment Guide - Firebase Security

## Overview
This project uses environment variables to protect Firebase credentials in production.

## Setup Instructions

### 1. Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`

3. The credentials are already in `.env` for your convenience

### 2. Vercel Deployment

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   ```
   VITE_FIREBASE_API_KEY = AIzaSyC5oHKF_FYWPZHGFoNNahmrvgfAhYehnAI
   VITE_FIREBASE_AUTH_DOMAIN = city-paper-repository.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = city-paper-repository
   VITE_FIREBASE_STORAGE_BUCKET = city-paper-repository.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 626588890303
   VITE_FIREBASE_APP_ID = 1:626588890303:web:ac48add55435d4c91c020a
   ```

4. Update `vercel.json` build command:
   ```json
   {
     "buildCommand": "bash generate-env.sh",
     "outputDirectory": "."
   }
   ```

5. Redeploy your project

#### Option B: Using Vercel CLI

```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

### 3. Firebase Security Rules

Even with environment variables, Firebase credentials are visible in the browser. Protect your data with Firebase Security Rules:

#### Firestore Rules Example:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only allow authenticated users
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Or restrict by domain
    match /{document=**} {
      allow read, write: if request.auth.token.email.matches('.*@yourdomain.com$');
    }
  }
}
```

#### Alternative: Domain Restrictions
1. Go to Firebase Console → Project Settings
2. Under "Your apps" → Web app
3. Add authorized domains (e.g., your-app.vercel.app)

### 4. Additional Security Measures

1. **Enable App Check** (Recommended):
   - Protects your Firebase resources from abuse
   - Go to Firebase Console → App Check
   - Enable for your web app

2. **Set up Authentication**:
   - Require users to sign in before accessing data
   - Use Firebase Authentication

3. **Monitor Usage**:
   - Check Firebase Console → Usage and billing
   - Set up budget alerts

## Important Notes

⚠️ **Firebase API keys are meant to be public** - they identify your Firebase project, not authenticate users. Security comes from:
- Firebase Security Rules
- Firebase App Check
- Firebase Authentication
- Domain restrictions

✅ The `.env` file is in `.gitignore` to prevent committing credentials to Git
✅ Use environment variables in Vercel for production
✅ Always set proper Firebase Security Rules

## Testing

After deployment, verify:
1. Open browser DevTools → Network tab
2. Check that `env-config.js` loads with environment variables
3. Verify Firebase connection works
4. Test that security rules are enforced

## Troubleshooting

**Issue**: Firebase not connecting
- Check that all environment variables are set in Vercel
- Verify `generate-env.sh` ran during build
- Check browser console for errors

**Issue**: "Permission denied" errors
- Review Firebase Security Rules
- Ensure authentication is set up if required
- Check that domain is authorized in Firebase Console
