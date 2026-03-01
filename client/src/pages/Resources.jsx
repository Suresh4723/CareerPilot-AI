import { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Resources = () => {
  const [form, setForm] = useState({
    role: '',
    experienceLevel: 'beginner',
    skills: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalResources = useMemo(() => {
    if (!result?.categories) return 0;
    return result.categories.reduce((sum, category) => sum + (category.resources?.length || 0), 0);
  }, [result]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!form.role.trim()) {
      setError('Target role is required.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/resources/generate', {
        role: form.role.trim(),
        experienceLevel: form.experienceLevel,
        skills: form.skills
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate resources');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resources-page">
      <section className="panel resources-hero">
        <div className="page-head">
          <h1>Learning Resources Hub</h1>
          <p>Curated learning links aligned to your role and experience level.</p>
        </div>
        <div className="resources-hero-badges">
          <span className="badge">Role-Aligned Learning</span>
          <span className="badge">Level-Based Curation</span>
          <span className="badge">Actionable Resource Stack</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="result-title">Generate Resource Plan</h2>
        <form className="resources-form" onSubmit={onSubmit}>
          <div>
            <label className="career-label" htmlFor="role">
              Target Role
            </label>
            <input
              id="role"
              className="input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="experienceLevel">
              Experience Level
            </label>
            <select
              id="experienceLevel"
              className="select"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="resources-full-width">
            <label className="career-label" htmlFor="skills">
              Current Skills (optional, comma separated)
            </label>
            <input
              id="skills"
              className="input"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>

          <div className="resources-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Resources'}
            </button>
          </div>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>

      {result?.categories?.length ? (
        <>
          <section className="resources-kpi-grid">
            <article className="kpi">
              <h3 className="result-title">{result.categories.length}</h3>
              <p className="muted">Resource Categories</p>
            </article>
            <article className="kpi">
              <h3 className="result-title">{totalResources}</h3>
              <p className="muted">Total Recommendations</p>
            </article>
            <article className="kpi">
              <h3 className="result-title">{result.role || form.role}</h3>
              <p className="muted">Target Role</p>
            </article>
          </section>

          <section className="resources-grid">
            {result.categories.map((category, idx) => (
              <article className="panel" key={`${category.name}-${idx}`}>
                <h3 className="result-title">{category.name}</h3>
                {(category.resources || []).map((resource, resIdx) => (
                  <div className="resource-item" key={`${idx}-${resIdx}-${resource.title || 'resource'}`}>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="resource-link">
                      {resource.title || 'Untitled Resource'}
                    </a>
                    <div className="muted">
                      {resource.provider || 'Unknown provider'}{resource.type ? ` - ${resource.type}` : ''}
                    </div>
                    <p className="muted">{resource.description || 'No description provided.'}</p>
                  </div>
                ))}
              </article>
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default Resources;
