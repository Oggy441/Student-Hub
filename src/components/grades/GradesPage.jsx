import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getLatestSemesterGrades, getAllSemesters, GRADE_COLORS, GRADE_POINTS } from '../../services/gradesDataService'
import './GradesPage.css'

function GradesPage() {
  const { userProfile } = useAuth()
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const rollNo = (userProfile?.rollNo || '').toUpperCase()
  
  const [allSemesters, setAllSemesters] = useState(null)
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rollNo) {
      setLoading(false)
      return
    }
    let cancelled = false
    async function loadGrades() {
      try {
        const data = await getAllSemesters(rollNo)
        if (cancelled) return
        setAllSemesters(data)

        if (data) {
          const keys = Object.keys(data).filter(k => !isNaN(k)).map(Number).sort((a, b) => b - a)
          if (keys.length > 0) {
            setLatest({ semester: keys[0], ...data[String(keys[0])] })
          }
        }
      } catch (err) {
        console.error('Failed to load GradesPage data:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadGrades()
    return () => { cancelled = true }
  }, [rollNo])

  // ── Loading state ──
  if (loading) {
    return (
      <div className="page grades-page">
        <header className="grades-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1>Grades & Analysis</h1>
        </header>
        <section className="gpa-overview card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>Loading academic data...</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Securely fetching from your profile...
          </p>
        </section>
      </div>
    )
  }

  // ── No data state ──
  if (!allSemesters) {
    return (
      <div className="page grades-page grades-animated">
        <header className="grades-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1>Grades & Analysis</h1>
        </header>
        <section className="gpa-overview card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>No Grade Data Available</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Your grades will appear here once they are synced from the eAkadamik portal.
          </p>
        </section>
      </div>
    )
  }

  // ── Build semester list for trend chart ──
  const semesterKeys = Object.keys(allSemesters).map(Number).sort((a, b) => a - b)
  const SEMESTER_DATA = semesterKeys.map(s => ({
    semester: `Sem ${s}`,
    sgpa: allSemesters[String(s)].summary?.sgpa ?? 0,
  }))

  // Use the prepared latest semester's data
  const currentSgpa = latest?.summary?.sgpa ?? 0
  const currentCgpa = latest?.summary?.cgpa ?? 0
  const totalCredits = latest?.summary?.totalCredits ?? 0
  const subjects = latest?.subjects ?? []

  // ── GPA progress ring (max 10 for PU scale) ──
  const MAX_GPA = 10
  const circumference = 2 * Math.PI * 54
  const progress = (currentSgpa / MAX_GPA) * circumference

  // ── Performance trend chart ──
  const chartWidth = 280
  const chartHeight = 100
  const sgpaValues = SEMESTER_DATA.map(d => d.sgpa)
  const minGpa = Math.max(0, Math.min(...sgpaValues) - 0.5)
  const maxGpa = Math.min(10, Math.max(...sgpaValues) + 0.5)
  const range = maxGpa - minGpa || 1

  let trendPoints = ''
  if (SEMESTER_DATA.length > 1) {
    trendPoints = SEMESTER_DATA.map((d, i) => {
      const x = (i / (SEMESTER_DATA.length - 1)) * chartWidth
      const y = chartHeight - ((d.sgpa - minGpa) / range) * chartHeight
      return `${x},${y}`
    }).join(' ')
  } else if (SEMESTER_DATA.length === 1) {
    const y = chartHeight - ((SEMESTER_DATA[0].sgpa - minGpa) / range) * chartHeight
    trendPoints = `${chartWidth / 2},${y}`
  }

  const areaPoints = SEMESTER_DATA.length > 1
    ? `0,${chartHeight} ${trendPoints} ${chartWidth},${chartHeight}`
    : ''

  // Y-axis labels
  const ySteps = 4
  const yLabels = Array.from({ length: ySteps }, (_, i) => {
    return +(minGpa + (range / (ySteps - 1)) * i).toFixed(1)
  }).reverse()

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

      {/* SGPA / CGPA Overview */}
      <section className="gpa-overview card">
        <h3 className="gpa-card-title">GPA Overview</h3>
        <div className="gpa-circle-container">
          <svg className="gpa-circle" width="140" height="140" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#e8eaf0" strokeWidth="8" />
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
            <text x="60" y="38" textAnchor="middle" dominantBaseline="middle" className="gpa-label-text">SGPA</text>
            <text x="60" y="60" textAnchor="middle" dominantBaseline="middle" className="gpa-value-text">{currentSgpa}</text>
            <text x="60" y="82" textAnchor="middle" dominantBaseline="middle" className="gpa-sub-text">Semester {latest?.semester}</text>
          </svg>
        </div>
        <div className="gpa-stats-row">
          <div className="gpa-stat">
            <span className="gpa-stat-label">CGPA</span>
            <span className="gpa-stat-value">{currentCgpa}</span>
          </div>
          <div className="gpa-stat-divider" />
          <div className="gpa-stat">
            <span className="gpa-stat-label">Credits</span>
            <span className="gpa-stat-value">{totalCredits}</span>
          </div>
        </div>
      </section>

      {/* Performance Trend */}
      {SEMESTER_DATA.length > 1 && (
        <section className="home-section">
          <h2 className="section-title">Performance Trend</h2>
          <div className="trend-chart card">
            <svg viewBox={`-30 -10 ${chartWidth + 40} ${chartHeight + 40}`} className="trend-svg">
              {yLabels.map((val) => {
                const y = chartHeight - ((val - minGpa) / range) * chartHeight
                return (
                  <g key={val}>
                    <text x="-8" y={y + 4} textAnchor="end" className="chart-label">{val.toFixed(1)}</text>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#e8eaf0" strokeWidth="0.5" />
                  </g>
                )
              })}
              {areaPoints && <polygon points={areaPoints} fill="url(#trendGradient)" opacity="0.3" />}
              <polyline points={trendPoints} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              {SEMESTER_DATA.map((d, i) => {
                const x = (i / (SEMESTER_DATA.length - 1)) * chartWidth
                const y = chartHeight - ((d.sgpa - minGpa) / range) * chartHeight
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
      )}

      {/* Subject Breakdown */}
      <section style={{ marginBottom: '8px' }}>
        <h2 className="section-title">Subject Breakdown</h2>
        <div className="courses-grid">
          {(() => {
            const groupedSubjects = []
            const subjectMap = new Map()

            subjects.forEach(subj => {
              const normalisedName = subj.subjectName.replace(' (P)', '').trim()
              if (!subjectMap.has(normalisedName)) {
                const newSubjGroup = {
                  name: normalisedName,
                  theory: null,
                  practical: null,
                  totalCredits: 0
                }
                subjectMap.set(normalisedName, newSubjGroup)
                groupedSubjects.push(newSubjGroup)
              }
              const group = subjectMap.get(normalisedName)
              if (subj.type === 'Practical') {
                group.practical = subj
              } else {
                group.theory = subj
              }
              group.totalCredits += subj.earnedCredit
            })

            return groupedSubjects.map((group, idx) => {
              const hasT = !!group.theory
              const hasP = !!group.practical
              
              const codes = []
              if (hasT) codes.push(group.theory.subjectCode)
              if (hasP) codes.push(group.practical.subjectCode)

              return (
                <div key={idx} className="course-card card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="course-card-header">
                    <h4 className="course-name">{group.name}</h4>
                    <div className="course-badges" style={{ display: 'flex', gap: '4px' }}>
                      {hasT && <span className="course-type-badge" style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>T</span>}
                      {hasP && <span className="course-type-badge" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>P</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <p className="course-code" style={{ margin: 0 }}>{codes.join(' / ')}</p>
                    <span className="course-credits" style={{ margin: 0 }}>{group.totalCredits} cr</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative', width: '100%', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '32px', margin: '0 auto' }}>
                      {hasT && (() => {
                        const gp = GRADE_POINTS[group.theory.gradeAwarded] ?? 0
                        const color = GRADE_COLORS[group.theory.gradeAwarded] || '#6b7280'
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {hasT && hasP ? (
                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '4px' }}>TH.</span>
                              ) : (
                                <span style={{ fontSize: '10px', opacity: 0, fontWeight: '600', marginBottom: '4px', userSelect: 'none' }}>TH.</span>
                              )}
                              <span className="course-grade-big" style={{ color: color, lineHeight: '1' }}>
                                {group.theory.gradeAwarded}
                              </span>
                            </div>
                            <div className="bar-group">
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    '--bar-height': `${(gp / 10) * 100}%`,
                                    background: `linear-gradient(180deg, ${color}88, ${color})`,
                                  }}
                                />
                              </div>
                              <span className="bar-label" style={{ marginTop: '2px' }}>GP</span>
                              <span className="bar-value">{gp}</span>
                            </div>
                          </div>
                        )
                      })()}

                      {hasP && (() => {
                        const gp = GRADE_POINTS[group.practical.gradeAwarded] ?? 0
                        const color = GRADE_COLORS[group.practical.gradeAwarded] || '#6b7280'
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              {hasT && hasP ? (
                                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '4px' }}>PR.</span>
                              ) : (
                                <span style={{ fontSize: '10px', opacity: 0, fontWeight: '600', marginBottom: '4px', userSelect: 'none' }}>PR.</span>
                              )}
                              <span className="course-grade-big" style={{ color: color, lineHeight: '1' }}>
                                {group.practical.gradeAwarded}
                              </span>
                            </div>
                            <div className="bar-group">
                              <div className="bar-track">
                                <div
                                  className="bar-fill"
                                  style={{
                                    '--bar-height': `${(gp / 10) * 100}%`,
                                    background: `linear-gradient(180deg, ${color}88, ${color})`,
                                  }}
                                />
                              </div>
                              <span className="bar-label" style={{ marginTop: '2px' }}>GP</span>
                              <span className="bar-value">{gp}</span>
                            </div>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </section>
    </div>
  )
}

export default GradesPage