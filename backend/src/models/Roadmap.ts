import mongoose, { Document, Schema } from 'mongoose';

export interface IRoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: { title: string; url?: string; type: string }[];
  projects: { title: string; description: string; technologies: string[] }[];
  practicePlatforms: { name: string; url?: string; focusArea: string }[];
}

export interface IRoadmap extends Document {
  studentId: mongoose.Types.ObjectId;
  duration: number;
  targetCompany?: string;
  skillGap: string[];
  weeks: IRoadmapWeek[];
  interviewPreparation: {
    topics: string[];
    resources: { title: string; url?: string }[];
    tips: string[];
  };
  completedWeeks: number[];
  isActive: boolean;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const roadmapSchema = new Schema<IRoadmap>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    duration: { type: Number, required: true },
    targetCompany: { type: String },
    skillGap: [String],
    weeks: [
      {
        week: { type: Number, required: true },
        title: { type: String, required: true },
        topics: [String],
        resources: [
          {
            title: String,
            url: String,
            type: { type: String },
          },
        ],
        projects: [
          {
            title: String,
            description: String,
            technologies: [String],
          },
        ],
        practicePlatforms: [
          {
            name: String,
            url: String,
            focusArea: String,
          },
        ],
      },
    ],
    interviewPreparation: {
      topics: [String],
      resources: [{ title: String, url: String }],
      tips: [String],
    },
    completedWeeks: [Number],
    isActive: { type: Boolean, default: true },
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
