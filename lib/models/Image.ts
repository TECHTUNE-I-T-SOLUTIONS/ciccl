import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IImage {
  _id: Types.ObjectId | string;
  fileName?: string;
  filename?: string;
  originalName?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  uploadedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ImageSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
      unique: true,
    },
    filename: {
      type: String,
    },
    originalName: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },
    url: {
      type: String,
      required: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

ImageSchema.index({ uploadedAt: -1 });

export default mongoose.models.Image || mongoose.model<IImage>('Image', ImageSchema);
