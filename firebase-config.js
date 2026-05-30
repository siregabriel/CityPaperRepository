// Firebase configuration using environment variables
export const getFirebaseConfig = () => {
  // Check if we're in a build environment (Vite/Vercel)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }
  
  // Fallback for direct HTML usage (development only)
  // In production, these should come from environment variables
  return {
    apiKey: window.ENV?.FIREBASE_API_KEY || '',
    authDomain: window.ENV?.FIREBASE_AUTH_DOMAIN || '',
    projectId: window.ENV?.FIREBASE_PROJECT_ID || '',
    storageBucket: window.ENV?.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: window.ENV?.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: window.ENV?.FIREBASE_APP_ID || ''
  };
};
