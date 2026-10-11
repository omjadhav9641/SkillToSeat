import mongoose from 'mongoose';
const categorySchema = new mongoose.Schema({ name: { type: String, required: true, trim: true }, description: String, icon: { type: String, default: 'BookOpen' }, order: { type: Number, default: 0 } }, { timestamps: true });
export default mongoose.model('Category', categorySchema);
