import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    async function signup(email, password, name, rollNo) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update Auth profile
        await updateProfile(user, { displayName: name })

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            rollNo,
            role: 'student',
            createdAt: new Date().toISOString()
        })

        return userCredential
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        return signOut(auth)
    }

    async function updateUserProfile(data) {
        const user = auth.currentUser
        if (!user) return

        // Update Auth profile (displayName, photoURL)
        if (data.displayName || data.photoURL) {
            await updateProfile(user, {
                displayName: data.displayName,
                photoURL: data.photoURL
            })
        }

        // Update Firestore document (rollNo, etc.)
        if (data.rollNo) {
            await setDoc(doc(db, 'users', user.uid), {
                rollNo: data.rollNo
            }, { merge: true })
        }

        // Refresh local state if needed (simplified)
        // Ideally we'd re-fetch, but for now we rely on the next refresh or manual state update if critical
    }

    function updateUserEmail(email) {
        return updateEmail(auth.currentUser, email)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch additional data from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid))
                    if (userDoc.exists()) {
                        const userData = userDoc.data()
                        // Merge Firestore data into the user object
                        user.rollNo = userData.rollNo
                        user.role = userData.role
                        user.grades = userData.grades || []
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err)
                }
            }
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        signup,
        login,
        logout,
        updateUserProfile,
        updateUserEmail
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
