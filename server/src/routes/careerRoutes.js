import { Router } from 'express';
import { getCareerRecommendations } from '../controllers/careerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/recommend', authMiddleware, getCareerRecommendations);

export default router;
