import { Router } from 'express';
import {
  login,
  logout,
  me,
  refreshAccessToken,
  register,
  updateProfile
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);
router.put('/profile', authMiddleware, updateProfile);

export default router;
