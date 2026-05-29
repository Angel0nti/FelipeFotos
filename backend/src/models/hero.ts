// hero.ts — Schema for the hero section image
import mongoose, { Schema, Document } from 'mongoose';

export interface IHero extends Document {
  photoUrl: string; // Cloudinary URL of the hero image
  publicId: string; // Cloudinary public_id for deletion
}

const HeroSchema = new Schema<IHero>(
  {
    photoUrl: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IHero>('Hero', HeroSchema);
