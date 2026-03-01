import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/token.js';

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  targetRole: user.targetRole || '',
  experienceLevel: user.experienceLevel || '',
  currentLevel: user.currentLevel || '',
  weeklyHours: Number(user.weeklyHours) || 10,
  preferredLearningStyle: user.preferredLearningStyle || 'mixed',
  careerGoal: user.careerGoal || '',
  skills: user.skills || [],
  focusAreas: user.focusAreas || [],
  targetCompanies: user.targetCompanies || [],
  createdAt: user.createdAt
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = secure ? 'none' : 'lax';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 60 * 60 * 1000
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      message: 'Registered successfully',
      user: sanitizeUser(user),
      accessToken
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = { id: user._id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
      accessToken
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshAccessToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const accessToken = generateAccessToken({ id: decoded.id, role: decoded.role });
    const secure = process.env.NODE_ENV === 'production';
    const sameSite = secure ? 'none' : 'lax';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 60 * 60 * 1000
    });

    return res.status(200).json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (_req, res) => {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = secure ? 'none' : 'lax';

  res.clearCookie('accessToken', { httpOnly: true, secure, sameSite });
  res.clearCookie('refreshToken', { httpOnly: true, secure, sameSite });
  return res.status(200).json({ message: 'Logged out' });
};

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      email,
      targetRole,
      experienceLevel,
      currentLevel,
      weeklyHours,
      preferredLearningStyle,
      careerGoal,
      skills,
      focusAreas,
      targetCompanies
    } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existing) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      user.email = email.toLowerCase();
    }

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    if (typeof targetRole === 'string') user.targetRole = targetRole.trim();
    if (typeof experienceLevel === 'string') user.experienceLevel = experienceLevel.trim();
    if (typeof currentLevel === 'string') user.currentLevel = currentLevel.trim();
    if (weeklyHours !== undefined) {
      const parsedHours = Number(weeklyHours);
      if (!Number.isNaN(parsedHours)) {
        user.weeklyHours = Math.min(Math.max(parsedHours, 2), 40);
      }
    }
    if (typeof preferredLearningStyle === 'string') {
      user.preferredLearningStyle = preferredLearningStyle.trim() || 'mixed';
    }
    if (typeof careerGoal === 'string') user.careerGoal = careerGoal.trim();
    if (Array.isArray(skills)) user.skills = skills.filter((item) => typeof item === 'string');
    if (Array.isArray(focusAreas)) {
      user.focusAreas = focusAreas.filter((item) => typeof item === 'string');
    }
    if (Array.isArray(targetCompanies)) {
      user.targetCompanies = targetCompanies.filter((item) => typeof item === 'string');
    }

    await user.save();

    return res.status(200).json({ message: 'Profile updated', user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};
