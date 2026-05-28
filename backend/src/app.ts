// app.ts - Main entry point, connects everything together
import express, { Express } from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import './config/cloudinary.js';
import photosRouter from './routes/photos.js';
import adminRouter from './routes/admin.js';
import authRouter from './routes/auth.js';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Allow requests from the frontend origin
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Parse incoming JSON requests
app.use(express.json());

// Register routes
app.use('/api/photos', photosRouter);
app.use('/api/admin', adminRouter);
app.use('/api/auth', authRouter);

// Health check - useful to verify the server is running on Vercel
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
connectDB();

// Vercel uses the exported app, not app.listen()

export default app;
