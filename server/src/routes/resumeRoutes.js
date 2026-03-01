import { Router } from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = Router();

router.post('/analyze', authMiddleware, uploadResume.single('resumePdf'), analyzeResume);

export default router;
