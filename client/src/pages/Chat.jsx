import { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => {
  const existing = localStorage.getItem('casamed_session_id');
  if (existing) return existing;
  const newId = 'session-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('casamed_session_id', newId);
  return newId;
});
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getChatHistory(sessionId)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input, sessionId };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await sendMessage({ sessionId, message: input });
      setMessages((prev) => [...prev, { role: 'assistant', content: JSON.stringify(res.data) }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Error getting response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (msg, idx) => {
    const isUser = msg.role === 'user';
    let parsed = null;
    if (!isUser) {
      try { parsed = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content; } catch { parsed = null; }
    }

    return (
      <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">AI</div>
        )}
        <div className={`max-w-xl ${isUser ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3' : 'bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm'}`}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : parsed?.recommendations ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Exercise Recommendations</p>
              </div>
              <div className="space-y-3">
                {parsed.recommendations.map((rec, i) => (
                  <div key={i} className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-start gap-2">
                      <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900 text-sm">{rec.name}</p>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">{rec.description}</p>
                        <div className="flex gap-3 mt-2">
                          <span className="bg-white text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-medium">⏱ {rec.duration}</span>
                          <span className="bg-white text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-200 font-medium">🔁 {rec.reps}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {parsed.disclaimer && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 leading-relaxed italic">{parsed.disclaimer}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">{msg.content}</p>
          )}
        </div>
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold ml-2 mt-1 flex-shrink-0">You</div>
        )}
      </div>
    );
  };

  const suggestions = [
    'Lower back pain from desk work',
    'Knee pain after running',
    'Shoulder stiffness in the morning',
    'Neck pain from phone use',
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">CM</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">CasaMed AI Coach</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <p className="text-xs text-gray-500">Online — Physiotherapy Assistant</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/book')}
            className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100 transition border border-blue-200"
          >
            Book Session
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-200"
          >
            Therapist Login
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 max-w-3xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
              <span className="text-white text-2xl font-bold">CM</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">How can I help you today?</h2>
            <p className="text-gray-500 text-sm text-center max-w-sm mb-8">
              Describe your pain or condition and I'll provide personalized exercise recommendations.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setInput(s)}
                  className="text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map(renderMessage)}
            {loading && (
              <div className="flex justify-start mb-4 px-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">AI</div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-5">
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Describe your pain or condition..."
              rows={1}
              className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}