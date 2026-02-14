import { useState } from 'react'
import './SchedulePage.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DATES = [12, 13, 14, 15, 16, 17]

const CLASSES = [
    {
        id: 1,
        subject: 'Calculus',
        topic: 'Calculus II: Integrals',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 301',
        tag: 'Calculus',
        tagColor: '#f59e0b',
        professor: 'Pud Moondah',
    },
    {
        id: 2,
        subject: 'Physics',
        topic: 'Physics',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 301',
        tag: 'Instraton',
        tagColor: '#10b981',
        professor: 'Avaldan',
    },
    {
        id: 3,
        subject: 'Biology',
        topic: 'Calculus II: Integrals',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 301',
        tag: 'Physics',
        tagColor: '#6366f1',
        professor: 'Pud Moondah',
    },
    {
        id: 4,
        subject: 'Biology',
        topic: 'Physics',
        time: '10:00 AM - 11:30 AM',
        room: 'Room 301',
        tag: 'Oncology',
        tagColor: '#3b82f6',
        professor: 'Aut Ito Mouttfaln',
    },
]

function SchedulePage() {
    const [selectedDay, setSelectedDay] = useState(0)

    return (
        <div className="page schedule-page">
            {/* Header */}
            <header className="schedule-header">
                <h1>University Schedule</h1>
            </header>

            {/* Date Picker */}
            <div className="date-picker-container">
                <button className="date-label-btn">
                    Saturday - 13
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                <div className="day-selector">
                    {DAYS.map((day, index) => (
                        <button
                            key={day}
                            className={`day-btn ${selectedDay === index ? 'active' : ''}`}
                            onClick={() => setSelectedDay(index)}
                        >
                            {selectedDay === index ? (
                                <span className="day-name-full">{day === 'Mon' ? 'Monday' : day === 'Tue' ? 'Tuesday' : day === 'Wed' ? 'Wednesday' : day === 'Thu' ? 'Thursday' : day === 'Fri' ? 'Friday' : 'Saturday'}</span>
                            ) : (
                                <span className="day-date">{DATES[index]}</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Classes Section */}
            <div className="classes-section">
                <div className="classes-header">
                    <span className="classes-tab active">Classes</span>
                    <span className="classes-time">2:2 PM</span>
                </div>

                {/* Class Cards */}
                <div className="class-cards">
                    {CLASSES.map(cls => (
                        <div key={cls.id} className="class-card card">
                            <div className="class-subject-badge" style={{ background: `${cls.tagColor}20`, color: cls.tagColor }}>
                                {cls.subject}
                            </div>
                            <div className="class-card-body">
                                <div className="class-info">
                                    <p className="class-time">{cls.time}</p>
                                    <h3 className="class-topic">{cls.topic}</h3>
                                    <div className="class-meta">
                                        <span className="class-tag" style={{ background: `${cls.tagColor}18`, color: cls.tagColor }}>
                                            {cls.tag}
                                        </span>
                                        <span className="class-professor">{cls.professor}</span>
                                    </div>
                                </div>
                                <span className="class-room">{cls.room}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
