// admin.ts Protected routes for photo management
import { Router, Request, Response, IRouter } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import Photo from '../models/photo.js';
import authMiddleware, { AuthRequest } from '../middleware/auth.js';

const router: IRouter = Router();

// Store uplodaded files in memory before sending yo Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/admin/photos - upload a new photo
router.post(
  '/photos',
  authMiddleware,
  upload.single('photo'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file provided' });
        return;
      }
      const { category, order, photoTitle } = req.body;

      // Upload the file buffer to Cloudinary inside a category folder
      const uploadResult = await new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `felipe-fotografia/${category}` },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result);
          },
        );
        stream.end(req.file!.buffer);
      });

      //   Save the Cloudinary URL and metadata to MongoDB
      const photo = await Photo.create({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        category,
        order: Number(order) || 0,
        photoTitle,
      });
      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: 'Error uploading photo' });
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
export default router;
