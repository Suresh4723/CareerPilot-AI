import { callOpenRouter } from '../config/openrouter.js';

const BASE_SYSTEM_PROMPT = 'You are a career planning and interview preparation assistant. Return only valid JSON.';

export const aiJsonCompletion = async ({ userPrompt, temperature = 0.3, systemPrompt = BASE_SYSTEM_PROMPT }) => {
  return callOpenRouter({
    systemPrompt,
    userPrompt,
    temperature
  });
};
