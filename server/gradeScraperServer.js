/**
 * Grade Scraper API Server
 * 
 * Express server that exposes the eAkadamik grade scraper as a REST API.
 * Used by the Student Hub frontend to fetch real grade data.
 * 
 * Endpoints:
 *   POST /api/scrape-grades  - Scrape grades for a student
 *   GET  /api/health         - Health check
 */

import express from 'express';
import cors from 'cors';
import { scrapeGrades } from './gradeScraper.js';

const app = express();
const PORT = process.env.SCRAPER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'grade-scraper',
    timestamp: new Date().toISOString() 
  });
});

/**
 * POST /api/scrape-grades
 * 
 * Body: {
 *   username: string   - Student roll number (e.g., 'CO25343')
 *   password: string   - Student password
 *   semester: number   - Semester number (1, 2, 3, etc.)
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     studentInfo: { department, rollNo, course, batch, studentName, ... },
 *     subjects: [{ subjectName, subjectCode, type, gradeAwarded, earnedCredit }],
 *     summary: { sgpa, cgpa, totalCredits }
 *   },
 *   timestamp: string
 * }
 */
app.post('/api/scrape-grades', async (req, res) => {
  const { username, password, semester } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required',
    });
  }

  const semesterNum = parseInt(semester) || 1;

  console.log(`[API] Scraping grades for: ${username}, Semester: ${semesterNum}`);

  try {
    const result = await scrapeGrades(username, password, semesterNum);
    
    if (result.success) {
      console.log(`[API] Successfully scraped ${result.data.subjects.length} subjects`);
      res.json(result);
    } else {
      console.log(`[API] Scraping failed: ${result.error}`);
      res.status(500).json(result);
    }
  } catch (error) {
    console.error(`[API] Unexpected error: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/scrape-all-semesters
 * 
 * Scrapes grades for all available semesters
 * 
 * Body: {
 *   username: string,
 *   password: string,
 *   maxSemesters: number (default: 8)
 * }
 */
app.post('/api/scrape-all-semesters', async (req, res) => {
  const { username, password, maxSemesters = 8 } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Username and password are required',
    });
  }

  console.log(`[API] Scraping all semesters for: ${username}`);

  const results = [];

  for (let sem = 1; sem <= maxSemesters; sem++) {
    console.log(`[API] Scraping semester ${sem}...`);
    const result = await scrapeGrades(username, password, sem);
    
    if (result.success && result.data.subjects.length > 0) {
      results.push({
        semester: sem,
        ...result.data,
      });
    } else {
      // No more semesters available
      console.log(`[API] No data for semester ${sem}, stopping.`);
      break;
    }
  }

  res.json({
    success: true,
    data: results,
    totalSemesters: results.length,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🎓 Grade Scraper API Server running at http://localhost:${PORT}`);
  console.log(`   POST /api/scrape-grades       - Scrape single semester`);
  console.log(`   POST /api/scrape-all-semesters - Scrape all semesters`);
  console.log(`   GET  /api/health              - Health check\n`);
});
