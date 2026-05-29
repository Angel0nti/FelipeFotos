// hero.ts — Public and protected routes for the hero section
import { Router, Request, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Hero from '../models/hero.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';

const router: IRouter = Router();

// Store uploaded files in memory before sending to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// PUT /api/hero — update the hero image (admin only)
router.put(
  '/',
  authMiddleware,
  upload.single('photo'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file provided' });
        return;
      }

      const existing = await Hero.findOne();

      // Delete old hero image from Cloudinary if exists
      if (existing?.publicId) {
        await cloudinary.uploader.destroy(existing.publicId);
      }

      // Upload new hero image to Cloudinary
      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'felipe-fotografia/hero' },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });

      // Update existing or create new
      const hero = await Hero.findOneAndUpdate(
        {},
        { photoUrl: uploadResult.secure_url, publicId: uploadResult.public_id },
        { new: true, upsert: true },
      );

      res.json(hero);
    } catch (error) {
      res.status(500).json({ message: 'Error updating hero image' });
    }
  },
);

export default router;
