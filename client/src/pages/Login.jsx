import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand">
          <p className="auth-kicker">Welcome Back</p>
          <h1>Continue your career preparation workflow.</h1>
          <p className="muted">
            Access your personalized modules for career recommendations, interview practice, and roadmap
            planning.
          </p>
          <ul className="auth-points">
            <li>Resume and interview progress in one place</li>
            <li>Role-specific AI guidance across modules</li>
            <li>Consistent career profile context</li>
          </ul>
        </aside>

        <div className="panel auth-form-panel">
          <div className="page-head">
            <h2>Login</h2>
            <p>Use your account credentials to continue.</p>
          </div>

          <form onSubmit={onSubmit} className="form-grid">
            <div>
              <label className="career-label" htmlFor="loginEmail">
                Email
              </label>
              <input
                id="loginEmail"
                className="input"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              <label className="career-label" htmlFor="loginPassword">
                Password
              </label>
              <input
                id="loginPassword"
                className="input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <button className="button" type="submit">
              Login
            </button>
          </form>

          {error ? <p className="error">{error}</p> : null}

          <p className="muted auth-switch">
            New user? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;
