import mongoose, { Document, Schema } from 'mongoose';

export interface ISelectionRound {
  name: string;
  description: string;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface ICompany extends Document {
  name: string;
  description: string;
  industry: string;
  website: string;
  logo?: string;
  minCgpa: number;
  skillsRequired: string[];
  preferredProjects: string[];
  eligibleDepartments: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    details?: string;
  };
  selectionProcess: {
    rounds: ISelectionRound[];
    totalDuration?: string;
  };
  isActive: boolean;
  location?: string;
  hiringCount?: number;
  pastRecruitment?: {
    year: number;
    studentsHired: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true },
    industry: { type: String, required: true },
    website: { type: String },
    logo: { type: String },
    minCgpa: { type: Number, required: true, min: 0, max: 10 },
    skillsRequired: [{ type: String, lowercase: true, trim: true }],
    preferredProjects: [{ type: String, trim: true }],
    eligibleDepartments: [{ type: String, lowercase: true, trim: true }],
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
      details: String,
    },
    selectionProcess: {
      rounds: [
        {
          name: { type: String, required: true },
          description: { type: String, required: true },
          duration: Number,
          difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard'],
          },
        },
      ],
      totalDuration: String,
    },
    isActive: { type: Boolean, default: true },
    location: String,
    hiringCount: Number,
    pastRecruitment: [
      {
        year: Number,
        studentsHired: Number,
      },
    ],
  },
  { timestamps: true }
);

companySchema.index({ skillsRequired: 1 });
companySchema.index({ eligibleDepartments: 1 });
companySchema.index({ 'salary.max': -1 });

export const Company = mongoose.model<ICompany>('Company', companySchema);
