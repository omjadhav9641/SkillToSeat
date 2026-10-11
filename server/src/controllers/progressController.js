import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Activity from '../models/Activity.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { recordActivity } from '../services/activityService.js';

export const completeLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId);
  if (!lesson) throw new AppError('Lesson not found.', 404);

  const item = await Progress.findOneAndUpdate(
    { user: req.user.id, lesson: lesson.id },
    {
      $set: {
        completed: true,
        topic: lesson.topic,
        completedAt: new Date()
      },
      $setOnInsert: {
        user: req.user.id,
        lesson: lesson.id
      }
    },
    { upsert: true, new: true }
  );

  await recordActivity(req.user.id);
  res.json({ item });
});

export const myProgress = asyncHandler(async (req, res) => {
  const items = await Progress.find({ user: req.user.id }).populate('lesson quiz');
  res.json({ items });
});

export const dashboard = asyncHandler(async (req, res) => {
  const [lessons, progress, activities, applications, jobCount] = await Promise.all([
    Lesson.countDocuments(),
    Progress.find({ user: req.user.id }),
    Activity.find({ user: req.user.id }).sort({ dateKey: -1 }).limit(90),
    Application.countDocuments({ user: req.user.id }),
    Job.countDocuments({ active: true })
  ]);

  const completed = progress.filter(p => p.completed && p.lesson).length;
  const keys = new Set(activities.map(a => a.dateKey));
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (i === 0 && !keys.has(k)) continue;
    if (!keys.has(k)) break;
    streak++;
  }

  res.json({
    stats: {
      completed,
      totalLessons: lessons,
      completion: lessons ? Math.round((completed / lessons) * 100) : 0,
      streak,
      applications,
      openJobs: jobCount
    },
    activity: activities
  });
});
