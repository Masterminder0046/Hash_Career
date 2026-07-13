import { Request } from 'express';

export enum UserRole {
  STUDENT = 'student',
  OFFICER = 'placement_officer',
  ADMIN = 'admin',
}

export enum InterviewType {
  HR = 'hr',
  TECHNICAL = 'technical',
  JAVA = 'java',
  PYTHON = 'python',
  REACT = 'react',
  NODE = 'node',
  SQL = 'sql',
  DBMS = 'dbms',
  OS = 'os',
  CN = 'cn',
  DSA = 'dsa',
  APTITUDE = 'aptitude',
}

export enum RoadmapDuration {
  DAYS_30 = 30,
  DAYS_60 = 60,
  DAYS_90 = 90,
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
