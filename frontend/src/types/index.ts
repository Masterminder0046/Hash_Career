export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'placement_officer' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: { token: string; user: User };
}

export interface StudentProfile {
  _id: string;
  userId: User;
  phone?: string;
  avatar?: string;
  bio?: string;
  academic: AcademicDetails;
  skills: string[];
  projects: Project[];
  certificates: Certificate[];
  experiences: Experience[];
  achievements: Achievement[];
  codingProfiles: CodingProfile[];
  githubUrl?: string;
  linkedinUrl?: string;
  languages: string[];
  resumeUrl?: string;
  resumeScore: number;
  profileCompletion: number;
  isPlacementReady: boolean;
  attendance: number;
  communicationScore: number;
  codingScore: number;
}

export interface AcademicDetails {
  cgpa: number;
  department: string;
  year: string;
  batch: string;
  rollNumber: string;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  graduationYear: number;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  url?: string;
  isVerified: boolean;
}

export interface Certificate {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  isVerified: boolean;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  isVerified: boolean;
}

export interface Achievement {
  title: string;
  description: string;
  date: string;
  type: string;
}

export interface CodingProfile {
  platform: string;
  username: string;
  profileUrl: string;
  rating?: number;
  problemsSolved?: number;
}

export interface Company {
  _id: string;
  name: string;
  description: string;
  industry: string;
  website: string;
  logo?: string;
  minCgpa: number;
  skillsRequired: string[];
  preferredProjects: string[];
  eligibleDepartments: string[];
  salary: { min: number; max: number; currency: string; details?: string };
  selectionProcess: { rounds: SelectionRound[]; totalDuration?: string };
  location?: string;
  hiringCount?: number;
  isActive: boolean;
}

export interface SelectionRound {
  name: string;
  description: string;
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CompanyMatch {
  company: Company;
  matchScore: number;
  missingSkills: string[];
  missingCertificates: string[];
  missingProjects: string[];
  eligible: boolean;
  reasons: string[];
  rejectReasons: string[];
  matchedSkills: string[];
  eligibilityPercentage: number;
  summary: string;
}

export interface Prediction {
  _id: string;
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
  createdAt: string;
}

export interface SkillGap {
  totalGaps: number;
  currentSkills: number;
  requiredSkills: number;
  coverage: number;
  missingSkills: { skill: string; priority: number; difficulty: string; companies: string[] }[];
  learningOrder: { skill: string; order: number; estimatedDays: number; priority: string }[];
  recommendations: string[];
}

export interface Roadmap {
  _id: string;
  duration: number;
  targetCompany?: string;
  weeks: RoadmapWeek[];
  interviewPreparation: { topics: string[]; resources: any[]; tips: string[] };
  completedWeeks: number[];
  progress: number;
  createdAt: string;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: { title: string; url?: string; type: string }[];
  projects: { title: string; description: string; technologies: string[] }[];
  practicePlatforms: { name: string; url?: string; focusArea: string }[];
}

export interface Interview {
  _id: string;
  type: string;
  status: 'in_progress' | 'completed';
  questions: InterviewQuestion[];
  overallScore: number;
  report?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    overallFeedback: string;
  };
  createdAt: string;
}

export interface InterviewQuestion {
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

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface OfficerDashboard {
  totalStudents: number;
  studentsWithResume: number;
  placementReady: number;
  atRisk: number;
  avgResumeScore: number;
  avgCgpa: number;
  avgPlacementProbability: number;
  departmentStats: { _id: string; count: number; avgCgpa: number; avgResumeScore: number; placementReady: number }[];
  mostMissingSkills: { skill: string; count: number }[];
  companyEligibility: { company: string; eligible: number; total: number; percentage: number }[];
  skillDistribution: { skill: string; count: number }[];
}

export interface AdminDashboard {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalOfficers: number;
    totalAdmins: number;
    totalCompanies: number;
    totalPredictions: number;
    totalInterviews: number;
    totalRoadmaps: number;
    unreadNotifications: number;
  };
  recentUsers: any[];
  recentActivities: any[];
}
