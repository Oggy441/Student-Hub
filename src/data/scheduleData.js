// Shared schedule data for CSE 2nd Sem (2025-2029 batch) Room L-3

export const SUBJECT_COLORS = {
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

export const SUBJECT_FULL_NAMES = {
    'AC': 'Applied Chemistry',
    'DET': 'Differential Eq. & Transforms',
    'BEEE': 'Basic Electrical & Electronics',
    'OOPS': 'Object Oriented Programming',
    'EG': 'Engineering Graphics',
    'BEEE Lab': 'BEEE Lab',
    'OOPS Lab': 'OOPS Lab',
    'AC Lab': 'AC Lab',
    'EG Lab': 'EG Lab',
}

// group: null = all groups (lectures), 1/2/3 = specific group lab
export const SCHEDULE = {
    0: [ // Monday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '10:30 AM - 1:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 2 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '10:30 AM - 1:30 PM', room: 'CL1', professor: '', type: 'P', group: 3 },
        { subject: 'AC Lab', topic: 'AC Lab', time: '10:30 AM - 1:30 PM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 1 },
        { subject: 'DET', topic: 'Differential Eq. & Transforms', time: '2:30 - 4:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'L', group: null },
    ],
    1: [ // Tuesday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'DET', topic: 'Differential Eq. & Transforms', time: '10:30 AM - 12:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '12:30 - 1:30 PM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'EG Lab', topic: 'EG Lab', time: '2:30 - 5:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 2 },
    ],
    2: [ // Wednesday
        { subject: 'AC', topic: 'Applied Chemistry', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '10:30 - 11:30 AM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'EG', topic: 'Engineering Graphics', time: '11:30 AM - 12:30 PM', room: 'Room L-3', professor: 'Mr. Harsh Dassal', type: 'L', group: null },
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '12:30 - 1:30 PM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'DET', topic: 'DET Tutorial', time: '2:30 - 3:30 PM', room: 'Room L-3', professor: 'Dr. Tejinder Kumar', type: 'T', group: null },
    ],
    3: [ // Thursday
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '9:30 - 10:30 AM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'AC', topic: 'Applied Chemistry', time: '10:30 - 11:30 AM', room: 'Room L-3', professor: 'Ms. Neha', type: 'L', group: null },
        { subject: 'OOPS', topic: 'Object Oriented Programming', time: '11:30 AM - 12:30 PM', room: 'Room L-3', professor: '', type: 'L', group: null },
        { subject: 'BEEE', topic: 'Basic Electrical & Electronics', time: '12:30 - 1:30 PM', room: 'Room L-3', professor: 'Dr. Parvinder Kaur', type: 'L', group: null },
        { subject: 'AC Lab', topic: 'AC Lab', time: '2:30 - 5:30 PM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 3 },
        { subject: 'EG Lab', topic: 'EG Lab', time: '2:30 - 5:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 1 },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '2:30 - 5:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 1 },
    ],
    4: [ // Friday
        { subject: 'AC Lab', topic: 'AC Lab', time: '10:30 AM - 1:30 PM', room: 'Lab No. 104', professor: 'Ms. Neha', type: 'P', group: 2 },
        { subject: 'BEEE Lab', topic: 'BEEE Lab', time: '10:30 AM - 1:30 PM', room: 'Lab No. 105', professor: 'Dr. Parvinder Kaur', type: 'P', group: 3 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '10:30 AM - 1:30 PM', room: 'CL1', professor: '', type: 'P', group: 1 },
        { subject: 'EG Lab', topic: 'EG Lab', time: '2:30 - 5:30 PM', room: 'Lab No. 409', professor: 'Mr. Harsh Dassal', type: 'P', group: 3 },
        { subject: 'OOPS Lab', topic: 'OOPS Lab', time: '2:30 - 5:30 PM', room: 'CL1', professor: '', type: 'P', group: 2 },
    ],
}

/**
 * Get today's classes filtered by group.
 * Returns classes for today (or next weekday if weekend).
 */
export function getTodayClasses(selectedGroup = 1) {
    const now = new Date()
    let dayIndex = now.getDay() // 0=Sun..6=Sat
    // On weekends, show Monday's schedule
    if (dayIndex === 0 || dayIndex === 6) dayIndex = 1
    const scheduleIndex = dayIndex - 1 // 0=Mon..4=Fri
    const allClasses = SCHEDULE[scheduleIndex] || []
    return allClasses.filter(cls => cls.group === null || cls.group === selectedGroup)
}

/**
 * Get upcoming classes: today's remaining + next day's first few.
 * Used by the HomePage "Coming Up" section.
 */
export function getUpcomingClasses(selectedGroup = 1, limit = 4) {
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    let dayIndex = now.getDay()

    // On weekends, show Monday
    if (dayIndex === 0 || dayIndex === 6) {
        const mondayClasses = (SCHEDULE[0] || []).filter(
            cls => cls.group === null || cls.group === selectedGroup
        )
        return mondayClasses.slice(0, limit).map(cls => ({
            ...cls,
            dayLabel: 'Monday',
        }))
    }

    const scheduleIndex = dayIndex - 1
    const todayAll = (SCHEDULE[scheduleIndex] || []).filter(
        cls => cls.group === null || cls.group === selectedGroup
    )

    // Filter out past classes - REMOVED to show full day schedule
    // const upcoming = todayAll.filter(cls => { ... })

    // Return all classes for today
    const result = todayAll.map(cls => ({ ...cls, dayLabel: 'Today' }))

    // REMOVED: Logic to fetch next day's classes to fill the limit.
    // User requested to show ONLY current day's schedule.

    return result.slice(0, limit)
}
