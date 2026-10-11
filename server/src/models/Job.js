import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, default: 'Remote', trim: true },
  type: { type: String, default: 'Full-time', trim: true },
  category: { type: String, default: 'Engineering', trim: true },
  description: { type: String, default: '', trim: true },
  applyUrl: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  active: { type: Boolean, default: true },
  postedAt: { type: Date, default: Date.now }
}, { timestamps: true });

jobSchema.pre('validate', function(next) {
  if (this.status) {
    this.active = this.status === 'Open';
  } else {
    this.status = this.active ? 'Open' : 'Closed';
  }
  next();
});

export default mongoose.model('Job', jobSchema);
