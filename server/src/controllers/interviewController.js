import { InterviewSession } from '../models/InterviewSession.js';
import { aiJsonCompletion } from '../services/aiService.js';
import {
  buildInterviewQuestionsPrompt,
  buildInterviewSummaryPrompt
} from '../utils/generatePrompt.js';

const normalizeQuestions = (rawQuestions, expectedCount = 20) => {
  const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const items = toArray(rawQuestions).slice(0, expectedCount);
  const questions = [];
  const options = [];
  const answerKey = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;

    const questionText = typeof item.question === 'string' ? item.question.trim() : '';
    const optionList = Array.isArray(item.options)
      ? item.options.map((opt) => String(opt).trim()).filter(Boolean).slice(0, 4)
      : [];
    const correctAnswer = typeof item.correctAnswer === 'string' ? item.correctAnswer.trim() : '';

    if (!questionText || optionList.length !== 4) continue;

    const normalizedCorrect =
      optionList.find((opt) => opt.toLowerCase() === correctAnswer.toLowerCase()) || optionList[0];

    questions.push(questionText);
    options.push(optionList);
    answerKey.push(normalizedCorrect);
  }

  return { questions, options, answerKey };
};

const sanitizeSessionForClient = (session) => {
  const obj = session.toObject();
  delete obj.answerKey;
  return obj;
};

export const createInterviewSession = async (req, res, next) => {
  try {
    const {
      context,
      difficulty = 'medium',
      questionCount: rawQuestionCount = 20,
      timeLimitMin: rawTimeLimitMin = 20
    } = req.body;

    if (!context || typeof context !== 'string') {
      return res.status(400).json({ message: 'context is required' });
    }

    const questionCount = Math.min(Math.max(Number(rawQuestionCount) || 20, 5), 30);
    const timeLimitMin = Math.min(Math.max(Number(rawTimeLimitMin) || 20, 5), 120);

    const recentSessions = await InterviewSession.find({
      userId: req.user.id,
      role: context
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('questions');

    const excludedQuestions = Array.from(
      new Set(
        recentSessions
          .flatMap((session) => session.questions || [])
          .map((q) => String(q || '').trim())
          .filter(Boolean)
      )
    ).slice(0, 80);

    const uniqueQuestions = [];
    const uniqueOptions = [];
    const uniqueAnswerKey = [];
    const seen = new Set(excludedQuestions.map((q) => q.toLowerCase()));

    const collectBatch = async ({ allowHistoricalRepeats = false }) => {
      const remaining = questionCount - uniqueQuestions.length;
      if (remaining <= 0) return;

      const promptExcluded = allowHistoricalRepeats
        ? uniqueQuestions
        : [...excludedQuestions, ...uniqueQuestions];

      const questionsResponse = await aiJsonCompletion({
        userPrompt: buildInterviewQuestionsPrompt({
          context,
          difficulty,
          questionCount: Math.min(Math.max(remaining + 2, remaining), 30),
          excludedQuestions: promptExcluded.slice(0, 120)
        }),
        temperature: 0.8
      });

      const { questions, options, answerKey } = normalizeQuestions(
        questionsResponse.questions,
        Math.min(Math.max(remaining + 2, remaining), 30)
      );

      for (let i = 0; i < questions.length && uniqueQuestions.length < questionCount; i += 1) {
        const key = questions[i].toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        uniqueQuestions.push(questions[i]);
        uniqueOptions.push(options[i]);
        uniqueAnswerKey.push(answerKey[i]);
      }
    };

    for (let attempt = 0; attempt < 4 && uniqueQuestions.length < questionCount; attempt += 1) {
      await collectBatch({ allowHistoricalRepeats: false });
    }

    if (uniqueQuestions.length < questionCount) {
      await collectBatch({ allowHistoricalRepeats: true });
    }

    if (uniqueQuestions.length !== questionCount) {
      return res.status(502).json({
        message: `Could not generate requested question count. Requested ${questionCount}, got ${uniqueQuestions.length}. Please retry.`
      });
    }

    const session = await InterviewSession.create({
      userId: req.user.id,
      role: context,
      difficulty,
      questions: uniqueQuestions,
      options: uniqueOptions,
      answerKey: uniqueAnswerKey,
      answers: [],
      feedback: [],
      questionCount: uniqueQuestions.length,
      timeLimitMin,
      totalScore: 0
    });

    return res.status(201).json(sanitizeSessionForClient(session));
  } catch (error) {
    return next(error);
  }
};

export const submitInterviewAnswers = async (req, res, next) => {
  try {
    const { sessionId, answers } = req.body;

    if (!sessionId || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'sessionId and answers[] are required' });
    }

    const session = await InterviewSession.findOne({ _id: sessionId, userId: req.user.id });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found' });
    }

    if (answers.length !== session.questions.length) {
      return res.status(400).json({ message: 'answers count must match questions count' });
    }

    const normalizedAnswers = answers.map((ans) => String(ans || '').trim());

    const evaluation = session.questions.map((question, i) => {
      const selectedAnswer = normalizedAnswers[i] || '';
      const correctAnswer = session.answerKey?.[i] || '';
      const isCorrect =
        selectedAnswer.length > 0 &&
        correctAnswer.length > 0 &&
        selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();

      return {
        question,
        options: session.options?.[i] || [],
        selectedAnswer,
        correctAnswer,
        isCorrect
      };
    });

    const correctCount = evaluation.filter((item) => item.isCorrect).length;
    const totalQuestions = evaluation.length;
    const totalScore = Math.round((correctCount / Math.max(totalQuestions, 1)) * 100);

    let summary = {
      strengths: [],
      weaknesses: [],
      practiceAreas: [],
      overallFeedback: ''
    };

    try {
      const aiSummary = await aiJsonCompletion({
        userPrompt: buildInterviewSummaryPrompt({
          context: session.role,
          difficulty: session.difficulty,
          totalQuestions,
          correctCount,
          wrongCount: totalQuestions - correctCount,
          results: evaluation
        }),
        temperature: 0.2
      });

      summary = {
        strengths: Array.isArray(aiSummary.strengths) ? aiSummary.strengths : [],
        weaknesses: Array.isArray(aiSummary.weaknesses) ? aiSummary.weaknesses : [],
        practiceAreas: Array.isArray(aiSummary.practiceAreas) ? aiSummary.practiceAreas : [],
        overallFeedback: typeof aiSummary.overallFeedback === 'string' ? aiSummary.overallFeedback : ''
      };
    } catch {
      summary = {
        strengths: ['Good attempt completion and engagement in the full mock round.'],
        weaknesses: ['Some concepts require more revision based on incorrect responses.'],
        practiceAreas: ['Review incorrect questions and strengthen weak topics.'],
        overallFeedback: 'Focus on weak topics and repeat a timed session for better accuracy.'
      };
    }

    session.answers = normalizedAnswers;
    session.feedback = [summary.overallFeedback || 'Interview summary generated'];
    session.totalScore = totalScore;
    await session.save();

    return res.status(200).json({
      sessionId: session._id,
      context: session.role,
      difficulty: session.difficulty,
      totalQuestions,
      correctCount,
      wrongCount: totalQuestions - correctCount,
      totalScore,
      evaluation,
      summary
    });
  } catch (error) {
    return next(error);
  }
};
