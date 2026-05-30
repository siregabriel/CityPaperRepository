# 🚀 Vercel Setup - Quick Guide

## Step 1: Add Environment Variables in Vercel

Go to your Vercel project: **Settings → Environment Variables**

Add these 6 variables (for Production, Preview, and Development):

```
Name: VITE_FIREBASE_API_KEY
Value: AIzaSyC5oHKF_FYWPZHGFoNNahmrvgfAhYehnAI

Name: VITE_FIREBASE_AUTH_DOMAIN
Value: city-paper-repository.firebaseapp.com

Name: VITE_FIREBASE_PROJECT_ID
Value: city-paper-repository

Name: VITE_FIREBASE_STORAGE_BUCKET
Value: city-paper-repository.firebasestorage.app

Name: VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 626588890303

Name: VITE_FIREBASE_APP_ID
Value: 1:626588890303:web:ac48add55435d4c91c020a
```

## Step 2: Redeploy

After adding the environment variables, trigger a new deployment:

```bash
git add .
git commit -m "Add environment variables support"
git push
```

Or in Vercel Dashboard: **Deployments → Redeploy**

## Step 3: Verify

1. Open your deployed site
2. Open DevTools → Console
3. Check for Firebase connection
4. No errors should appear

## ✅ What Changed?

- ✅ Credentials removed from `index.html`
- ✅ Credentials now in environment variables
- ✅ `env-config.js` generated at build time
- ✅ `.env` file added to `.gitignore`
- ✅ Local development still works with `env-config.js`

## 🔒 Important Security Note

**Firebase API keys are designed to be public.** Real security comes from:

1. **Firebase Security Rules** (Most Important!)
2. **Firebase App Check**
3. **Domain restrictions**
4. **Authentication requirements**

### Next Step: Secure Your Firebase Database

Go to Firebase Console → Firestore Database → Rules

Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Only allow from your domain
      allow read, write: if request.auth != null 
        || request.headers.origin.matches('.*vercel.app$')
        || request.headers.origin.matches('.*yourdomain.com$');
    }
  }
}
```

## 📝 Notes

- The current `env-config.js` has hardcoded values for local development
- In production (Vercel), it will be regenerated with environment variables
- This approach works without needing a build tool like Vite or Webpack

## Need Help?

Check `README-DEPLOYMENT.md` for detailed instructions.
