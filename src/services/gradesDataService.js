/**
 * Grades Data Service
 *
 * Loads scraped grade JSON files from the /data folder (imported at build time)
 * and provides helpers to look up a student's grades by roll number.
 *
 * How it works:
 *   • At build-time Vite's import.meta.glob eagerly loads every
 *     data/grades_*_sem*.json file as a JS module.
 *   • We index them by roll number + semester so any component can
 *     call  getGradesByRollNo('CO25343')  and instantly receive the data.
 */

import { doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'

// ── Eagerly import every scraped JSON at build time as fallback ──
const gradeModules = import.meta.glob('/data/grades_*_sem*.json', { eager: true })
const localGradesIndex = {}

for (const [filepath, mod] of Object.entries(gradeModules)) {
  const match = filepath.match(/grades_(.+)_sem(\d+)\.json$/)
  if (!match) continue

  const rollNo = match[1].toUpperCase()
  const semester = match[2]
  const data = mod.default ?? mod

  if (!localGradesIndex[rollNo]) localGradesIndex[rollNo] = {}
  localGradesIndex[rollNo][semester] = data
}

// ── Grade-point mapping (PU grading scheme) ──
export const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8.5, 'B+': 7, 'B': 6,
  'C+': 5, 'C': 4, 'D': 3, 'F': 0, 'Ab': 0,
}

// ── Grade colour mapping for UI ──
export const GRADE_COLORS = {
  'O': '#8b5cf6',
  'A+': '#10b981',
  'A': '#22c55e',
  'B+': '#3b82f6',
  'B': '#06b6d4',
  'C+': '#f59e0b',
  'C': '#f97316',
  'D': '#ef4444',
  'F': '#dc2626',
  'Ab': '#6b7280',
}

/**
 * Get all available semester data for a roll number from Firestore database first, 
 * with a fallback to the statically imported local files.
 * @param {string} rollNo
 * @returns {Promise<Object|null>}  keyed by semester string, e.g. { '1': { studentInfo, subjects, summary } }
 */
export async function getAllSemesters(rollNo) {
  if (!rollNo) return null
  const upperRoll = rollNo.toUpperCase()

  try {
    const snap = await getDoc(doc(db, 'grades', upperRoll))
    if (snap.exists()) {
      return snap.data()
    }
  } catch (err) {
    console.warn('[GradeService] Firestore fetch failed or denied, trying local fallback:', err)
  }

  // Fallback if not found in Firestore
  return localGradesIndex[upperRoll] ?? null
}

/**
 * Get grade data for a specific semester.
 * @returns {Promise<{ studentInfo, subjects, summary } | null>}
 */
export async function getSemesterGrades(rollNo, semester = 1) {
  const semesters = await getAllSemesters(rollNo)
  return semesters?.[String(semester)] ?? null
}

/**
 * Get the latest (highest numbered) semester data available.
 */
export async function getLatestSemesterGrades(rollNo) {
  const semesters = await getAllSemesters(rollNo)
  if (!semesters) return null
  
  const keys = Object.keys(semesters).filter(k => !isNaN(k)).map(Number).sort((a, b) => b - a)
  if (keys.length === 0) return null
  return { semester: keys[0], ...semesters[String(keys[0])] }
}

/**
 * Returns a simple array suitable for the "Current Grades" strip on HomePage.
 * Each entry: { subject, full, grade }
 */
export async function getHomeGradeCards(rollNo, semester = 1) {
  const data = await getSemesterGrades(rollNo, semester)
  if (!data) return []

  return data.subjects.map(s => {
    // Abbreviate long names for the compact card
    const abbr = s.subjectName
      .replace('Professional Communication', 'Pro Comm')
      .replace('Programming Fundamentals', 'Prog Fund')
      .replace('Quantum Physics', 'Quantum')
      .replace('Universal Human Values-II', 'UHV-II')
      .replace('Workshop', 'Workshop')
      .replace(' (P)', ' (P)')

    return {
      subject: abbr.length > 16 ? abbr.slice(0, 14) + '…' : abbr,
      full: s.subjectName,
      grade: s.gradeAwarded,
      code: s.subjectCode,
      type: s.type,
      credits: s.earnedCredit,
    }
  })
}

/**
 * Check if we have any grade data at all for a roll number.
 */
export async function hasGradeData(rollNo) {
  const data = await getAllSemesters(rollNo)
  return !!data
}
