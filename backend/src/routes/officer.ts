import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getDashboardStats, getStudentsList, getStudentDetail, exportCsv, createStudent } from '../controllers/OfficerController';

const router = Router();

router.get('/dashboard', protect, authorize('placement_officer', 'admin'), getDashboardStats);
router.get('/students', protect, authorize('placement_officer', 'admin'), getStudentsList);
router.post('/students', protect, authorize('placement_officer', 'admin'), createStudent);
router.get('/students/:id', protect, authorize('placement_officer', 'admin'), getStudentDetail);
router.get('/export/csv', protect, authorize('placement_officer', 'admin'), exportCsv);

export default router;
