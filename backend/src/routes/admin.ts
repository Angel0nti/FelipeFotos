// admin.ts Protected routes for photo management
import { Router, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';

import Photo from '../models/photo.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';

const router: IRouter = Router();

// GET /api/admin/photos — returns ALL photos including inactive ones
router.get(
  '/photos',
  authMiddleware,
  async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const photos = await Photo.find().sort({ order: 1 });
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching photos' });
    }
  },
);

router.get(
  '/sign-upload',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { folder } = req.query;
      const timestamp = Math.round(new Date().getTime() / 1000);

      // Generate signature using Cloudinary API secret
      const signature = cloudinary.utils.api_sign_request(
        { timestamp },
        process.env.CLOUDINARY_API_SECRET!,
      );

      console.log('folder recibido:', folder);
      console.log('timestamp:', timestamp);
      console.log('signature:', signature);

      res.json({
        timestamp,
        signature,
        folder: `felipe-fotografia/${folder}`,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      });
    } catch (error) {
      res.status(500).json({ message: 'Error generating signature' });
    }
  },
);

// POST /api/admin/photos — saves photo metadata after direct Cloudinary upload
router.post(
  '/photos',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { url, publicId, category, order, photoTitle } = req.body;

      if (!url || !publicId || !category) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      // Save the Cloudinary URL and metadata to MongoDB
      const photo = await Photo.create({
        url,
        publicId,
        category,
        order: Number(order) || 0,
        photoTitle,
      });

      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Error saving photo' });
    }
  },
);

// PATCH /api/admin/photos/:id - update order or active status
router.patch(
  '/photos/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { order, active, photoTitle } = req.body;

      const photo = await Photo.findByIdAndUpdate(
        req.params.id,
        { order, active, photoTitle },
        // Return the updated document
        { new: true },
      );

      if (!photo) {
        res.status(404).json({ message: 'Photo not found' });
        return;
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: ' Error updating photo' });
    }
  },
);
// DELETE /api/admin/photos/:id - Delete a photo from MongoDB and Cloudinary
router.delete(
  '/photos/:id',
  authMiddleware,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const photo = await Photo.findById(req.params.id);

      if (!photo) {
        res.status(404).json({ message: 'Photo not found' });
        return;
      }

      // Remove the image from Cloudinary using its public_id
      await cloudinary.uploader.destroy(photo.publicId);

      //   Remove the document from MongoDB
      await photo.deleteOne();
      res.json({ message: 'Photo deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deletng photo' });
    }
  },
);

export default router;
