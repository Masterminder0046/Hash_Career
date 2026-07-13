import mongoose from 'mongoose';
import { config } from '../config';
import { User } from '../models/User';
import { Student } from '../models/Student';
import { Company } from '../models/Company';
import { UserRole } from '../types';

const companies = [
  {
    name: 'Google',
    description: 'Global technology leader in search, cloud computing, and AI',
    industry: 'Technology',
    website: 'https://careers.google.com',
    minCgpa: 8.0,
    skillsRequired: ['python', 'java', 'c++', 'data structures', 'algorithms', 'machine learning', 'system design', 'distributed systems'],
    preferredProjects: ['Search Engine', 'Recommendation System', 'Distributed System', 'Machine Learning Model'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics'],
    salary: { min: 3000000, max: 5000000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Online Assessment', description: 'Coding test on DSA', duration: 90, difficulty: 'hard' },
        { name: 'Technical Interview 1', description: 'Data structures and algorithms', duration: 60, difficulty: 'hard' },
        { name: 'Technical Interview 2', description: 'System design', duration: 60, difficulty: 'hard' },
        { name: 'Technical Interview 3', description: 'Problem solving and coding', duration: 45, difficulty: 'hard' },
        { name: 'HR Interview', description: 'Behavioral and cultural fit', duration: 30, difficulty: 'medium' },
      ],
      totalDuration: '4-5 weeks',
    },
    location: 'Bangalore, Hyderabad',
    hiringCount: 500,
    pastRecruitment: [{ year: 2023, studentsHired: 450 }, { year: 2024, studentsHired: 500 }],
  },
  {
    name: 'Microsoft',
    description: 'Global technology company empowering every person and organization',
    industry: 'Technology',
    website: 'https://careers.microsoft.com',
    minCgpa: 7.5,
    skillsRequired: ['c#', 'python', 'java', 'azure', 'data structures', 'algorithms', 'dotnet', 'sql'],
    preferredProjects: ['Cloud Application', 'Full Stack Development', 'API Development', 'Database Design'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 2500000, max: 4500000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Online Coding Test', description: 'DSA and problem solving', duration: 90, difficulty: 'hard' },
        { name: 'Technical Interview', description: 'Coding and system design', duration: 60, difficulty: 'hard' },
        { name: 'Technical + Managerial', description: 'Deep technical discussion', duration: 45, difficulty: 'hard' },
        { name: 'HR Interview', description: 'Behavioral', duration: 30, difficulty: 'medium' },
      ],
      totalDuration: '3-4 weeks',
    },
    location: 'Bangalore, Hyderabad, Noida',
    hiringCount: 600,
    pastRecruitment: [{ year: 2023, studentsHired: 550 }, { year: 2024, studentsHired: 600 }],
  },
  {
    name: 'Amazon',
    description: 'Worlds largest online retailer and cloud computing provider',
    industry: 'Technology',
    website: 'https://amazon.jobs',
    minCgpa: 7.0,
    skillsRequired: ['java', 'python', 'c++', 'data structures', 'algorithms', 'system design', 'aws', 'distributed systems'],
    preferredProjects: ['E-commerce Platform', 'Scalable Web Service', 'Microservices Architecture'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics'],
    salary: { min: 2800000, max: 4800000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Online Assessment', description: 'Coding and work simulation', duration: 120, difficulty: 'hard' },
        { name: 'Technical Interview 1', description: 'Data structures', duration: 60, difficulty: 'hard' },
        { name: 'Technical Interview 2', description: 'System design', duration: 60, difficulty: 'hard' },
        { name: 'Bar Raiser', description: 'Leadership principles and depth', duration: 60, difficulty: 'hard' },
        { name: 'HR Interview', description: 'Behavioral', duration: 30, difficulty: 'medium' },
      ],
      totalDuration: '4-6 weeks',
    },
    location: 'Bangalore, Hyderabad, Chennai',
    hiringCount: 800,
    pastRecruitment: [{ year: 2023, studentsHired: 750 }, { year: 2024, studentsHired: 800 }],
  },
  {
    name: 'TCS',
    description: 'Indias largest IT services company',
    industry: 'IT Services',
    website: 'https://www.tcs.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'html', 'css', 'javascript', 'spring', 'hibernate'],
    preferredProjects: ['Web Application', 'Database Project', 'API Development'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical', 'mechanical', 'civil'],
    salary: { min: 350000, max: 1200000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Quantitative, logical, verbal', duration: 90, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Programming and technical skills', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Communication and fit', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Pan India',
    hiringCount: 40000,
    pastRecruitment: [{ year: 2023, studentsHired: 38000 }, { year: 2024, studentsHired: 40000 }],
  },
  {
    name: 'Infosys',
    description: 'Global leader in next-generation digital services and consulting',
    industry: 'IT Services',
    website: 'https://www.infosys.com/careers',
    minCgpa: 6.5,
    skillsRequired: ['java', 'python', 'sql', 'javascript', 'spring', 'react', 'html', 'css'],
    preferredProjects: ['Full Stack Application', 'REST API', 'Database Management'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 360000, max: 1500000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Logical reasoning and quant', duration: 60, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Coding and technical concepts', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Communication and attitude', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Bangalore, Mysore, Pune, Hyderabad',
    hiringCount: 25000,
    pastRecruitment: [{ year: 2023, studentsHired: 22000 }, { year: 2024, studentsHired: 25000 }],
  },
  {
    name: 'Zoho',
    description: 'Software development company offering a suite of business applications',
    industry: 'Technology',
    website: 'https://www.zoho.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'javascript', 'python', 'sql', 'data structures', 'algorithms', 'react', 'html', 'css'],
    preferredProjects: ['Web Application', 'API Development', 'Database Design'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics'],
    salary: { min: 450000, max: 2000000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Advanced aptitude and coding logic', duration: 120, difficulty: 'medium' },
        { name: 'Coding Test', description: 'Problem solving', duration: 120, difficulty: 'hard' },
        { name: 'Technical Interview', description: 'In-depth technical discussion', duration: 45, difficulty: 'hard' },
        { name: 'HR Interview', description: 'Cultural fit', duration: 20, difficulty: 'medium' },
      ],
      totalDuration: '3-4 weeks',
    },
    location: 'Chennai, Tenkasi',
    hiringCount: 3000,
    pastRecruitment: [{ year: 2023, studentsHired: 2500 }, { year: 2024, studentsHired: 3000 }],
  },
  {
    name: 'Accenture',
    description: 'Global professional services company with leading capabilities in digital, cloud and security',
    industry: 'Consulting',
    website: 'https://www.accenture.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'html', 'css', 'javascript', 'salesforce', 'sap', 'cloud'],
    preferredProjects: ['Digital Transformation', 'Cloud Migration', 'Application Development'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical', 'mechanical'],
    salary: { min: 380000, max: 1800000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Cognitive Assessment', description: 'Aptitude, reasoning, verbal', duration: 90, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Technical skills and projects', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Communication and fitment', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Bangalore, Chennai, Mumbai, Pune, Hyderabad',
    hiringCount: 35000,
    pastRecruitment: [{ year: 2023, studentsHired: 32000 }, { year: 2024, studentsHired: 35000 }],
  },
  {
    name: 'Capgemini',
    description: 'Global leader in consulting, technology services and digital transformation',
    industry: 'IT Services',
    website: 'https://www.capgemini.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'javascript', 'html', 'css', 'react', 'spring', 'cloud'],
    preferredProjects: ['Enterprise Application', 'Cloud Project', 'Data Analytics'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 400000, max: 1600000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Online Test', description: 'Aptitude, logical, technical', duration: 90, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Coding and project discussion', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Behavioral', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Bangalore, Mumbai, Pune, Chennai',
    hiringCount: 20000,
    pastRecruitment: [{ year: 2023, studentsHired: 18000 }, { year: 2024, studentsHired: 20000 }],
  },
  {
    name: 'IBM',
    description: 'Global technology and consulting company innovating in AI, cloud, and quantum computing',
    industry: 'Technology',
    website: 'https://www.ibm.com/careers',
    minCgpa: 7.0,
    skillsRequired: ['python', 'java', 'sql', 'cloud', 'ai', 'machine learning', 'data science', 'react', 'node'],
    preferredProjects: ['AI/ML Project', 'Cloud Application', 'Data Science Project'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'mathematics'],
    salary: { min: 800000, max: 3000000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Coding Test', description: 'DSA and problem solving', duration: 90, difficulty: 'hard' },
        { name: 'Technical Interview', description: 'Technology stack and projects', duration: 45, difficulty: 'hard' },
        { name: 'Managerial Interview', description: 'Leadership and team fit', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Overall fitment', duration: 20, difficulty: 'medium' },
      ],
      totalDuration: '3-4 weeks',
    },
    location: 'Bangalore, Hyderabad, Pune, Coimbatore',
    hiringCount: 5000,
    pastRecruitment: [{ year: 2023, studentsHired: 4500 }, { year: 2024, studentsHired: 5000 }],
  },
  {
    name: 'Cognizant',
    description: 'Leading technology services company helping clients modernize technology',
    industry: 'IT Services',
    website: 'https://www.cognizant.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'javascript', 'html', 'css', 'react', 'spring', 'microservices'],
    preferredProjects: ['Web Development', 'Microservices', 'Database Application'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 375000, max: 1400000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Quantitative and logical', duration: 60, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Programming and domain knowledge', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Communication and attitude', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Bangalore, Chennai, Hyderabad, Pune, Kolkata',
    hiringCount: 18000,
    pastRecruitment: [{ year: 2023, studentsHired: 15000 }, { year: 2024, studentsHired: 18000 }],
  },
  {
    name: 'Wipro',
    description: 'Leading global information technology, consulting and business process services company',
    industry: 'IT Services',
    website: 'https://www.wipro.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'javascript', 'html', 'css', 'spring', 'hibernate', 'cloud'],
    preferredProjects: ['Enterprise Application', 'Web Portal', 'Database Design'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 350000, max: 1300000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Logical, quantitative, verbal', duration: 60, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Programming and domain', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Communication and culture fit', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Bangalore, Hyderabad, Pune, Chennai',
    hiringCount: 15000,
    pastRecruitment: [{ year: 2023, studentsHired: 13000 }, { year: 2024, studentsHired: 15000 }],
  },
  {
    name: 'HCL',
    description: 'Global technology company helping enterprises reimagine their businesses',
    industry: 'IT Services',
    website: 'https://www.hcltech.com/careers',
    minCgpa: 6.0,
    skillsRequired: ['java', 'python', 'sql', 'javascript', 'react', 'node', 'cloud', 'devops'],
    preferredProjects: ['Full Stack Development', 'Cloud Project', 'DevOps Pipeline'],
    eligibleDepartments: ['computer science', 'information technology', 'electronics', 'electrical'],
    salary: { min: 350000, max: 1200000, currency: 'INR' },
    selectionProcess: {
      rounds: [
        { name: 'Aptitude Test', description: 'Quantitative, logical, verbal', duration: 60, difficulty: 'medium' },
        { name: 'Technical Interview', description: 'Technical skills assessment', duration: 30, difficulty: 'medium' },
        { name: 'HR Interview', description: 'Behavioral and cultural fit', duration: 15, difficulty: 'easy' },
      ],
      totalDuration: '2-3 weeks',
    },
    location: 'Noida, Chennai, Bangalore, Hyderabad, Pune',
    hiringCount: 12000,
    pastRecruitment: [{ year: 2023, studentsHired: 10000 }, { year: 2024, studentsHired: 12000 }],
  },
];

const skillPools = {
  cs: ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'mongodb', 'sql', 'data structures', 'algorithms', 'git', 'docker', 'aws', 'html', 'css', 'c++', 'c', 'linux', 'rest apis', 'graphql'],
  core: ['python', 'c', 'c++', 'embedded systems', 'arduino', 'raspberry pi', 'matlab', 'verilog', 'vhdl', 'pcb design', 'microcontrollers'],
  other: ['python', 'java', 'sql', 'excel', 'power bi', 'tableau', 'data analysis', 'machine learning', 'communication', 'teamwork'],
};

const departments = ['computer science', 'information technology', 'electronics', 'electrical', 'mechanical', 'civil'];
const names = ['Aarav Sharma', 'Vihaan Patel', 'Vivaan Singh', 'Ananya Gupta', 'Diya Reddy', 'Advik Kumar', 'Sara Joseph', 'Ishaan Verma', 'Myra Joshi', 'Kabir Das', 'Aanya Bhat', 'Reyansh Nair', 'Saanvi Pillai', 'Arjun Mehta', 'Ishita Kapoor', 'Rudra Raj', 'Pari Saxena', 'Shaurya Choudhury', 'Anika Agarwal', 'Rohan Malhotra', 'Kavya Srinivasan', 'Neil Deshmukh', 'Aadhya Iyer', 'Vihaan Rao', 'Ananya Shenoy', 'Yash Tripathi', 'Nisha Jain', 'Ravi Menon', 'Priya Kulkarni', 'Aryan Joshi', 'Neha Singh', 'Rahul Verma', 'Pooja Patel', 'Karan Gupta', 'Shreya Sharma', 'Manish Yadav', 'Smriti Bose', 'Vikram Rathore', 'Tanvi Sawant', 'Harshad Gawande', 'Pranav Joshi', 'Shivani Dixit', 'Kunal Agarwal', 'Megha Desai', 'Siddharth Nair', 'Tanya Arora', 'Rajat Bansal', 'Divya Chauhan', 'Nikhil Tyagi', 'Kriti Bhatt'];

const generateStudentData = (index: number) => {
  const name = names[index % names.length];
  const email = name.toLowerCase().replace(' ', '.') + index + '@college.edu.in';
  const dept = departments[index % departments.length];
  const year = ['First', 'Second', 'Third', 'Fourth'][index % 4];
  const batch = `202${(index % 5) + 2}`;
  const cgpa = Math.round((6 + Math.random() * 3.5) * 100) / 100;

  let skills: string[];
  if (dept === 'computer science' || dept === 'information technology') {
    skills = [...skillPools.cs].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 6));
  } else if (dept === 'electronics' || dept === 'electrical') {
    skills = [...skillPools.core, ...skillPools.cs.slice(0, 3)].sort(() => Math.random() - 0.5).slice(0, 4 + Math.floor(Math.random() * 5));
  } else {
    skills = [...skillPools.other].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 4));
  }

  const resumeScore = Math.round(40 + Math.random() * 50);
  const codingScore = Math.round(30 + Math.random() * 60);
  const communicationScore = Math.round(50 + Math.random() * 40);
  const attendance = Math.round(60 + Math.random() * 35);

  return {
    email: `${email.replace(/[^a-z0-9@.]/g, '')}`,
    name: name,
    password: 'student123',
    role: UserRole.STUDENT,
    studentData: {
      academic: {
        cgpa,
        department: dept,
        year,
        batch,
        rollNumber: `${dept.slice(0, 3).toUpperCase()}${2024}${String(index + 1).padStart(4, '0')}`,
        tenthPercentage: Math.round(75 + Math.random() * 20),
        twelfthPercentage: Math.round(70 + Math.random() * 22),
        graduationYear: 2025 + (index % 2),
      },
      skills,
      projects: [
        {
          title: `Project ${index + 1}`,
          description: `A ${['web', 'mobile', 'data', 'cloud'][index % 4]} application built using ${skills.slice(0, 2).join(' and ')}`,
          technologies: skills.slice(0, 3),
          isVerified: Math.random() > 0.3,
        },
        {
          title: `Project ${index + 2}`,
          description: `An innovative solution for ${['education', 'healthcare', 'finance', 'e-commerce'][index % 4]}`,
          technologies: skills.slice(1, 4),
          isVerified: Math.random() > 0.4,
        },
      ].slice(0, Math.random() > 0.3 ? 2 : 1),
      certificates: [
        { name: `${skills[0]?.toUpperCase() || 'Python'} Certification`, issuer: 'Coursera', date: new Date(2024, index % 12, 15), isVerified: Math.random() > 0.3 },
        { name: 'AWS Cloud Practitioner', issuer: 'Amazon', date: new Date(2024, (index + 3) % 12, 10), isVerified: Math.random() > 0.4 },
      ].slice(0, Math.random() > 0.3 ? 2 : 1),
      experiences: Math.random() > 0.5 ? [
        { company: ['Tech Corp', 'Startup Labs', 'Digital Solutions'][index % 3], role: 'Intern', startDate: new Date(2024, 0, 1), endDate: new Date(2024, 2, 31), description: 'Worked on full stack development', isVerified: Math.random() > 0.3 },
      ] : [],
      achievements: [
        { title: `Hackathon ${['Winner', 'Runner-up', 'Finalist'][index % 3]}`, description: `Placed in top ${[3, 5, 10][index % 3]} in national hackathon`, date: new Date(2024, (index + 2) % 12, 20), type: 'hackathon' },
        { title: 'Academic Excellence', description: 'Dean list for academic performance', date: new Date(2024, (index + 1) % 12, 10), type: 'academic' },
      ],
      codingProfiles: [
        { platform: 'LeetCode', username: `user_${index}`, profileUrl: 'https://leetcode.com', rating: Math.round(1200 + Math.random() * 800), problemsSolved: Math.round(20 + Math.random() * 100) },
        { platform: 'GitHub', username: `dev_${index}`, profileUrl: 'https://github.com', problemsSolved: Math.round(10 + Math.random() * 50) },
      ],
      githubUrl: `https://github.com/dev_${index}`,
      linkedinUrl: `https://linkedin.com/in/user_${index}`,
      languages: ['English', 'Hindi', ['Tamil', 'Telugu', 'Kannada', 'Marathi', 'Bengali'][index % 5]],
      resumeScore,
      codingScore,
      communicationScore,
      attendance,
      profileCompletion: Math.round(50 + Math.random() * 45),
      isPlacementReady: cgpa > 7.5 && skills.length > 5 && resumeScore > 60,
    },
  };
};

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB for seeding...');

    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Company.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const adminUser = await User.create({
      email: 'admin@placement.edu.in',
      password: 'admin123',
      name: 'Admin User',
      role: UserRole.ADMIN,
    });
    console.log('Admin created: admin@placement.edu.in / admin123');

    const officerUser = await User.create({
      email: 'officer@placement.edu.in',
      password: 'officer123',
      name: 'Placement Officer',
      role: UserRole.OFFICER,
    });
    console.log('Officer created: officer@placement.edu.in / officer123');

    await Company.insertMany(companies);
    console.log(`${companies.length} companies seeded`);

    const studentData = [];
    for (let i = 0; i < 100; i++) {
      const data = generateStudentData(i);
      studentData.push(data);
    }

    const BATCH_SIZE = 20;
    for (let i = 0; i < studentData.length; i += BATCH_SIZE) {
      const batch = studentData.slice(i, i + BATCH_SIZE);
      const createdUsers = await User.create(
        batch.map((s) => ({ email: s.email, password: s.password, name: s.name, role: s.role }))
      );
      await Student.create(
        createdUsers.map((user, idx) => ({
          userId: user._id,
          ...batch[idx].studentData,
        }))
      );
      console.log(`Seeded students ${i + 1}-${Math.min(i + BATCH_SIZE, studentData.length)}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('   Admin: admin@placement.edu.in / admin123');
    console.log('   Officer: officer@placement.edu.in / officer123');
    console.log(`   Students: ${studentData.length} accounts created (password: student123)`);
    console.log(`   Companies: ${companies.length} companies seeded`);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
