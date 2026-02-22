import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../services/firebase'

const AuthContext = createContext()

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    // Firestore-only fields are kept separate from the Firebase User object
    // to avoid mutating a sealed native object (which silently fails in strict mode).
    const [userProfile, setUserProfile] = useState({ rollNo: null, role: null, grades: [] })
    const [loading, setLoading] = useState(true)

    async function signup(email, password, name, rollNo) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update Firebase Auth profile (displayName only)
        await updateProfile(user, { displayName: name })

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name,
            email,
            rollNo,
            role: 'student',
            createdAt: new Date().toISOString(),
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

        // Update Firebase Auth profile (displayName, photoURL)
        if (data.displayName || data.photoURL) {
            await updateProfile(user, {
                displayName: data.displayName,
                photoURL: data.photoURL,
            })
            // Force a re-render with the updated user object
            setCurrentUser({ ...user })
        }

        // Update Firestore document (rollNo, etc.)
        if (data.rollNo !== undefined) {
            await setDoc(doc(db, 'users', user.uid), { rollNo: data.rollNo }, { merge: true })
            setUserProfile(prev => ({ ...prev, rollNo: data.rollNo }))
        }
    }

    function updateUserEmail(email) {
        return updateEmail(auth.currentUser, email)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)

            if (user) {
                // Fetch Firestore-specific fields into dedicated state
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid))
                    if (userDoc.exists()) {
                        const data = userDoc.data()
                        setUserProfile({
                            rollNo: data.rollNo ?? null,
                            role: data.role ?? 'student',
                            grades: data.grades ?? [],
                        })
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err)
                }
            } else {
                setUserProfile({ rollNo: null, role: null, grades: [] })
            }

            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        userProfile,
        signup,
        login,
        logout,
        updateUserProfile,
        updateUserEmail,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
