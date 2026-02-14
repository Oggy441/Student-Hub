import { useState, useMemo } from 'react'
import './SchedulePage.css'

const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

const SUBJECT_COLORS = {
    'AC': '#3b82f6',
    'DET': '#8b5cf6',
    'BEEE': '#f59e0b',
    'OOPS': '#10b981',
    'EG': '#6366f1',
    'BEEE Lab': '#f59e0b',
    'OOPS Lab': '#10b981',
    'AC Lab': '#3b82f6',
    'EG Lab': '#6366f1',
}

// group: null = all groups (lectures), 1/2/3 = specific group lab
const SCHEDULE = {
    0: [ // Monday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '10:30 AM - 12:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 2 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '10:30 AM - 12:30 PM', room: 'CL1', professor: '', type: 'P', group: 3 },
        { subject: 'AC Lab', topic: 'AC Lab', time: '10:30 AM - 12:30 PM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 1 },
        { subject: 'DET', topic: 'Differential Eq. & Transforms', time: '3:30 - 5:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'L', group: null },
    ],
    1: [ // Tuesday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'DET', topic: 'Differential Eq. & Transforms', time: '10:30 AM - 12:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '12:30 - 1:30 PM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'EG Lab', topic: 'EG Lab', time: '2:30 - 4:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 2 },
    ],
    2: [ // Wednesday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '10:30 - 11:30 AM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'EG', topic: 'Engineering Graphics', time: '11:30 AM - 12:30 PM', room: 'Room L-3', professor: 'Mr. Harsh Dassal', type: 'L', group: null },
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '1:30 - 2:30 PM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'DET', topic: 'DET Tutorial', time: '2:30 - 3:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'T', group: null },
        { subject: 'AC Lab', topic: 'AC Lab', time: '3:30 - 5:30 PM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 3 },
    ],
    3: [ // Thursday
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'AC', topic: 'Applied Chemistry', time: '10:30 - 11:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '11:30 AM - 12:30 PM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '12:30 - 1:30 PM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'EG Lab', topic: 'EG Lab', time: '2:30 - 4:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 1 },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '3:30 - 5:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 1 },
    ],
    4: [ // Friday
        { subject: 'AC Lab', topic: 'AC Lab', time: '9:30 - 11:30 AM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 2 },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '10:30 AM - 12:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 3 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '12:30 - 2:30 PM', room: 'CL1', professor: '', type: 'P', group: 1 },
        { subject: 'EG Lab', topic: 'EG Lab', time: '3:30 - 5:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 3 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '3:30 - 5:30 PM', room: 'CL1', professor: '', type: 'P', group: 2 },
    ],
}

function getVisibleDays() {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    while (yesterday.getDay() === 0 || yesterday.getDay() === 6) {
        yesterday.setDate(yesterday.getDate() - 1)
    }
    const days = []
    const cursor = new Date(yesterday)
    while (days.length < 5) {
        if (cursor.getDay() >= 1 && cursor.getDay() <= 5) {
            days.push({
                date: new Date(cursor),
                scheduleIndex: cursor.getDay() - 1,
            })
        }
        cursor.setDate(cursor.getDate() + 1)
    }
    return days
}

function formatDateFull(date) {
    return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function SchedulePage() {
    const visibleDays = useMemo(() => getVisibleDays(), [])
    const [selectedGroup, setSelectedGroup] = useState(1)
    const [groupOpen, setGroupOpen] = useState(false)

    const [selectedTab, setSelectedTab] = useState(() => {
        const now = new Date()
        now.setHours(0, 0, 0, 0)
        const todayIdx = visibleDays.findIndex(
            d => d.date.toDateString() === now.toDateString()
        )
        return todayIdx >= 0 ? todayIdx : 1
    })

    const currentDay = visibleDays[selectedTab]
    const isToday = currentDay.date.toDateString() === new Date().toDateString()

    // Filter: show lectures (group=null) + only selected group's labs
    const filteredClasses = (SCHEDULE[currentDay.scheduleIndex] || []).filter(
        cls => cls.group === null || cls.group === selectedGroup
    )

    return (
        <div className="page schedule-page">
            <header className="schedule-header">
                <h1>📅 Schedule</h1>
                <span className="schedule-sem-badge">CSE · Sem 2</span>
            </header>

            {/* Day Selector */}
            <div className="date-picker-container">
                <div className="day-selector">
                    {visibleDays.map((day, index) => {
                        const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0))
                        return (
                            <button
                                key={index}
                                className={`day-btn ${selectedTab === index ? 'active' : ''} ${isPast ? 'past' : ''}`}
                                onClick={() => setSelectedTab(index)}
                            >
                                <span className="day-name-short">{DAY_SHORT[day.scheduleIndex]}</span>
                                <span className="day-date">{day.date.getDate()}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            <p className="day-full-label">
                {isToday ? '📍 Today · ' : ''}{formatDateFull(currentDay.date)}
            </p>

            {/* Classes Header with Group Dropdown */}
            <div className="classes-section">
                <div className="classes-header">
                    <span className="classes-tab active">
                        {filteredClasses.length} Classes
                    </span>
                    <div className="group-selector-wrapper">
                        <button
                            className="group-selector-btn"
                            onClick={() => setGroupOpen(!groupOpen)}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Group {selectedGroup}
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

                {/* Class Cards */}
                <div className="class-cards">
                    {filteredClasses.map((cls, i) => {
                        const color = SUBJECT_COLORS[cls.subject] || '#6b7280'
                        return (
                            <div key={i} className="class-card card">
                                <div className="class-card-left" style={{ background: color }} />
                                <div className="class-card-body">
                                    <div className="class-card-top">
                                        <div className="class-subject-badge" style={{ background: `${color}18`, color }}>
                                            {cls.subject}
                                        </div>
                                        <span className={`class-type-badge type-${cls.type}`}>
                                            {cls.type === 'L' ? 'Lecture' : cls.type === 'P' ? 'Practical' : 'Tutorial'}
                                        </span>
                                    </div>
                                    <div className="class-info">
                                        <h3 className="class-topic">{cls.topic}</h3>
                                        <p className="class-time">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            {cls.time}
                                        </p>
                                        <div className="class-meta">
                                            <span className="class-room">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                                    <circle cx="12" cy="10" r="3" />
                                                </svg>
                                                {cls.room}
                                            </span>
                                            {cls.professor && (
                                                <span className="class-professor">{cls.professor}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
