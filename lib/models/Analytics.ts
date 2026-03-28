import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAnalytics {
  _id: Types.ObjectId | string;
  ipAddress: string;
  route: string;
  referrer?: string;
  deviceType: string;
  isUnique: boolean;
  timestamp: Date;
}

const AnalyticsSchema = new Schema(
  {
    ipAddress: {
      type: String,
      required: true,
    },
    route: {
      type: String,
      required: true,
    },
    referrer: {
      type: String,
    },
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop',
    },
    isUnique: {
      type: Boolean,
      default: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

AnalyticsSchema.index({ timestamp: -1 });
AnalyticsSchema.index({ ipAddress: 1 });
AnalyticsSchema.index({ route: 1 });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
