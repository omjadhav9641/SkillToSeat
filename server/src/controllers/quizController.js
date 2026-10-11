import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import { asyncHandler, AppError } from '../utils/errors.js';
import { recordActivity } from '../services/activityService.js';

export const getQuizForStudent = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('category lesson');
  if (!quiz) throw new AppError('Test not found.', 404);

  const clean = quiz.toObject();
  clean.questions = clean.questions.map(({ answerIndex, explanation, ...q }) => q);
  res.json({ quiz: clean });
});

export const getQuizForAdmin = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).populate('category lesson');
  if (!quiz) throw new AppError('Test not found.', 404);
  res.json({ quiz });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) throw new AppError('Test not found.', 404);

  const answers = req.body.answers || []; // array of selected option indices
  let score = 0;

  const results = quiz.questions.map((q, i) => {
    const studentAnswer = answers[i] !== undefined && answers[i] !== null ? Number(answers[i]) : null;
    const correct = studentAnswer === q.answerIndex;
    if (correct) score++;
    return {
      prompt: q.prompt,
      options: q.options,
      studentAnswer,
      correct,
      correctAnswerIndex: q.answerIndex,
      explanation: q.explanation || ''
    };
  });

  const total = quiz.questions.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;

  // Save attempt and score to student's progress
  const progressFilter = { user: req.user.id, quiz: quiz._id };

  const progress = await Progress.findOneAndUpdate(
    progressFilter,
    {
      $max: { bestScore: percent },
      $set: {
        lastScore: percent,
        topic: quiz.topic,
        completed: percent >= 70,
        ...(percent >= 70 ? { completedAt: new Date() } : {})
      },
      $inc: { attempts: 1 },
      $setOnInsert: {
        user: req.user.id,
        quiz: quiz._id
      }
    },
    { upsert: true, new: true }
  );

  await recordActivity(req.user.id);

  res.json({
    score,
    total,
    percent,
    results,
    attempts: progress.attempts,
    bestScore: progress.bestScore
  });
});
