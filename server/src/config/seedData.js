import bcrypt from 'bcryptjs';
import Category from '../models/Category.js';
import Lesson from '../models/Lesson.js';
import Job from '../models/Job.js';
import Quiz from '../models/Quiz.js';
import User from '../models/User.js';
import Progress from '../models/Progress.js';

export async function seedInitialData() {
  try {
    await Progress.collection.dropIndexes().catch(() => {});
    await Progress.createIndexes().catch(() => {});
    const adminHash = await bcrypt.hash('AdminPassword123!', 10);
    const studentHash = await bcrypt.hash('StudentPassword123!', 10);

    for (const email of ['admin@skilltoseat.internal', 'admin@startupmeu.internal']) {
      await User.findOneAndUpdate(
        { email },
        { name: 'SkillToSeat Administrator', password: adminHash, role: 'ADMIN' },
        { upsert: true, new: true }
      );
    }
    for (const email of ['student@skilltoseat.internal', 'student@startupmeu.internal']) {
      await User.findOneAndUpdate(
        { email },
        { name: 'Alex Rivera', password: studentHash, role: 'STUDENT' },
        { upsert: true, new: true }
      );
    }
    console.log('Ensured demo users for SkillToSeat: admin@skilltoseat.internal & student@skilltoseat.internal');

    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const dsa = await Category.create({
        name: 'Data Structures & Algorithms',
        description: 'Core algorithmic patterns, arrays, trees, and dynamic programming.',
        order: 1
      });
      const sys = await Category.create({
        name: 'System Design & Architecture',
        description: 'Scalable distributed systems, caching, databases, and microservices.',
        order: 2
      });
      const cs = await Category.create({
        name: 'Core Computer Science',
        description: 'Operating systems, networks, DBMS, and concurrency.',
        order: 3
      });

      // Seed Lessons
      const lec1 = await Lesson.create({
        title: 'Binary Search: Invariants & Predicates',
        topic: 'Binary Search',
        category: dsa._id,
        youtubeVideoId: 'fDKIpRe8GW4',
        durationMinutes: 24,
        order: 1,
        description: 'Master binary search boundaries, monotonic predicate functions, and search spaces.',
        keyConcepts: ['Monotonicity', 'Search Range', 'Lower Bound', 'Loop Invariants']
      });

      await Lesson.create({
        title: 'Two Pointers & Sliding Window Mastery',
        topic: 'Two Pointers',
        category: dsa._id,
        youtubeVideoId: 'On03HWe2tZM',
        durationMinutes: 30,
        order: 2,
        description: 'Optimize subarray operations, handle opposite-direction scans, and remove nested loops.',
        keyConcepts: ['Opposite Ends', 'Window Shrinking', 'Two Pointers', 'Subarray Sums']
      });

      await Lesson.create({
        title: 'Distributed Caching & Redis Patterns',
        topic: 'System Design',
        category: sys._id,
        youtubeVideoId: 'jgpVdJB29zk',
        durationMinutes: 35,
        order: 1,
        description: 'Learn cache-aside, write-through caching, Redis replication, and TTL policies.',
        keyConcepts: ['Cache Aside', 'TTL', 'Eviction Policies', 'Redis Sharding']
      });

      // Seed Jobs
      await Job.create([
        {
          title: 'Associate Software Engineer',
          company: 'Google',
          location: 'Bangalore / Hybrid',
          type: 'Full-time',
          category: 'Engineering',
          applyUrl: 'https://careers.google.com',
          description: 'Build high-scale distributed backend systems and real-time processing pipelines.',
          status: 'Open',
          active: true
        },
        {
          title: 'Frontend Engineer (React)',
          company: 'Razorpay',
          location: 'Bangalore',
          type: 'Full-time',
          category: 'Engineering',
          applyUrl: 'https://razorpay.com/jobs',
          description: 'Deliver clean, high-performance checkout and payment experiences for merchants.',
          status: 'Open',
          active: true
        },
        {
          title: 'Backend Engineering Intern',
          company: 'Swiggy',
          location: 'Remote',
          type: 'Internship',
          category: 'Engineering',
          applyUrl: 'https://bytes.swiggy.com/careers',
          description: 'Work on delivery allocation, real-time dispatching, and high-throughput order APIs.',
          status: 'Open',
          active: true
        },
        {
          title: 'Software Engineer - Infrastructure (Closed)',
          company: 'Meta',
          location: 'Remote',
          type: 'Full-time',
          category: 'Engineering',
          applyUrl: 'https://metacareers.com',
          description: 'Position filled for the current cycle.',
          status: 'Closed',
          active: false
        }
      ]);

      // Seed Tests (Quizzes)
      await Quiz.create([
        {
          title: 'Binary Search Mastery Assessment',
          topic: 'Binary Search',
          category: dsa._id,
          lesson: lec1._id,
          description: 'Test your understanding of binary search invariants, edge conditions, and complexity.',
          questions: [
            {
              prompt: 'What is the runtime complexity of binary search on a sorted array of size N?',
              options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
              answerIndex: 1,
              explanation: 'Binary search divides the remaining search interval in half at each iteration, taking logarithmic O(log N) time.'
            },
            {
              prompt: 'What mathematical property is strictly required for standard binary search to work?',
              options: ['Monotonicity (sorted order)', 'All elements must be positive', 'Array size must be a power of 2', 'Unique elements with no duplicates'],
              answerIndex: 0,
              explanation: 'Monotonicity allows us to confidently discard one entire half of the search space based on a single condition.'
            },
            {
              prompt: 'To avoid potential integer overflow when calculating midpoint in languages with 32-bit integers, which formula is safest?',
              options: ['mid = (left + right) / 2', 'mid = left + (right - left) / 2', 'mid = (right - left) / 2', 'mid = (left * right) / 2'],
              answerIndex: 1,
              explanation: 'left + (right - left) / 2 is mathematically identical to (left + right) / 2 but avoids left + right overflowing MAX_INT.'
            }
          ]
        },
        {
          title: 'System Design & Distributed Caching Quiz',
          topic: 'System Design',
          category: sys._id,
          description: 'Evaluate your knowledge of caching strategies, invalidation techniques, and eviction algorithms.',
          questions: [
            {
              prompt: 'Which eviction policy discards the items that have not been read or written to for the longest time?',
              options: ['FIFO (First In First Out)', 'LRU (Least Recently Used)', 'LFU (Least Frequently Used)', 'Random Drop'],
              answerIndex: 1,
              explanation: 'LRU tracks item access chronology and discards the least recently accessed item when cache capacity is exceeded.'
            },
            {
              prompt: 'In a Cache-Aside (Lazy Loading) architecture, how does the system behave on a cache miss?',
              options: [
                'The cache automatically fetches data from the primary database',
                'The application server queries the database, writes the fetched data into the cache, and returns it to the client',
                'The client request is immediately aborted with a 404 error',
                'All database transactions are rolled back'
              ],
              answerIndex: 1,
              explanation: 'In Cache-Aside, the application code is responsible for checking the cache, reading from the database upon a miss, and populating the cache.'
            }
          ]
        }
      ]);

      console.log('Successfully seeded demo categories, lectures, open jobs, and topic tests!');
    }
  } catch (err) {
    console.error('Initial seeding notice:', err.message);
  }
}
