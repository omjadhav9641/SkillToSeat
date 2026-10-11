import { Router } from 'express';
import Category from '../models/Category.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import Job from '../models/Job.js';
import { list, create, update, remove } from '../controllers/resourceController.js';
import { submitQuiz, getQuizForStudent, getQuizForAdmin } from '../controllers/quizController.js';
import { completeLesson, myProgress, dashboard } from '../controllers/progressController.js';
import { protect, optionalAuth, adminOnly } from '../middleware/auth.js';

const r = Router();

const crud = (path, Model, opts) => {
  r.get(path, optionalAuth, list(Model, opts));
  r.post(path, protect, adminOnly, create(Model));
  r.patch(`${path}/:id`, protect, adminOnly, update(Model));
  r.delete(`${path}/:id`, protect, adminOnly, remove(Model));
};

// Categories
crud('/categories', Category, { sort: { order: 1 } });

// Lectures / Lessons
crud('/lessons', Lesson, {
  populate: 'category',
  searchFields: ['title', 'topic', 'description'],
  sort: { order: 1, createdAt: 1 }
});

// Jobs
crud('/jobs', Job, {
  searchFields: ['title', 'company', 'location', 'description', 'category', 'type']
});

// Topic-based automated tests (Quizzes)
r.get('/quizzes', optionalAuth, list(Quiz, {
  populate: 'category lesson',
  searchFields: ['title', 'topic', 'description']
}));
r.get('/quizzes/:id', getQuizForStudent);
r.get('/quizzes/:id/admin', protect, adminOnly, getQuizForAdmin);
r.post('/quizzes', protect, adminOnly, create(Quiz));
r.patch('/quizzes/:id', protect, adminOnly, update(Quiz));
r.delete('/quizzes/:id', protect, adminOnly, remove(Quiz));
r.post('/quizzes/:id/submit', protect, submitQuiz);

// Student progress & dashboard
r.get('/progress', protect, myProgress);
r.post('/progress/lessons/:lessonId/complete', protect, completeLesson);
r.get('/dashboard', protect, dashboard);

export default r;
