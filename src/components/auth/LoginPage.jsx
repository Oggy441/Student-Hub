import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { scrapeStudentGrades } from '../../services/gradeScraperService'
import './Auth.css'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            const userCredential = await login(email, password)

            // Fire-and-forget: do not block login success on scraper failures.
            const uid = userCredential?.user?.uid
            if (uid) {
                getDoc(doc(db, 'users', uid))
                    .then((snap) => {
                        const rollNo = snap.exists() ? snap.data()?.rollNo : null
                        if (!rollNo) return

                        const rollNoUpper = String(rollNo).trim().toUpperCase()
                        if (!rollNoUpper) return

                        scrapeStudentGrades(rollNoUpper, rollNoUpper, 1)
                            .then(async (sem1Data) => {
                                if (sem1Data) {
                                    const firestorePayload = {
                                        "1": sem1Data
                                    }
                                    await setDoc(doc(db, 'grades', rollNoUpper), firestorePayload)
                                    console.log('[Login] Semester 1 grades scraped and saved to live Firestore database.')
                                }
                            })
                            .catch((err) => {
                                console.warn('[Login] Auto grade scrape/sync failed:', err)
                            })
                    })
                    .catch((err) => {
                        console.warn('[Login] Failed to fetch roll number for auto scrape:', err)
                    })
            }

            navigate('/')
        } catch {
            setError('Failed to log in. Please check your email and password.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <h2 className="auth-title">Welcome Back! 👋</h2>
                <p className="auth-subtitle">Sign in to continue to StudyHub</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>

                    <button disabled={loading} className="btn btn-primary btn-full" type="submit">
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <div className="auth-footer">
                    Need an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
