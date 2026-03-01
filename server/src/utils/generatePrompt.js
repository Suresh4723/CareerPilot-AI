export const buildCareerPrompt = (input) => {
  return `Generate career recommendations in strict JSON.
Input:
${JSON.stringify(input, null, 2)}

Output format:
{
  "careers": [
    {
      "title": "",
      "reason": "",
      "requiredSkills": [],
      "certifications": []
    }
  ]
}`;
};

export const buildResumePrompt = (resumeText, jobDescription = '') => {
  return `Analyze this resume and return strict JSON only.
Resume:
${resumeText}

${jobDescription ? `Target job description:\n${jobDescription}\n` : ''}

Output format:
{
  "score": 0,
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": [],
  "jobMatchScore": 0,
  "jdMissingKeywords": [],
  "jobFitSummary": ""
}`;
};

export const buildInterviewQuestionsPrompt = ({
  context,
  difficulty,
  questionCount = 20,
  excludedQuestions = []
}) => {
  return `Generate ${questionCount} interview MCQ questions for context "${context}" at difficulty "${difficulty}".
Rules:
- Return JSON only (no markdown, no explanation)
- "questions" must be an array of exactly ${questionCount} objects
- Each object must contain:
  - "question": string
  - "options": array of exactly 4 option strings
-  - "correctAnswer": must exactly match one of the options
- Keep options realistic and mutually exclusive where possible

${excludedQuestions.length ? `Do NOT repeat these previous questions:\n${JSON.stringify(excludedQuestions, null, 2)}` : ''}

Return strict JSON:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": ""
    }
  ]
}`;
};

export const buildInterviewEvaluationPrompt = ({ role, difficulty, question, options = [], answer }) => {
  return `Evaluate candidate answer for role "${role}" and difficulty "${difficulty}".
Question: ${question}
Options: ${JSON.stringify(options)}
Answer: ${answer}
Return strict JSON:
{
  "score": 0,
  "feedback": ""
}`;
};

export const buildInterviewSummaryPrompt = ({
  context,
  difficulty,
  totalQuestions,
  correctCount,
  wrongCount,
  results
}) => {
  return `You are evaluating an interview MCQ performance summary.
Context: ${context}
Difficulty: ${difficulty}
Total questions: ${totalQuestions}
Correct answers: ${correctCount}
Wrong answers: ${wrongCount}

Question results:
${JSON.stringify(results, null, 2)}

Return strict JSON only:
{
  "strengths": [],
  "weaknesses": [],
  "practiceAreas": [],
  "overallFeedback": ""
}`;
};

export const buildRoadmapPrompt = (input) => {
  return `Create an industry-grade learning roadmap and return strict JSON only.
Input:
${JSON.stringify(input, null, 2)}

Rules:
- Keep it practical and execution-focused
- Include dependencies and milestone checkpoints
- Use concise action-oriented steps
- Timeline must align with durationMonths and weeklyHours

Output format:
{
  "overview": {
    "targetRole": "",
    "currentLevel": "",
    "durationMonths": 0,
    "weeklyHours": 0,
    "outcome": ""
  },
  "timeline": [
    {
      "phase": "Foundation",
      "startMonth": 1,
      "endMonth": 2,
      "objectives": [],
      "topics": [],
      "deliverables": [],
      "milestones": [],
      "successMetrics": []
    }
  ],
  "projects": [
    {
      "title": "",
      "difficulty": "Beginner",
      "durationWeeks": 0,
      "skillsCovered": [],
      "description": "",
      "deliverables": []
    }
  ],
  "certifications": [],
  "resources": [
    {
      "category": "Courses",
      "items": []
    }
  ],
  "interviewPrepPlan": [],
  "weeklyPlanTemplate": {
    "hours": 0,
    "breakdown": []
  },
  "riskMitigation": [],
  "next30Days": []
}`;
};

export const buildLearningResourcesPrompt = ({ role, skills = [], experienceLevel = 'beginner' }) => {
  return `You are generating a curated learning resources hub for career preparation.
Input:
${JSON.stringify({ role, skills, experienceLevel }, null, 2)}

Rules:
- Return JSON only
- Include valid, widely known learning resource URLs
- Provide 3 to 6 entries for each category

Output format:
{
  "role": "",
  "experienceLevel": "",
  "categories": [
    {
      "name": "Courses",
      "resources": [
        {
          "title": "",
          "provider": "",
          "url": "",
          "type": "course",
          "description": ""
        }
      ]
    }
  ]
}`;
};
