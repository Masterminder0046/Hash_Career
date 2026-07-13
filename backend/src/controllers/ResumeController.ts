import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { parseResume } from '../services/ResumeParser';
import { analyzeResume } from '../services/GeminiService';
import path from 'path';
import fs from 'fs';

export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const parsed = await parseResume(req.file.path, req.file.mimetype);

    student.resumeUrl = fileUrl;
    student.resumeText = parsed.text;

    if (parsed.skills.length > 0) {
      const existingSkills = new Set(student.skills.map((s) => s.toLowerCase()));
      parsed.skills.forEach((s) => existingSkills.add(s.toLowerCase()));
      student.skills = Array.from(existingSkills);
    }

    await student.save();

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { fileUrl, parsed },
    });
  } catch (error) {
    next(error);
  }
};

export const analyzeResumeHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.resumeText) {
      return res.status(400).json({ success: false, message: 'No resume uploaded. Please upload your resume first.' });
    }

    const analysis = await analyzeResume(student.resumeText);

    if (analysis.resumeScore) {
      student.resumeScore = analysis.resumeScore;
      await student.save();
    }

    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({
      success: true,
      data: {
        resumeUrl: student.resumeUrl,
        resumeScore: student.resumeScore,
        hasResume: !!student.resumeUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadResume = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student?.resumeUrl) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }

    const filePath = path.join(__dirname, '../../', student.resumeUrl);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  } catch (error) {
    next(error);
  }
};
