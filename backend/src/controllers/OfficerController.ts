import { Response, NextFunction } from 'express';
import { AuthRequest, UserRole } from '../types';
import { Student } from '../models/Student';
import { Prediction } from '../models/Prediction';
import { Company } from '../models/Company';
import { User } from '../models/User';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const totalStudents = await Student.countDocuments();
    const studentsWithResume = await Student.countDocuments({ resumeUrl: { $ne: null } });
    const placementReady = await Student.countDocuments({ isPlacementReady: true });

    const students = await Student.find();
    const avgResumeScore = students.reduce((sum, s) => sum + (s.resumeScore || 0), 0) / (students.length || 1);
    const avgCgpa = students.reduce((sum, s) => sum + s.academic.cgpa, 0) / (students.length || 1);

    const lowCgpa = await Student.countDocuments({ 'academic.cgpa': { $lt: 7 } });
    const atRisk = await Student.countDocuments({
      $or: [
        { 'academic.cgpa': { $lt: 6.5 } },
        { resumeScore: { $lt: 40 } },
        { skills: { $size: 0 } },
      ],
    });

    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$academic.department',
          count: { $sum: 1 },
          avgCgpa: { $avg: '$academic.cgpa' },
          avgResumeScore: { $avg: { $ifNull: ['$resumeScore', 0] } },
          placementReady: { $sum: { $cond: ['$isPlacementReady', 1, 0] } },
        },
      },
    ]);

    const allSkills = students.flatMap((s) => s.skills);
    const skillFrequency: Record<string, number> = {};
    allSkills.forEach((s) => { skillFrequency[s] = (skillFrequency[s] || 0) + 1; });
    const mostMissingSkills = Object.entries(skillFrequency)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    const predictions = await Prediction.find().sort({ createdAt: -1 }).limit(100);
    const avgProbability = predictions.reduce((sum, p) => sum + p.probability, 0) / (predictions.length || 1);

    const companies = await Company.find();
    const companyEligibility = companies.map((c) => {
      const eligible = students.filter((s) => s.academic.cgpa >= c.minCgpa).length;
      return { company: c.name, eligible, total: students.length, percentage: Math.round((eligible / students.length) * 100) };
    });

    res.json({
      success: true,
      data: {
        totalStudents,
        studentsWithResume,
        placementReady,
        atRisk,
        lowCgpa,
        avgResumeScore: Math.round(avgResumeScore),
        avgCgpa: Math.round(avgCgpa * 100) / 100,
        avgPlacementProbability: Math.round(avgProbability),
        departmentStats,
        mostMissingSkills,
        companyEligibility,
        skillDistribution: Object.entries(skillFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([skill, count]) => ({ skill, count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentsList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, department, search, sort = '-academic.cgpa' } = req.query;

    const query: any = {};
    if (department) query['academic.department'] = department;
    if (search) {
      const userQuery = await User.find({
        role: UserRole.STUDENT,
        name: { $regex: search, $options: 'i' },
      }).select('_id');
      query.userId = { $in: userQuery.map((u) => u._id) };
    }

    const students = await Student.find(query)
      .populate('userId', 'name email')
      .sort(sort as string)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const predictions = await Prediction.find({ studentId: student._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: { student, predictions } });
  } catch (error) {
    next(error);
  }
};

export const exportCsv = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const students = await Student.find().populate('userId', 'name email').lean();

    const csvRows = ['Name,Email,Department,CGPA,Skills,ResumeScore,Projects,Internships,PlacementReady'];
    students.forEach((s: any) => {
      csvRows.push(
        `"${s.userId?.name || ''}","${s.userId?.email || ''}","${s.academic.department || ''}",${s.academic.cgpa},"${s.skills.join('; ')}",${s.resumeScore || 0},${s.projects.length},${s.experiences.length},${s.isPlacementReady}`
      );
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.send(csvRows.join('\n'));
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, department, year, batch, rollNumber, cgpa } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: UserRole.STUDENT,
    });

    const student = await Student.create({
      userId: user._id,
      academic: {
        cgpa: cgpa || 0,
        department: department || '',
        year: year || '',
        batch: batch || '',
        rollNumber: rollNumber || '',
        graduationYear: new Date().getFullYear() + 4,
      },
      skills: [],
      projects: [],
      certificates: [],
      experiences: [],
      achievements: [],
      codingProfiles: [],
      languages: [],
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully!',
      data: {
        user,
        student,
      },
    });
  } catch (error) {
    next(error);
  }
};
