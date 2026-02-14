import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    updateEmail
} from 'firebase/auth'
import { auth } from '../services/firebase'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    function signup(email, password, name) {
        return createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Update profile with name
                return updateProfile(userCredential.user, {
                    displayName: name
                })
            })
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        return signOut(auth)
    }

    function updateUserProfile(data) {
        return updateProfile(auth.currentUser, data)
    }

    function updateUserEmail(email) {
        return updateEmail(auth.currentUser, email)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
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
