import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import './SettingsPage.css'

function SettingsPage() {
    const { currentUser, userProfile, logout, updateUserProfile, updateUserEmail } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [name, setName] = useState(currentUser?.displayName || '')
    const [rollNo, setRollNo] = useState(userProfile?.rollNo || '')
    const [email, setEmail] = useState(currentUser?.email || '')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Auto-dismiss the success message after 3 seconds
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(() => setMessage(''), 3000)
        return () => clearTimeout(timer)
    }, [message])

    async function handleSaveProfile(e) {
        e.preventDefault()
        try {
            setSaving(true)
            setError('')
            setMessage('')

            if (name !== currentUser.displayName) {
                await updateUserProfile({ displayName: name })
            }
            if (email !== currentUser.email) {
                await updateUserEmail(email)
            }
            if (rollNo && rollNo !== userProfile?.rollNo) {
                await updateUserProfile({ rollNo })
            }

            setMessage('Profile updated successfully!')
        } catch (err) {
            console.error('Profile update error:', err)
            setError(err.message || 'Failed to update profile.')
        } finally {
            setSaving(false)
        }
    }

    async function handleLogout() {
        await logout()
        navigate('/login')
    }

    const hasChanges =
        name !== (currentUser?.displayName ?? '') ||
        email !== (currentUser?.email ?? '') ||
        rollNo !== (userProfile?.rollNo ?? '')

    return (
        <div className="page settings-page">
            <header className="settings-header">
                <button className="back-btn-settings" onClick={() => navigate('/')} aria-label="Back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <h1>Settings</h1>
            </header>

            {/* Profile Section */}
            <section className="settings-section">
                <h2 className="settings-section-title">Profile</h2>
                <div className="card settings-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                        <div className="profile-info-brief">
                            <span className="profile-name-display">{currentUser?.displayName || 'Student'}</span>
                            <span className="profile-email-display">{currentUser?.email}</span>
                        </div>
                    </div>

                    {message && <div className="settings-success">{message}</div>}
                    {error && <div className="settings-error">{error}</div>}

                    <form onSubmit={handleSaveProfile} className="profile-form">
                        <div className="form-group">
                            <label htmlFor="settings-name">Name</label>
                            <input
                                type="text"
                                id="settings-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="settings-email">Email</label>
                            <input
                                type="email"
                                id="settings-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="settings-rollno">Roll Number</label>
                            <input
                                type="text"
                                id="settings-rollno"
                                value={rollNo}
                                onChange={(e) => setRollNo(e.target.value)}
                                placeholder="Enter your roll number"
                                disabled={!!userProfile?.rollNo}
                                title={userProfile?.rollNo ? 'Contact admin to change roll number' : 'Set your roll number'}
                            />
                        </div>
                        <button
                            className="btn btn-primary btn-full"
                            type="submit"
                            disabled={saving || !hasChanges}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </section>

            {/* Preferences Section */}
            <section className="settings-section">
                <h2 className="settings-section-title">Preferences</h2>
                <div className="card settings-card">
                    <div className="settings-row" onClick={toggleTheme}>
                        <div className="settings-row-left">
                            <span className="settings-row-icon">
                                {isDark ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="5" />
                                        <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                    </svg>
                                )}
                            </span>
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </div>
                        <span className={`theme-toggle-settings ${isDark ? 'active' : ''}`}>
                            <span className="theme-toggle-knob" />
                        </span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="settings-section">
                <h2 className="settings-section-title">About</h2>
                <div className="card settings-card">
                    <div className="about-info">
                        <div className="about-row">
                            <span className="about-label">App</span>
                            <span className="about-value">StudyHub</span>
                        </div>
                        <div className="about-row">
                            <span className="about-label">Version</span>
                            <span className="about-value">1.0.0</span>
                        </div>
                        <div className="about-row">
                            <span className="about-label">Built by</span>
                            <span className="about-value">Team Arch</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Logout */}
            <section className="settings-section">
                <button className="btn btn-danger btn-full" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                </button>
            </section>
        </div>
    )
}

export default SettingsPage
