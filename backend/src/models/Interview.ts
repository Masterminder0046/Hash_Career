import mongoose, { Document, Schema } from 'mongoose';
import { InterviewType } from '../types';

export interface IQuestion {
  question: string;
  userAnswer: string;
  evaluation: {
    grammar: number;
    technicalAccuracy: number;
    confidence: number;
    completeness: number;
    communication: number;
    feedback: string;
    suggestions: string[];
  };
}

export interface IInterview extends Document {
  studentId: mongoose.Types.ObjectId;
  type: InterviewType;
  status: 'in_progress' | 'completed';
  questions: IQuestion[];
  overallScore: number;
  report: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallFeedback: string;
  };
  duration: number;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(InterviewType),
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    questions: [
      {
        question: { type: String, required: true },
        userAnswer: { type: String, default: '' },
        evaluation: {
          grammar: { type: Number, default: 0 },
          technicalAccuracy: { type: Number, default: 0 },
          confidence: { type: Number, default: 0 },
          completeness: { type: Number, default: 0 },
          communication: { type: Number, default: 0 },
          feedback: String,
          suggestions: [String],
        },
      },
    ],
    overallScore: { type: Number, default: 0 },
    report: {
      strengths: [String],
      weaknesses: [String],
      recommendations: [String],
      overallFeedback: String,
    },
    duration: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

export const Interview = mongoose.model<IInterview>('Interview', interviewSchema);
