// MongoDB Initialization Script
// Run: mongosh placement-platform < database/init.js

db.createCollection('users');
db.createCollection('students');
db.createCollection('companies');
db.createCollection('predictions');
db.createCollection('interviews');
db.createCollection('roadmaps');
db.createCollection('notifications');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ userId: 1 }, { unique: true });
db.students.createIndex({ skills: 1 });
db.students.createIndex({ 'academic.department': 1 });
db.companies.createIndex({ skillsRequired: 1 });
db.companies.createIndex({ eligibleDepartments: 1 });
db.predictions.createIndex({ studentId: 1, createdAt: -1 });
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 });

print('Database initialized successfully');
print('Collections created: users, students, companies, predictions, interviews, roadmaps, notifications');
print('Indexes created for performance optimization');
