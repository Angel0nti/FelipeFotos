// about.ts - Schema for the about section content
import mongoose, { Schema, Document } from 'mongoose';

export interface IAbout extends Document {
  title: string; //Section heading
  bio: string; // Bio text
  photoUrl: string; // Cloudinary URL of the about pic
  publicId: string; // Cloudinary public_id for the pic deletion
}

const AboutSchema = new Schema<IAbout>(
  {
    title: { type: String, required: true },
    bio: { type: String, required: true },
    photoUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true },
);
export default mongoose.model<IAbout>('About', AboutSchema);
