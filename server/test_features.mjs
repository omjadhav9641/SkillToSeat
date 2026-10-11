import axios from 'axios';

async function run() {
  const ts = Date.now();
  const baseURL = 'http://localhost:5000/api';

  function getCookie(res) {
    const raw = res.headers['set-cookie'];
    return Array.isArray(raw) ? raw[0].split(';')[0] : raw;
  }

  // Ensure server is reachable and database is connected
  for (let i = 0; i < 15; i++) {
    try {
      const h = await axios.get(baseURL + '/health');
      if (h.data?.database === 'connected') break;
    } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('=== TEST 1: SETUP ADMIN & STUDENT ACCOUNTS ===');
  let loginAdminRes = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      loginAdminRes = await axios.post(baseURL + '/auth/login', {
        email: 'admin@startupmeu.internal',
        password: 'AdminPassword123!'
      });
      if (loginAdminRes.status === 200) break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  if (!loginAdminRes) throw new Error('Could not authenticate as admin.');
  const adminCookie = getCookie(loginAdminRes);

  const regStudentRes = await axios.post(baseURL + '/auth/register', {
    name: 'Student Learner ' + ts,
    email: 'student_' + ts + '@example.com',
    password: 'Password123!'
  });
  const studentCookie = getCookie(regStudentRes);

  console.log('Admin & Student logged in and ready.');

  console.log('\n=== TEST 2: LECTURES (FEATURE 1) ===');
  // Admin creates category
  const catRes = await axios.post(
    baseURL + '/categories',
    { name: 'Algorithms ' + ts, description: 'Core Algorithmic Foundations', order: 1 },
    { headers: { Cookie: adminCookie } }
  );
  const categoryId = catRes.data.item._id;
  console.log('Category created:', catRes.data.item.name);

  // Admin creates lecture with full YouTube URL
  const lecRes = await axios.post(
    baseURL + '/lessons',
    {
      title: 'Binary Search Deep Dive',
      topic: 'Binary Search',
      category: categoryId,
      youtubeUrl: 'https://www.youtube.com/watch?v=fDKIpRe8GW4',
      durationMinutes: 24,
      order: 1,
      description: 'Learn monotonic predicates and search space reduction.',
      keyConcepts: ['Monotonicity', 'Search Range', 'Lower Bound']
    },
    { headers: { Cookie: adminCookie } }
  );
  const lectureId = lecRes.data.item._id;
  console.log('Lecture created with extracted YouTube ID:', lecRes.data.item.youtubeVideoId, '(Expected: fDKIpRe8GW4)');
  if (lecRes.data.item.youtubeVideoId !== 'fDKIpRe8GW4') throw new Error('YouTube ID was not extracted properly!');

  // Admin edits lecture
  const editLecRes = await axios.patch(
    baseURL + '/lessons/' + lectureId,
    {
      title: 'Binary Search & Two Pointers Complete Guide',
      order: 2
    },
    { headers: { Cookie: adminCookie } }
  );
  console.log('Lecture updated title:', editLecRes.data.item.title, 'order:', editLecRes.data.item.order);

  // Student lists lectures with topic filter
  const listLecRes = await axios.get(baseURL + '/lessons?topic=Binary Search', {
    headers: { Cookie: studentCookie }
  });
  console.log('Student listed lectures count:', listLecRes.data.items.length);

  // Student marks lecture complete
  const compRes = await axios.post(
    baseURL + '/progress/lessons/' + lectureId + '/complete',
    {},
    { headers: { Cookie: studentCookie } }
  );
  console.log('Student marked complete status:', compRes.status, 'completed:', compRes.data.item.completed);

  console.log('\n=== TEST 3: OPEN JOB ROLES (FEATURE 2) ===');
  // Admin creates open job
  const jobOpenRes = await axios.post(
    baseURL + '/jobs',
    {
      title: 'Associate SDE',
      company: 'Google',
      location: 'Bangalore, India',
      type: 'Full-time',
      category: 'Engineering',
      applyUrl: 'https://careers.google.com/jobs/results/12345',
      description: 'Build high-scale distributed systems.',
      status: 'Open'
    },
    { headers: { Cookie: adminCookie } }
  );
  const openJobId = jobOpenRes.data.item._id;
  console.log('Open job created:', jobOpenRes.data.item.title, 'status:', jobOpenRes.data.item.status);

  // Admin creates closed job
  const jobClosedRes = await axios.post(
    baseURL + '/jobs',
    {
      title: 'Product Intern (Filled)',
      company: 'Meta',
      location: 'Remote',
      type: 'Internship',
      category: 'Product',
      applyUrl: 'https://meta.com/careers/closed',
      description: 'Closed internship position.',
      status: 'Closed'
    },
    { headers: { Cookie: adminCookie } }
  );
  const closedJobId = jobClosedRes.data.item._id;
  console.log('Closed job created:', jobClosedRes.data.item.title, 'status:', jobClosedRes.data.item.status);

  // Student fetches jobs -> Closed job MUST be hidden!
  const studentJobsRes = await axios.get(baseURL + '/jobs', {
    headers: { Cookie: studentCookie }
  });
  const studentHasClosed = studentJobsRes.data.items.some(j => j._id === closedJobId);
  const studentHasOpen = studentJobsRes.data.items.some(j => j._id === openJobId);
  console.log('Student sees open job:', studentHasOpen, '| Student sees closed job:', studentHasClosed, '(Should be false)');
  if (studentHasClosed) throw new Error('Closed job was NOT hidden from student!');

  // Admin fetches jobs with ?all=true -> BOTH open and closed must be visible
  const adminJobsRes = await axios.get(baseURL + '/jobs?all=true', {
    headers: { Cookie: adminCookie }
  });
  const adminHasClosed = adminJobsRes.data.items.some(j => j._id === closedJobId);
  console.log('Admin sees closed job with ?all=true:', adminHasClosed, '(Should be true)');
  if (!adminHasClosed) throw new Error('Admin could not see closed job!');

  // Student saves open role to application tracker
  const appRes = await axios.post(
    baseURL + '/applications',
    {
      job: openJobId,
      jobTitle: 'Associate SDE',
      company: 'Google',
      applyUrl: 'https://careers.google.com/jobs/results/12345',
      status: 'Saved'
    },
    { headers: { Cookie: studentCookie } }
  );
  console.log('Student saved role to tracker. App ID:', appRes.data.item._id);

  // Student views application tracker
  const myAppsRes = await axios.get(baseURL + '/applications', {
    headers: { Cookie: studentCookie }
  });
  console.log('Student tracked applications count:', myAppsRes.data.items.length);

  console.log('\n=== TEST 4: TOPIC-BASED AUTOMATED TESTS (FEATURE 3) ===');
  // Admin creates topic test
  const testCreateRes = await axios.post(
    baseURL + '/quizzes',
    {
      title: 'Binary Search Concepts Assessment',
      topic: 'Binary Search',
      category: categoryId,
      lesson: lectureId,
      description: 'Test your understanding of binary search invariants and time complexity.',
      questions: [
        {
          prompt: 'What is the runtime complexity of binary search on a sorted array of size N?',
          options: ['O(N)', 'O(log N)', 'O(N^2)', 'O(1)'],
          answerIndex: 1,
          explanation: 'Each iteration eliminates half of the remaining elements, yielding O(log N).'
        },
        {
          prompt: 'Which condition is required for standard binary search to work?',
          options: ['Array must be sorted', 'Array must contain unique elements', 'Array length must be even', 'Array elements must be positive'],
          answerIndex: 0,
          explanation: 'Monotonicity/sorted order is required to decide which half to discard.'
        }
      ]
    },
    { headers: { Cookie: adminCookie } }
  );
  const testId = testCreateRes.data.item._id;
  console.log('Topic test created:', testCreateRes.data.item.title, 'questions count:', testCreateRes.data.item.questions.length);

  // Student fetches test details BEFORE submission
  const studentQuizRes = await axios.get(baseURL + '/quizzes/' + testId, {
    headers: { Cookie: studentCookie }
  });
  const sampleQ = studentQuizRes.data.quiz.questions[0];
  console.log('Student quiz fetched. Contains answerIndex:', 'answerIndex' in sampleQ, '| Contains explanation:', 'explanation' in sampleQ);
  if ('answerIndex' in sampleQ || 'explanation' in sampleQ) {
    throw new Error('SECURITY VIOLATION: answerIndex or explanation leaked to student before submission!');
  }

  // Student submits answers: [1, 0] (Both correct)
  const submitRes1 = await axios.post(
    baseURL + '/quizzes/' + testId + '/submit',
    { answers: [1, 0] },
    { headers: { Cookie: studentCookie } }
  );
  console.log('Attempt 1 result: score =', submitRes1.data.score, '/', submitRes1.data.total, '(', submitRes1.data.percent, '%)');
  console.log('Received explanations upon submission:', submitRes1.data.results.map(r => r.explanation));
  if (submitRes1.data.percent !== 100) throw new Error('Expected 100% score!');

  // Student takes test again: [0, 0] (1 wrong, 1 correct)
  const submitRes2 = await axios.post(
    baseURL + '/quizzes/' + testId + '/submit',
    { answers: [0, 0] },
    { headers: { Cookie: studentCookie } }
  );
  console.log('Attempt 2 result: score =', submitRes2.data.score, '/', submitRes2.data.total, '(', submitRes2.data.percent, '%) attempts =', submitRes2.data.attempts, 'bestScore =', submitRes2.data.bestScore);
  if (submitRes2.data.attempts !== 2 || submitRes2.data.bestScore !== 100) {
    throw new Error('Progress attempts or bestScore not updated properly!');
  }

  // Student checks progress list
  const progressRes = await axios.get(baseURL + '/progress', {
    headers: { Cookie: studentCookie }
  });
  console.log('Student total progress records:', progressRes.data.items.length);

  // Admin deletes the test
  const delTestRes = await axios.delete(baseURL + '/quizzes/' + testId, {
    headers: { Cookie: adminCookie }
  });
  console.log('Admin test deletion status:', delTestRes.data.message);

  console.log('\n=============================================');
  console.log('SUCCESS: ALL FEATURES FULLY VERIFIED ON LIVE DB!');
  console.log('=============================================');
  process.exit(0);
}

run().catch(err => {
  console.error('TEST ERROR:', err.response?.status, err.response?.data || err.message);
  process.exit(1);
});
