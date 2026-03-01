import { Router } from 'express';
import { createInterviewSession, submitInterviewAnswers } from '../controllers/interviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/session', authMiddleware, createInterviewSession);
router.post('/submit', authMiddleware, submitInterviewAnswers);

export default router;
