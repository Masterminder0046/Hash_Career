import { Router } from 'express';
import { protect } from '../middleware/auth';
import { createRoadmap, getRoadmaps, getRoadmapById, updateWeekProgress, deleteRoadmap } from '../controllers/RoadmapController';

const router = Router();

router.post('/', protect, createRoadmap);
router.get('/', protect, getRoadmaps);
router.get('/:id', protect, getRoadmapById);
router.put('/:id/week', protect, updateWeekProgress);
router.delete('/:id', protect, deleteRoadmap);

export default router;
