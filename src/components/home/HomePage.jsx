import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { useAuth } from '../../context/AuthContext'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { getUpcomingClasses, SUBJECT_COLORS } from '../../data/scheduleData'
import { syncScheduleWithWidget } from '../../utils/widgetSync'
import { getHomeGradeCards } from '../../services/gradesDataService'
import DailyQuote from './DailyQuote'
import './HomePage.css'

// Pure function — defined at module scope so it's never re-created
function getGradeColor(grade) {
    const letter = grade.charAt(0).toUpperCase()
    if (letter === 'A') return '#10b981' // green
    if (letter === 'B') return '#6366f1' // indigo
    if (letter === 'C') return '#f59e0b' // amber
    return '#ef4444'                     // red for D / F
}

function getDisplayTitle(cls) {
    if (cls.subject === 'DET') return 'DET'
    return cls.topic
}

// Grades are now loaded from scraped JSON files in /data via gradesDataService

function HomePage() {
    const { isDark, toggleTheme } = useTheme()
    const { currentUser, userProfile, logout } = useAuth()
    const navigate = useNavigate()

    const [showDropdown, setShowDropdown] = useState(false)
    const [quickNotes, setQuickNotes] = useState([])
    const [loadingNotes, setLoadingNotes] = useState(true)
    const [newNote, setNewNote] = useState('')
    const [selectedGroup, setSelectedGroup] = useState(() => {
        const saved = localStorage.getItem('selectedGroup')
        return saved ? parseInt(saved, 10) : 1
    })
    const [groupOpen, setGroupOpen] = useState(false)

    const dropdownRef = useRef(null)
    const groupRef = useRef(null)

    const [greeting] = useState(() => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    })

    const displayName =
        currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'


    // Sync schedule with Android widget whenever the group changes
    useEffect(() => {
        if (currentUser) {
            syncScheduleWithWidget(selectedGroup)
            localStorage.setItem('selectedGroup', selectedGroup.toString())
        }
    }, [currentUser, selectedGroup])

    // Load quick notes from Firestore
    useEffect(() => {
        if (!currentUser) return
        let cancelled = false
        async function fetchNotes() {
            setLoadingNotes(true)
            try {
                const snap = await getDoc(doc(db, 'quickNotes', currentUser.uid))
                if (!cancelled && snap.exists() && snap.data().notes) {
                    setQuickNotes(snap.data().notes)
                }
            } catch {
                // non-critical — just leave the empty state
            } finally {
                if (!cancelled) setLoadingNotes(false)
            }
        }
        fetchNotes()
        return () => { cancelled = true }
    }, [currentUser])

    // Close user dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Close group dropdown when clicking outside
    useEffect(() => {
        function handleGroupClickOutside(e) {
            if (groupRef.current && !groupRef.current.contains(e.target)) {
                setGroupOpen(false)
            }
        }
        document.addEventListener('mousedown', handleGroupClickOutside)
        return () => document.removeEventListener('mousedown', handleGroupClickOutside)
    }, [])

    // Save notes to Firestore
    async function saveNotes(notes) {
        if (!currentUser) return
        try {
            await setDoc(doc(db, 'quickNotes', currentUser.uid), {
                notes,
                updatedAt: new Date(),
            })
        } catch (err) {
            console.error('Failed to save quick notes:', err)
        }
    }

    function handleAddNote() {
        if (!newNote.trim()) return
        const updated = [...quickNotes, { id: Date.now(), text: newNote.trim() }]
        setQuickNotes(updated)
        setNewNote('')
        saveNotes(updated)
    }

    function handleDeleteNote(id) {
        const updated = quickNotes.filter(n => n.id !== id)
        setQuickNotes(updated)
        saveNotes(updated)
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddNote()
        }
    }

    const userRollNo = (userProfile?.rollNo || '').toUpperCase()

    // Load grades dynamically from Firestore (with local fallback)
    const [grades, setGrades] = useState([])
    
    useEffect(() => {
        if (!userRollNo) return
        let cancelled = false
        async function fetchGrades() {
            try {
                const result = await getHomeGradeCards(userRollNo, 1)
                if (!cancelled && result) {
                    setGrades(result)
                }
            } catch (err) {
                console.error('Failed to load home grades:', err)
            }
        }
        fetchGrades()
        return () => { cancelled = true }
    }, [userRollNo])

    return (
        <div className="page home-page">
            {/* Header */}
            <header className="home-header">
                <div className="home-greeting">
                    <h1>{greeting},<br />{displayName}!</h1>
                </div>
                <div className="home-avatar" ref={dropdownRef}>
                    <button
                        className="avatar-circle"
                        onClick={() => setShowDropdown(prev => !prev)}
                        aria-label="User menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>

                    {showDropdown && (
                        <div className="avatar-dropdown">
                            <div className="dropdown-item" onClick={toggleTheme}>
                                <span className="dropdown-icon">
                                    {isDark ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="5" />
                                            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                                        </svg>
                                    )}
                                </span>
                                <span className="dropdown-label">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                                <span className={`theme-toggle ${isDark ? 'active' : ''}`}>
                                    <span className="theme-toggle-knob" />
                                </span>
                            </div>
                            <div className="dropdown-item" onClick={() => navigate('/settings')}>
                                <span className="dropdown-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                </span>
                                <span className="dropdown-label">Settings</span>
                            </div>
                            <div className="dropdown-divider" />
                            <div
                                className="dropdown-item dropdown-item-danger"
                                onClick={() => { logout(); navigate('/login') }}
                            >
                                <span className="dropdown-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </span>
                                <span className="dropdown-label">Log Out</span>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Daily Quote */}
            <DailyQuote />

            {/* Coming Up */}
            <section className="home-section">
                <div className="section-header-row">
                    <h2 className="section-title">Coming Up</h2>
                    <div className="group-selector-wrapper" ref={groupRef}>
                        <button
                            className="group-selector-btn"
                            onClick={() => setGroupOpen(o => !o)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            G-{selectedGroup}
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`group-chevron ${groupOpen ? 'open' : ''}`}>
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>
                        {groupOpen && (
                            <div className="group-dropdown">
                                {[1, 2, 3].map(g => (
                                    <button
                                        key={g}
                                        className={`group-option ${selectedGroup === g ? 'active' : ''}`}
                                        onClick={() => { setSelectedGroup(g); setGroupOpen(false) }}
                                    >
                                        Group {g}
                                        {selectedGroup === g && (
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="upcoming-scroll">
                    {getUpcomingClasses(selectedGroup, 4).map((cls, i) => (
                        <div key={i} className="upcoming-card">
                            <div className="upcoming-accent" style={{ background: SUBJECT_COLORS[cls.subject] || '#6b7280' }} />
                            <h3 className="upcoming-title">{getDisplayTitle(cls)}</h3>
                            <p className="upcoming-date">{cls.dayLabel}, {cls.time}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Current Grades */}
            {grades.length > 0 && (
                <section className="home-section">
                    <h2 className="section-title">Current Grades</h2>
                    <div className="grades-quick-grid">
                        {grades.map((item, index) => (
                            <div key={index} className="grade-quick-card">
                                <div className="grade-subject">{item.subject}</div>
                                <div className="grade-value" style={{ color: getGradeColor(item.grade) }}>
                                    {item.grade}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Notes */}
            <section className="home-section">
                <h2 className="section-title">Quick Notes</h2>
                <div className="quick-notes-box card">
                    <div className="quick-notes-add">
                        <input
                            type="text"
                            className="quick-notes-input"
                            placeholder="Add a reminder..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="quick-notes-add-btn"
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                            aria-label="Add note"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>

                    {loadingNotes && (
                        <div className="quick-notes-loading">
                            <div className="spinner" />
                            <span>Loading reminders...</span>
                        </div>
                    )}

                    {!loadingNotes && quickNotes.length > 0 && (
                        <div className="quick-notes-list">
                            {quickNotes.map(note => (
                                <div key={note.id} className="quick-note-item">
                                    <span className="quick-note-text">{note.text}</span>
                                    <button
                                        className="quick-note-delete"
                                        onClick={() => handleDeleteNote(note.id)}
                                        aria-label="Delete note"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loadingNotes && quickNotes.length === 0 && (
                        <p className="quick-notes-empty">No reminders yet</p>
                    )}
                </div>
            </section>
        </div>
    )
}

export default HomePage
