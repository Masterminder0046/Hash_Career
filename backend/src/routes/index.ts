import { Router } from 'express';
import authRoutes from './auth';
import resumeRoutes from './resume';
import companyRoutes from './company';
import matchingRoutes from './matching';
import predictionRoutes from './prediction';
import skillGapRoutes from './skillgap';
import roadmapRoutes from './roadmap';
import interviewRoutes from './interview';
import chatbotRoutes from './chatbot';
import officerRoutes from './officer';
import adminRoutes from './admin';
import notificationRoutes from './notifications';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/companies', companyRoutes);
router.use('/matching', matchingRoutes);
router.use('/prediction', predictionRoutes);
router.use('/skill-gap', skillGapRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/interview', interviewRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/officer', officerRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);

export default router;
