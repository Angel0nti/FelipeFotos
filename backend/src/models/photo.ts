// photo.ts Mongoose schema for a photo document
import mongoose, { Schema } from 'mongoose';

// Interface to type the Phot document in TypeScript
export interface IPhoto extends Document {
  url: string; // Cloudinary URL of the full image
  publicId: string; // Cloudinary public_id - needed to delete the image
  category: string; // Category: weddings, outdoors, graduations,studio, events
  order: number; // Display order within the category
  photoTitle?: string; // Optional title for the photo
  active: boolean; // Whether the photo is visible on the site
  createdAt: Date;
}

const PhotoSchema = new Schema<IPhoto>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    category: {
      type: String,
      required: true,
      // Only allow these category values
      enum: ['weddings', 'outdoors', 'graduations', 'studio', 'events'],
    },
    order: { type: Number, required: true },
    photoTitle: { type: String },
    active: { type: Boolean, default: true },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
);

export default mongoose.model<IPhoto>('Photo', PhotoSchema);
