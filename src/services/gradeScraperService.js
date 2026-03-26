/**
 * Grade Scraper Service
 * 
 * Frontend service that communicates with the Grade Scraper API server.
 * Used by the GradesPage component to fetch real student grade data
 * from the eAkadamik portal.
 */

const SCRAPER_API_BASE = 'http://localhost:3001';

/**
 * Grade point mapping for GPA calculations on the frontend
 */
export const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8.5, 'B+': 7, 'B': 6,
  'C+': 5, 'C': 4, 'D': 3, 'F': 0, 'Ab': 0,
};

/**
 * Grade color mapping for UI display
 */
export const GRADE_COLORS = {
  'O': '#8b5cf6',   // Purple - Outstanding
  'A+': '#10b981',  // Emerald
  'A': '#22c55e',   // Green
  'B+': '#3b82f6',  // Blue
  'B': '#06b6d4',   // Cyan
  'C+': '#f59e0b',  // Amber
  'C': '#f97316',   // Orange
  'D': '#ef4444',   // Red
  'F': '#dc2626',   // Dark Red
  'Ab': '#6b7280',  // Gray
};

/**
 * Scrapes grades for a single semester
 * 
 * @param {string} username - Student roll number
 * @param {string} password - Student password
 * @param {number} semester - Semester number
 * @returns {Promise<Object>} Grade data
 */
export async function scrapeStudentGrades(username, password, semester = 1) {
  try {
    const response = await fetch(`${SCRAPER_API_BASE}/api/scrape-grades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, semester }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to scrape grades');
    }

    return data.data;
  } catch (error) {
    console.error('[GradeService] Error scraping grades:', error);
    throw error;
  }
}

/**
 * Scrapes grades for all available semesters
 * 
 * @param {string} username - Student roll number
 * @param {string} password - Student password
 * @returns {Promise<Array>} Array of semester grade data
 */
export async function scrapeAllSemesters(username, password) {
  try {
    const response = await fetch(`${SCRAPER_API_BASE}/api/scrape-all-semesters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to scrape grades');
    }

    return data.data;
  } catch (error) {
    console.error('[GradeService] Error scraping all semesters:', error);
    throw error;
  }
}

/**
 * Checks if the scraper API server is running
 * @returns {Promise<boolean>}
 */
export async function isScraperAvailable() {
  try {
    const response = await fetch(`${SCRAPER_API_BASE}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    const data = await response.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

/**
 * Transforms scraped data into the format expected by GradesPage component
 * 
 * @param {Object} scrapedData - Raw scraped data from API
 * @returns {Object} Formatted data for GradesPage
 */
export function formatGradesForDisplay(scrapedData) {
  const { studentInfo, subjects, summary } = scrapedData;

  // Transform subjects into course cards format
  const courses = subjects.map(subject => ({
    name: subject.subjectName,
    code: subject.subjectCode,
    type: subject.type,
    grade: subject.gradeAwarded,
    credits: subject.earnedCredit,
    gradePoints: GRADE_POINTS[subject.gradeAwarded] || 0,
    color: GRADE_COLORS[subject.gradeAwarded] || '#6b7280',
  }));

  return {
    studentInfo,
    courses,
    sgpa: summary.sgpa,
    cgpa: summary.cgpa,
    totalCredits: summary.totalCredits,
  };
}

export default {
  scrapeStudentGrades,
  scrapeAllSemesters,
  isScraperAvailable,
  formatGradesForDisplay,
  GRADE_POINTS,
  GRADE_COLORS,
};
