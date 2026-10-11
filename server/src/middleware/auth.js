import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/errors.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError('Please sign in to continue.', 401);
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.sub);
  if (!user) throw new AppError('Account not found.', 401);
  req.user = user;
  next();
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      if (user) req.user = user;
    } catch {
      // Ignore invalid or expired token on public routes
    }
  }
  next();
});

export const adminOnly = (req, _res, next) => {
  if (req.user?.role === 'ADMIN') return next();
  return next(new AppError('Administrator access required.', 403));
};
