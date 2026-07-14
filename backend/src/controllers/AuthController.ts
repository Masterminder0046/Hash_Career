import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { config } from '../config';
import { UserRole, AuthRequest } from '../types';

const generateToken = (userId: string, role: string, email: string): string => {
  return jwt.sign({ userId, role, email }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  } as jwt.SignOptions);
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userRole = UserRole.STUDENT;
    const user = await User.create({ email, password, name, role: userRole });

    if (userRole === UserRole.STUDENT) {
      await Student.create({
        userId: user._id,
        academic: {
          cgpa: 0,
          department: '',
          year: '',
          batch: '',
          rollNumber: '',
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
    }

    const token = generateToken(user._id.toString(), user.role, user.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id.toString(), user.role, user.email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let profile = null;
    if (user.role === UserRole.STUDENT) {
      profile = await Student.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, profile },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, bio, ...profileData } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (name) user.name = name;
    await user.save();

    if (user.role === UserRole.STUDENT) {
      const student = await Student.findOneAndUpdate(
        { userId: user._id },
        { $set: profileData },
        { new: true, runValidators: true }
      );
      if (student) {
        student.profileCompletion = calculateProfileCompletion(student);
        await student.save();
      }
      return res.json({ success: true, data: { user, profile: student } });
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    res.json({ success: true, message: 'Password reset link sent to email', resetToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

const calculateProfileCompletion = (student: any): number => {
  let score = 0;
  const total = 12;

  if (student.academic?.cgpa > 0) score++;
  if (student.academic?.department) score++;
  if (student.skills?.length > 0) score++;
  if (student.projects?.length > 0) score++;
  if (student.certificates?.length > 0) score++;
  if (student.experiences?.length > 0) score++;
  if (student.achievements?.length > 0) score++;
  if (student.codingProfiles?.length > 0) score++;
  if (student.githubUrl) score++;
  if (student.linkedinUrl) score++;
  if (student.languages?.length > 0) score++;
  if (student.resumeUrl) score++;

  return Math.round((score / total) * 100);
};
