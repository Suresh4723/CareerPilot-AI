import { aiJsonCompletion } from '../services/aiService.js';
import { buildRoadmapPrompt } from '../utils/generatePrompt.js';

const toArray = (value) => (Array.isArray(value) ? value.filter(Boolean) : []);

const toReadableText = (item) => {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  if (typeof item === 'number' || typeof item === 'boolean') return String(item);
  if (Array.isArray(item)) return item.map(toReadableText).filter(Boolean).join(', ');
  if (typeof item === 'object') {
    if (typeof item.title === 'string' && item.title.trim()) return item.title.trim();
    if (typeof item.name === 'string' && item.name.trim()) return item.name.trim();
    if (typeof item.topic === 'string' && item.topic.trim()) return item.topic.trim();
    const values = Object.values(item).map(toReadableText).filter(Boolean);
    return values.join(' - ');
  }
  return '';
};

const ensureStringArray = (value) => toArray(value).map(toReadableText).filter(Boolean);

const normalizeRoadmapResponse = (response, input) => {
  if (response && typeof response === 'object' && response.overview && Array.isArray(response.timeline)) {
    return {
      overview: {
        targetRole: String(response.overview.targetRole || input.targetRole),
        currentLevel: String(response.overview.currentLevel || input.currentLevel),
        durationMonths: Number(response.overview.durationMonths) || input.durationMonths,
        weeklyHours: Number(response.overview.weeklyHours) || input.weeklyHours,
        outcome: String(response.overview.outcome || `Roadmap generated for ${input.targetRole}`)
      },
      timeline: toArray(response.timeline).map((phase, idx) => ({
        phase: String(phase?.phase || `Phase ${idx + 1}`),
        startMonth: Number(phase?.startMonth) || idx + 1,
        endMonth: Number(phase?.endMonth) || idx + 1,
        objectives: ensureStringArray(phase?.objectives),
        topics: ensureStringArray(phase?.topics),
        deliverables: ensureStringArray(phase?.deliverables),
        milestones: ensureStringArray(phase?.milestones),
        successMetrics: ensureStringArray(phase?.successMetrics)
      })),
      projects: toArray(response.projects).map((p) => ({
        title: String(p?.title || ''),
        difficulty: String(p?.difficulty || 'Intermediate'),
        durationWeeks: Number(p?.durationWeeks) || 2,
        skillsCovered: ensureStringArray(p?.skillsCovered),
        description: String(p?.description || ''),
        deliverables: ensureStringArray(p?.deliverables)
      })),
      certifications: ensureStringArray(response.certifications),
      resources: toArray(response.resources).map((r) => ({
        category: String(r?.category || 'Resources'),
        items: ensureStringArray(r?.items)
      })),
      interviewPrepPlan: ensureStringArray(response.interviewPrepPlan),
      weeklyPlanTemplate: {
        hours: Number(response.weeklyPlanTemplate?.hours) || input.weeklyHours,
        breakdown: ensureStringArray(response.weeklyPlanTemplate?.breakdown)
      },
      riskMitigation: ensureStringArray(response.riskMitigation),
      next30Days: ensureStringArray(response.next30Days)
    };
  }

  const beginner = ensureStringArray(response?.beginner);
  const intermediate = ensureStringArray(response?.intermediate);
  const advanced = ensureStringArray(response?.advanced);

  return {
    overview: {
      targetRole: input.targetRole,
      currentLevel: input.currentLevel,
      durationMonths: input.durationMonths,
      weeklyHours: input.weeklyHours,
      outcome: `Roadmap generated for ${input.targetRole}`
    },
    timeline: [
      {
        phase: 'Foundation',
        startMonth: 1,
        endMonth: Math.max(1, Math.round(input.durationMonths / 3)),
        objectives: beginner,
        topics: beginner,
        deliverables: [],
        milestones: [],
        successMetrics: []
      },
      {
        phase: 'Build and Apply',
        startMonth: Math.max(1, Math.round(input.durationMonths / 3) + 1),
        endMonth: Math.max(2, Math.round((input.durationMonths * 2) / 3)),
        objectives: intermediate,
        topics: intermediate,
        deliverables: [],
        milestones: [],
        successMetrics: []
      },
      {
        phase: 'Advanced and Interview',
        startMonth: Math.max(2, Math.round((input.durationMonths * 2) / 3) + 1),
        endMonth: input.durationMonths,
        objectives: advanced,
        topics: advanced,
        deliverables: [],
        milestones: [],
        successMetrics: []
      }
    ],
    projects: ensureStringArray(response?.projects).map((title) => ({
      title,
      difficulty: 'Intermediate',
      durationWeeks: 2,
      skillsCovered: [],
      description: '',
      deliverables: []
    })),
    certifications: [],
    resources: [],
    interviewPrepPlan: [],
    weeklyPlanTemplate: {
      hours: input.weeklyHours,
      breakdown: []
    },
    riskMitigation: [],
    next30Days: []
  };
};

export const generateRoadmap = async (req, res, next) => {
  try {
    const {
      targetRole,
      role,
      currentLevel = 'beginner',
      weeklyHours = 10,
      durationMonths = 6,
      goals = [],
      currentSkills = [],
      preferredLearningStyle = 'mixed'
    } = req.body;

    const resolvedTargetRole = String(targetRole || role || '').trim();
    if (!resolvedTargetRole) {
      return res.status(400).json({ message: 'targetRole (or role) is required' });
    }

    const input = {
      targetRole: resolvedTargetRole,
      currentLevel: String(currentLevel || 'beginner'),
      weeklyHours: Math.min(Math.max(Number(weeklyHours) || 10, 2), 40),
      durationMonths: Math.min(Math.max(Number(durationMonths) || 6, 1), 24),
      goals: ensureStringArray(goals),
      currentSkills: ensureStringArray(currentSkills),
      preferredLearningStyle: String(preferredLearningStyle || 'mixed')
    };

    const response = await aiJsonCompletion({
      userPrompt: buildRoadmapPrompt(input),
      temperature: 0.35
    });

    const normalized = normalizeRoadmapResponse(response, input);
    return res.status(200).json(normalized);
  } catch (error) {
    return next(error);
  }
};
