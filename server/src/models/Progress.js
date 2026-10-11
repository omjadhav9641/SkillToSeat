import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  topic: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  bestScore: { type: Number, default: 0 },
  lastScore: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  completedAt: { type: Date }
}, { timestamps: true });

progressSchema.index(
  { user: 1, lesson: 1 },
  { unique: true, partialFilterExpression: { lesson: { $type: 'objectId' } } }
);

progressSchema.index(
  { user: 1, quiz: 1 },
  { unique: true, partialFilterExpression: { quiz: { $type: 'objectId' } } }
);

progressSchema.index({ user: 1, topic: 1 });

export default mongoose.model('Progress', progressSchema);
