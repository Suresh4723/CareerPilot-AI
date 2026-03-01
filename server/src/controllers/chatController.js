import { aiJsonCompletion } from '../services/aiService.js';

const SYSTEM_PROMPT =
  'You are a career planning and interview preparation assistant. Only answer career-related questions. Return JSON with {"reply":"..."}.';

export const chatAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    const response = await aiJsonCompletion({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: `User message: ${message}`,
      temperature: 0.5
    });

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
};
