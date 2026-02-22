import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// All Firebase config values are read from VITE_ environment variables.
// Set these in your .env file locally, and in your Vercel project dashboard for production.
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Guard: fail fast in development if env vars are not set
if (import.meta.env.DEV && !firebaseConfig.apiKey) {
    throw new Error(
        '[firebase.js] VITE_FIREBASE_API_KEY is not set. ' +
        'Add VITE_FIREBASE_* variables to your .env file.'
    )
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
