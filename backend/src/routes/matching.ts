import { Router } from 'express';
import { protect } from '../middleware/auth';
import { getCompanyMatches, getCompanyMatchDetail } from '../controllers/MatchingController';

const router = Router();

router.get('/', protect, getCompanyMatches);
router.get('/:companyId', protect, getCompanyMatchDetail);

export default router;
