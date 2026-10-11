import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { asyncHandler } from '../utils/errors.js';

export const myApplications = asyncHandler(async (req, res) => {
  const items = await Application.find({ user: req.user.id }).sort({ updatedAt: -1 });
  res.json({ items });
});

export const createApplication = asyncHandler(async (req, res) => {
  let data = { ...req.body, user: req.user.id };

  if (data.job) {
    const job = await Job.findById(data.job);
    if (job) {
      data.jobTitle = data.jobTitle || job.title;
      data.company = data.company || job.company;
      data.applyUrl = data.applyUrl || job.applyUrl;
    }

    // Check if user already tracked this job to prevent duplicates
    const existing = await Application.findOne({ user: req.user.id, job: data.job });
    if (existing) {
      if (data.status) existing.status = data.status;
      if (data.notes) existing.notes = data.notes;
      await existing.save();
      return res.status(200).json({ item: existing, updated: true });
    }
  }

  const item = await Application.create(data);
  res.status(201).json({ item });
});

export const updateApplication = asyncHandler(async (req, res) => {
  const allowed = ['status', 'notes', 'appliedAt', 'nextStepAt'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => allowed.includes(key))
  );

  const item = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    updates,
    { new: true, runValidators: true }
  );

  if (!item) return res.status(404).json({ message: 'Application not found.' });
  res.json({ item });
});

export const deleteApplication = asyncHandler(async (req, res) => {
  const item = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!item) return res.status(404).json({ message: 'Application not found.' });
  res.json({ message: 'Deleted from tracker successfully.' });
});
