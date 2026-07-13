import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  geminiApiKey?: string;
  mlModelAccuracy?: number;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    geminiApiKey: { type: String, trim: true },
    mlModelAccuracy: { type: Number },
  },
  { timestamps: true }
);

export const Settings = mongoose.model<ISettings>('Settings', settingsSchema);
