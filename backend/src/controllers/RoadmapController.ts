import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { Student } from '../models/Student';
import { Roadmap } from '../models/Roadmap';
import { generateRoadmap } from '../services/GeminiService';

export const createRoadmap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { duration, targetCompany } = req.body;

    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const existingRoadmap = await Roadmap.findOne({
      studentId: student._id,
      duration,
      isActive: true,
    });

    if (existingRoadmap) {
      return res.json({ success: true, data: existingRoadmap, message: 'Roadmap already exists' });
    }

    const geminiRoadmap = await generateRoadmap(student.skills, targetCompany || '', duration);

    const roadmapData = {
      studentId: student._id,
      duration,
      targetCompany: targetCompany || '',
      skillGap: student.skills,
      weeks: geminiRoadmap.weeks || generateDefaultWeeks(duration),
      interviewPreparation: geminiRoadmap.interviewPreparation || {
        topics: ['Data Structures', 'Algorithms', 'System Design'],
        resources: [],
        tips: ['Practice consistently', 'Focus on weak areas'],
      },
      completedWeeks: [],
      isActive: true,
      progress: 0,
    };

    const roadmap = await Roadmap.create(roadmapData);

    res.status(201).json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};

export const getRoadmaps = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const student = await Student.findOne({ userId: req.user!.userId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const roadmaps = await Roadmap.find({ studentId: student._id }).sort({ createdAt: -1 });

    res.json({ success: true, data: roadmaps });
  } catch (error) {
    next(error);
  }
};

export const getRoadmapById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    res.json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};

export const updateWeekProgress = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { week } = req.body;
    const roadmap = await Roadmap.findById(req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    if (!roadmap.completedWeeks.includes(week)) {
      roadmap.completedWeeks.push(week);
    }

    roadmap.progress = Math.round((roadmap.completedWeeks.length / roadmap.weeks.length) * 100);
    await roadmap.save();

    res.json({ success: true, data: roadmap });
  } catch (error) {
    next(error);
  }
};

export const deleteRoadmap = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await Roadmap.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    next(error);
  }
};

const generateDefaultWeeks = (duration: number): any[] => {
  const numWeeks = Math.floor(duration / 7);
  const weeks = [];

  const weeklyTopics = [
    ['Arrays', 'Strings', 'Basic Algorithms'],
    ['Linked Lists', 'Stacks', 'Queues'],
    ['Trees', 'Binary Search Trees', 'Tree Traversals'],
    ['Graphs', 'BFS', 'DFS'],
    ['Dynamic Programming', 'Memoization', 'Tabulation'],
    ['Sorting Algorithms', 'Searching Algorithms', 'Complexity Analysis'],
    ['System Design Basics', 'OOP Concepts', 'Design Patterns'],
    ['Database Design', 'SQL', 'NoSQL'],
    ['Web Technologies', 'REST APIs', 'HTTP'],
    ['Operating Systems', 'Memory Management', 'Process Scheduling'],
    ['Computer Networks', 'TCP/IP', 'HTTP/HTTPS'],
    ['Aptitude', 'Logical Reasoning', 'Verbal Ability'],
  ];

  for (let i = 0; i < Math.min(numWeeks, 12); i++) {
    weeks.push({
      week: i + 1,
      title: `Week ${i + 1}: ${weeklyTopics[i]?.[0] || 'Review & Practice'}`,
      topics: weeklyTopics[i] || ['Practice', 'Revision', 'Mock Tests'],
      resources: [
        { title: 'GeeksforGeeks', url: 'https://geeksforgeeks.org', type: 'website' },
        { title: 'LeetCode', url: 'https://leetcode.com', type: 'platform' },
      ],
      projects: [
        {
          title: 'Practice Project',
          description: 'Build a project implementing learned concepts',
          technologies: ['JavaScript', 'Python'],
        },
      ],
      practicePlatforms: [
        { name: 'LeetCode', url: 'https://leetcode.com', focusArea: 'DSA' },
        { name: 'HackerRank', url: 'https://hackerrank.com', focusArea: 'Problem Solving' },
      ],
    });
  }

  return weeks;
};
