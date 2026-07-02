import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInquiry {
  _id: Types.ObjectId | string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  budgetRange: string;
  message: string;
  whatsappSent: boolean;
  status: 'new' | 'contacted' | 'converted';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    projectType: {
      type: String,
      required: true,
    },
    budgetRange: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 10,
    },
    whatsappSent: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

InquirySchema.index({ email: 1 });
InquirySchema.index({ status: 1 });
InquirySchema.index({ createdAt: -1 });

export default mongoose.models.Inquiry || mongoose.model<IInquiry>('Inquiry', InquirySchema);