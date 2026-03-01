import pdfParse from 'pdf-parse';
import { aiJsonCompletion } from '../services/aiService.js';
import { buildResumePrompt } from '../utils/generatePrompt.js';

export const analyzeResume = async (req, res, next) => {
  try {
    const { resumeText = '', jobDescription = '' } = req.body;
    let extractedText = resumeText;

    if (req.file?.buffer) {
      const parsedPdf = await pdfParse(req.file.buffer);
      extractedText = parsedPdf.text || '';
    }

    if (!extractedText || typeof extractedText !== 'string' || !extractedText.trim()) {
      return res.status(400).json({ message: 'Upload a resume PDF or provide resumeText' });
    }

    const response = await aiJsonCompletion({
      userPrompt: buildResumePrompt(extractedText, jobDescription),
      temperature: 0.2
    });

    return res.status(200).json({
      ...response,
      source: req.file ? 'pdf' : 'text'
    });
  } catch (error) {
    return next(error);
  }
};
