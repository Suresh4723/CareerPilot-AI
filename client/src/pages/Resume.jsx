import { useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const Resume = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isJobMatchMode = useMemo(() => jobDescription.trim().length > 0, [jobDescription]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!resumeFile) {
      setError('Upload a resume PDF to continue.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('resumePdf', resumeFile);
      if (jobDescription.trim()) formData.append('jobDescription', jobDescription.trim());

      const { data } = await axiosInstance.post('/resume/analyze', formData);

      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setResumeFile(null);
    setJobDescription('');
    setResult(null);
    setError('');
  };

  return (
    <div className="resume-page">
      <section className="panel resume-hero">
        <div className="page-head">
          <h1>Resume Analyzer Pro</h1>
          <p>
            Upload a PDF resume and optionally match it against a specific job description for targeted
            ATS feedback.
          </p>
        </div>
        <div className="resume-hero-badges">
          <span className="badge">PDF Upload</span>
          <span className="badge">ATS Scoring</span>
          <span className="badge">Job Description Match</span>
        </div>
      </section>

      <section className="panel">
        <form onSubmit={onSubmit} className="resume-form">
          <div className="resume-upload">
            <label className="career-label" htmlFor="resumePdf">
              Resume PDF
            </label>
            <div className="resume-upload-control">
              <input
                id="resumePdf"
                className="resume-file-input"
                type="file"
                accept="application/pdf"
                onClick={(e) => {
                  e.currentTarget.value = '';
                }}
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="resumePdf" className="resume-upload-trigger">
                Upload PDF
              </label>
              <p className="resume-file-name">
                {resumeFile ? resumeFile.name : 'No file selected yet'}
              </p>
            </div>
          </div>

          <div>
            <label className="career-label" htmlFor="jobDescription">
              Job Description (optional)
            </label>
            <textarea
              id="jobDescription"
              className="textarea"
              rows={8}
              placeholder="Paste a target job description to get job-fit score and missing keyword analysis"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="resume-actions">
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
            <button className="button career-ghost" type="button" onClick={clearAll}>
              Clear
            </button>
          </div>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      {result ? (
        <section className="panel">
          <div className="resume-score-grid">
            <article className="kpi">
              <h4>ATS Score</h4>
              <div className="score">{Number(result.score) || 0}</div>
            </article>

            {isJobMatchMode ? (
              <article className="kpi">
                <h4>Job Match Score</h4>
                <div className="score">{Number(result.jobMatchScore) || 0}</div>
              </article>
            ) : (
              <article className="kpi">
                <h4>Analysis Source</h4>
                <p className="muted">{result.source === 'pdf' ? 'PDF upload' : 'Manual text input'}</p>
              </article>
            )}
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <article>
              <h4>Strengths</h4>
              <ul className="list">
                {(result.strengths || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article>
              <h4>Weaknesses</h4>
              <ul className="list">
                {(result.weaknesses || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="grid-2">
            <article>
              <h4>Missing Skills</h4>
              <div>
                {(result.missingSkills || []).map((item) => (
                  <span className="badge career-badge-gap" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </article>

            <article>
              <h4>Improvement Suggestions</h4>
              <ul className="list">
                {(result.suggestions || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          {isJobMatchMode ? (
            <div className="grid-2" style={{ marginTop: 10 }}>
              <article>
                <h4>Missing JD Keywords</h4>
                <div>
                  {(result.jdMissingKeywords || []).map((item) => (
                    <span className="badge" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>

              <article>
                <h4>Job Fit Summary</h4>
                <p className="muted">{result.jobFitSummary || 'No summary returned by AI.'}</p>
              </article>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
};

export default Resume;
