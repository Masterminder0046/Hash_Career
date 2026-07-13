import { Router } from 'express';
import { protect } from '../middleware/auth';
import { analyzeSkillGap } from '../controllers/SkillGapController';

const router = Router();

router.get('/', protect, analyzeSkillGap);

export default router;
