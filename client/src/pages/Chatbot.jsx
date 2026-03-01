import { useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const STARTER_PROMPTS = [
  'How should I prepare for a frontend developer interview in 30 days?',
  'Review my plan for improving communication and behavioral rounds.',
  'What skills should I prioritize for data analyst roles?'
];

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([
    {
      role: 'assistant',
      content:
        'Hello. I can help with career planning, interview preparation, and role-focused learning strategy.'
    }
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const chatWindowRef = useRef(null);

  const canSend = useMemo(() => message.trim().length > 0 && !loading, [message, loading]);

  useEffect(() => {
    if (!chatWindowRef.current) return;
    chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [chat, loading]);

  const sendText = async (text) => {
    const userMessage = text.trim();
    if (!userMessage) return;

    setError('');
    setLoading(true);
    setChat((prev) => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');

    try {
      const { data } = await axiosInstance.post('/chat', { message: userMessage });
      setChat((prev) => [...prev, { role: 'assistant', content: data.reply || 'No response received.' }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get chatbot response');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await sendText(message);
  };

  return (
    <div className="chatbot-page">
      <section className="panel chatbot-hero">
        <div className="page-head">
          <h1>CareerPilot AI Chat Assistant</h1>
          <p>
            Ask focused questions on career decisions, interview prep, resume strategy, and skill
            planning.
          </p>
        </div>
        <div className="chatbot-hero-badges">
          <span className="badge">Career Guidance</span>
          <span className="badge">Interview Strategy</span>
          <span className="badge">Actionable Advice</span>
        </div>
      </section>

      <section className="panel">
        <div className="chatbot-headline">
          <h2 className="result-title">Conversation</h2>
          <span className="chatbot-status">{loading ? 'Assistant is typing...' : 'Ready'}</span>
        </div>

        <div className="chatbot-starters">
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="chatbot-starter"
              onClick={() => sendText(prompt)}
              disabled={loading}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="chat-window chatbot-window" ref={chatWindowRef}>
          {chat.map((item, idx) => (
            <div key={idx} className={`chat-message ${item.role}`}>
              <div className={`chat-avatar ${item.role}`}>{item.role === 'assistant' ? 'AI' : 'You'}</div>
              <div className={`chat-bubble ${item.role}`}>{item.content}</div>
            </div>
          ))}
          {loading ? <div className="chatbot-typing">Thinking...</div> : null}
        </div>

        <form className="chat-form chatbot-form" onSubmit={onSubmit}>
          <input
            className="input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask a career-related question"
          />
          <button className="button" type="submit" disabled={!canSend}>
            Send
          </button>
        </form>

        {error ? <p className="error">{error}</p> : null}
      </section>
    </div>
  );
};

export default Chatbot;
