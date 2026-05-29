// app.ts - Main entry point, connects everything together
import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import './config/cloudinary.js';
import photosRouter from './routes/photos.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';
import aboutRouter from './routes/about.js';
import heroRouter from './routes/hero.js';

const app: Express = express();

// Only allow requests from the production frontend
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Parse incoming JSON requests
app.use(express.json());

// Register routes
app.use('/api/photos', photosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);
app.use('/api/about', aboutRouter);
app.use('/api/hero', heroRouter);

// Health check - useful to verify the server is running on Vercel
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
connectDB();

// Listen locally — Vercel uses the exported app instead
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
export default app;
