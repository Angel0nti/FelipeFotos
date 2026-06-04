// hero.ts — Public and protected routes for the hero section
import { Router, Request, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import Hero from '../models/hero.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';

const router: IRouter = Router();

// GET /api/hero — returns the hero image
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const hero = await Hero.findOne();
    if (!hero) {
      res.status(404).json({ message: 'Hero image not found' });
      return;
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching hero image' });
  }
});

// PUT /api/hero — update hero image with Cloudinary URL (admin only)
router.put(
  '/',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { photoUrl, publicId } = req.body;

      if (!photoUrl || !publicId) {
        res.status(400).json({ message: 'Missing photoUrl or publicId' });
        return;
      }

      const existing = await Hero.findOne();

      // Delete old hero image from Cloudinary if exists
      if (existing?.publicId && existing.publicId !== publicId) {
        await cloudinary.uploader.destroy(existing.publicId);
      }

      const hero = await Hero.findOneAndUpdate(
        {},
        { photoUrl, publicId },
        { new: true, upsert: true },
      );

      res.json(hero);
    } catch (error) {
      res.status(500).json({ message: 'Error updating hero image' });
    }
  },
);

export default router;
