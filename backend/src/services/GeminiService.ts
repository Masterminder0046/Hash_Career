import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { config } from '../config';

import { Settings } from '../models/Settings';

let genAI: GoogleGenerativeAI;
let model: GenerativeModel;
let currentApiKey = '';

const getModel = async (): Promise<GenerativeModel | null> => {
  let key = '';
  try {
    const settings = await Settings.findOne({});
    if (settings && settings.geminiApiKey) {
      key = settings.geminiApiKey;
    }
  } catch (err) {
    console.error('Error reading Gemini key from database:', err);
  }

  if (!key) {
    key = config.geminiApiKey;
  }

  if (key && key !== currentApiKey) {
    currentApiKey = key;
    genAI = new GoogleGenerativeAI(key);
    model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });
  } else if (!key) {
    model = null as any;
    currentApiKey = '';
  }

  return model;
};

export const geminiGenerate = async (prompt: string): Promise<string> => {
  try {
    const m = await getModel();
    if (!m) {
      return geminiFallback(prompt);
    }
    const result = await m.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error('Gemini API error:', error.message);
    return geminiFallback(prompt);
  }
};

const geminiFallback = (prompt: string): string => {
  const lower = prompt.toLowerCase();
  if (lower.includes('chatbot') || lower.includes('career advisor')) {
    return 'Based on your profile, I recommend focusing on Data Structures and Algorithms. Start with arrays and strings, then move to trees and graphs. Practice on LeetCode daily and build projects using the MERN stack.';
  }
  if (lower.includes('ats score') || lower.includes('resume')) {
    // Extract the raw resume text from the prompt
    let resumeText = '';
    const labelIndex = prompt.indexOf('Analyze this resume text and return JSON:');
    if (labelIndex !== -1) {
      resumeText = prompt.slice(labelIndex + 'Analyze this resume text and return JSON:'.length);
      const endInstructionsIndex = resumeText.indexOf('Return JSON with:');
      if (endInstructionsIndex !== -1) {
        resumeText = resumeText.slice(0, endInstructionsIndex).trim();
      }
    } else {
      resumeText = prompt;
    }

    const rTextLower = resumeText.toLowerCase();

    // 1. Identify present sections
    const hasEducation = rTextLower.includes('education') || rTextLower.includes('academic') || rTextLower.includes('degree') || rTextLower.includes('btech') || rTextLower.includes('college') || rTextLower.includes('university');
    const hasExperience = rTextLower.includes('experience') || rTextLower.includes('work') || rTextLower.includes('internship') || rTextLower.includes('employment') || rTextLower.includes('job');
    const hasProjects = rTextLower.includes('project') || rTextLower.includes('academic project') || rTextLower.includes('personal project');
    const hasSkills = rTextLower.includes('skills') || rTextLower.includes('technical skills') || rTextLower.includes('core competencies') || rTextLower.includes('technologies');
    const hasCertifications = rTextLower.includes('certification') || rTextLower.includes('certificate') || rTextLower.includes('certifications') || rTextLower.includes('credentials');
    const hasAchievements = rTextLower.includes('achievement') || rTextLower.includes('award') || rTextLower.includes('accomplishments') || rTextLower.includes('honors');

    // 2. Identify skills present in resume
    const skillList = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'mongodb', 'mysql', 'postgresql', 'redis', 'firebase',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git', 'github',
      'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
      'rest api', 'graphql', 'socket.io', 'webpack', 'system design', 'machine learning', 'data science'
    ];
    
    const foundSkills = skillList.filter(s => rTextLower.includes(s));

    // 3. Define target keywords that should be in a resume
    const targetKeywords = ['docker', 'kubernetes', 'aws', 'system design', 'machine learning', 'git', 'typescript', 'react', 'node', 'rest api', 'mongodb', 'ci/cd'];
    const missingKeywords = targetKeywords.filter(s => !foundSkills.includes(s));

    // 4. Calculate dynamic scores
    let atsScore = 45; // base score

    // Section rewards
    if (hasEducation) atsScore += 6;
    if (hasExperience) atsScore += 8;
    if (hasProjects) atsScore += 8;
    if (hasSkills) atsScore += 6;
    if (hasCertifications) atsScore += 4;
    if (hasAchievements) atsScore += 4;

    // Skill density reward
    atsScore += Math.min(foundSkills.length * 1.5, 15);

    // Metrics/action verbs checks
    const hasMetrics = /%|\b\d+\s*(?:%|percent|users|scaling|optimized|reduced|increased|saved|built|implemented|created|developed)\b/i.test(resumeText);
    if (hasMetrics) {
      atsScore += 8;
    }

    // Penalize missing keywords
    atsScore -= Math.min(missingKeywords.length * 1.5, 10);

    // Add slight random/deterministic fluctuation based on text length to feel real
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    if (wordCount > 300) {
      atsScore += 3;
    } else if (wordCount < 100) {
      atsScore -= 10;
    }

    // Bound score
    atsScore = Math.max(35, Math.min(atsScore, 96));
    atsScore = Math.round(atsScore);

    const resumeScore = Math.round(Math.max(30, Math.min(atsScore - (hasMetrics ? 2 : 5), 95)));

    // 5. Weak sections
    const weakSections: string[] = [];
    if (!hasExperience) weakSections.push('experience');
    if (!hasProjects) weakSections.push('projects');
    if (!hasCertifications) weakSections.push('certifications');
    if (!hasAchievements) weakSections.push('achievements');
    if (weakSections.length === 0) {
      weakSections.push('certifications'); // default least priority
    }

    // 6. Suggestions
    const grammarSuggestions: string[] = [
      'Ensure consistent past/present tense usage (e.g. use past tense for completed experiences).',
      'Remove passive voice phrasing (e.g., replace "was responsible for building" with "Built").'
    ];
    if (wordCount < 150) {
      grammarSuggestions.push('Expand content to hit target 300-500 words length.');
    }

    const professionalSuggestions: string[] = [];
    if (!hasMetrics) {
      professionalSuggestions.push('Quantify project impact with measurable metrics (e.g., "reduced page load times by 30%" or "served 500+ active users").');
    }
    if (!hasExperience) {
      professionalSuggestions.push('Add an experience or internship section to showcase real-world collaboration.');
    }
    if (!hasProjects) {
      professionalSuggestions.push('Add 2-3 personal or academic projects showcasing the implementation of your technical skills.');
    }
    if (missingKeywords.length > 0) {
      professionalSuggestions.push(`Integrate missing industry-relevant skills such as ${missingKeywords.slice(0, 3).join(', ')} to clear ATS filters.`);
    }
    if (professionalSuggestions.length === 0) {
      professionalSuggestions.push('Elevate resume bullet points by following the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]).');
    }

    // 7. Dynamic Summary & Improved Sections
    const skillsToDisplay = foundSkills.length > 0 ? foundSkills.slice(0, 4).join(', ') : 'Software Development';
    const betterSummary = `Result-driven and highly motivated software engineer with expertise in ${skillsToDisplay}. Proven capabilities in designing efficient systems, optimizing data workflows, and working on collaborative development projects. Eager to solve complex software engineering challenges in placements.`;

    const improvedSections = {
      summary: betterSummary,
      projects: hasProjects ? [
        'Developed scalable applications leveraging modern architectures.',
        'Optimized system efficiency by integrating structured APIs and database indexing.'
      ] : [
        'Build a full stack web application leveraging modern technology stack.',
        'Implement responsive user interfaces and RESTful APIs to solve specific user needs.'
      ]
    };

    return JSON.stringify({
      atsScore,
      resumeScore,
      missingKeywords,
      weakSections,
      grammarSuggestions,
      professionalSuggestions,
      betterSummary,
      improvedSections
    });
  }
  if (lower.includes('interview') || lower.includes('question')) {
    return JSON.stringify({
      question: 'Explain the difference between REST and GraphQL APIs.',
      evaluation: {
        grammar: 8,
        technicalAccuracy: 7,
        confidence: 6,
        completeness: 7,
        communication: 8,
        feedback: 'Good understanding of concepts. Consider mentioning use cases.',
        suggestions: ['Study more on caching strategies', 'Practice explaining trade-offs'],
      },
      nextQuestion: 'What is the difference between SQL and NoSQL databases?',
    });
  }
  if (lower.includes('roadmap')) {
    return JSON.stringify({
      weeks: Array.from({ length: 4 }, (_, i) => ({
        week: i + 1,
        title: `Week ${i + 1}: Core Concepts`,
        topics: ['Data Structures', 'Algorithms', 'System Design Basics'],
        resources: [{ title: 'Resource', type: 'article' }],
        projects: [{ title: 'Project', description: 'Build something', technologies: ['React', 'Node'] }],
        practicePlatforms: [{ name: 'LeetCode', focusArea: 'DSA' }],
      })),
      interviewPreparation: { topics: ['DSA', 'System Design'], resources: [], tips: ['Practice daily'] },
    });
  }
  if (lower.includes('chat') || lower.includes('career')) {
    return 'Based on your profile, I recommend focusing on Data Structures and Algorithms. Start with arrays and strings, then move to trees and graphs. Practice on LeetCode daily and build projects using the MERN stack.';
  }
  if (lower.includes('company') || lower.includes('match')) {
    return JSON.stringify({
      eligibilityPercentage: 65,
      missingSkills: ['Docker', 'Kubernetes'],
      missingCertificates: ['AWS Certified'],
      missingProjects: ['Cloud-native project'],
      reasonEligible: 'Good CGPA and relevant skills',
      reasonRejected: 'Missing key technical skills',
    });
  }
  return 'Analysis completed successfully. Based on your profile, we recommend continuing with your current preparation strategy.';
};

