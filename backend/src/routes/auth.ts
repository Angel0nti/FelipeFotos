// auth.ts Admin login route, generates a JWT token
import { Router, Request, Response, IRouter } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { loginRules, validate } from '../middleware/validators.js';

const router: IRouter = Router();

// Post /api/auth/login - receives password, returns token if valid
router.post(
  '/login',
  loginLimiter,
  loginRules,
  validate,
  async (req: Request, res: Response): Promise<void> => {
    const { password } = req.body;

    const adminPassword = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!adminPassword || !jwtSecret) {
      res.status(500).json({ message: 'Server configuration error' });
      return;
    }

    //   Compare the received password with the hashed one stored in the .env
    const isValid = await bcrypt.compare(password, adminPassword);
    if (!isValid) {
      res.status(401).json({ message: 'Invalid password' });
      return;
    }

    //   Generate a token valid for 8 hours
    const token = jwt.sign({ id: 'admin' }, jwtSecret, { expiresIn: '8h' });
    res.json({ token });
  },
);

export default router;
