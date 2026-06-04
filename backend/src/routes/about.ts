// about.ts — Public and protected routes for the about section
import { Router, Request, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import About from '../models/about.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';
import { aboutRules, validate } from '../middleware/validators.js';

const router: IRouter = Router();

// GET /api/about - returns the about section content
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Find the single about document
    const about = await About.findOne();
    if (!about) {
      res.status(404).json({ message: 'About content not found' });
      return;
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching about content' });
  }
});

// PUT /api/about — update or create the about section (admin only)
router.put(
  '/',
  authMiddleware,
  aboutRules,
  validate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, bio, photoUrl, publicId } = req.body;
      const existing = await About.findOne();

      // Use new photo if provided, otherwise keep existing
      const finalPhotoUrl = photoUrl || existing?.photoUrl;
      const finalPublicId = publicId || existing?.publicId;

      // Delete old photo from Cloudinary if a new one was uploaded
      if (
        photoUrl &&
        existing?.publicId &&
        existing.publicId !== finalPublicId
      ) {
        await cloudinary.uploader.destroy(existing.publicId);
      }

      const about = await About.findOneAndUpdate(
        {},
        { title, bio, photoUrl: finalPhotoUrl, publicId: finalPublicId },
        { new: true, upsert: true },
      );

      res.json(about);
    } catch (error) {
      res.status(500).json({ message: 'Error updating about content' });
    }
  },
);

export default router;
