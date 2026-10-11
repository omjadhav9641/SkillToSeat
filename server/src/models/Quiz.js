import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  answerIndex: { type: Number, required: true, min: 0 },
  explanation: { type: String, default: '', trim: true }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  topic: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  description: { type: String, default: '', trim: true },
  questions: {
    type: [questionSchema],
    validate: [val => Array.isArray(val) && val.length > 0, 'Test must contain at least one question']
  }
}, { timestamps: true });

export default mongoose.model('Quiz', quizSchema);
