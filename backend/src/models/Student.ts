import mongoose, { Document, Schema } from 'mongoose';

export interface IAcademicDetails {
  cgpa: number;
  department: string;
  year: string;
  batch: string;
  rollNumber: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  graduationYear: number;
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  isVerified: boolean;
}

export interface ICertificate {
  name: string;
  issuer: string;
  date: Date;
  url?: string;
  isVerified: boolean;
}

export interface IExperience {
  company: string;
  role: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  isVerified: boolean;
}

export interface IAchievement {
  title: string;
  description: string;
  date: Date;
  type: string;
}

export interface ICodingProfile {
  platform: string;
  username: string;
  profileUrl: string;
  rating?: number;
  problemsSolved?: number;
  lastSynced?: Date;
}

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  phone?: string;
  avatar?: string;
  bio?: string;
  academic: IAcademicDetails;
  skills: string[];
  projects: IProject[];
  certificates: ICertificate[];
  experiences: IExperience[];
  achievements: IAchievement[];
  codingProfiles: ICodingProfile[];
  githubUrl?: string;
  linkedinUrl?: string;
  languages: string[];
  resumeUrl?: string;
  resumeText?: string;
  resumeScore?: number;
  profileCompletion: number;
  isPlacementReady: boolean;
  attendance: number;
  communicationScore: number;
  codingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    academic: {
      cgpa: { type: Number, required: true, min: 0, max: 10 },
      department: { type: String },
      year: { type: String },
      batch: { type: String },
      rollNumber: { type: String },
      tenthPercentage: { type: Number },
      twelfthPercentage: { type: Number },
      graduationYear: { type: Number, required: true },
    },
    skills: [{ type: String, lowercase: true, trim: true }],
    projects: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [String],
        url: String,
        isVerified: { type: Boolean, default: false },
      },
    ],
    certificates: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: Date,
        url: String,
        isVerified: { type: Boolean, default: false },
      },
    ],
    experiences: [
      {
        company: { type: String, required: true },
        role: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: Date,
        description: { type: String, required: true },
        isVerified: { type: Boolean, default: false },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: String,
        date: Date,
        type: { type: String },
      },
    ],
    codingProfiles: [
      {
        platform: { type: String, required: true },
        username: { type: String, required: true },
        profileUrl: String,
        rating: Number,
        problemsSolved: Number,
        lastSynced: Date,
      },
    ],
    githubUrl: { type: String },
    linkedinUrl: { type: String },
    languages: [{ type: String }],
    resumeUrl: { type: String },
    resumeText: { type: String },
    resumeScore: { type: Number, default: 0 },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    isPlacementReady: { type: Boolean, default: false },
    attendance: { type: Number, default: 0, min: 0, max: 100 },
    communicationScore: { type: Number, default: 0, min: 0, max: 100 },
    codingScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

studentSchema.index({ 'academic.department': 1, 'academic.graduationYear': 1 });
studentSchema.index({ skills: 1 });
studentSchema.index({ 'academic.cgpa': -1 });

export const Student = mongoose.model<IStudent>('Student', studentSchema);
