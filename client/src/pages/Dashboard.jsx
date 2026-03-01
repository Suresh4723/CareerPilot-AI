import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <section className="panel">
        <div className="page-head">
          <h1>Career Dashboard</h1>
          <p>Welcome back, {user?.name || 'User'}.</p>
        </div>
        <p className="muted">
          Use this workspace to get AI-based career guidance, analyze your resume, practice interviews,
          and build a role-specific roadmap.
        </p>
      </section>

      <section className="grid-3">
        <article className="kpi">
          <h3 className="result-title">Career Guidance</h3>
          <p className="muted">Get role recommendations based on skills, interests, education, and level.</p>
        </article>
        <article className="kpi">
          <h3 className="result-title">Resume Review</h3>
          <p className="muted">See ATS score, missing skills, strengths, and improvement actions.</p>
        </article>
        <article className="kpi">
          <h3 className="result-title">Interview Practice</h3>
          <p className="muted">Generate questions and receive per-answer feedback with a final score.</p>
        </article>
        <article className="kpi">
          <h3 className="result-title">Learning Resources</h3>
          <p className="muted">Build a curated list of courses, documentation, and practice platforms.</p>
        </article>
        <article className="kpi">
          <h3 className="result-title">AI Chatbot</h3>
          <p className="muted">Ask career-related questions and get focused guidance instantly.</p>
        </article>
        <article className="kpi">
          <h3 className="result-title">Profile</h3>
          <p className="muted">Store your background details to improve recommendation quality.</p>
        </article>
      </section>
    </>
  );
};

export default Dashboard;
