import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { Prediction } from '../models/Prediction';
import axios from 'axios';

export const predictPlacement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const features = {
      cgpa: student.academic.cgpa,
      skillsCount: student.skills.length,
      projectsCount: student.projects.length,
      internshipsCount: student.experiences.length,
      resumeScore: student.resumeScore || 50,
      codingScore: student.codingScore || 50,
      communicationScore: student.communicationScore || 50,
      attendance: student.attendance || 75,
      certificationsCount: student.certificates.length,
    };

    let prediction: any;

    try {
      const mlResponse = await axios.post('http://localhost:5001/predict', { features });
      prediction = mlResponse.data as any;
    } catch {
      prediction = fallbackPrediction(features);
    }

    const reason = generatePredictionReason(features, prediction.probability);

    const savedPrediction = await Prediction.create({
      studentId: student._id,
      probability: prediction.probability,
      confidence: prediction.confidence,
      featureImportance: prediction.featureImportance || [
        { feature: 'cgpa', importance: 0.25 },
        { feature: 'skillsCount', importance: 0.2 },
        { feature: 'projectsCount', importance: 0.15 },
        { feature: 'codingScore', importance: 0.15 },
        { feature: 'resumeScore', importance: 0.1 },
        { feature: 'communicationScore', importance: 0.08 },
        { feature: 'attendance', importance: 0.07 },
      ],
      reason,
      inputFeatures: features,
    });

    res.json({ success: true, data: { prediction: savedPrediction, features } });
  } catch (error) {
    next(error);
  }
};

const fallbackPrediction = (features: any) => {
  const weights = {
    cgpa: 0.25,
    skillsCount: 0.15,
    projectsCount: 0.1,
    internshipsCount: 0.1,
    resumeScore: 0.1,
    codingScore: 0.1,
    communicationScore: 0.08,
    attendance: 0.07,
    certificationsCount: 0.05,
  };

  const cgpaScore = (features.cgpa / 10) * 100 * weights.cgpa;
  const skillsScore = Math.min(100, features.skillsCount * 5) * weights.skillsCount;
  const projectsScore = Math.min(100, features.projectsCount * 10) * weights.projectsCount;
  const internshipsScore = Math.min(100, features.internshipsCount * 20) * weights.internshipsCount;
  const resumeScore = features.resumeScore * weights.resumeScore;
  const codingScore = features.codingScore * weights.codingScore;
  const commScore = features.communicationScore * weights.communicationScore;
  const attendanceScore = features.attendance * weights.attendance;
  const certScore = Math.min(100, features.certificationsCount * 10) * weights.certificationsCount;

  const probability = Math.round(cgpaScore + skillsScore + projectsScore + internshipsScore + resumeScore + codingScore + commScore + attendanceScore + certScore);

  let confidence: 'low' | 'medium' | 'high' = 'medium';
  if (probability >= 75) confidence = 'high';
  else if (probability < 50) confidence = 'low';

  return {
    probability: Math.min(100, Math.max(0, probability)),
    confidence,
    featureImportance: Object.entries(weights).map(([feature, importance]) => ({ feature, importance })),
  };
};

const generatePredictionReason = (features: any, probability: number): string => {
  const reasons: string[] = [];

  if (features.cgpa >= 8.5) reasons.push('Excellent CGPA');
  else if (features.cgpa >= 7) reasons.push('Good CGPA');
  else reasons.push('CGPA needs improvement');

  if (features.skillsCount >= 8) reasons.push('Strong skill set');
  else if (features.skillsCount < 5) reasons.push('Limited technical skills');

  if (features.projectsCount >= 3) reasons.push('Good project experience');
  else reasons.push('Need more projects');

  if (features.resumeScore >= 70) reasons.push('Strong resume');
  else reasons.push('Resume needs improvement');

  if (features.codingScore < 50) reasons.push('Coding skills need improvement');

  if (probability >= 70) return `High placement probability. ${reasons.slice(0, 3).join('. ')}.`;
  if (probability >= 50) return `Moderate placement probability. ${reasons.slice(0, 3).join('. ')}. Consider improving weak areas.`;
  return `Low placement probability. Focus on: ${reasons.slice(0, 3).join(', ')}. Need significant improvement.`;
};

export const getPredictionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const predictions = await Prediction.find({ studentId: student._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
};
