import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { scrapeStudentGrades } from '../../services/gradeScraperService'
import './Auth.css'

function SignupPage() {
    const [name, setName] = useState('')
    const [rollNo, setRollNo] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signup } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()

        if (!agreedToTerms) {
            return setError('You must agree to the Terms of Service to create an account.')
        }

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        try {
            setError('')
            setLoading(true)
            await signup(email, password, name, rollNo)

            // Fire-and-forget: account creation should succeed even if scraping fails.
            if (rollNo?.trim()) {
                const rollNoUpper = rollNo.trim().toUpperCase()
                scrapeStudentGrades(rollNoUpper, rollNoUpper, 1)
                    .then(async (sem1Data) => {
                        if (sem1Data) {
                            // Map the data to Semester 1 key for exactly the structure Firestore expects
                            const firestorePayload = {
                                "1": sem1Data
                            }
                            await setDoc(doc(db, 'grades', rollNoUpper), firestorePayload)
                            console.log('[Signup] Semester 1 grades scraped and saved to live Firestore database.')
                        }
                    })
                    .catch((err) => {
                        console.warn('[Signup] Auto grade scrape/sync failed:', err)
                    })
            }

            navigate('/')
        } catch (err) {
            console.error('Signup error:', err)
            const code = err.code || ''
            if (code === 'auth/email-already-in-use') {
                setError('This email is already registered. Try logging in.')
            } else if (code === 'auth/weak-password') {
                setError('Password must be at least 6 characters.')
            } else if (code === 'auth/invalid-email') {
                setError('Please enter a valid email address.')
            } else {
                setError(err.message || 'Failed to create an account.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card card">
                <h2 className="auth-title">Create Account 🚀</h2>
                <p className="auth-subtitle">Join StudyHub and organize your life</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rollNo">Roll Number</label>
                        <input
                            type="text"
                            id="rollNo"
                            value={rollNo}
                            onChange={(e) => setRollNo(e.target.value)}
                            required
                            placeholder="Enter your roll number"
                        />
                    </div>

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
                            placeholder="Create a password"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirm-password">Confirm Password</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>

                    <div className="form-group checkbox-group" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '12px', marginTop: '8px' }}>
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            style={{ marginTop: '4px', width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                        />
                        <label htmlFor="terms" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500', lineHeight: 1.4 }}>
                            I agree to the Terms of Service and Privacy Policy. I explicitly consent to allowing Student Hub to connect to the initial eAkadamik portal on my behalf to securely sync my academic grades and attendance.
                        </label>
                    </div>

                    <button disabled={loading || !agreedToTerms} className="btn btn-primary btn-full" type="submit" style={{ marginTop: '12px' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
