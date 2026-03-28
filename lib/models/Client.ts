import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IClient {
  _id: Types.ObjectId | string;
  userId: string;
  companyName?: string;
  projectName: string;
  projectDescription: string;
  projectType: string;
  budgetRange: {
    min: number;
    max: number;
  };
  location?: string;
  attachmentUrl?: string;
  status: 'pending' | 'in-review' | 'approved' | 'completed';
  adminNotes?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    projectType: {
      type: String,
      required: true,
      trim: true,
    },
    budgetRange: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
    },
    location: {
      type: String,
      trim: true,
    },
    attachmentUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'approved', 'completed'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ClientSchema.index({ userId: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ createdAt: -1 });

export default mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);
