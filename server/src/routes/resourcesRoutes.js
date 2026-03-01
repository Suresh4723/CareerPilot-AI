import { Router } from 'express';
import { generateLearningResources } from '../controllers/resourcesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', authMiddleware, generateLearningResources);

export default router;
