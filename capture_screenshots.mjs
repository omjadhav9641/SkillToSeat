import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const OUT_DIR = path.resolve('docs/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  console.log('Using browser executable at:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

  // 1. Sign In Page
  console.log('Capturing Sign In page...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.auth-form');
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT_DIR, '01-sign-in.png') });

  // 2. Log in as Student
  console.log('Logging in as student...');
  await page.type('input[name="email"]', 'student@skilltoseat.internal');
  await page.type('input[name="password"]', 'StudentPassword123!');
  await Promise.all([
    page.click('button.primary'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  // Save 3 jobs to populate application tracker
  console.log('Saving jobs to populate application tracker...');
  try {
    await page.goto('http://localhost:5173/jobs', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.job-card button.secondary');
    const saveBtns = await page.$$('.job-card button.secondary');
    for (let i = 0; i < Math.min(saveBtns.length, 3); i++) {
      await saveBtns[i].click().catch(() => {});
      await new Promise(r => setTimeout(r, 400));
    }
  } catch (e) {
    console.log('Jobs seed note:', e.message);
  }

  // Complete a lecture
  console.log('Marking lecture complete...');
  try {
    await page.goto('http://localhost:5173/learn', { waitUntil: 'networkidle0' });
    await page.waitForSelector('.lesson-card');
    await page.click('.lesson-card');
    await page.waitForSelector('.video-frame');
    const markBtn = await page.$('button.primary');
    if (markBtn) await markBtn.click().catch(() => {});
    await new Promise(r => setTimeout(r, 500));
  } catch (e) {
    console.log('Learn seed note:', e.message);
  }

  // 3. Student Dashboard
  console.log('Capturing Student Dashboard...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.dash-grid');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '02-student-dashboard.png') });

  // 4. Lesson Page with YouTube Lecture & Quiz
  console.log('Capturing Lesson Page with YouTube & Quiz...');
  await page.goto('http://localhost:5173/learn', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.lesson-card');
  await page.click('.lesson-card');
  await page.waitForSelector('.video-frame');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '03-lesson-and-quiz.png') });

  // 5. Topic Quiz runner screen
  console.log('Capturing Topic Quiz runner...');
  await page.goto('http://localhost:5173/practice', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.test-card button.primary');
  await page.click('.test-card button.primary');
  await page.waitForSelector('.test-q-box');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '04-topic-quiz.png') });

  // 6. Job Openings
  console.log('Capturing Job Openings...');
  await page.goto('http://localhost:5173/jobs', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.job-card');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '05-job-listings.png') });

  // 7. Application Tracker
  console.log('Capturing Application Tracker...');
  await page.goto('http://localhost:5173/applications', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.status-summary');
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, '06-application-tracker.png') });

  // 8. Log in as Admin for Admin Management
  console.log('Logging in as Admin for Admin Portal...');
  const client = await page.target().createCDPSession();
  await client.send('Network.clearBrowserCookies');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
  await page.waitForSelector('input[name="email"]');
  await page.type('input[name="email"]', 'admin@skilltoseat.internal');
  await page.type('input[name="password"]', 'AdminPassword123!');
  await Promise.all([
    page.click('button.primary'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);

  // 9. Admin Management
  console.log('Capturing Admin Management...');
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
  await page.waitForSelector('.admin-list');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, '07-admin-management.png') });

  console.log('All updated screenshots captured successfully!');
  await browser.close();
}

run().catch(err => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
