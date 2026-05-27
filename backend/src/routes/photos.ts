// phoos.ts Public routes to fetch photos
import { Router, Request, Response, IRouter } from 'express';
import Photo from '../models/photo.js';

const router: IRouter = Router();

// Get /api/photos - returns all active photos
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const photos = await Photo.find({ active: true }).sort({ order: 1 });
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching photos' });
  }
});

// Get /api/photos/:category - returns active photos filtered by category
router.get('/:category', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.params;

    const photos = await Photo.find({ category, active: true }).sort({
      order: 1,
    });

    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching photos by category' });
  }
});

export default router;
