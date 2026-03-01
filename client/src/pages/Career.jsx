import { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const DEFAULT_FORM = {
  skills: '',
  interests: '',
  education: '',
  experienceLevel: 'fresher'
};

const parseSkills = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeCareer = (item, index) => ({
  id: `${item?.title || 'career'}-${index}`,
  title: item?.title || 'Suggested Career',
  reason: item?.reason || 'No reason generated.',
  requiredSkills: Array.isArray(item?.requiredSkills) ? item.requiredSkills.filter(Boolean) : [],
  certifications: Array.isArray(item?.certifications) ? item.certifications.filter(Boolean) : []
});

const Career = () => {
  const [payload, setPayload] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('match');
  const [lastInputSkills, setLastInputSkills] = useState([]);

  const normalizedCareers = useMemo(() => {
    const careers = Array.isArray(result?.careers) ? result.careers.map(normalizeCareer) : [];
    if (!careers.length) return [];

    const inputSet = new Set(lastInputSkills.map((skill) => skill.toLowerCase()));

    const withMetrics = careers.map((career) => {
      const matched = career.requiredSkills.filter((skill) => inputSet.has(skill.toLowerCase()));
      const missing = career.requiredSkills.filter((skill) => !inputSet.has(skill.toLowerCase()));
      const denominator = Math.max(career.requiredSkills.length, 1);
      const matchScore = Math.round((matched.length / denominator) * 100);
      const readiness = matchScore >= 70 ? 'High' : matchScore >= 40 ? 'Medium' : 'Low';

      return {
        ...career,
        matchedSkills: matched,
        missingSkills: missing,
        matchScore,
        readiness
      };
    });

    const sorted = [...withMetrics].sort((a, b) => {
      if (sortBy === 'growth') return b.missingSkills.length - a.missingSkills.length;
      if (sortBy === 'quick') return a.missingSkills.length - b.missingSkills.length;
      return b.matchScore - a.matchScore;
    });

    return sorted;
  }, [result, lastInputSkills, sortBy]);

  const stats = useMemo(() => {
    if (!normalizedCareers.length) return null;
    const best = normalizedCareers[0];
    const avgMatch = Math.round(
      normalizedCareers.reduce((sum, item) => sum + item.matchScore, 0) / normalizedCareers.length
    );
    const uniqueSkills = new Set(
      normalizedCareers.flatMap((career) => career.missingSkills.map((skill) => skill.toLowerCase()))
    );

    return {
      total: normalizedCareers.length,
      bestRole: best.title,
      bestScore: best.matchScore,
      avgMatch,
      gapCount: uniqueSkills.size
    };
  }, [normalizedCareers]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    const skills = parseSkills(payload.skills);
    if (skills.length < 2) {
      setError('Add at least 2 skills to get meaningful recommendations.');
      return;
    }
    if (!payload.interests.trim() || !payload.education.trim()) {
      setError('Interests and education are required.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/career/recommend?save=true', {
        ...payload,
        skills
      });
      setLastInputSkills(skills);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => setPayload(DEFAULT_FORM);
  const clearForm = () =>
    setPayload({ skills: '', interests: '', education: '', experienceLevel: 'fresher' });

  return (
    <div className="career-page">
      <section className="panel career-hero">
        <div className="page-head">
          <h1>Career Recommendation Studio</h1>
          <p>
            Generate ranked career options with skill-match scoring, skill-gap insights, and
            certification guidance.
          </p>
        </div>
        <div className="career-hero-meta">
          <span className="badge">AI Ranked Suggestions</span>
          <span className="badge">Skill Gap Analysis</span>
          <span className="badge">Certification Path</span>
        </div>
      </section>

      <section className="panel">
        <form onSubmit={onSubmit} className="career-form">
          <div>
            <label className="career-label" htmlFor="skills">
              Skills
            </label>
            <input
              id="skills"
              className="input"
              placeholder="JavaScript, React, Node.js"
              value={payload.skills}
              onChange={(e) => setPayload({ ...payload, skills: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="interests">
              Interests
            </label>
            <input
              id="interests"
              className="input"
              placeholder="Problem solving, product design, AI"
              value={payload.interests}
              onChange={(e) => setPayload({ ...payload, interests: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="education">
              Education
            </label>
            <input
              id="education"
              className="input"
              placeholder="B.Tech CSE"
              value={payload.education}
              onChange={(e) => setPayload({ ...payload, education: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="experienceLevel">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              className="select"
              value={payload.experienceLevel}
              onChange={(e) => setPayload({ ...payload, experienceLevel: e.target.value })}
            >
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="intermediate">Intermediate</option>
            </select>
          </div>

          <div className="career-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Recommendations'}
            </button>
            <button className="button career-ghost" type="button" onClick={fillSample}>
              Use Sample
            </button>
            <button className="button career-ghost" type="button" onClick={clearForm}>
              Clear
            </button>
          </div>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      {loading ? (
        <section className="career-grid">
          <article className="panel career-skeleton" />
          <article className="panel career-skeleton" />
          <article className="panel career-skeleton" />
        </section>
      ) : null}

      {stats ? (
        <section className="career-stats">
          <article className="kpi">
            <h3 className="result-title">{stats.total}</h3>
            <p className="muted">Roles generated</p>
          </article>
          <article className="kpi">
            <h3 className="result-title">{stats.bestScore}%</h3>
            <p className="muted">Best match score</p>
          </article>
          <article className="kpi">
            <h3 className="result-title">{stats.avgMatch}%</h3>
            <p className="muted">Average match</p>
          </article>
          <article className="kpi">
            <h3 className="result-title">{stats.gapCount}</h3>
            <p className="muted">Unique skill gaps</p>
          </article>
        </section>
      ) : null}

      {normalizedCareers.length ? (
        <>
          <section className="panel career-toolbar">
            <div>
              <h3 className="result-title">Top Recommendation: {stats.bestRole}</h3>
              <p className="muted">Sorted view helps evaluate fast-track and long-term options.</p>
            </div>
            <div className="career-sort">
              <label className="career-label" htmlFor="sortBy">
                Sort by
              </label>
              <select
                id="sortBy"
                className="select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="match">Best match</option>
                <option value="quick">Quick start (least gaps)</option>
                <option value="growth">Growth potential (more gaps)</option>
              </select>
            </div>
          </section>

          <section className="career-grid">
            {normalizedCareers.map((career, index) => (
              <article className="panel career-card" key={career.id}>
                <div className="career-card-head">
                  <span className="career-rank">#{index + 1}</span>
                  <span className="career-score">{career.matchScore}% match</span>
                </div>
                <h3 className="result-title">{career.title}</h3>
                <p className="muted">{career.reason}</p>

                <div className="career-block">
                  <h4>Matched Skills</h4>
                  {career.matchedSkills.length ? (
                    career.matchedSkills.map((skill) => (
                      <span className="badge career-badge-good" key={`good-${career.id}-${skill}`}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="muted">No direct matches from current profile.</p>
                  )}
                </div>

                <div className="career-block">
                  <h4>Skill Gaps</h4>
                  {career.missingSkills.length ? (
                    career.missingSkills.map((skill) => (
                      <span className="badge career-badge-gap" key={`gap-${career.id}-${skill}`}>
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="muted">Great fit. Minimal skill gaps for this role.</p>
                  )}
                </div>

                <div className="career-block">
                  <h4>Recommended Certifications</h4>
                  {career.certifications.length ? (
                    <ul className="list">
                      {career.certifications.map((cert) => (
                        <li key={`${career.id}-${cert}`}>{cert}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted">No certifications suggested by AI for this role.</p>
                  )}
                </div>

                <div className="career-readiness">
                  <span className="muted">Readiness:</span>
                  <strong>{career.readiness}</strong>
                </div>
              </article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default Career;
