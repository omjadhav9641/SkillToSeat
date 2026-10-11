import mongoose from 'mongoose';
import { asyncHandler, AppError } from '../utils/errors.js';
import { extractYoutubeId } from '../models/Lesson.js';
import Category from '../models/Category.js';

export const list = (Model, options = {}) => asyncHandler(async (req, res) => {
  const filter = {};

  // Public/Job filtering
  if (Model.modelName === 'Job') {
    const showAll = req.query.all === 'true' && req.user?.role === 'ADMIN';
    if (!showAll) {
      filter.active = true;
      filter.status = { $ne: 'Closed' };
    }
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    if (req.query.type && req.query.type !== 'All') {
      filter.type = req.query.type;
    }
  }

  // Lesson filtering
  if (Model.modelName === 'Lesson') {
    if (req.query.category && req.query.category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      } else {
        const cat = await Category.findOne({ name: req.query.category });
        if (cat) filter.category = cat._id;
      }
    }
    if (req.query.topic && req.query.topic !== 'All') {
      filter.topic = req.query.topic;
    }
  }

  // Quiz filtering
  if (Model.modelName === 'Quiz') {
    if (req.query.topic && req.query.topic !== 'All') {
      filter.topic = req.query.topic;
    }
    if (req.query.category && req.query.category !== 'All') {
      if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        filter.category = req.query.category;
      } else {
        const cat = await Category.findOne({ name: req.query.category });
        if (cat) filter.category = cat._id;
      }
    }
  }

  // Generic search with proper query composition so filters are never bypassed
  if (req.query.search && req.query.search.trim()) {
    const term = req.query.search.trim();
    const searchFields = options.searchFields || ['title', 'name', 'topic', 'description', 'company'];
    const orConditions = searchFields.map(key => ({ [key]: { $regex: term, $options: 'i' } }));

    if (filter.$or) {
      filter.$and = [{ $or: filter.$or }, { $or: orConditions }];
      delete filter.$or;
    } else {
      filter.$or = orConditions;
    }
  }

  const sort = options.sort || (Model.modelName === 'Lesson' ? { order: 1, createdAt: 1 } : { createdAt: -1 });
  const rows = await Model.find(filter).sort(sort).limit(150).populate(options.populate || []);

  // For quizzes, never expose answerIndex or explanation to students/public in listing
  const items = Model.modelName === 'Quiz'
    ? rows.map(row => {
        const quiz = row.toObject();
        quiz.questionCount = quiz.questions?.length || 0;
        quiz.questions = (quiz.questions || []).map(({ answerIndex, explanation, ...q }) => q);
        return quiz;
      })
    : rows;

  res.json({ items });
});

export const create = Model => asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (Model.modelName === 'Lesson') {
    if (payload.youtubeUrl) {
      payload.youtubeVideoId = extractYoutubeId(payload.youtubeUrl);
    } else if (payload.youtubeVideoId) {
      payload.youtubeVideoId = extractYoutubeId(payload.youtubeVideoId);
    }
    if (payload.duration !== undefined && payload.durationMinutes === undefined) {
      payload.durationMinutes = Number(payload.duration) || 0;
    }
    if (payload.displayOrder !== undefined && payload.order === undefined) {
      payload.order = Number(payload.displayOrder) || 0;
    }
    // Handle category if name provided instead of ObjectId
    if (payload.category && typeof payload.category === 'string' && !mongoose.Types.ObjectId.isValid(payload.category)) {
      let cat = await Category.findOne({ name: payload.category.trim() });
      if (!cat) {
        cat = await Category.create({ name: payload.category.trim() });
      }
      payload.category = cat._id;
    }
  }

  if (Model.modelName === 'Job') {
    if (payload.employmentType && !payload.type) {
      payload.type = payload.employmentType;
    }
    if (payload.externalApplicationUrl && !payload.applyUrl) {
      payload.applyUrl = payload.externalApplicationUrl;
    }
    if (payload.status) {
      payload.active = payload.status === 'Open';
    } else if (payload.active !== undefined) {
      payload.status = payload.active ? 'Open' : 'Closed';
    }
  }

  if (Model.modelName === 'Quiz') {
    if (!payload.category) delete payload.category;
    if (!payload.lesson) delete payload.lesson;
    if (!payload.questions || !payload.questions.length) {
      throw new AppError('Test must have at least one question.', 400);
    }
    for (const q of payload.questions) {
      if (!q.prompt || !q.options || q.options.length < 2 || q.answerIndex === undefined) {
        throw new AppError('Each question must have a prompt, at least 2 options, and a valid correct answer index.', 400);
      }
      if (q.answerIndex < 0 || q.answerIndex >= q.options.length) {
        throw new AppError(`Answer index ${q.answerIndex} is out of bounds for the available options.`, 400);
      }
    }
  }

  const item = await Model.create(payload);
  const populated = optionsPopulate(Model, item);
  res.status(201).json({ item: populated ? await populated : item });
});

export const update = Model => asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (Model.modelName === 'Lesson') {
    if (payload.youtubeUrl) {
      payload.youtubeVideoId = extractYoutubeId(payload.youtubeUrl);
    } else if (payload.youtubeVideoId) {
      payload.youtubeVideoId = extractYoutubeId(payload.youtubeVideoId);
    }
    if (payload.duration !== undefined && payload.durationMinutes === undefined) {
      payload.durationMinutes = Number(payload.duration) || 0;
    }
    if (payload.displayOrder !== undefined && payload.order === undefined) {
      payload.order = Number(payload.displayOrder) || 0;
    }
    if (payload.category && typeof payload.category === 'string' && !mongoose.Types.ObjectId.isValid(payload.category)) {
      let cat = await Category.findOne({ name: payload.category.trim() });
      if (!cat) {
        cat = await Category.create({ name: payload.category.trim() });
      }
      payload.category = cat._id;
    }
  }

  if (Model.modelName === 'Job') {
    if (payload.employmentType && !payload.type) {
      payload.type = payload.employmentType;
    }
    if (payload.externalApplicationUrl && !payload.applyUrl) {
      payload.applyUrl = payload.externalApplicationUrl;
    }
    if (payload.status) {
      payload.active = payload.status === 'Open';
    } else if (payload.active !== undefined) {
      payload.status = payload.active ? 'Open' : 'Closed';
    }
  }

  if (Model.modelName === 'Quiz') {
    if (!payload.category) delete payload.category;
    if (!payload.lesson) delete payload.lesson;
    if (payload.questions) {
      for (const q of payload.questions) {
        if (!q.prompt || !q.options || q.options.length < 2 || q.answerIndex === undefined) {
          throw new AppError('Each question must have a prompt, at least 2 options, and a valid correct answer index.', 400);
        }
        if (q.answerIndex < 0 || q.answerIndex >= q.options.length) {
          throw new AppError(`Answer index ${q.answerIndex} is out of bounds for the available options.`, 400);
        }
      }
    }
  }

  const item = await Model.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Not found.' });
  const populated = optionsPopulate(Model, item);
  res.json({ item: populated ? await populated : item });
});

export const remove = Model => asyncHandler(async (req, res) => {
  const item = await Model.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found.' });
  res.json({ message: 'Deleted successfully.' });
});

function optionsPopulate(Model, item) {
  if (Model.modelName === 'Lesson') return item.populate('category');
  if (Model.modelName === 'Quiz') return item.populate('category lesson');
  return null;
}
