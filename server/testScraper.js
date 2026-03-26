/**
 * Test script for Grade Scraper
 * 
 * Run: node server/testScraper.js
 * 
 * Tests scraping grades for CO25343, Semester 1
 */

import { scrapeGrades } from './gradeScraper.js';

async function runTest() {
  console.log('═══════════════════════════════════════════');
  console.log('  eAkadamik Grade Scraper - Test Run');
  console.log('═══════════════════════════════════════════\n');

  const username = 'CO25343';
  const password = 'CO25343';
  const semester = 1;

  console.log(`  Username:  ${username}`);
  console.log(`  Semester:  ${semester}`);
  console.log('');

  const startTime = Date.now();
  const result = await scrapeGrades(username, password, semester);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n  ⏱  Completed in ${elapsed}s\n`);

  if (result.success) {
    const { studentInfo, subjects, summary } = result.data;

    console.log('  ✅ SCRAPING SUCCESSFUL\n');
    
    // Student Info
    console.log('  ── Student Info ──');
    for (const [key, value] of Object.entries(studentInfo)) {
      console.log(`     ${key}: ${value}`);
    }

    // Subjects
    console.log('\n  ── Subjects ──');
    console.log('  ┌──────────────────────────────────┬────────────┬───────────┬───────┬─────────┐');
    console.log('  │ Subject Name                     │ Code       │ Type      │ Grade │ Credits │');
    console.log('  ├──────────────────────────────────┼────────────┼───────────┼───────┼─────────┤');
    
    for (const subject of subjects) {
      const name = subject.subjectName.padEnd(32).slice(0, 32);
      const code = subject.subjectCode.padEnd(10).slice(0, 10);
      const type = subject.type.padEnd(9).slice(0, 9);
      const grade = subject.gradeAwarded.padEnd(5).slice(0, 5);
      const credits = String(subject.earnedCredit).padEnd(7);
      console.log(`  │ ${name} │ ${code} │ ${type} │ ${grade} │ ${credits} │`);
    }
    
    console.log('  └──────────────────────────────────┴────────────┴───────────┴───────┴─────────┘');

    // Summary
    console.log('\n  ── Summary ──');
    console.log(`     SGPA:           ${summary.sgpa}`);
    console.log(`     CGPA:           ${summary.cgpa}`);
    console.log(`     Total Credits:  ${summary.totalCredits}`);
    
  } else {
    console.log('  ❌ SCRAPING FAILED');
    console.log(`     Error: ${result.error}`);
  }

  console.log('\n═══════════════════════════════════════════\n');
}

runTest().catch(console.error);
