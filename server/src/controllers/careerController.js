import { CareerResult } from '../models/CareerResult.js';
import { aiJsonCompletion } from '../services/aiService.js';
import { buildCareerPrompt } from '../utils/generatePrompt.js';

export const getCareerRecommendations = async (req, res, next) => {
  try {
    const { skills, interests, education, experienceLevel } = req.body;

    if (!Array.isArray(skills) || !interests || !education || !experienceLevel) {
      return res.status(400).json({
        message: 'skills(array), interests, education and experienceLevel are required'
      });
    }

    const inputData = { skills, interests, education, experienceLevel };

    const aiResponse = await aiJsonCompletion({
      userPrompt: buildCareerPrompt(inputData),
      temperature: 0.2
    });

    if (!Array.isArray(aiResponse.careers)) {
      return res.status(502).json({ message: 'AI response format mismatch' });
    }

    const saveResult = req.query.save === 'true';
    if (saveResult) {
      await CareerResult.create({
        userId: req.user.id,
        inputData,
        aiResponse
      });
    }

    return res.status(200).json(aiResponse);
  } catch (error) {
    return next(error);
  }
};
