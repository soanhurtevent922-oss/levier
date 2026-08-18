'use client';

import { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../layout';
import { getBenchmark } from '../../../lib/benchmarks';

export default function EntrainementPage() {
  const { profile } = useDashboard();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [min, max] = getBenchmark(profile.job_category, profile.experience_level, profile.city_tier) || [null, null];

  async function callAI(history) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/interview-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, jobCategory: profile.job_category, min, max }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([...history, { role: 'assistant', content: data.reply }]);
      } else {
        setError(data.error || 'Erreur inconnue côté serveur.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleStart() {
    setStarted(true);
    const opening = { role: 'user', content: "[Début de l'entretien. Réagis comme si je venais d'entrer dans ton bureau pour discuter de mon salaire.]" };
    callAI([opening]);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const newHistory = [...messages, { role: 'user', content: input.trim() }];
    setMessages(newHistory);
    setInput('');
    callAI(newHistory);
  }

  const visibleMessages = messages.filter((m) => !m.content.startsWith("[Début de l'entretien"));

  return (
    <div>
      <h2 className="section-title" style={{ marginTop: 0 }}>Entraînement face à un recruteur IA</h2>
      <p className="benchmark-note" style={{ marginBottom: '14px' }}>
        Une IA joue le rôle du manager en face de toi. Pas un script à lire — une vraie conversation, avec de vraies objections à gérer en direct.
      </p>

      {!started ? (
        <div className="panel">
          <button className="btn-primary" onClick={handleStart} disabled={loading}>
            {loading ? 'Un instant…' : "Démarrer l'entretien"}
          </button>
        </div>
      ) : (
        <div className="panel">
          <div className="chat-window">
            {visibleMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === 'user' ? 'chat-bubble--me' : 'chat-bubble--ai'}`}>
                <span className="chat-role">{m.role === 'user' ? 'Vous' : 'Recruteur'}</span>
                {m.content}
              </div>
            ))}
            {loading && <div className="chat-bubble chat-bubble--ai"><span className="chat-role">Recruteur</span>…</div>}
            <div ref={bottomRef} />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <form onSubmit={handleSend} style={{ marginTop: '14px' }}>
            <textarea
              rows={2}
              placeholder="Écris ta réponse..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={loading}>Envoyer</button>
          </form>
        </div>
      )}
    </div>
  );
}
