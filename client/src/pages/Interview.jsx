import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const TRACKS = {
  aptitude: {
    title: 'Aptitude',
    subtitle: 'Quantitative, verbal, logical, and DI preparation',
    blurb: 'Practice screening-test style MCQs with speed and accuracy.',
    subtopics: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Reasoning', 'Data Interpretation']
  },
  technical: {
    title: 'Technical',
    subtitle: 'Role/domain engineering MCQs',
    blurb: 'Prepare for DSA, coding fundamentals, system concepts, and implementation questions.',
    subtopics: ['DSA', 'Web Development', 'Databases', 'OS & Networks', 'System Design Basics']
  },
  nontechnical: {
    title: 'Non-Technical',
    subtitle: 'Behavioral, communication, and HR rounds',
    blurb: 'Prepare decision-making and situational responses in MCQ format.',
    subtopics: ['Behavioral (STAR)', 'Communication', 'Teamwork', 'Leadership', 'Conflict Handling']
  },
  subject: {
    title: 'Subject-Specific',
    subtitle: 'One-subject focused MCQ revision',
    blurb: 'Target a specific subject for deep and focused preparation.',
    subtopics: []
  }
};

const DEFAULT_QUESTION_COUNT = 20;
const DEFAULT_TIMER_MIN = 20;
const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20, 25, 30];

