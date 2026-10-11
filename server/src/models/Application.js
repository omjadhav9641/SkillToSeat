import mongoose from 'mongoose';
const statuses = ['Saved','Applied','Assessment','Interview','Offer','Rejected','Withdrawn'];
const applicationSchema = new mongoose.Schema({ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, jobTitle: { type: String, required: true }, company: { type: String, required: true }, applyUrl: String, status: { type: String, enum: statuses, default: 'Saved' }, notes: String, appliedAt: Date, nextStepAt: Date }, { timestamps: true });
export default mongoose.model('Application', applicationSchema);
