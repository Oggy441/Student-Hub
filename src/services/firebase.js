import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
    apiKey: "AIzaSyB2WXTgw0YQOMPlKv6FI3iVt2bR9gtq9kg",
    authDomain: "student-hub-cb748.firebaseapp.com",
    projectId: "student-hub-cb748",
    storageBucket: "student-hub-cb748.firebasestorage.app",
    messagingSenderId: "967082607713",
    appId: "1:967082607713:web:06ac684967904d55f79620",
    measurementId: "G-XWDTKH29K2"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Export services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