const Interview = () => {
  const [track, setTrack] = useState('technical');
  const [selectedSubtopics, setSelectedSubtopics] = useState(['DSA', 'Web Development']);

  const [form, setForm] = useState({
    targetDomain: '',
    subjectName: '',
    companyType: '',
    difficulty: 'medium',
    questionCount: String(DEFAULT_QUESTION_COUNT),
    timerMin: String(DEFAULT_TIMER_MIN)
  });

  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [result, setResult] = useState(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [error, setError] = useState('');

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [timeLeftSec, setTimeLeftSec] = useState(0);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const trackMeta = TRACKS[track];
  const totalQuestions = session?.questions?.length || 0;

  const answeredCount = useMemo(
    () => answers.filter((answer) => typeof answer === 'string' && answer.trim().length > 0).length,
    [answers]
  );

  const progress = totalQuestions ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (!session || result || timeLeftSec <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSec((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [session, result, timeLeftSec]);

  useEffect(() => {
    if (!session || result || loadingSubmit || timeLeftSec !== 0 || autoSubmitted) return;

    setAutoSubmitted(true);
    submitInterview(true);
  }, [timeLeftSec, session, result, loadingSubmit, autoSubmitted]);

  const toggleSubtopic = (item) => {
    setSelectedSubtopics((prev) => {
      if (prev.includes(item)) return prev.filter((x) => x !== item);
      return [...prev, item];
    });
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, '0');
    return `${m}:${s}`;
  };

  const buildContext = () => {
    const company = form.companyType.trim() ? `Company type: ${form.companyType.trim()}` : '';

    const base = [`Track: ${trackMeta.title}`];

    if (track === 'subject') {
      base.push(`Subject: ${form.subjectName.trim()}`);
    } else if (track === 'technical') {
      if (form.targetDomain.trim()) base.push(`Domain: ${form.targetDomain.trim()}`);
      if (selectedSubtopics.length) base.push(`Focus topics: ${selectedSubtopics.join(', ')}`);
    } else if (track === 'aptitude') {
      if (selectedSubtopics.length) base.push(`Focus topics: ${selectedSubtopics.join(', ')}`);
    } else {
      if (selectedSubtopics.length) base.push(`Focus topics: ${selectedSubtopics.join(', ')}`);
      if (form.targetDomain.trim()) base.push(`Role context: ${form.targetDomain.trim()}`);
    }

    if (company) base.push(company);
    base.push('MCQ format only');

    return base.join(' | ');
  };

  const createSession = async () => {
    setError('');
    setResult(null);

    if (track === 'subject' && !form.subjectName.trim()) {
      setError('Enter the subject name for Subject-Specific mode.');
      return;
    }

    if (track !== 'subject' && selectedSubtopics.length === 0) {
      setError('Select at least one focus topic.');
      return;
    }

    const parsedQuestionCount = Number.parseInt(form.questionCount, 10);
    const parsedTimerMin = Number.parseInt(form.timerMin, 10);

    const questionCount = Math.min(Math.max(Number.isNaN(parsedQuestionCount) ? 20 : parsedQuestionCount, 5), 30);
    const timerMin = Math.min(Math.max(Number.isNaN(parsedTimerMin) ? 20 : parsedTimerMin, 5), 120);

    setLoadingCreate(true);
    try {
      const { data } = await axiosInstance.post('/interview/session', {
        context: buildContext(),
        difficulty: form.difficulty,
        questionCount,
        timeLimitMin: timerMin
      });

      setSession(data);
      setAnswers(new Array(data.questions.length).fill(''));
      setCurrentQuestion(0);
      setTimeLeftSec((data.timeLimitMin || timerMin) * 60);
      setAutoSubmitted(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate interview session');
    } finally {
      setLoadingCreate(false);
    }
  };

  const submitInterview = async (force = false) => {
    setError('');

    if (!session?._id) {
      setError('Create a session first.');
      return;
    }

    if (!force && answeredCount !== totalQuestions) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setLoadingSubmit(true);
    try {
      const normalizedAnswers = [...answers];
      while (normalizedAnswers.length < totalQuestions) normalizedAnswers.push('');

      const { data } = await axiosInstance.post('/interview/submit', {
        sessionId: session._id,
        answers: normalizedAnswers
      });

      setResult(data);
      setReviewIndex(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to evaluate answers');
    } finally {
      setLoadingSubmit(false);
    }
  };

  const resetAll = () => {
    setSession(null);
    setAnswers([]);
    setResult(null);
    setCurrentQuestion(0);
    setReviewIndex(0);
    setTimeLeftSec(0);
    setAutoSubmitted(false);
    setError('');
  };

  const optionsForCurrent = session?.options?.[currentQuestion] || [];
  const currentReview = result?.evaluation?.[reviewIndex];

  return (
    <div className="interview-lab">
      <section className="panel interview-lab-hero">
        <div className="page-head">
          <h1>Interview Preparation Lab</h1>
          <p>
            Configurable timed MCQ practice with accurate scoring, answer review, and consolidated
            strengths/weaknesses feedback.
          </p>
        </div>
        <div className="interview-lab-badges">
          <span className="badge">20+ Questions</span>
          <span className="badge">Adjustable Timer</span>
          <span className="badge">Right/Wrong Review</span>
        </div>
      </section>

      <section className="panel">
        <h2 className="result-title">1. Select Interview Track</h2>
        <div className="interview-track-grid">
          {Object.entries(TRACKS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={`interview-track-card${track === key ? ' active' : ''}`}
              onClick={() => {
                setTrack(key);
                setSelectedSubtopics(item.subtopics.slice(0, 2));
              }}
            >
              <h3>{item.title}</h3>
              <p className="muted">{item.subtitle}</p>
              <small>{item.blurb}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="result-title">2. Configure Session</h2>
        <div className="interview-config-grid">
          {track === 'subject' ? (
            <div>
              <label className="career-label" htmlFor="subjectName">
                Subject Name
              </label>
              <input
                id="subjectName"
                className="input"
                placeholder="Operating Systems"
                value={form.subjectName}
                onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
              />
            </div>
          ) : (
            <div>
              <label className="career-label" htmlFor="targetDomain">
                Domain / Role Context (optional)
              </label>
              <input
                id="targetDomain"
                className="input"
                placeholder="IT, Developer"
                value={form.targetDomain}
                onChange={(e) => setForm({ ...form, targetDomain: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="career-label" htmlFor="companyType">
              Company Type (optional)
            </label>
            <input
              id="companyType"
              className="input"
              placeholder="Product-based, startup"
              value={form.companyType}
              onChange={(e) => setForm({ ...form, companyType: e.target.value })}
            />
          </div>

          <div>
            <label className="career-label" htmlFor="difficulty">
              Difficulty
            </label>
            <select
              id="difficulty"
              className="select"
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="career-label" htmlFor="questionCount">
              Question Count
            </label>
            <select
              id="questionCount"
              className="input"
              value={form.questionCount}
              onChange={(e) => setForm({ ...form, questionCount: e.target.value })}
            >
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <option key={count} value={String(count)}>
                  {count}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="career-label" htmlFor="timerMin">
              Timer (minutes)
            </label>
            <input
              id="timerMin"
              type="number"
              min={5}
              max={120}
              className="input"
              value={form.timerMin}
              onChange={(e) => setForm({ ...form, timerMin: e.target.value })}
            />
          </div>
        </div>

        {track !== 'subject' ? (
          <div style={{ marginTop: 12 }}>
            <label className="career-label">Focus Topics</label>
            <div className="interview-topic-chips">
              {trackMeta.subtopics.map((topic) => (
                <button
                  type="button"
                  key={topic}
                  className={`interview-chip${selectedSubtopics.includes(topic) ? ' active' : ''}`}
                  onClick={() => toggleSubtopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="interview-actions">
          <button className="button" onClick={createSession} disabled={loadingCreate}>
            {loadingCreate ? 'Generating...' : 'Start MCQ Test'}
          </button>
          {(session || result) && (
            <button className="button career-ghost" onClick={resetAll}>
              Reset Session
            </button>
          )}
        </div>

        {error ? <p className="error">{error}</p> : null}
      </section>

      {session?.questions?.length && !result ? (
        <section className="panel">
          <div className="interview-live-head">
            <h2 className="result-title">3. Answer Questions</h2>
            <span className="interview-live-progress">Progress: {progress}%</span>
          </div>

          <div className="interview-timer-box">Time Left: {formatTimer(timeLeftSec)}</div>

          <div className="interview-progress-track">
            <div className="interview-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="interview-live-layout">
            <aside className="interview-live-nav">
              {session.questions.map((_, index) => {
                const done = Boolean((answers[index] || '').trim());
                return (
                  <button
                    key={`q-${index}`}
                    type="button"
                    className={`interview-live-nav-item${currentQuestion === index ? ' active' : ''}${done ? ' done' : ''}`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    Q{index + 1}
                  </button>
                );
              })}
            </aside>

            <div className="interview-live-main">
              <div className="interview-question-card">
                <h3 className="result-title">Question {currentQuestion + 1}</h3>
                <p>{session.questions[currentQuestion]}</p>
              </div>

              <div className="interview-options-grid">
                {optionsForCurrent.map((option, idx) => (
                  <label key={`${currentQuestion}-opt-${idx}`} className="interview-option-card">
                    <input
                      type="radio"
                      name={`q-${currentQuestion}`}
                      checked={answers[currentQuestion] === option}
                      onChange={() => {
                        const next = [...answers];
                        next[currentQuestion] = option;
                        setAnswers(next);
                      }}
                    />
                    <span>
                      <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                    </span>
                  </label>
                ))}
              </div>

              <div className="interview-actions">
                <button
                  className="button career-ghost"
                  type="button"
                  disabled={currentQuestion === 0}
                  onClick={() => setCurrentQuestion((prev) => Math.max(prev - 1, 0))}
                >
                  Previous
                </button>
                <button
                  className="button career-ghost"
                  type="button"
                  disabled={currentQuestion === totalQuestions - 1}
                  onClick={() => setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions - 1))}
                >
                  Next
                </button>
                <button className="button" type="button" onClick={() => submitInterview(false)} disabled={loadingSubmit}>
                  {loadingSubmit ? 'Evaluating...' : 'Submit Test'}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {result ? (
        <section className="panel">
          <div className="interview-report-head">
            <div>
              <h2 className="result-title">Result & Review</h2>
              <p className="muted">
                Correct: {result.correctCount} / {result.totalQuestions} | Wrong: {result.wrongCount}
              </p>
            </div>
            <div className="interview-score-box">
              <span className="interview-score-label">Final Score</span>
              <strong>{result.totalScore}/100</strong>
            </div>
          </div>

          <div className="interview-live-layout" style={{ marginTop: 12 }}>
            <aside className="interview-live-nav">
              {result.evaluation.map((item, idx) => (
                <button
                  key={`review-${idx}`}
                  type="button"
                  className={`interview-live-nav-item${reviewIndex === idx ? ' active' : ''}${item.isCorrect ? ' done' : ''}`}
                  onClick={() => setReviewIndex(idx)}
                >
                  Q{idx + 1}
                </button>
              ))}
            </aside>

            <div className="interview-live-main">
              {currentReview ? (
                <>
                  <div className="interview-question-card">
                    <h3 className="result-title">Question {reviewIndex + 1}</h3>
                    <p>{currentReview.question}</p>
                  </div>

                  <div className="interview-options-grid">
                    {currentReview.options.map((option, idx) => {
                      const isCorrect = option === currentReview.correctAnswer;
                      const isSelected = option === currentReview.selectedAnswer;

                      let className = 'interview-option-card';
                      if (isCorrect) className += ' option-correct';
                      if (isSelected && !isCorrect) className += ' option-wrong';

                      return (
                        <div key={`review-opt-${idx}`} className={className}>
                          <span>
                            <strong>{String.fromCharCode(65 + idx)}.</strong> {option}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className="interview-summary-grid">
            <article className="kpi">
              <h4>Strengths</h4>
              <ul className="list">
                {(result.summary?.strengths || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="kpi">
              <h4>Weaknesses</h4>
              <ul className="list">
                {(result.summary?.weaknesses || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="kpi">
              <h4>What to Practice</h4>
              <ul className="list">
                {(result.summary?.practiceAreas || []).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="kpi" style={{ marginTop: 12 }}>
            <h4>Overall Feedback</h4>
            <p className="muted">{result.summary?.overallFeedback || 'No feedback generated.'}</p>
          </article>
        </section>
      ) : null}
    </div>
  );
};

export default Interview;
