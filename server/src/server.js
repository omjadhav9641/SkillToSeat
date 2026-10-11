import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();
if (!process.env.MONGODB_URI) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown';
  res.json({
    status: 'ok',
    database: dbState,
    connected: mongoose.connection.readyState === 1,
    tip: dbState !== 'connected' ? 'Please ensure your current IP is added to the MongoDB Atlas Network Access IP Access List (or 0.0.0.0/0).' : undefined
  });
});

// Guard data routes if database is disconnected
app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'MongoDB Atlas is disconnected. Please ensure your current IP is added to your Atlas Project Network Access list (or add 0.0.0.0/0 for anywhere access).',
      status: 'database_unavailable'
    });
  }
  next();
});

app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 50 : 500,
  standardHeaders: true,
  legacyHeaders: false
}), authRoutes);
app.use('/api', contentRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API listening on ${port}`));

connectDB().catch(err => {
  console.error('Database connection failed:', err.message);
});
