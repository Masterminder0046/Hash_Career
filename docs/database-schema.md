# Database Schema

## Collections

### Users
```
{
  _id: ObjectId,
  email: String (unique, indexed),
  password: String (hashed, bcrypt),
  role: String (enum: student | placement_officer | admin),
  name: String,
  isActive: Boolean,
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Students
```
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, unique),
  phone: String,
  avatar: String,
  bio: String,
  academic: {
    cgpa: Number,
    department: String,
    year: String,
    batch: String,
    rollNumber: String,
    tenthPercentage: Number,
    twelfthPercentage: Number,
    graduationYear: Number
  },
  skills: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    url: String,
    isVerified: Boolean
  }],
  certificates: [{
    name: String,
    issuer: String,
    date: Date,
    url: String,
    isVerified: Boolean
  }],
  experiences: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String,
    isVerified: Boolean
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    type: String
  }],
  codingProfiles: [{
    platform: String,
    username: String,
    profileUrl: String,
    rating: Number,
    problemsSolved: Number,
    lastSynced: Date
  }],
  githubUrl: String,
  linkedinUrl: String,
  languages: [String],
  resumeUrl: String,
  resumeText: String,
  resumeScore: Number,
  profileCompletion: Number,
  isPlacementReady: Boolean,
  attendance: Number,
  communicationScore: Number,
  codingScore: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Companies
```
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  industry: String,
  website: String,
  logo: String,
  minCgpa: Number,
  skillsRequired: [String],
  preferredProjects: [String],
  eligibleDepartments: [String],
  salary: {
    min: Number,
    max: Number,
    currency: String,
    details: String
  },
  selectionProcess: {
    rounds: [{
      name: String,
      description: String,
      duration: Number,
      difficulty: String
    }],
    totalDuration: String
  },
  isActive: Boolean,
  location: String,
  hiringCount: Number,
  pastRecruitment: [{ year: Number, studentsHired: Number }],
  createdAt: Date,
  updatedAt: Date
}
```

### Predictions
```
{
  _id: ObjectId,
  studentId: ObjectId (ref: Students),
  probability: Number,
  confidence: String,
  featureImportance: [{ feature: String, importance: Number }],
  reason: String,
  inputFeatures: {
    cgpa: Number,
    skillsCount: Number,
    projectsCount: Number,
    internshipsCount: Number,
    resumeScore: Number,
    codingScore: Number,
    communicationScore: Number,
    attendance: Number,
    certificationsCount: Number
  },
  createdAt: Date
}
```

### Interviews
```
{
  _id: ObjectId,
  studentId: ObjectId (ref: Students),
  type: String (enum),
  status: String (enum: in_progress, completed),
  questions: [{
    question: String,
    userAnswer: String,
    evaluation: {
      grammar: Number,
      technicalAccuracy: Number,
      confidence: Number,
      completeness: Number,
      communication: Number,
      feedback: String,
      suggestions: [String]
    }
  }],
  overallScore: Number,
  report: { strengths: [String], weaknesses: [String], recommendations: [String], overallFeedback: String },
  duration: Number,
  startedAt: Date,
  completedAt: Date,
  createdAt: Date
}
```

### Roadmaps
```
{
  _id: ObjectId,
  studentId: ObjectId (ref: Students),
  duration: Number,
  targetCompany: String,
  skillGap: [String],
  weeks: [{
    week: Number,
    title: String,
    topics: [String],
    resources: [{ title: String, url: String, type: String }],
    projects: [{ title: String, description: String, technologies: [String] }],
    practicePlatforms: [{ name: String, url: String, focusArea: String }]
  }],
  interviewPreparation: { topics: [String], resources: [{ title: String, url: String }], tips: [String] },
  completedWeeks: [Number],
  isActive: Boolean,
  progress: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Notifications
```
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  title: String,
  message: String,
  type: String (enum: info, warning, success, error),
  category: String,
  isRead: Boolean,
  link: String,
  createdAt: Date
}
```

## Indexes

- Users: email (unique)
- Students: { userId: 1 }, { skills: 1 }, { 'academic.department': 1 }
- Companies: { skillsRequired: 1 }, { eligibleDepartments: 1 }
- Predictions: { studentId: 1, createdAt: -1 }
- Notifications: { userId: 1, isRead: 1, createdAt: -1 }
