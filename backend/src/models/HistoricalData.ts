import mongoose, { Document, Schema } from 'mongoose';

export interface IHistoricalData extends Document {
  cgpa: number;
  skillsCount: number;
  projectsCount: number;
  internshipsCount: number;
  resumeScore: number;
  codingScore: number;
  communicationScore: number;
  attendance: number;
  certificationsCount: number;
  placed: boolean;
  createdAt: Date;
}

const historicalDataSchema = new Schema<IHistoricalData>(
  {
    cgpa: { type: Number, required: true },
    skillsCount: { type: Number, required: true },
    projectsCount: { type: Number, required: true },
    internshipsCount: { type: Number, required: true },
    resumeScore: { type: Number, required: true },
    codingScore: { type: Number, required: true },
    communicationScore: { type: Number, required: true },
    attendance: { type: Number, required: true },
    certificationsCount: { type: Number, required: true },
    placed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const HistoricalData = mongoose.model<IHistoricalData>('HistoricalData', historicalDataSchema);
