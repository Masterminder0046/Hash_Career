import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { Settings } from '../models/Settings';
import { Notification } from '../models/Notification';
import { Prediction } from '../models/Prediction';
import { Interview } from '../models/Interview';
import { Roadmap } from '../models/Roadmap';

export const getAdminDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [users, students, companies, predictions, interviews, roadmaps, notifications] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      Company.countDocuments(),
      Prediction.countDocuments(),
      Interview.countDocuments(),
      Roadmap.countDocuments(),
      Notification.countDocuments({ isRead: false }),
    ]);

    const studentsByRole = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'placement_officer' }),
      User.countDocuments({ role: 'admin' }),
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(10).select('-password');
    const recentActivities = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers: users,
          totalStudents: studentsByRole[0],
          totalOfficers: studentsByRole[1],
          totalAdmins: studentsByRole[2],
          totalCompanies: companies,
          totalPredictions: predictions,
          totalInterviews: interviews,
          totalRoadmaps: roadmaps,
          unreadNotifications: notifications,
        },
        recentUsers,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const logs = await Prediction.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({ path: 'studentId', select: 'academic.department academic.cgpa', populate: { path: 'userId', select: 'name email' } });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

export const manageUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'student') {
      await Student.deleteOne({ userId: user._id });
    }
    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const students = await Student.find();

    const cgpaDistribution = [
      { range: '9-10', count: students.filter((s) => s.academic.cgpa >= 9).length },
      { range: '8-9', count: students.filter((s) => s.academic.cgpa >= 8 && s.academic.cgpa < 9).length },
      { range: '7-8', count: students.filter((s) => s.academic.cgpa >= 7 && s.academic.cgpa < 8).length },
      { range: '6-7', count: students.filter((s) => s.academic.cgpa >= 6 && s.academic.cgpa < 7).length },
      { range: 'Below 6', count: students.filter((s) => s.academic.cgpa < 6).length },
    ];

    const allSkills = students.flatMap((s) => s.skills);
    const skillCounts: Record<string, number> = {};
    allSkills.forEach((s) => { skillCounts[s] = (skillCounts[s] || 0) + 1; });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    const departmentPerformance = await Student.aggregate([
      {
        $group: {
          _id: '$academic.department',
          count: { $sum: 1 },
          avgCgpa: { $avg: '$academic.cgpa' },
          avgResumeScore: { $avg: { $ifNull: ['$resumeScore', 0] } },
          avgCodingScore: { $avg: { $ifNull: ['$codingScore', 0] } },
          placementReady: { $sum: { $cond: ['$isPlacementReady', 1, 0] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        cgpaDistribution,
        topSkills,
        departmentPerformance,
        totalStudents: students.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({ geminiApiKey: '' });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { geminiApiKey } = req.body;
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({});
    }
    settings.geminiApiKey = geminiApiKey;
    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (error) {
    next(error);
  }
};
