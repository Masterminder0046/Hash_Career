import { Router } from 'express';
import { protect } from '../middleware/auth';
import { predictPlacement, getPredictionHistory } from '../controllers/PredictionController';

const router = Router();

router.post('/', protect, predictPlacement);
router.get('/history', protect, getPredictionHistory);

export default router;
