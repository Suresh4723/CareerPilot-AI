import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  {
    title: 'Career Recommendation',
    desc: 'Discover role options aligned with your skills and interests.',
    path: '/career'
  },
  {
    title: 'Resume Analyzer',
    desc: 'Get ATS feedback, keyword gaps, and improvement suggestions.',
    path: '/resume'
  },
  {
    title: 'Interview Prep',
    desc: 'Practice timed MCQ interview rounds with score-based review.',
    path: '/interview'
  },
  {
    title: 'Roadmap Generator',
    desc: 'Build a phased learning plan with milestones and projects.',
    path: '/roadmap'
  },
  {
    title: 'Resources Hub',
    desc: 'Generate curated resources based on role and experience level.',
    path: '/resources'
  },
  {
    title: 'AI Chat Assistant',
    desc: 'Ask career-focused questions and get actionable guidance.',
    path: '/chatbot'
  }
];

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-left">
          <p className="home-kicker">CareerPilot AI Platform</p>
          <h1>Plan, prepare, and grow your career in one workspace.</h1>
          <p>
            Use six focused modules to choose the right path, improve your resume, practice interviews,
            and execute a roadmap that leads to real job outcomes.
          </p>
          <div className="home-cta-row">
            {user ? (
              <Link className="button" to="/career">
                Continue Learning
              </Link>
            ) : (
              <>
                <Link className="button" to="/register">
                  Create Account
                </Link>
                <Link className="button home-secondary-btn" to="/login">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="home-hero-right">
          <div className="home-hero-stat-card">
            <h3>Career Progress Workspace</h3>
            <p className="muted">A single flow from career discovery to interview readiness.</p>
          </div>
          <div className="home-hero-stat-grid">
            <article>
              <strong>6</strong>
              <span>Core Modules</span>
            </article>
            <article>
              <strong>1</strong>
              <span>Unified Learning Journey</span>
            </article>
            <article>
              <strong>Role-Based</strong>
              <span>Recommendations & Practice</span>
            </article>
            <article>
              <strong>Actionable</strong>
              <span>Roadmaps and Feedback</span>
            </article>
          </div>
        </div>
      </section>

      <section className="panel home-user-head">
        <h2>Core Modules</h2>
        <p className="muted">
          {user
            ? 'All modules are unlocked. Continue from any module based on your current goal.'
            : 'Sign in to access all modules and save your progress.'}
        </p>
      </section>

      <section className="home-module-grid">
        {MODULES.map((item) => (
          <article className="home-module-card" key={item.path}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            {user ? (
              <Link className="home-module-link" to={item.path}>
                Open Module
              </Link>
            ) : (
              <span className="home-module-lock">Login Required</span>
            )}
          </article>
        ))}
      </section>

      <section className="home-footer-panel panel">
        <h2>{user ? 'Keep your momentum' : 'Start your preparation journey'}</h2>
        <p className="muted">
          {user
            ? 'Move to your next module and continue improving your career readiness.'
            : 'Create your profile once and use personalized AI workflows across all six modules.'}
        </p>
        <div className="home-cta-row">
          {user ? (
            <Link className="button" to="/profile">
              Update Profile
            </Link>
          ) : (
            <>
              <Link className="button" to="/register">
                Get Started
              </Link>
              <Link className="button home-secondary-btn" to="/login">
                Login
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

