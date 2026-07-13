import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { chatWithBot } from '../services/GeminiService';

export const chat = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let context = 'General student';
    const student = await Student.findOne({ userId: req.user!.userId });
    if (student) {
      context = `Student with skills: ${student.skills.slice(0, 10).join(', ')}, CGPA: ${student.academic.cgpa}, Department: ${student.academic.department}. They have ${student.projects.length} projects and ${student.certificates.length} certifications.`;
    }

    let response;
    const lower = message.toLowerCase();

    if (lower.includes('resume') || lower.includes('cv')) {
      response = 'To improve your resume: 1) Use action verbs to describe achievements, 2) Quantify your impact with numbers, 3) Tailor your resume for each company, 4) Keep it to one page, 5) Include relevant projects and skills. Would you like specific tips for any section?';
    } else if (lower.includes('interview')) {
      response = 'For interview preparation: 1) Research the company thoroughly, 2) Practice common questions, 3) Prepare your own questions to ask, 4) Use the STAR method for behavioral questions, 5) Review technical concepts. Would you like to practice with a mock interview?';
    } else if (lower.includes('company') || lower.includes('placement')) {
      response = 'Top placement tips: 1) Start early preparation, 2) Focus on fundamentals, 3) Build real projects, 4) Practice coding daily, 5) Improve communication skills. Which company are you targeting?';
    } else if (lower.includes('skill') || lower.includes('learn')) {
      response = 'Based on current industry trends, focus on: 1) Data Structures & Algorithms, 2) A programming language (Python/Java), 3) Web technologies, 4) Databases, 5) Version control (Git). What specific area interests you?';
    } else if (lower.includes('roadmap') || lower.includes('plan')) {
      response = 'A good preparation roadmap should include: 1) DSA practice (2-3 months), 2) System Design (1 month), 3) Project building (1-2 months), 4) Mock interviews (1 month). Would you like me to generate a detailed roadmap?';
    } else {
      response = await chatWithBot(message, context);
    }

    res.json({ success: true, data: { message: response } });
  } catch (error) {
    next(error);
  }
};

export const getQuickReplies = async (req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    data: [
      'How can I improve my resume?',
      'Tips for interview preparation',
      'Which companies are hiring?',
      'What skills should I learn?',
      'Create a study roadmap for me',
      'How to prepare for technical interviews?',
      'Best resources for learning DSA?',
      'How to get a referral?',
    ],
  });
};
