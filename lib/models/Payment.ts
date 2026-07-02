import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment {
  _id: Types.ObjectId | string;
  clientId?: string;
  serviceType: string;
  packageType: string;
  amount: number;
  currency: string;
  paymentMethod: 'paystack';
  transactionRef: string;
  status: 'pending' | 'success' | 'failed';
  paystackReference?: string;
  projectDetails: {
    name: string;
    description: string;
  };
  clientEmail: string;
  clientName: string;
  clientPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    serviceType: {
      type: String,
      required: true,
      trim: true,
    },
    packageType: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
    paymentMethod: {
      type: String,
      enum: ['paystack'],
      required: true,
    },
    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    paystackReference: {
      type: String,
    },
    projectDetails: {
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    clientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ status: 1 });
PaymentSchema.index({ clientId: 1 });
PaymentSchema.index({ createdAt: -1 });

// Force recompile on hot reload by deleting cached model
if (mongoose.models.Payment) {
  delete mongoose.models.Payment;
}

export default mongoose.model<IPayment>('Payment', PaymentSchema);