import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { Company } from '../models/Company';

export const getCompanyMatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found. Complete your profile first.' });
    }

    const companies = await Company.find({ isActive: true });

    const matches = companies.map((company) => {
      const { score, details } = calculateMatch(student, company);
      return { company, matchScore: score, ...details };
    });

    matches.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      data: matches.slice(0, 50),
      total: matches.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyMatchDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const company = await Company.findById(req.params.companyId);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    const { score, details } = calculateMatch(student, company);
    res.json({ success: true, data: { company, matchScore: score, ...details } });
  } catch (error) {
    next(error);
  }
};

const calculateMatch = (student: any, company: any) => {
  let score = 0;
  const details: any = {
    missingSkills: [],
    missingCertificates: [],
    missingProjects: [],
    eligible: true,
    reasons: [],
    rejectReasons: [],
  };

  const CGPA_WEIGHT = 25;
  const SKILL_WEIGHT = 35;
  const PROJECT_WEIGHT = 15;
  const DEPARTMENT_WEIGHT = 15;
  const CERT_WEIGHT = 10;

  if (student.academic.cgpa >= company.minCgpa) {
    const cgpaBonus = Math.min(25, (student.academic.cgpa / 10) * CGPA_WEIGHT);
    score += cgpaBonus;
    details.reasons.push(`CGPA ${student.academic.cgpa} meets minimum requirement of ${company.minCgpa}`);
  } else {
    details.eligible = false;
    details.rejectReasons.push(`CGPA ${student.academic.cgpa} is below minimum ${company.minCgpa}`);
  }

  const dept = student.academic.department?.toLowerCase();
  const deptEligible = company.eligibleDepartments.some((d: string) => dept?.includes(d.toLowerCase()));
  if (deptEligible) {
    score += DEPARTMENT_WEIGHT;
    details.reasons.push('Department is eligible');
  } else if (company.eligibleDepartments.length > 0) {
    details.eligible = false;
    details.rejectReasons.push(`Department ${dept} is not eligible`);
  }

  const studentSkills = new Set(student.skills.map((s: string) => s.toLowerCase()));
  const matchedSkills = company.skillsRequired.filter((s: string) => studentSkills.has(s.toLowerCase()));
  const missing = company.skillsRequired.filter((s: string) => !studentSkills.has(s.toLowerCase()));

  details.missingSkills = missing;
  if (company.skillsRequired.length > 0) {
    const skillScore = (matchedSkills.length / company.skillsRequired.length) * SKILL_WEIGHT;
    score += skillScore;
    details.reasons.push(`Matched ${matchedSkills.length}/${company.skillsRequired.length} required skills`);
  }

  const studentProjects = new Set(student.projects.map((p: any) => p.title.toLowerCase()));
  const matchedProjects = company.preferredProjects.filter((p: string) =>
    studentProjects.has(p.toLowerCase()) || student.skills.some((s: string) => p.toLowerCase().includes(s.toLowerCase()))
  );
  const missingProjects = company.preferredProjects.filter(
    (p: string) => !matchedProjects.includes(p)
  );

  details.missingProjects = missingProjects;
  if (company.preferredProjects.length > 0) {
    const projScore = (matchedProjects.length / company.preferredProjects.length) * PROJECT_WEIGHT;
    score += projScore;
  } else {
    score += student.projects.length > 0 ? PROJECT_WEIGHT : 0;
  }

  const studentCerts = new Set(student.certificates.map((c: any) => c.name.toLowerCase()));
  const certMatch = studentCerts.size > 0 ? CERT_WEIGHT : 0;
  score += certMatch;

  const finalScore = Math.min(100, Math.round(score));

  return {
    score: finalScore,
    details: {
      ...details,
      matchedSkills,
      matchedProjects,
      cgpaStatus: student.academic.cgpa >= company.minCgpa ? 'meets' : 'below',
      departmentStatus: deptEligible ? 'eligible' : 'not-eligible',
      eligibilityPercentage: finalScore,
      summary: generateMatchSummary(finalScore, details),
    },
  };
};

const generateMatchSummary = (score: number, details: any): string => {
  if (score >= 80) return 'Excellent match! You are well-prepared for this company.';
  if (score >= 60) return 'Good match. Focus on filling the skill gaps to improve your chances.';
  if (score >= 40) return 'Moderate match. Consider improving your skills and projects for this company.';
  return 'Low match. You may need significant preparation to be eligible for this company.';
};
