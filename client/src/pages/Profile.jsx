import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LEARNING_STYLES = ['mixed', 'project-first', 'theory-first', 'video-first', 'reading-first'];

const splitCsv = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const Profile = () => {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    targetRole: '',
    experienceLevel: '',
    currentLevel: 'beginner',
    weeklyHours: 10,
    preferredLearningStyle: 'mixed',
    careerGoal: '',
    skills: '',
    focusAreas: '',
    targetCompanies: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      email: user.email || '',
      targetRole: user.targetRole || '',
      experienceLevel: user.experienceLevel || '',
      currentLevel: user.currentLevel || 'beginner',
      weeklyHours: Number(user.weeklyHours) || 10,
      preferredLearningStyle: user.preferredLearningStyle || 'mixed',
      careerGoal: user.careerGoal || '',
      skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      focusAreas: Array.isArray(user.focusAreas) ? user.focusAreas.join(', ') : '',
      targetCompanies: Array.isArray(user.targetCompanies) ? user.targetCompanies.join(', ') : ''
    });
  }, [user]);

  const completionScore = useMemo(() => {
    const checks = [
      form.name.trim(),
      form.email.trim(),
      form.targetRole.trim(),
      form.experienceLevel.trim(),
      form.careerGoal.trim(),
      splitCsv(form.skills).length > 0,
      splitCsv(form.focusAreas).length > 0
    ];
    const done = checks.filter(Boolean).length;
    return Math.round((done / checks.length) * 100);
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    if (!form.targetRole.trim()) {
      setError('Target role is required for career planning.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        targetRole: form.targetRole.trim(),
        experienceLevel: form.experienceLevel.trim(),
        currentLevel: form.currentLevel,
        weeklyHours: Number(form.weeklyHours),
        preferredLearningStyle: form.preferredLearningStyle,
        careerGoal: form.careerGoal.trim(),
        skills: splitCsv(form.skills),
        focusAreas: splitCsv(form.focusAreas),
        targetCompanies: splitCsv(form.targetCompanies)
      });
      setMessage('Career profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <section className="panel profile-hero">
        <div className="page-head">
          <h1>Career Profile</h1>
          <p>Maintain only the information needed for better recommendations and interview planning.</p>
        </div>
        <div className="profile-hero-meta">
          <span className="badge">Profile Completion: {completionScore}%</span>
          <span className="badge">Used by Career, Roadmap, Interview modules</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="result-title">Profile Details</h2>

        <form className="profile-form" onSubmit={onSubmit}>
          <div>
            <label className="career-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="targetRole">
              Target Role
            </label>
            <input
              id="targetRole"
              className="input"
              value={form.targetRole}
              onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="experienceLevel">
              Experience Level
            </label>
            <input
              id="experienceLevel"
              className="input"
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
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
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
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

          <div className="profile-full-width">
            <label className="career-label" htmlFor="careerGoal">
              Career Goal
            </label>
            <textarea
              id="careerGoal"
              className="textarea"
              rows={3}
              value={form.careerGoal}
              onChange={(e) => setForm({ ...form, careerGoal: e.target.value })}
            />
          </div>

          <div className="profile-full-width">
            <label className="career-label" htmlFor="skills">
              Skills (comma separated)
            </label>
            <input
              id="skills"
              className="input"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
            />
          </div>

          <div className="profile-full-width">
            <label className="career-label" htmlFor="focusAreas">
              Focus Areas (comma separated)
            </label>
            <input
              id="focusAreas"
              className="input"
              value={form.focusAreas}
              onChange={(e) => setForm({ ...form, focusAreas: e.target.value })}
            />
          </div>

          <div className="profile-full-width">
            <label className="career-label" htmlFor="targetCompanies">
              Target Companies (comma separated)
            </label>
            <input
              id="targetCompanies"
              className="input"
              value={form.targetCompanies}
              onChange={(e) => setForm({ ...form, targetCompanies: e.target.value })}
            />
          </div>

          <div className="profile-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Career Profile'}
            </button>
          </div>
        </form>

        {message ? <p className="success">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  );
};

export default Profile;