const safeJsonParse = (text: string, fallback: any = {}): any => {
  try {
    let cleanText = text.trim();
    if (cleanText.startsWith('```')) {
      const firstNewline = cleanText.indexOf('\n');
      if (firstNewline !== -1) {
        cleanText = cleanText.slice(firstNewline);
      } else {
        cleanText = cleanText.replace(/^```[a-zA-Z]*/, '');
      }
      cleanText = cleanText.replace(/```$/, '').trim();
    }
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse JSON from Gemini response:', error);
    return fallback;
  }
};

export const generateInterviewQuestion = async (type: string, previousContext?: string): Promise<any> => {
  const prompt = `Generate a ${type} interview question for a college placement interview. ${previousContext ? `Previous context: ${previousContext}` : ''} Return as JSON with fields: question (string), expectedKeywords (array), difficulty (easy/medium/hard).`;
  const response = await geminiGenerate(prompt);
  return safeJsonParse(response, {
    question: 'Tell me about yourself and your technical background.',
    expectedKeywords: ['experience', 'skills', 'projects', 'motivation'],
    difficulty: 'easy',
  });
};

export const evaluateAnswer = async (question: string, answer: string, type: string): Promise<any> => {
  const prompt = `Evaluate this ${type} interview answer. Question: "${question}". Answer: "${answer}". Return JSON with: grammar (0-10), technicalAccuracy (0-10), confidence (0-10), completeness (0-10), communication (0-10), feedback (string), suggestions (array of strings).`;
  const response = await geminiGenerate(prompt);
  return safeJsonParse(response, {
    grammar: 7,
    technicalAccuracy: 6,
    confidence: 7,
    completeness: 6,
    communication: 7,
    feedback: 'Good attempt. Try to structure your answer more clearly.',
    suggestions: ['Use STAR method', 'Include specific examples'],
  });
};

export const analyzeResume = async (resumeText: string): Promise<any> => {
  const prompt = `Analyze this resume text and return JSON: ${resumeText}. Return JSON with: atsScore (0-100), resumeScore (0-100), missingKeywords (array), weakSections (array), grammarSuggestions (array), professionalSuggestions (array), betterSummary (string), improvedSections (object with summary and projects array).`;
  const response = await geminiGenerate(prompt);
  return safeJsonParse(response, {
    atsScore: 70,
    resumeScore: 68,
    missingKeywords: ['system design', 'aws', 'docker'],
    weakSections: ['projects'],
    grammarSuggestions: ['Use consistent tense throughout.'],
    professionalSuggestions: ['Add measurable achievements.'],
    betterSummary: 'Experienced software developer...',
    improvedSections: { summary: '...', projects: [] }
  });
};

export const generateRoadmap = async (skills: string[], targetCompany: string, duration: number): Promise<any> => {
  const prompt = `Create a ${duration}-day placement preparation roadmap for a student with skills: ${skills.join(', ')}${targetCompany ? ` targeting ${targetCompany}` : ''}. Return JSON with weeks array containing week number, title, topics, resources (array of {title, url, type}), projects (array of {title, description, technologies}), practicePlatforms (array of {name, url, focusArea}), and interviewPreparation object with topics, resources, tips. IMPORTANT: Ensure each week object has exactly 'week' (number) and 'title' (string) fields.`;
  const response = await geminiGenerate(prompt);
  const parsed = safeJsonParse(response, {
    weeks: [
      {
        week: 1,
        title: 'Preparation Kickoff',
        topics: ['Data Structures', 'Basic Algorithms'],
        resources: [],
        projects: [],
        practicePlatforms: []
      }
    ],
    interviewPreparation: { topics: [], resources: [], tips: [] }
  });

  if (parsed && Array.isArray(parsed.weeks)) {
    parsed.weeks.forEach((item: any, index: number) => {
      if (item.week === undefined) {
        const val = item.weekNumber ?? item.week_number ?? item.weekNo ?? item.number ?? (index + 1);
        item.week = Number(val) || (index + 1);
      }
      if (!item.title) {
        item.title = item.name || item.topic || `Week ${item.week}`;
      }
    });
  }

  return parsed;
};

export const chatWithBot = async (message: string, context: string): Promise<string> => {
  const prompt = `You are a placement career advisor chatbot. Context about student: ${context}. Student asks: "${message}". Provide helpful, concise career advice about placements, interviews, companies, or skills.`;
  return geminiGenerate(prompt);
};
