import { Router } from 'express';
import { generateRoadmap } from '../controllers/roadmapController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/generate', authMiddleware, generateRoadmap);

export default router;
