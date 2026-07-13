import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { Company } from '../models/Company';

export const analyzeSkillGap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const targetCompany = req.query.company as string | undefined;
    const query: any = { isActive: true };
    if (targetCompany) query.name = { $regex: targetCompany, $options: 'i' };

    const companies = await Company.find(query);

    const studentSkills = new Set(student.skills.map((s) => s.toLowerCase()));

    const allRequiredSkills = new Set<string>();
    companies.forEach((c) => c.skillsRequired.forEach((s) => allRequiredSkills.add(s.toLowerCase())));

    const missingSkills: { skill: string; priority: number; difficulty: string; companies: string[] }[] = [];

    allRequiredSkills.forEach((skill) => {
      if (!studentSkills.has(skill)) {
        const foundIn = companies
          .filter((c) => c.skillsRequired.some((s) => s.toLowerCase() === skill))
          .map((c) => c.name);
        const priority = foundIn.length;
        const difficulty = getDifficulty(skill);

        missingSkills.push({ skill, priority, difficulty, companies: foundIn });
      }
    });

    missingSkills.sort((a, b) => b.priority - a.priority);

    const learningOrder = missingSkills.map((s) => ({
      skill: s.skill,
      order: missingSkills.indexOf(s) + 1,
      estimatedDays: getEstimatedDays(s.difficulty),
      priority: s.priority >= 5 ? 'high' : s.priority >= 3 ? 'medium' : 'low',
    }));

    res.json({
      success: true,
      data: {
        totalGaps: missingSkills.length,
        currentSkills: student.skills.length,
        requiredSkills: allRequiredSkills.size,
        coverage: allRequiredSkills.size > 0
          ? Math.round(((allRequiredSkills.size - missingSkills.length) / allRequiredSkills.size) * 100)
          : 0,
        missingSkills: missingSkills.slice(0, 30),
        learningOrder,
        recommendations: generateRecommendations(missingSkills),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDifficulty = (skill: string): string => {
  const hard = ['machine learning', 'deep learning', 'kubernetes', 'aws', 'system design', 'docker'];
  const medium = ['react', 'node', 'typescript', 'mongodb', 'python', 'java', 'spring'];

  if (hard.includes(skill.toLowerCase())) return 'hard';
  if (medium.includes(skill.toLowerCase())) return 'medium';
  return 'easy';
};

const getEstimatedDays = (difficulty: string): number => {
  switch (difficulty) {
    case 'hard': return 30;
    case 'medium': return 15;
    default: return 7;
  }
};

const generateRecommendations = (missingSkills: any[]): string[] => {
  const recs: string[] = [];
  const highPriority = missingSkills.filter((s) => s.priority >= 5);
  const mediumPriority = missingSkills.filter((s) => s.priority >= 3 && s.priority < 5);

  if (highPriority.length > 0) {
    recs.push(`Focus on learning ${highPriority.slice(0, 3).map((s) => s.skill).join(', ')} first as they are required by many companies.`);
  }
  if (mediumPriority.length > 0) {
    recs.push(`Next, learn ${mediumPriority.slice(0, 3).map((s) => s.skill).join(', ')} to expand your opportunities.`);
  }
  recs.push('Build projects using these skills to strengthen your practical knowledge.');
  recs.push('Practice coding problems related to these skills on platforms like LeetCode and HackerRank.');

  return recs;
};
