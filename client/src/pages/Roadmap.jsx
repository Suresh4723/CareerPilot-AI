import { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const LEARNING_STYLES = ['mixed', 'project-first', 'theory-first', 'video-first', 'reading-first'];

const splitCsv = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

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

const normalizeRoadmap = (data, fallbackRole) => {
  if (data?.overview && Array.isArray(data.timeline)) return data;

  return {
    overview: {
      targetRole: fallbackRole,
      currentLevel: 'beginner',
      durationMonths: 6,
      weeklyHours: 10,
      outcome: `Roadmap generated for ${fallbackRole}`
    },
    timeline: [
      {
        phase: 'Foundation',
        startMonth: 1,
        endMonth: 2,
        objectives: toArray(data?.beginner),
        topics: toArray(data?.beginner),
        deliverables: [],
        milestones: [],
        successMetrics: []
      },
      {
        phase: 'Build and Apply',
        startMonth: 3,
        endMonth: 4,
        objectives: toArray(data?.intermediate),
        topics: toArray(data?.intermediate),
        deliverables: [],
        milestones: [],
        successMetrics: []
      },
      {
        phase: 'Advanced and Interview',
        startMonth: 5,
        endMonth: 6,
        objectives: toArray(data?.advanced),
        topics: toArray(data?.advanced),
        deliverables: [],
        milestones: [],
        successMetrics: []
      }
    ],
    projects: toArray(data?.projects).map((p) => ({
      title: String(p),
      difficulty: 'Intermediate',
      durationWeeks: 2,
      skillsCovered: [],
      description: '',
      deliverables: []
    })),
    certifications: [],
    resources: [],
    interviewPrepPlan: [],
    weeklyPlanTemplate: { hours: 10, breakdown: [] },
    riskMitigation: [],
    next30Days: []
  };
};

const Roadmap = () => {
  const [form, setForm] = useState({
    targetRole: '',
    currentLevel: 'beginner',
    durationMonths: 6,
    weeklyHours: 10,
    currentSkills: '',
    goals: '',
    preferredLearningStyle: 'mixed'
  });

  const [result, setResult] = useState(null);
  const [activePhase, setActivePhase] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const progressMetrics = useMemo(() => {
    if (!result) return null;
    return {
      phases: toArray(result.timeline).length,
      projects: toArray(result.projects).length,
      certifications: toArray(result.certifications).length,
      next30: toArray(result.next30Days).length
    };
  }, [result]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!form.targetRole.trim()) {
      setError('Target role is required.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/roadmap/generate', {
        targetRole: form.targetRole.trim(),
        currentLevel: form.currentLevel,
        durationMonths: Number(form.durationMonths),
        weeklyHours: Number(form.weeklyHours),
        currentSkills: splitCsv(form.currentSkills),
        goals: splitCsv(form.goals),
        preferredLearningStyle: form.preferredLearningStyle
      });

      const normalized = normalizeRoadmap(data, form.targetRole.trim());
      setResult(normalized);
      setActivePhase(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate roadmap');
    } finally {
      setLoading(false);
    }
  };

  const selectedPhase = toArray(result?.timeline)[activePhase] || null;

  return (
    <div className="roadmap-page">
      <section className="panel roadmap-hero">
        <div className="page-head">
          <h1>Roadmap Generator Pro</h1>
          <p>
            Build an execution-ready career roadmap with phased milestones, project strategy, weekly
            scheduling, and interview preparation guidance.
          </p>
        </div>
        <div className="roadmap-hero-badges">
          <span className="badge">Phase Planning</span>
          <span className="badge">Milestone Tracking</span>
          <span className="badge">Projects + Interview Plan</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="result-title">Roadmap Inputs</h2>
        <form onSubmit={onSubmit} className="roadmap-form-grid">
          <div>
            <label className="career-label" htmlFor="targetRole">
              Target Role
            </label>
            <input
              id="targetRole"
              className="input"
              placeholder="Full Stack Developer"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="currentLevel">
              Current Level
            </label>
            <select
              id="currentLevel"
              className="select"
              value={form.currentLevel}
              onChange={(e) => setForm({ ...form, currentLevel: e.target.value })}
            >
              {LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="career-label" htmlFor="durationMonths">
              Duration (Months)
            </label>
            <input
              id="durationMonths"
              className="input"
              type="number"
              min={1}
              max={24}
              value={form.durationMonths}
              onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="weeklyHours">
              Weekly Hours
            </label>
            <input
              id="weeklyHours"
              className="input"
              type="number"
              min={2}
              max={40}
              value={form.weeklyHours}
              onChange={(e) => setForm({ ...form, weeklyHours: e.target.value })}
            />
          </div>

          <div className="roadmap-full-width">
            <label className="career-label" htmlFor="currentSkills">
              Current Skills (comma separated)
            </label>
            <input
              id="currentSkills"
              className="input"
              placeholder="JavaScript, React, Node.js"
              value={form.currentSkills}
              onChange={(e) => setForm({ ...form, currentSkills: e.target.value })}
            />
          </div>

          <div className="roadmap-full-width">
            <label className="career-label" htmlFor="goals">
              Goals (comma separated)
            </label>
            <input
              id="goals"
              className="input"
              placeholder="Get internship, Build 3 portfolio projects, Crack product company interviews"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="preferredLearningStyle">
              Preferred Learning Style
            </label>
            <select
              id="preferredLearningStyle"
              className="select"
              value={form.preferredLearningStyle}
              onChange={(e) => setForm({ ...form, preferredLearningStyle: e.target.value })}
            >
              {LEARNING_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div className="roadmap-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Industry Roadmap'}
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {result ? (
        <>
          <section className="roadmap-kpi-grid">
            <article className="kpi">
              <h3 className="result-title">{progressMetrics?.phases || 0}</h3>
              <p className="muted">Roadmap Phases</p>
            </article>
            <article className="kpi">
              <h3 className="result-title">{progressMetrics?.projects || 0}</h3>
              <p className="muted">Projects</p>
            </article>
            <article className="kpi">
              <h3 className="result-title">{progressMetrics?.certifications || 0}</h3>
              <p className="muted">Certifications</p>
            </article>
            <article className="kpi">
              <h3 className="result-title">{progressMetrics?.next30 || 0}</h3>
              <p className="muted">Next 30 Days Actions</p>
            </article>
          </section>

          <section className="panel">
            <div className="roadmap-overview-head">
              <h2 className="result-title">Roadmap Overview</h2>
              <span className="badge">{result.overview?.targetRole}</span>
            </div>
            <p className="muted">{result.overview?.outcome || 'No overview generated.'}</p>
            <div className="roadmap-overview-meta">
              <span className="badge">Level: {result.overview?.currentLevel}</span>
              <span className="badge">Duration: {result.overview?.durationMonths} months</span>
              <span className="badge">Weekly Hours: {result.overview?.weeklyHours}</span>
            </div>
          </section>

          <section className="panel">
            <h2 className="result-title">Phase Timeline</h2>
            <div className="roadmap-phase-tabs">
              {toArray(result.timeline).map((phase, idx) => (
                <button
                  key={`${phase.phase}-${idx}`}
                  className={`roadmap-phase-tab${activePhase === idx ? ' active' : ''}`}
                  onClick={() => setActivePhase(idx)}
                  type="button"
                >
                  <span>{phase.phase}</span>
                  <small>
                    M{phase.startMonth}-M{phase.endMonth}
                  </small>
                </button>
              ))}
            </div>

            {selectedPhase ? (
              <div className="roadmap-phase-card">
                <h3>{selectedPhase.phase}</h3>
                <p className="muted">
                  Months {selectedPhase.startMonth} to {selectedPhase.endMonth}
                </p>

                <div className="grid-2">
                  <article className="kpi">
                    <h4>Objectives</h4>
                    <ul className="list">
                      {toArray(selectedPhase.objectives).map((item, idx) => (
                        <li key={`objective-${idx}`}>{toReadableText(item)}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="kpi">
                    <h4>Topics</h4>
                    <ul className="list">
                      {toArray(selectedPhase.topics).map((item, idx) => (
                        <li key={`topic-${idx}`}>{toReadableText(item)}</li>
                      ))}
                    </ul>
                  </article>
                </div>

                <div className="grid-2">
                  <article className="kpi">
                    <h4>Milestones</h4>
                    <ul className="list">
                      {toArray(selectedPhase.milestones).map((item, idx) => (
                        <li key={`milestone-${idx}`}>{toReadableText(item)}</li>
                      ))}
                    </ul>
                  </article>
                  <article className="kpi">
                    <h4>Success Metrics</h4>
                    <ul className="list">
                      {toArray(selectedPhase.successMetrics).map((item, idx) => (
                        <li key={`metric-${idx}`}>{toReadableText(item)}</li>
                      ))}
                    </ul>
                  </article>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid-2">
            <article className="panel">
              <h3 className="result-title">Project Pipeline</h3>
              {toArray(result.projects).map((project, idx) => (
                <div className="roadmap-project-card" key={`${project.title || 'project'}-${idx}`}>
                  <h4>{project.title || 'Project'}</h4>
                  <p className="muted">
                    {project.difficulty || 'Intermediate'} | {project.durationWeeks || 0} weeks
                  </p>
                  <p>{project.description || ''}</p>
                  <div>
                    {toArray(project.skillsCovered).map((skill, idx) => (
                      <span className="badge" key={`project-skill-${idx}`}>{toReadableText(skill)}</span>
                    ))}
                  </div>
                </div>
              ))}
            </article>

            <article className="panel">
              <h3 className="result-title">Certifications & Resources</h3>

              <h4>Certifications</h4>
              <ul className="list">
                {toArray(result.certifications).map((cert, idx) => (
                  <li key={`cert-${idx}`}>{toReadableText(cert)}</li>
                ))}
              </ul>

              <h4 style={{ marginTop: 12 }}>Learning Resources</h4>
              {toArray(result.resources).map((group, idx) => (
                <div className="kpi" key={`${group.category || 'group'}-${idx}`}>
                  <h5>{group.category || 'Resources'}</h5>
                  <ul className="list">
                    {toArray(group.items).map((item, itemIdx) => (
                      <li key={`resource-${idx}-${itemIdx}`}>{toReadableText(item)}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          </section>

          <section className="grid-2">
            <article className="panel">
              <h3 className="result-title">Weekly Plan Template</h3>
              <p className="muted">Hours/week: {result.weeklyPlanTemplate?.hours || 0}</p>
              <ul className="list">
                {toArray(result.weeklyPlanTemplate?.breakdown).map((item, idx) => (
                  <li key={`weekly-${idx}`}>{toReadableText(item)}</li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <h3 className="result-title">Interview Prep + Risk Mitigation</h3>
              <h4>Interview Plan</h4>
              <ul className="list">
                {toArray(result.interviewPrepPlan).map((item, idx) => (
                  <li key={`interview-plan-${idx}`}>{toReadableText(item)}</li>
                ))}
              </ul>

              <h4 style={{ marginTop: 12 }}>Risk Mitigation</h4>
              <ul className="list">
                {toArray(result.riskMitigation).map((item, idx) => (
                  <li key={`risk-${idx}`}>{toReadableText(item)}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="panel">
            <h3 className="result-title">Next 30 Days Action Plan</h3>
            <div className="roadmap-next-grid">
              {toArray(result.next30Days).map((item, idx) => (
                <article className="roadmap-next-card" key={`next30-${idx}`}>
                  <span>{idx + 1}</span>
                  <p>{toReadableText(item)}</p>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default Roadmap;
