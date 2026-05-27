//  auth.ts - Middleware to protect admin routes
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend request to include the admin payload after validation
export interface AuthRequest extends Request {
  admin?: { id: string };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  // Get the token from the Authorization header: 'Bearer <token>'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided!' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined in .env');

    // Verify the token and attach the decoded payload to the request
    const decoded = jwt.verify(token, secret) as { id: string };
    req.admin = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
