import mongoose from 'mongoose';

export function extractYoutubeId(input) {
  if (!input) return '';
  const str = String(input).trim();
  const urlMatch = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (urlMatch) return urlMatch[1];
  const directMatch = str.match(/^[\w-]{11}$/);
  if (directMatch) return directMatch[0];
  return str;
}

const lessonSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  topic: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  youtubeVideoId: { type: String, required: true, trim: true },
  durationMinutes: { type: Number, default: 0, min: 0 },
  keyConcepts: [{ type: String, trim: true }],
  order: { type: Number, default: 0 }
}, { timestamps: true });

lessonSchema.pre('validate', function(next) {
  if (this.youtubeVideoId) {
    this.youtubeVideoId = extractYoutubeId(this.youtubeVideoId);
  }
  next();
});

export default mongoose.model('Lesson', lessonSchema);
