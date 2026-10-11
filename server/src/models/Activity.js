import mongoose from 'mongoose';
const activitySchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, dateKey: { type: String, required: true }, actions: { type: Number, default: 1 } }, { timestamps: true });
activitySchema.index({ user: 1, dateKey: 1 }, { unique: true });
export default mongoose.model('Activity', activitySchema);
