import { Router } from 'express';
import { protect } from '../middleware/auth';
import { startInterview, submitAnswer, getInterviewHistory, getInterviewById } from '../controllers/InterviewController';

const router = Router();

router.post('/start', protect, startInterview);
router.post('/submit', protect, submitAnswer);
router.get('/history', protect, getInterviewHistory);
router.get('/:id', protect, getInterviewById);

export default router;
