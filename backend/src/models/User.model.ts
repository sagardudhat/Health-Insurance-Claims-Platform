import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '../types';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['provider', 'reviewer', 'admin'],
      default: 'provider',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Exclude passwordHash when converting doc to JSON
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as unknown as Record<string, unknown>).passwordHash;
    delete (ret as unknown as Record<string, unknown>).__v;
    return ret;
  },
});

export const User = mongoose.model<IUserDocument>('User', userSchema);
