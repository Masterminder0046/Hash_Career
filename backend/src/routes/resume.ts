import { Router } from 'express';
import { protect } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadResume, analyzeResumeHandler, getResume, downloadResume } from '../controllers/ResumeController';

const router = Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.post('/analyze', protect, analyzeResumeHandler);
router.get('/', protect, getResume);
router.get('/download', protect, downloadResume);

export default router;
