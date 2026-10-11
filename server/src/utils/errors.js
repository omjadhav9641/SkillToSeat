export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export class AppError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
