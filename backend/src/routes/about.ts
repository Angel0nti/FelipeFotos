// about.ts — Public and protected routes for the about section
import { Router, Request, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import About from '../models/about.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';

const router: IRouter = Router();

// Store uplodaded files in memory before sending to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

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

// PUT /api/about - update or create the about section (admin only)
// PUT /api/about — update or create the about section (admin only)
router.put(
  '/',
  authMiddleware,
  upload.single('photo'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, bio } = req.body;
      const existing = await About.findOne();

      let photoUrl = existing?.photoUrl;
      let publicId = existing?.publicId;

      // Only update photo if a new one was uploaded
      if (req.file) {
        if (existing?.publicId) {
          await cloudinary.uploader.destroy(existing.publicId);
        }

        const uploadResult = await new Promise<{
          secure_url: string;
          public_id: string;
        }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'felipe-fotografia/about' },
            (error, result) => {
              if (error || !result) return reject(error);
              resolve(result);
            },
          );
          stream.end(req.file!.buffer);
        });

        photoUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      }

      // Update existing or create new — always preserve photo if not changed
      const about = await About.findOneAndUpdate(
        {},
        { title, bio, photoUrl, publicId },
        { new: true, upsert: true },
      );

      res.json(about);
    } catch (error) {
      res.status(500).json({ message: 'Error updating about content' });
    }
  },
);

export default router;
