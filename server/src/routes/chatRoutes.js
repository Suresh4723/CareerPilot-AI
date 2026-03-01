import { Router } from 'express';
import { chatAssistant } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware, chatAssistant);

export default router;
