import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getNotifications, markAsRead, deleteNotification } from '../controllers/NotificationController';

const router = Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
