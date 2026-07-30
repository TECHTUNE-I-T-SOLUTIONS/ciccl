import mongoose, { Schema, Document, Types } from 'mongoose';
import { PROJECT_TYPES, ProjectType } from '@/lib/constants/projectTypes';

export interface IProject {
  _id: Types.ObjectId | string;
  title: string;
  slug: string;
  description: string;
  shortSummary: string;
  coverImage?: string;
  images: string[];
  problemsSolved: string[];
  features: string[];
  budgetScope: {
    min: number;
    max: number;
    currency: string;
  };
  timeline: {
    startDate: Date;
    endDate: Date;
  };
  deliverables: string[];
  hashtags: string[];
  projectType: ProjectType;
  documents?: {
    name: string;
    url: string;
  }[];
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortSummary: {
      type: String,
      required: true,
      maxlength: 500,
    },
    coverImage: {
      type: String,
    },
    images: [
      {
        type: String,
      },
    ],
    problemsSolved: [
      {
        type: String,
      },
    ],
    features: [
      {
        type: String,
      },
    ],
    budgetScope: {
      min: {
        type: Number,
        required: true,
      },
      max: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: 'NGN',
      },
    },
    timeline: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    deliverables: [
      {
        type: String,
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
      },
    ],
    projectType: {
      type: String,
      enum: PROJECT_TYPES as unknown as string[],
      required: true,
    },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ hashtags: 1 });
ProjectSchema.index({ projectType: 1 });
ProjectSchema.index({ isFeatured: 1 });
ProjectSchema.index({ isPublished: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
