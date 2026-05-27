// db.ts MongoDB connection setup
import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Read the connection string from environment variables
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGOO_URI is not defined in .env');

    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit the process if we can't connect
    process.exit(1);
  }
};
export default connectDB;
