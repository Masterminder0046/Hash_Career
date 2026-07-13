import fs from 'fs';
import pdfParse from 'pdf-parse';
// @ts-ignore
import mammoth from 'mammoth';

export interface ParsedResume {
  text: string;
  skills: string[];
  projects: string[];
  education: string;
  experience: string[];
  certificates: string[];
  achievements: string[];
}

export const parseResume = async (filePath: string, mimeType: string): Promise<ParsedResume> => {
  try {
    let text = '';

    if (mimeType === 'application/pdf') {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(pdfBuffer);
      text = pdfData.text;
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxBuffer = fs.readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      text = result.value;
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }

    return extractStructuredData(text);
  } catch (error: any) {
    console.error('Resume parsing error:', error.message);
    return {
      text: '',
      skills: [],
      projects: [],
      education: '',
      experience: [],
      certificates: [],
      achievements: [],
    };
  }
};

const extractStructuredData = (text: string): ParsedResume => {
  const lines = text.split('\n').filter((l) => l.trim());
  const lower = text.toLowerCase();

  const skillKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'ruby', 'go', 'rust',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'mongodb', 'mysql', 'postgresql', 'redis', 'firebase',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins', 'git',
    'tensorflow', 'pytorch', 'scikit-learn', 'pandas', 'numpy',
    'rest', 'graphql', 'socket.io', 'webpack', 'babel',
  ];

  const skills = skillKeywords.filter((s) => lower.includes(s));

  const projectSection = extractSection(text, ['project', 'project experience']);
  const projects = projectSection
    ? projectSection.split('\n').filter((l) => l.trim().length > 10).slice(0, 5)
    : [];

  const educationSection = extractSection(text, ['education', 'academic']);
  const experienceSection = extractSection(text, ['experience', 'work experience', 'employment']);
  const experience = experienceSection
    ? experienceSection.split('\n').filter((l) => l.trim().length > 10).slice(0, 5)
    : [];

  const certSection = extractSection(text, ['certification', 'certificate', 'certifications']);
  const certificates = certSection
    ? certSection.split('\n').filter((l) => l.trim().length > 5).slice(0, 5)
    : [];

  const achievementSection = extractSection(text, ['achievement', 'award', 'accomplishment']);
  const achievements = achievementSection
    ? achievementSection.split('\n').filter((l) => l.trim().length > 5).slice(0, 5)
    : [];

  return {
    text,
    skills: [...new Set(skills)],
    projects,
    education: educationSection || '',
    experience,
    certificates,
    achievements,
  };
};

const extractSection = (text: string, sectionNames: string[]): string | null => {
  const lines = text.split('\n');
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (sectionNames.some((name) => line.includes(name))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return null;

  const nextSectionHeaders = [
    'education', 'experience', 'project', 'skill', 'certification',
    'achievement', 'language', 'interest', 'summary', 'objective',
    'publication', 'reference', 'additional',
  ];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    if (nextSectionHeaders.some((h) => line.startsWith(h) || line.match(new RegExp(`^${h}\\s`)))) {
      endIndex = i;
      break;
    }
  }

  return endIndex === -1
    ? lines.slice(startIndex + 1).join('\n').trim()
    : lines.slice(startIndex + 1, endIndex).join('\n').trim();
};
