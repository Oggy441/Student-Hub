import { useState, useEffect } from 'react'
import './GradesPage.css'

const SEMESTER_DATA = [
  { semester: 'Semester 1', gpa: 3.68 },
  { semester: 'Semester 2', gpa: 3.80 },
  { semester: 'Semester 3', gpa: 3.88 },
]

const COURSES = [
  {
    name: 'Calculus',
    grade: 'A',
    breakdown: [
      { label: 'Quizzes', value: 90 },
      { label: 'Midterm', value: 85 },
      { label: 'Final', value: 92 },
    ],
    color: '#f59e0b',
  },
  {
    name: 'Physics',
    grade: 'B+',
    breakdown: [
      { label: 'Quizzes', value: 90 },
      { label: 'Midterm', value: 85 },
      { label: 'Final', value: 92 },
    ],
    color: '#10b981',
  },
  {
    name: 'History',
    grade: 'B+',
    breakdown: [
      { label: 'Quizzes', value: 78 },
      { label: 'Midterm', value: 82 },
      { label: 'Final', value: 88 },
    ],
    color: '#ef4444',
  },
  {
    name: 'Comp Sci',
    grade: 'A',
    breakdown: [
      { label: 'Quizzes', value: 95 },
      { label: 'Midterm', value: 92 },
      { label: 'Final', value: 96 },
    ],
    color: '#3b82f6',
  },
]

function GradesPage() {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const currentGpa = SEMESTER_DATA[SEMESTER_DATA.length - 1].gpa
  const prevGpa = SEMESTER_DATA[SEMESTER_DATA.length - 2].gpa
  const gpaDiff = (currentGpa - prevGpa).toFixed(1)

  // Calculate the SVG circle progress
  const circumference = 2 * Math.PI * 54 // radius = 54
  const progress = (currentGpa / 4.0) * circumference

  // Performance trend chart points
  const chartWidth = 280
  const chartHeight = 100
  const minGpa = 3.6
  const maxGpa = 4.0
  const range = maxGpa - minGpa

  const trendPoints = SEMESTER_DATA.map((d, i) => {
    const x = (i / (SEMESTER_DATA.length - 1)) * chartWidth
    const y = chartHeight - ((d.gpa - minGpa) / range) * chartHeight
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${chartHeight} ${trendPoints} ${chartWidth},${chartHeight}`

  return (
    <div className={`page grades-page ${animated ? 'grades-animated' : ''}`}>
      {/* Header */}
      <header className="grades-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1>Grades & Analysis</h1>
      </header>

      {/* GPA Overview Card */}
      <section className="gpa-overview card">
        <h3 className="gpa-card-title">GPA Overview</h3>
        <div className="gpa-circle-container">
          <svg className="gpa-circle" width="140" height="140" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e8eaf0" strokeWidth="8" />
            {/* Progress circle */}
            <circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              transform="rotate(-90 60 60)"
              className="gpa-progress"
              style={{ '--target-offset': circumference - progress }}
            />
            <text x="60" y="50" textAnchor="middle" className="gpa-label-text">GPA</text>
            <text x="60" y="72" textAnchor="middle" className="gpa-value-text">{currentGpa}</text>
            <text x="60" y="90" textAnchor="middle" className="gpa-sub-text">Semester GPA</text>
          </svg>
        </div>
        <div className="gpa-change">
          <span className="gpa-change-icon">↗</span>
          <span>+{gpaDiff} from last sem</span>
        </div>
      </section>

      {/* Performance Trend */}
      <section className="home-section">
        <h2 className="section-title">Performance Trend</h2>
        <div className="trend-chart card">
          <svg viewBox={`-30 -10 ${chartWidth + 40} ${chartHeight + 40}`} className="trend-svg">
            {/* Y-axis labels */}
            {[3.90, 3.80, 3.70, 3.6].map((val) => {
              const y = chartHeight - ((val - minGpa) / range) * chartHeight
              return (
                <g key={val}>
                  <text x="-8" y={y + 4} textAnchor="end" className="chart-label">{val.toFixed(1) === '3.60' ? '3.6A' : val.toFixed(2)}</text>
                  <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e8eaf0" strokeWidth="0.5" />
                </g>
              )
            })}
            {/* Area fill */}
            <polygon points={areaPoints} fill="url(#trendGradient)" opacity="0.3" />
            {/* Line */}
            <polyline points={trendPoints} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Data points */}
            {SEMESTER_DATA.map((d, i) => {
              const x = (i / (SEMESTER_DATA.length - 1)) * chartWidth
              const y = chartHeight - ((d.gpa - minGpa) / range) * chartHeight
              return (
                <g key={d.semester}>
                  <circle cx={x} cy={y} r="5" fill="white" stroke="var(--primary)" strokeWidth="2.5" />
                  <text x={x} y={chartHeight + 20} textAnchor="middle" className="chart-label">{d.semester}</text>
                </g>
              )
            })}
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* Course Breakdown */}
      <section className="home-section">
        <h2 className="section-title">Course Breakdown</h2>
        <div className="courses-grid">
          {COURSES.map(course => (
            <div key={course.name} className="course-card card">
              <div className="course-card-header">
                <h4 className="course-name">{course.name}</h4>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
              <p className="course-final-grade">Final grade: <strong>{course.grade}</strong></p>
              <div className="course-bars">
                {course.breakdown.map(item => (
                  <div key={item.label} className="bar-group">
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{
                          '--bar-height': `${item.value}%`,
                          background: `linear-gradient(180deg, var(--primary-light), var(--primary))`,
                        }}
                      />
                    </div>
                    <span className="bar-label">{item.label}</span>
                    <span className="bar-value">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default GradesPage