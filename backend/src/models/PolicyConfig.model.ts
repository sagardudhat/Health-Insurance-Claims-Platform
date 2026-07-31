import mongoose, { Document, Schema } from 'mongoose';

export interface IPolicyConfigDocument extends Document {
  year: number;
  annualLimit: number;
  deductible: number;
  coverageRate: number; // e.g. 0.8 for 80%
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PolicyConfigSchema = new Schema<IPolicyConfigDocument>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    annualLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    deductible: {
      type: Number,
      required: true,
      min: 0,
    },
    coverageRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const PolicyConfig = mongoose.model<IPolicyConfigDocument>(
  'PolicyConfig',
  PolicyConfigSchema
);
