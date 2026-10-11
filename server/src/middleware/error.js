import { AppError } from '../utils/errors.js';
export const notFound = (_req, _res, next) => next(new AppError('Route not found.', 404));
export const errorHandler = (err, _req, res, _next) => { const status = err.status || (err.name === 'ValidationError' ? 400 : err.code === 11000 ? 409 : 500); res.status(status).json({ message: status === 500 ? 'Something went wrong.' : err.message, ...(process.env.NODE_ENV !== 'production' && status === 500 ? { detail: err.message } : {}) }); };
