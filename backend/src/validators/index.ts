import { body } from 'express-validator';

export const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateCompany = [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('minCgpa').isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('skillsRequired').isArray({ min: 1 }).withMessage('At least one skill required'),
];
