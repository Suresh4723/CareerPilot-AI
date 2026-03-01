import { aiJsonCompletion } from '../services/aiService.js';
import { buildLearningResourcesPrompt } from '../utils/generatePrompt.js';

export const generateLearningResources = async (req, res, next) => {
  try {
    const { role, skills = [], experienceLevel = 'beginner' } = req.body;

    if (!role || typeof role !== 'string') {
      return res.status(400).json({ message: 'role is required' });
    }

    const response = await aiJsonCompletion({
      userPrompt: buildLearningResourcesPrompt({ role, skills, experienceLevel }),
      temperature: 0.2
    });

    if (!Array.isArray(response.categories)) {
      return res.status(502).json({ message: 'AI response format mismatch for resources' });
    }

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
