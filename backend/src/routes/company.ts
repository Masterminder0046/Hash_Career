import { Router } from 'express';
import { protect, authorize } from '../middleware/auth';
import { getAllCompanies, getCompanyById, createCompany, updateCompany, deleteCompany } from '../controllers/CompanyController';

const router = Router();

router.get('/', protect, getAllCompanies);
router.get('/:id', protect, getCompanyById);
router.post('/', protect, authorize('admin', 'placement_officer'), createCompany);
router.put('/:id', protect, authorize('admin'), updateCompany);
router.delete('/:id', protect, authorize('admin'), deleteCompany);

export default router;
