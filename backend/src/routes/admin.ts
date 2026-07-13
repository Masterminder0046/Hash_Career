import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getAdminDashboard, getSystemLogs, manageUser, deleteUser, getAnalytics, getSettings, updateSettings } from '../controllers/AdminController';
import { upload } from '../middleware/upload';
import { uploadHistoricalData, getRetrainingStatus } from '../controllers/AdminUploadController';

const router = Router();

router.get('/dashboard', protect, authorize('admin'), getAdminDashboard);
router.get('/logs', protect, authorize('admin'), getSystemLogs);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.put('/users/:userId', protect, authorize('admin'), manageUser);
router.delete('/users/:userId', protect, authorize('admin'), deleteUser);
router.post('/upload-history', protect, authorize('admin'), upload.single('csv'), uploadHistoricalData);
router.get('/retrain-status', protect, authorize('admin'), getRetrainingStatus);
router.get('/settings', protect, authorize('admin'), getSettings);
router.put('/settings', protect, authorize('admin'), updateSettings);

export default router;
