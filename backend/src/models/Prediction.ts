import mongoose, { Document, Schema } from 'mongoose';

export interface IPrediction extends Document {
  studentId: mongoose.Types.ObjectId;
  probability: number;
  confidence: 'low' | 'medium' | 'high';
  featureImportance: { feature: string; importance: number }[];
  reason: string;
  inputFeatures: {
    cgpa: number;
    skillsCount: number;
    projectsCount: number;
    internshipsCount: number;
    resumeScore: number;
    codingScore: number;
    communicationScore: number;
    attendance: number;
    certificationsCount: number;
  };
  isAccurate?: boolean;
  actualPlaced?: boolean;
  createdAt: Date;
}

const predictionSchema = new Schema<IPrediction>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    probability: { type: Number, required: true, min: 0, max: 100 },
    confidence: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    featureImportance: [
      {
        feature: String,
        importance: Number,
      },
    ],
    reason: { type: String, required: true },
    inputFeatures: {
      cgpa: Number,
      skillsCount: Number,
      projectsCount: Number,
      internshipsCount: Number,
      resumeScore: Number,
      codingScore: Number,
      communicationScore: Number,
      attendance: Number,
      certificationsCount: Number,
    },
    isAccurate: Boolean,
    actualPlaced: Boolean,
  },
  { timestamps: true }
);

predictionSchema.index({ studentId: 1, createdAt: -1 });

export const Prediction = mongoose.model<IPrediction>('Prediction', predictionSchema);
