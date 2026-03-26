/**
 * Save Grades Scraper Tool
 * 
 * Run this from the terminal to scrape a specific student's grades
 * and save them to a JSON file.
 * 
 * Usage:
 *   node server/saveGrades.js <username> <password> [semester]
 * 
 * Example:
 *   node server/saveGrades.js CO25343 mypassword1 1
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeGrades } from './gradeScraper.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node server/saveGrades.js <username> <password> [semester]');
    console.log('Example: node server/saveGrades.js CO25343 mypassword 1');
    process.exit(1);
  }

  const username = args[0];
  const password = args[1];
  const semester = args[2] ? parseInt(args[2]) : 1;

  console.log('═══════════════════════════════════════════');
  console.log(`  Scraping Grades for: ${username} (Sem ${semester})`);
  console.log('═══════════════════════════════════════════\n');

  const startTime = Date.now();
  const result = await scrapeGrades(username, password, semester);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    const { studentInfo, summary } = result.data;
    
    console.log(`\n  ✅ Scraped successfully in ${elapsed}s`);
    console.log(`     SGPA: ${summary.sgpa} | CGPA: ${summary.cgpa}`);
    console.log(`     Name: ${studentInfo.studentName || 'Unknown'}\n`);

    // Create a data directory if it doesn't exist
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    // Save mapping to a JSON file
    const filename = `grades_${username}_sem${semester}.json`;
    const filepath = path.join(dataDir, filename);

    // Write file
    fs.writeFileSync(filepath, JSON.stringify(result.data, null, 2));
    
    console.log(`  💾 Saved full details to:`);
    console.log(`     -> data/${filename}\n`);
    
  } else {
    console.log(`\n  ❌ Scraping failed in ${elapsed}s`);
    console.log(`     Error: ${result.error}\n`);
  }
}

run().catch(console.error);
