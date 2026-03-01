import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand">
          <p className="auth-kicker">Create Account</p>
          <h1>Start a structured career growth journey.</h1>
          <p className="muted">
            Build your profile once and use AI-powered workflows for recommendations, practice, and
            planning.
          </p>
          <ul className="auth-points">
            <li>Personalized career recommendations</li>
            <li>Role-focused interview simulation</li>
            <li>Actionable roadmap with milestones</li>
          </ul>
        </aside>

        <div className="panel auth-form-panel">
          <div className="page-head">
            <h2>Register</h2>
            <p>Create your account to unlock all modules.</p>
          </div>

          <form onSubmit={onSubmit} className="form-grid">
            <div>
              <label className="career-label" htmlFor="registerName">
                Name
              </label>
              <input
                id="registerName"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <label className="career-label" htmlFor="registerEmail">
                Email
              </label>
              <input
                id="registerEmail"
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="career-label" htmlFor="registerPassword">
                Password
              </label>
              <input
                id="registerPassword"
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="button" type="submit">
              Register
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}

          <p className="muted auth-switch">
            Have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;
