import { Router } from 'express';
import { protect } from '../middleware/auth';
import { chat, getQuickReplies } from '../controllers/ChatbotController';

const router = Router();

router.post('/chat', protect, chat);
router.get('/quick-replies', protect, getQuickReplies);

export default router;
