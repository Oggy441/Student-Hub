/**
 * eAkadamik Grade Scraper
 * 
 * Scrapes student grade data from https://eakadamik.in/ccet/
 * Uses Puppeteer headless browser to simulate the exact UI flow:
 *   1. Login with student credentials (select "Student" role)
 *   2. Click RESULT nav link (uses dynamic secureKey/secureHash URLs)
 *   3. Click "View Result" sidebar link
 *   4. Select semester from #semesterId dropdown
 *   5. Remove target="_blank" from form to keep in same tab
 *   6. Submit via #frm_0 and parse the resulting grades table
 */

import puppeteer from 'puppeteer';

const BASE_URL = 'https://eakadamik.in/ccet/';

/**
 * Scrapes grades for a given student from eAkadamik portal
 */
export async function scrapeGrades(username, password, semester = 1) {
  let browser = null;

  try {
    console.log(`[Scraper] Starting grade scrape for ${username}, Semester ${semester}`);

    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
      timeout: 60000,
    });

    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // ═══════════════════════════════════════
    // Step 1: Navigate to login page
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 1: Navigating to login page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('#pu_username', { timeout: 10000 });

    // ═══════════════════════════════════════
    // Step 2: Fill login credentials
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 2: Filling login form...');
    
    await page.click('#pu_username', { clickCount: 3 });
    await page.type('#pu_username', username, { delay: 30 });
    
    await page.click('#pu_password', { clickCount: 3 });
    await page.type('#pu_password', password, { delay: 30 });

    // Select "Student" role
    await page.evaluate(() => {
      const roleSelect = document.querySelector('#roleId');
      if (roleSelect) {
        const options = Array.from(roleSelect.options);
        const studentOption = options.find(o => 
          o.text.trim().toLowerCase() === 'student'
        );
        if (studentOption) {
          roleSelect.value = studentOption.value;
          roleSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });

    // ═══════════════════════════════════════
    // Step 3: Submit login
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 3: Submitting login...');
    
    await page.click('#signINValidate');
    
    await page.waitForFunction(
      () => window.location.href.includes('/base'),
      { timeout: 30000 }
    );
    await new Promise(r => setTimeout(r, 2000));
    
    console.log(`[Scraper] ✓ Login successful. URL: ${page.url()}`);

    // ═══════════════════════════════════════
    // Step 4: Click RESULT in navigation
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 4: Clicking RESULT nav link...');
    
    const resultHref = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('a');
      for (const link of navLinks) {
        if (link.textContent.trim().toUpperCase() === 'RESULT') {
          return link.href;
        }
      }
      return null;
    });

    if (!resultHref) throw new Error('Could not find RESULT navigation link');

    await page.goto(resultHref, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log(`[Scraper] ✓ On RESULT page`);

    // ═══════════════════════════════════════
    // Step 5: Click "View Result" sidebar button
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 5: Clicking View Result...');
    
    const viewResultHref = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      for (const link of links) {
        const text = link.textContent.trim().toLowerCase();
        if (text === 'view result') {
          return link.href;
        }
      }
      return null;
    });

    if (!viewResultHref) throw new Error('Could not find View Result link');

    await page.goto(viewResultHref, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    
    console.log(`[Scraper] ✓ On View Result form page`);

    // ═══════════════════════════════════════
    // Step 6: Select semester
    // ═══════════════════════════════════════
    console.log(`[Scraper] Step 6: Selecting semester ${semester}...`);
    
    await page.waitForSelector('#semesterId', { timeout: 10000 });
    await page.select('#semesterId', String(semester));
    await new Promise(r => setTimeout(r, 500));
    
    console.log(`[Scraper] ✓ Semester ${semester} selected`);

    // ═══════════════════════════════════════
    // Step 7: Remove target="_blank" and submit form in same tab
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 7: Submitting form...');
    
    // Remove target="_blank" from the form so it submits in the same tab
    await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const form of forms) {
        form.removeAttribute('target');
      }
      // Also remove from any submit button
      const submitBtn = document.querySelector('#frm_0');
      if (submitBtn) {
        submitBtn.removeAttribute('formtarget');
      }
    });

    // Submit the form and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('#frm_0'),
    ]);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const gradesUrl = page.url();
    console.log(`[Scraper] ✓ Form submitted. URL: ${gradesUrl}`);

    // ═══════════════════════════════════════
    // Step 8: Parse the grades table
    // ═══════════════════════════════════════
    console.log('[Scraper] Step 8: Parsing grades data...');

    const gradeData = await parseGradesFromPage(page);
    
    console.log(`[Scraper] ✓ Scraping complete!`);
    console.log(`[Scraper]   Subjects found: ${gradeData.subjects.length}`);
    console.log(`[Scraper]   SGPA: ${gradeData.summary.sgpa}`);
    console.log(`[Scraper]   CGPA: ${gradeData.summary.cgpa}`);
    console.log(`[Scraper]   Credits: ${gradeData.summary.totalCredits}`);

    return {
      success: true,
      data: gradeData,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    console.error(`[Scraper] ✗ Error: ${error.message}`);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Parse grades data from a Puppeteer page
 */
async function parseGradesFromPage(page) {
  return await page.evaluate(() => {
    const result = {
      studentInfo: {},
      subjects: [],
      summary: {},
    };

    const pageText = document.body.innerText;
    
    // ── Extract student information ──
    const infoPatterns = {
      department: /Department\s*(?:Name)?\s*:?\s*(.+?)(?:\n|Course|Roll|$)/i,
      rollNo: /Roll\s*No\s*:?\s*(.+?)(?:\n|Regd|Father|$)/i,
      regdNo: /Regd\.?\s*No\s*:?\s*(.+?)(?:\n|Student|Mother|$)/i,
      course: /Course\s*:?\s*([A-Z.]+)/i,
      batch: /Batch\s*:?\s*(\d{4}-\d{4})/i,
      studentName: /Student\s*Name\s*:?\s*(.+?)(?:\n|Semester|$)/i,
      fatherName: /Father\s*(?:Name)?\s*:?\s*(.+?)(?:\n|Mother|$)/i,
      motherName: /Mother\s*(?:Name)?\s*:?\s*(.+?)(?:\n|$)/i,
      semester: /Semester\s*:?\s*(\d+)/i,
    };

    for (const [key, pattern] of Object.entries(infoPatterns)) {
      const match = pageText.match(pattern);
      if (match) {
        result.studentInfo[key] = match[1].trim();
      }
    }

    // ── Parse the grades table ──
    const tables = document.querySelectorAll('table');
    let gradesTable = null;

    for (const table of tables) {
      const text = table.innerText.toLowerCase();
      if (text.includes('subject') && (text.includes('grade') || text.includes('credit'))) {
        gradesTable = table;
        break;
      }
    }

    if (gradesTable) {
      const rows = gradesTable.querySelectorAll('tr');
      
      for (const row of rows) {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length >= 5) {
          const cellTexts = cells.map(c => c.textContent.trim());
          
          // Skip header/summary/empty rows
          if (cellTexts[0].toLowerCase().includes('subject name') || 
              cellTexts[0].toLowerCase().includes('result') ||
              cellTexts[0] === '') {
            continue;
          }
          
          const grade = cellTexts[3];
          const credit = parseInt(cellTexts[4]);
          
          if (grade && !isNaN(credit)) {
            result.subjects.push({
              subjectName: cellTexts[0],
              subjectCode: cellTexts[1],
              type: cellTexts[2],
              gradeAwarded: grade,
              earnedCredit: credit,
            });
          }
        }
      }
    }

    // ── Extract summary (SGPA, CGPA, Credits) ──
    const sgpaMatch = pageText.match(/SGPA\s*=?\s*([\d.]+)/i);
    const cgpaMatch = pageText.match(/CGPA\s*=?\s*([\d.]+)/i);
    const creditsMatch = pageText.match(/(?:Cumulative\s+)?Earned\s+Credits?\s*=?\s*(\d+)/i);

    result.summary = {
      sgpa: sgpaMatch ? parseFloat(sgpaMatch[1]) : null,
      cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : null,
      totalCredits: creditsMatch ? parseInt(creditsMatch[1]) : null,
    };

    return result;
  });
}

export default scrapeGrades;
